<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC173_ABI = ['function owner() public view returns(address)'];

// Theme
const themeVars = useThemeVars();

// State
const rpcInput = ref('');
const contractAddressInput = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');
const isEOA = ref(false);
const ownerAddress = ref('');

// Providers
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

// Computed properties
const contractAddressValid = computed(() => isValidAddress(contractAddressInput.value));
const rpcValid = computed(
  () => walletConnected.value || (rpcInput.value.trim() !== '' && rpcInput.value.startsWith('http')),
);
const canQuery = computed(() => contractAddressValid.value && rpcValid.value && !isEOA.value);

// Helper functions
function isValidAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

function resetStatus() {
  errorMessage.value = '';
  isEOA.value = false;
  ownerAddress.value = '';
}

// Wallet connection
async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      networkInfo.value = `${network.name} (Chain ID: ${network.chainId})`;
      walletConnected.value = true;
      rpcInput.value = 'Connected to Wallet RPC';
      if (contractAddressValid.value) {
        await checkIfEOA();
      }
    }
    catch (error) {
      errorMessage.value = 'Failed to connect to the wallet';
      console.error(error);
    }
  }
  else {
    errorMessage.value = 'No Ethereum provider found. Please install MetaMask.';
  }
}

async function disconnectWallet() {
  provider = null;
  walletConnected.value = false;
  rpcInput.value = '';
  networkInfo.value = '';
  resetStatus();
}

async function checkIfEOA() {
  if (!provider || !contractAddressValid.value) {
    return;
  }

  try {
    const code = await provider.getCode(contractAddressInput.value);
    isEOA.value = code === '0x';
  }
  catch (error) {
    console.error('Error checking if address is EOA:', error);
    isEOA.value = false;
  }
}

// Main functionality
async function queryOwner() {
  resetStatus();

  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, ERC173_ABI, provider);
    ownerAddress.value = await contract.owner();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query owner';
    console.error(error);
  }
}

// Watch for changes in the contract address
watch(contractAddressInput, async (newValue) => {
  resetStatus();
  if (isValidAddress(newValue) && provider) {
    await checkIfEOA();
  }
});

// Watch for changes in RPC input
watch(rpcInput, async () => {
  resetStatus();
  if (!walletConnected.value && rpcValid.value) {
    try {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
      const network = await provider.getNetwork();
      networkInfo.value = `${network.name} (Chain ID: ${network.chainId})`;
      walletConnected.value = true;
      if (contractAddressValid.value) {
        await checkIfEOA();
      }
    }
    catch (error) {
      console.error('Error creating provider:', error);
      provider = null;
    }
  }
});
</script>

<template>
  <c-card title="ERC173 config">
    <div align-center mb-2 flex>
      <c-input-text
        v-model:value="rpcInput"
        :placeholder="walletConnected ? 'Connected to Wallet RPC' : 'RPC of the network...'"
        :readonly="walletConnected"
        label="Network: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button @click="walletConnected ? disconnectWallet() : connectWallet()">
        {{ walletConnected ? 'Disconnect' : 'Connect Wallet' }}
      </c-button>
    </div>

    <div v-if="walletConnected" mb-2>
      <span>Connected Network: {{ networkInfo }}</span>
    </div>

    <c-input-text
      v-model:value="contractAddressInput"
      placeholder="Contract address..."
      label="Contract: "
      label-position="left"
      label-align="right"
      label-width="100px"
      mb-3
    />
    <div v-if="isEOA" class="error-message" mb-2>
      This address is an Externally Owned Account (EOA), not a contract.
    </div>

    <div class="button-container" mb-3>
      <c-button :disabled="!canQuery" @click="queryOwner">
        Query Owner
      </c-button>
    </div>

    <input-copyable
      label="Owner: "
      label-position="left"
      label-align="right"
      label-width="100px"
      :value="ownerAddress"
      placeholder="Contract owner address..."
      readonly
      mt-2
    />

    <div v-if="errorMessage" class="error-message" mt-2>
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.button-container {
  display: flex;
  justify-content: center;
}

.error-message {
  color: v-bind('themeVars.errorColor');
  font-size: 0.9em;
}
</style>

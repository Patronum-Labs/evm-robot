<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC165_ABI = ['function supportsInterface(bytes4 interfaceId) view returns (bool)'];

// Theme
const themeVars = useThemeVars();

// State
const rpcInput = ref('');
const contractAddressInput = ref('');
const interfaceId = ref('');
const isSupported = ref(false);
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');
const isEOA = ref(false);

// Providers
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

// Computed properties
const contractAddressValid = computed(() => isValidAddress(contractAddressInput.value));
const interfaceIdValid = computed(() => isValidInterfaceId(interfaceId.value));
const rpcValid = computed(
  () => walletConnected.value || (rpcInput.value.trim() !== '' && rpcInput.value.startsWith('http')),
);
const canQuery = computed(() => contractAddressValid.value && interfaceIdValid.value && rpcValid.value && !isEOA.value);

// Helper functions
function isValidAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

function isValidInterfaceId(id: string): boolean {
  return id.startsWith('0x') && id.length === 10;
}

function resetSupportStatus() {
  isSupported.value = false;
  errorMessage.value = '';
  isEOA.value = false;
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
  resetSupportStatus();
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
async function checkSupportsInterface() {
  resetSupportStatus();

  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, ERC165_ABI, provider);
    isSupported.value = await contract.supportsInterface(interfaceId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to check interface support';
    console.error(error);
  }
}

// Watch for changes in the contract address
watch(contractAddressInput, async (newValue) => {
  if (isValidAddress(newValue) && provider) {
    await checkIfEOA();
  }
  else {
    isEOA.value = false;
  }
});

// Watch for changes in RPC input
watch(rpcInput, async () => {
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
  <c-card title="ERC165">
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

    <c-input-text
      v-model:value="interfaceId"
      placeholder="Interface ID (bytes4)..."
      label="Interface ID: "
      label-position="left"
      label-align="right"
      label-width="100px"
      mb-3
    />

    <div class="button-container" mb-3>
      <c-button :disabled="!canQuery" @click="checkSupportsInterface">
        Query
      </c-button>
    </div>

    <input-copyable
      label="Supported: "
      label-position="left"
      label-align="right"
      label-width="100px"
      :value="isSupported"
      placeholder="Interface support status..."
      readonly
      mt-2
    />

    <div v-if="errorMessage" class="error-message" mt-2>
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.compare-result {
  color: v-bind('themeVars.errorColor');

  &.positive {
    color: v-bind('themeVars.successColor');
  }
}

.button-container {
  display: flex;
  justify-content: center;
}

.error-message {
  color: v-bind('themeVars.errorColor');
  font-size: 0.9em;
}
</style>

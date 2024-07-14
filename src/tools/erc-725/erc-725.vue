<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC725_ABI = [
  'function getData(bytes32 dataKey) external view returns(bytes memory)',
  'function getDataBatch(bytes32[] memory dataKeys) external view returns(bytes[] memory)',
];

// Theme
const themeVars = useThemeVars();

// State
const rpcInput = ref('');
const contractAddressInput = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');
const isEOA = ref(false);

const dataKey = ref('');
const dataResult = ref('');

const dataBatchKeys = ref('');
const dataBatchResult = ref('');

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
  dataResult.value = '';
  dataBatchResult.value = '';
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
async function queryData() {
  if (!dataKey.value) {
    errorMessage.value = 'Data key is required';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, ERC725_ABI, provider);
    const result = await contract.getData(dataKey.value);
    dataResult.value = result;
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query data';
    console.error(error);
  }
}

async function queryDataBatch() {
  const keys = dataBatchKeys.value.split(',').map(key => key.trim());

  if (keys.length === 0) {
    errorMessage.value = 'At least one data key is required';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, ERC725_ABI, provider);
    const results = await contract.getDataBatch(keys.map(key => key));
    dataBatchResult.value = results.join(', ');
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query data batch';
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
  <c-card title="ERC725 Query">
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

    <div class="separator" mb-3 />

    <c-input-text v-model:value="dataKey" label="Data Key: " label-position="left" label-align="right" label-width="100px" placeholder="Enter data key..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryData">
        Query Data
      </c-button>
    </div>

    <c-input-text v-model:value="dataResult" label="Data: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="dataBatchKeys" label="Batch Keys: " label-position="left" label-align="right" label-width="100px" placeholder="Comma-separated data keys..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryDataBatch">
        Query Data Batch
      </c-button>
    </div>

    <c-input-text v-model:value="dataBatchResult" label="Batch Data: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

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

.input-container {
  display: flex;
  gap: 10px;
}

.error-message {
  color: v-bind('themeVars.errorColor');
  font-size: 0.9em;
}

.separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 15px 0;
}
</style>

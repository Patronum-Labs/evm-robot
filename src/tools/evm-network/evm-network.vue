<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Theme
const themeVars = useThemeVars();

// State
const rpcInput = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);

const networkName = ref('');
const networkChainId = ref('');
const latestBlockNumber = ref(0);
const blockTimestamp = ref('');
const latestBlockHash = ref('');
const latestGasPrice = ref('');
const latestMaxFeePerGas = ref('');
const latestMaxPriorityFeePerGas = ref('');

// Providers
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;

// Computed properties
const rpcValid = computed(
  () => walletConnected.value || (rpcInput.value.trim() !== '' && rpcInput.value.startsWith('http')),
);

function resetStatus() {
  errorMessage.value = '';
  networkName.value = '';
  networkChainId.value = '';
  latestBlockNumber.value = 0;
  blockTimestamp.value = '';
  latestBlockHash.value = '';
  latestGasPrice.value = '';
  latestMaxFeePerGas.value = '';
  latestMaxPriorityFeePerGas.value = '';
}

function formatFeeData(feeData: ethers.FeeData): {
  gasPrice: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
} {
  return {
    gasPrice: ethers.formatUnits(feeData.gasPrice || 0n, 'gwei'),
    maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas || 0n, 'gwei'),
    maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas || 0n, 'gwei'),
  };
}

// Wallet connection
async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      walletConnected.value = true;
      rpcInput.value = 'Connected to Wallet RPC';
      await getBlockchainInfo();
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
  provider = undefined;
  walletConnected.value = false;
  rpcInput.value = '';
  resetStatus();
}

// Main functionality
async function getBlockchainInfo() {
  if (!rpcValid.value) {
    return;
  }

  try {
    if (!walletConnected.value) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const network = await provider.getNetwork();
    networkName.value = network.name;
    networkChainId.value = network.chainId.toString();

    latestBlockNumber.value = await provider.getBlockNumber();
    const block = await provider.getBlock(latestBlockNumber.value);
    blockTimestamp.value = new Date(Number(block.timestamp) * 1000).toLocaleString();
    latestBlockHash.value = block.hash;

    const feeData = await provider.getFeeData();
    const formattedFeeData = formatFeeData(feeData);

    latestGasPrice.value = formattedFeeData.gasPrice;
    latestMaxFeePerGas.value = formattedFeeData.maxFeePerGas;
    latestMaxPriorityFeePerGas.value = formattedFeeData.maxPriorityFeePerGas;

    errorMessage.value = '';
  }
  catch (error) {
    resetStatus();
    errorMessage.value = 'Error: Failed to get blockchain information';
    console.error(error);
  }
}

// Watch for changes in RPC input
watch(rpcInput, async () => {
  resetStatus();
  if (!walletConnected.value && rpcValid.value) {
    await getBlockchainInfo();
  }
});

// Setup interval for fetching blockchain info
let intervalId: number | null = null;

onMounted(() => {
  // Start the interval only if there's a valid RPC
  if (rpcValid.value) {
    getBlockchainInfo();
    intervalId = setInterval(getBlockchainInfo, 5000);
  }
});

// Watch for changes in rpcValid to start/stop the interval
watch(rpcValid, (newValue) => {
  if (newValue) {
    if (!intervalId) {
      getBlockchainInfo();
      intervalId = setInterval(getBlockchainInfo, 5000);
    }
  }
  else {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});
</script>

<template>
  <c-card title="EVM Blockchain Information">
    <div align-center flex>
      <c-input-text
        v-model:value="rpcInput"
        :placeholder="walletConnected ? 'Connected to Wallet RPC' : 'RPC of the network...'"
        :readonly="walletConnected"
        label="Network: "
        label-position="left"
        label-align="right"
        label-width="100px"
        mb-2
      />
      <c-button @click="walletConnected ? disconnectWallet() : connectWallet()">
        {{ walletConnected ? 'Disconnect' : 'Connect Wallet' }}
      </c-button>
    </div>

    <c-input-text
      v-model:value="networkName"
      placeholder="Network name..."
      label="Network Name: "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="networkChainId"
      placeholder="Network chain ID..."
      label="Chain ID: "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="blockTimestamp"
      placeholder="Block timestamp..."
      label="Block Timestamp: "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="latestBlockNumber"
      placeholder="Latest block number..."
      label="Latest Block Number: "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="latestBlockHash"
      placeholder="Latest block hash..."
      label="Latest Block Hash: "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="latestGasPrice"
      :placeholder="latestGasPrice || 'Not available'"
      label="Gas Price (Gwei): "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="latestMaxFeePerGas"
      :placeholder="latestMaxFeePerGas || 'Not available'"
      label="Max Fee (Gwei): "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <c-input-text
      v-model:value="latestMaxPriorityFeePerGas"
      :placeholder="latestMaxPriorityFeePerGas || 'Not available'"
      label="Max Priority Fee (Gwei): "
      label-position="left"
      label-align="right"
      label-width="100px"
      readonly
      mb-3
    />

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.error-message {
  color: v-bind('themeVars.errorColor');
  font-size: 0.9em;
  margin-top: 10px;
}
</style>

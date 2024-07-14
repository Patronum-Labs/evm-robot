<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ethers } from 'ethers';

// State
const rpcInput = ref('');
const addressInput = ref('');
const storageSlot = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');

const bytecode = ref('');
const balance = ref('');
const transactionCount = ref('');
const storageValue = ref('');

// Provider
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

// Computed properties
const addressValid = computed(() => isValidAddress(addressInput.value));
const rpcValid = computed(
  () => walletConnected.value || (rpcInput.value.trim() !== '' && rpcInput.value.startsWith('http')),
);
const canQuery = computed(() => addressValid.value && rpcValid.value);

// Helper functions
function isValidAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

function resetStatus() {
  errorMessage.value = '';
  bytecode.value = '';
  balance.value = '';
  transactionCount.value = '';
  storageValue.value = '';
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

// Main functionality
async function queryAddressInfo() {
  resetStatus();

  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    // Get bytecode
    bytecode.value = await provider.getCode(addressInput.value);

    // Get balance
    const balanceWei = await provider.getBalance(addressInput.value);
    balance.value = `${ethers.formatEther(balanceWei)} ETH`;

    // Get transaction count
    transactionCount.value = (await provider.getTransactionCount(addressInput.value)).toString();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query address info';
    console.error(error);
  }
}

async function queryStorageSlot() {
  if (!storageSlot.value) {
    errorMessage.value = 'Please enter a storage slot';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    storageValue.value = await provider.getStorage(addressInput.value, storageSlot.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query storage slot';
    console.error(error);
  }
}

// Watch for changes in RPC input
watch(rpcInput, () => {
  resetStatus();
  if (!walletConnected.value && rpcValid.value) {
    provider = new ethers.JsonRpcProvider(rpcInput.value);
  }
});
</script>

<template>
  <c-card title="Address Information Query">
    <div class="grid-container">
      <div class="label">
        Network:
      </div>
      <div class="input-container">
        <c-input-text
          v-model:value="rpcInput"
          :placeholder="walletConnected ? 'Connected to Wallet RPC' : 'RPC of the network...'"
          :readonly="walletConnected"
        />
        <c-button @click="walletConnected ? disconnectWallet() : connectWallet()">
          {{ walletConnected ? 'Disconnect' : 'Connect Wallet' }}
        </c-button>
      </div>

      <div class="label">
        Connected Network:
      </div>
      <c-input-text v-model:value="networkInfo" readonly placeholder="Not connected" />

      <div class="label">
        Address:
      </div>
      <div class="input-container">
        <c-input-text v-model:value="addressInput" placeholder="Enter address..." />
        <c-button :disabled="!canQuery" @click="queryAddressInfo">
          Query
        </c-button>
      </div>

      <div class="label">
        Bytecode:
      </div>
      <c-input-text v-model:value="bytecode" readonly />

      <div class="label">
        Balance:
      </div>
      <c-input-text v-model:value="balance" readonly />

      <div class="label">
        Transaction Count:
      </div>
      <c-input-text v-model:value="transactionCount" readonly />

      <div class="label">
        Storage Slot:
      </div>
      <div class="input-container">
        <c-input-text v-model:value="storageSlot" placeholder="Enter storage slot..." />
        <c-button :disabled="!canQuery" @click="queryStorageSlot">
          Query Storage
        </c-button>
      </div>

      <div class="label">
        Storage Value:
      </div>
      <c-input-text v-model:value="storageValue" readonly />
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.grid-container {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.label {
  text-align: right;
  padding-right: 10px;
}

.input-container {
  display: flex;
  gap: 10px;

  :deep(.c-input-text) {
    flex-grow: 1;
  }
}

.error-message {
  color: red;
  font-size: 0.9em;
  margin-top: 10px;
  grid-column: 1 / -1;
}

:deep(.c-input-text) {
  width: 100%;
}
</style>

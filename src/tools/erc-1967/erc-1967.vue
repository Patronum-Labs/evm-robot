<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

const rpcInput = ref('');
const contractAddressInput = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');

const logicContractAddress = ref('');
const beaconContractAddress = ref('');
const adminAddress = ref('');

let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

const LOGIC_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const BEACON_SLOT = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50';
const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';

const contractAddressValid = computed(() => isValidAddress(contractAddressInput.value));
const rpcValid = computed(() => walletConnected.value || (rpcInput.value.trim() !== '' && rpcInput.value.startsWith('http')));
const canQuery = computed(() => contractAddressValid.value && rpcValid.value);

function isValidAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

function bytesToAddress(bytes: string): string {
  return ethers.getAddress(`0x${bytes.slice(-40)}`);
}

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
  resetResults();
}

function resetResults() {
  logicContractAddress.value = '';
  beaconContractAddress.value = '';
  adminAddress.value = '';
  errorMessage.value = '';
}

async function queryProxyInfo() {
  resetResults();

  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const logicSlotData = await provider.getStorage(contractAddressInput.value, LOGIC_SLOT);
    const beaconSlotData = await provider.getStorage(contractAddressInput.value, BEACON_SLOT);
    const adminSlotData = await provider.getStorage(contractAddressInput.value, ADMIN_SLOT);

    logicContractAddress.value = bytesToAddress(logicSlotData.slice(2));
    beaconContractAddress.value = bytesToAddress(beaconSlotData.slice(2));
    adminAddress.value = bytesToAddress(adminSlotData.slice(2));
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query proxy info';
    console.error(error);
  }
}
</script>

<template>
  <c-card title="ERC1967 Proxy Query">
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
      placeholder="Proxy contract address..."
      label="Proxy: "
      label-position="left"
      label-align="right"
      label-width="100px"
      mb-3
    />

    <div class="button-container" mb-3>
      <c-button :disabled="!canQuery" @click="queryProxyInfo">
        Query Proxy Info
      </c-button>
    </div>

    <c-input-text
      :value="logicContractAddress"
      label="Logic Contract: "
      label-position="left"
      label-align="right"
      label-width="150px"
      readonly
      mb-2
    />
    <c-input-text
      :value="beaconContractAddress"
      label="Beacon Contract: "
      label-position="left"
      label-align="right"
      label-width="150px"
      readonly
      mb-2
    />
    <c-input-text
      :value="adminAddress"
      label="Admin Address: "
      label-position="left"
      label-align="right"
      label-width="150px"
      readonly
      mb-2
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
  color: red;
  font-size: 0.9em;
}
</style>

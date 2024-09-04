<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

const themeVars = useThemeVars();

const rpcInput = ref('');
const contractAddressInput = ref('');
const bytecodeInput = ref('');
const errorMessage = ref('');
const walletConnected = ref(false);
const networkInfo = ref('');
const implementationAddress = ref('');

let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

const canQuery = computed(() =>
  (contractAddressInput.value && rpcInput.value) || bytecodeInput.value,
);

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

function disconnectWallet() {
  provider = null;
  walletConnected.value = false;
  rpcInput.value = '';
  networkInfo.value = '';
  errorMessage.value = '';
}

function extractImplementationFromBytecode(bytecode: string) {
  try {
    const minimalProxyPattern = /^0x365f5f375f5f365f73([0-9a-fA-F]{40})5af43d5f5f3e5f3d91602a57fd5bf3/;
    const match = bytecode.match(minimalProxyPattern);

    if (match) {
      const implementationAddressHex = `0x${match[1]}`;
      implementationAddress.value = ethers.getAddress(implementationAddressHex);
      errorMessage.value = '';
    }
    else {
      implementationAddress.value = '';
      errorMessage.value = 'Error: This is not a minimal proxy (ERC-7511) contract';
    }
  }
  catch (error) {
    implementationAddress.value = '';
    errorMessage.value = 'Error: Failed to extract implementation address';
    console.error(error);
  }
}

async function queryImplementation() {
  errorMessage.value = '';
  implementationAddress.value = '';

  try {
    let bytecode: string;

    if (contractAddressInput.value && rpcInput.value) {
      if (!provider || !walletConnected.value) {
        provider = new ethers.JsonRpcProvider(rpcInput.value);
      }
      bytecode = await provider.getCode(contractAddressInput.value);
      bytecodeInput.value = bytecode;
    }
    else if (bytecodeInput.value) {
      bytecode = bytecodeInput.value;
    }
    else {
      throw new Error('Please provide either a contract address and RPC, or bytecode');
    }

    extractImplementationFromBytecode(bytecode);
  }
  catch (error) {
    errorMessage.value = `Error: ${error.message}`;
    console.error(error);
  }
}

watch(rpcInput, async () => {
  if (!walletConnected.value && rpcInput.value) {
    try {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
      const network = await provider.getNetwork();
      networkInfo.value = `${network.name} (Chain ID: ${network.chainId})`;
      walletConnected.value = true;
    }
    catch (error) {
      console.error('Error creating provider:', error);
      provider = null;
    }
  }
});
</script>

<template>
  <c-card title="ERC7511 config">
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

    <c-input-text
      v-model:value="bytecodeInput"
      placeholder="Bytecode..."
      label="Bytecode: "
      label-position="left"
      label-align="right"
      label-width="100px"
      mb-3
    />

    <div class="button-container" mb-3>
      <c-button :disabled="!canQuery" @click="queryImplementation">
        Query Implementation
      </c-button>
    </div>

    <input-copyable
      label="Implementation: "
      label-position="left"
      label-align="right"
      label-width="100px"
      :value="implementationAddress"
      placeholder="Implementation address..."
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

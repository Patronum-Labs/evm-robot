<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
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

const tokenName = ref('');
const tokenSymbol = ref('');
const tokenDecimals = ref('');
const tokenTotalSupply = ref('');

const balanceAddress = ref('');
const balanceResult = ref('');

const allowanceOwner = ref('');
const allowanceSpender = ref('');
const allowanceResult = ref('');

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
  tokenName.value = '';
  tokenSymbol.value = '';
  tokenDecimals.value = '';
  tokenTotalSupply.value = '';
  balanceResult.value = '';
  allowanceResult.value = '';
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
async function queryTokenInfo() {
  resetStatus();

  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, ERC20_ABI, provider);
    tokenName.value = await contract.name();
    tokenSymbol.value = await contract.symbol();
    tokenDecimals.value = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    tokenTotalSupply.value = ethers.formatUnits(totalSupply, tokenDecimals.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query token info';
    console.error(error);
  }
}

async function queryBalance() {
  if (!isValidAddress(balanceAddress.value)) {
    errorMessage.value = 'Invalid address for balance query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC20_ABI, provider);
    const balance = await contract.balanceOf(balanceAddress.value);
    balanceResult.value = ethers.formatUnits(balance, tokenDecimals.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query balance';
    console.error(error);
  }
}

async function queryAllowance() {
  if (!isValidAddress(allowanceOwner.value) || !isValidAddress(allowanceSpender.value)) {
    errorMessage.value = 'Invalid address(es) for allowance query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC20_ABI, provider);
    const allowance = await contract.allowance(allowanceOwner.value, allowanceSpender.value);
    allowanceResult.value = ethers.formatUnits(allowance, tokenDecimals.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query allowance';
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
  <c-card title="ERC20 Token Query">
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
      <c-button :disabled="!canQuery" @click="queryTokenInfo">
        Query Token Info
      </c-button>
    </div>

    <c-input-text v-model:value="tokenName" label="Name: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />
    <c-input-text v-model:value="tokenSymbol" label="Symbol: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />
    <c-input-text v-model:value="tokenDecimals" label="Decimals: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />
    <c-input-text v-model:value="tokenTotalSupply" label="Total Supply: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="balanceAddress"
        placeholder="Address to check balance..."
        label="Balance Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryBalance">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="balanceResult" label="Balance: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="allowanceOwner" label="Owner: " label-position="left" label-align="right" label-width="100px" placeholder="Owner address..." mb-2 />
    <c-input-text v-model:value="allowanceSpender" label="Spender: " label-position="left" label-align="right" label-width="100px" placeholder="Spender address..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryAllowance">
        Query Allowance
      </c-button>
    </div>

    <c-input-text v-model:value="allowanceResult" label="Allowance: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

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

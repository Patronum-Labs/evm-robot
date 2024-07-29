<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const LSP7_ABI = [
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function authorizedAmountFor(address,address) view returns (uint256)',
  'function getOperatorsOf(address) view returns (address[])',
  'function supportsInterface(bytes4) view returns (bool)',
  'function owner() view returns (address)',
  'function getData(bytes32) view returns (bytes)',
  'function getDataBatch(bytes32[]) view returns (bytes[])',
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

const tokenDecimals = ref('');
const tokenTotalSupply = ref('');

const balanceAddress = ref('');
const balanceResult = ref('');

const authorizedAmountForOperator = ref('');
const authorizedAmountForTokenOwner = ref('');
const authorizedAmountResult = ref('');

const getOperatorsOfAddress = ref('');
const operatorsResult = ref([]);

const interfaceId = ref('');
const supportsInterfaceResult = ref('');

const ownerResult = ref('');

const getDataKey = ref('');
const getDataResult = ref('');

const getDataBatchKeys = ref('');
const getDataBatchResult = ref([]);

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
  tokenDecimals.value = '';
  tokenTotalSupply.value = '';
  balanceResult.value = '';
  authorizedAmountResult.value = '';
  operatorsResult.value = [];
  supportsInterfaceResult.value = '';
  ownerResult.value = '';
  getDataResult.value = '';
  getDataBatchResult.value = [];
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

    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
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
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    const balance = await contract.balanceOf(balanceAddress.value);
    balanceResult.value = ethers.formatUnits(balance, tokenDecimals.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query balance';
    console.error(error);
  }
}

async function queryAuthorizedAmount() {
  if (!isValidAddress(authorizedAmountForOperator.value) || !isValidAddress(authorizedAmountForTokenOwner.value)) {
    errorMessage.value = 'Invalid address(es) for authorized amount query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    const amount = await contract.authorizedAmountFor(authorizedAmountForOperator.value, authorizedAmountForTokenOwner.value);
    authorizedAmountResult.value = ethers.formatUnits(amount, tokenDecimals.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query authorized amount';
    console.error(error);
  }
}

async function queryOperators() {
  if (!isValidAddress(getOperatorsOfAddress.value)) {
    errorMessage.value = 'Invalid address for operators query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    operatorsResult.value = await contract.getOperatorsOf(getOperatorsOfAddress.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query operators';
    console.error(error);
  }
}

async function querySupportsInterface() {
  if (!interfaceId.value.startsWith('0x') || interfaceId.value.length !== 10) {
    errorMessage.value = 'Invalid interface ID';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    supportsInterfaceResult.value = await contract.supportsInterface(interfaceId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query supportsInterface';
    console.error(error);
  }
}

async function queryOwner() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    ownerResult.value = await contract.owner();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query owner';
    console.error(error);
  }
}

async function queryGetData() {
  if (!getDataKey.value.startsWith('0x') || getDataKey.value.length !== 66) {
    errorMessage.value = 'Invalid data key';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    getDataResult.value = await contract.getData(getDataKey.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query getData';
    console.error(error);
  }
}

async function queryGetDataBatch() {
  const keys = getDataBatchKeys.value.split(',').map(key => key.trim());
  if (!keys.every(key => key.startsWith('0x') && key.length === 66)) {
    errorMessage.value = 'Invalid data keys';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP7_ABI, provider);
    getDataBatchResult.value = await contract.getDataBatch(keys);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query getDataBatch';
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
  <c-card title="LSP7 Token Query">
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

    <c-input-text v-model:value="authorizedAmountForOperator" label="Operator: " label-position="left" label-align="right" label-width="100px" placeholder="Operator address..." mb-2 />
    <c-input-text v-model:value="authorizedAmountForTokenOwner" label="Token Owner: " label-position="left" label-align="right" label-width="100px" placeholder="Token owner address..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryAuthorizedAmount">
        Query Authorized Amount
      </c-button>
    </div>

    <c-input-text v-model:value="authorizedAmountResult" label="Authorized Amount: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getOperatorsOfAddress"
        placeholder="Address to check operators..."
        label="Get Operators Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryOperators">
        Query
      </c-button>
    </div>

    <div v-if="operatorsResult.length > 0">
      <p>Operators:</p>
      <ul>
        <li v-for="operator in operatorsResult" :key="operator">
          {{ operator }}
        </li>
      </ul>
    </div>

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="interfaceId"
        placeholder="Interface ID (e.g., 0x01ffc9a7)"
        label="Supports Interface: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="querySupportsInterface">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="supportsInterfaceResult" label="Supports: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryOwner">
        Query Owner
      </c-button>
    </div>

    <c-input-text v-model:value="ownerResult" label="Owner: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getDataKey"
        placeholder="Data key (32 bytes)"
        label="Get Data: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetData">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="getDataResult" label="Data: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getDataBatchKeys"
        placeholder="Data keys (comma-separated 32 byte keys)"
        label="Get Data Batch: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetDataBatch">
        Query
      </c-button>
    </div>

    <div v-if="getDataBatchResult.length > 0">
      <p>Data Batch Results:</p>
      <ul>
        <li v-for="(data, index) in getDataBatchResult" :key="index">
          {{ data }}
        </li>
      </ul>
    </div>

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

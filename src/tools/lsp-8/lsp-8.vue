<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const LSP8_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function tokenOwnerOf(bytes32) view returns (address)',
  'function tokenIdsOf(address) view returns (bytes32[])',
  'function getDataForTokenId(bytes32,bytes32) view returns (bytes)',
  'function getDataBatchForTokenIds(bytes32[],bytes32[]) view returns (bytes[])',
  'function isOperatorFor(address,bytes32) view returns (bool)',
  'function getOperatorsOf(bytes32) view returns (address[])',
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

const totalSupply = ref('');

const balanceAddress = ref('');
const balanceResult = ref('');

const tokenOwnerOfId = ref('');
const tokenOwnerResult = ref('');

const tokenIdsOfAddress = ref('');
const tokenIdsResult = ref([]);

const getDataTokenId = ref('');
const getDataKey = ref('');
const getDataResult = ref('');

const getDataBatchTokenIds = ref('');
const getDataBatchKeys = ref('');
const getDataBatchResult = ref([]);

const isOperatorForAddress = ref('');
const isOperatorForTokenId = ref('');
const isOperatorResult = ref('');

const getOperatorsOfTokenId = ref('');
const operatorsResult = ref([]);

const interfaceId = ref('');
const supportsInterfaceResult = ref('');

const ownerResult = ref('');

const getDataKeyGlobal = ref('');
const getDataResultGlobal = ref('');

const getDataBatchKeysGlobal = ref('');
const getDataBatchResultGlobal = ref([]);

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
  totalSupply.value = '';
  balanceResult.value = '';
  tokenOwnerResult.value = '';
  tokenIdsResult.value = [];
  getDataResult.value = '';
  getDataBatchResult.value = [];
  isOperatorResult.value = '';
  operatorsResult.value = [];
  supportsInterfaceResult.value = '';
  ownerResult.value = '';
  getDataResultGlobal.value = '';
  getDataBatchResultGlobal.value = [];
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
async function queryTotalSupply() {
  if (!canQuery.value) {
    errorMessage.value = 'Invalid input or no RPC/provider available';
    return;
  }

  try {
    if (!provider) {
      provider = new ethers.JsonRpcProvider(rpcInput.value);
    }

    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    totalSupply.value = await contract.totalSupply();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query total supply';
    console.error(error);
  }
}

async function queryBalance() {
  if (!isValidAddress(balanceAddress.value)) {
    errorMessage.value = 'Invalid address for balance query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    balanceResult.value = await contract.balanceOf(balanceAddress.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query balance';
    console.error(error);
  }
}

async function queryTokenOwner() {
  if (!tokenOwnerOfId.value) {
    errorMessage.value = 'Invalid token ID for owner query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    tokenOwnerResult.value = await contract.tokenOwnerOf(tokenOwnerOfId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query token owner';
    console.error(error);
  }
}

async function queryTokenIds() {
  if (!isValidAddress(tokenIdsOfAddress.value)) {
    errorMessage.value = 'Invalid address for token IDs query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    tokenIdsResult.value = await contract.tokenIdsOf(tokenIdsOfAddress.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query token IDs';
    console.error(error);
  }
}

async function queryGetData() {
  if (!getDataTokenId.value || !getDataKey.value) {
    errorMessage.value = 'Invalid token ID or data key for getData query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    getDataResult.value = await contract.getDataForTokenId(getDataTokenId.value, getDataKey.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query getData';
    console.error(error);
  }
}

async function queryGetDataBatch() {
  const tokenIds = getDataBatchTokenIds.value.split(',').map(id => id.trim());
  const keys = getDataBatchKeys.value.split(',').map(key => key.trim());

  if (tokenIds.length !== keys.length) {
    errorMessage.value = 'Number of token IDs must match number of data keys';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    getDataBatchResult.value = await contract.getDataBatchForTokenIds(tokenIds, keys);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query getDataBatch';
    console.error(error);
  }
}

async function queryIsOperatorFor() {
  if (!isValidAddress(isOperatorForAddress.value) || !isOperatorForTokenId.value) {
    errorMessage.value = 'Invalid operator address or token ID for isOperatorFor query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    isOperatorResult.value = await contract.isOperatorFor(isOperatorForAddress.value, isOperatorForTokenId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query isOperatorFor';
    console.error(error);
  }
}

async function queryGetOperatorsOf() {
  if (!getOperatorsOfTokenId.value) {
    errorMessage.value = 'Invalid token ID for getOperatorsOf query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    operatorsResult.value = await contract.getOperatorsOf(getOperatorsOfTokenId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query getOperatorsOf';
    console.error(error);
  }
}

async function querySupportsInterface() {
  if (!interfaceId.value.startsWith('0x') || interfaceId.value.length !== 10) {
    errorMessage.value = 'Invalid interface ID';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    supportsInterfaceResult.value = await contract.supportsInterface(interfaceId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query supportsInterface';
    console.error(error);
  }
}

async function queryOwner() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    ownerResult.value = await contract.owner();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query owner';
    console.error(error);
  }
}

async function queryGetDataGlobal() {
  if (!getDataKeyGlobal.value) {
    errorMessage.value = 'Invalid data key for global getData query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    getDataResultGlobal.value = await contract.getData(getDataKeyGlobal.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query global getData';
    console.error(error);
  }
}

async function queryGetDataBatchGlobal() {
  const keys = getDataBatchKeysGlobal.value.split(',').map(key => key.trim());

  try {
    const contract = new ethers.Contract(contractAddressInput.value, LSP8_ABI, provider);
    getDataBatchResultGlobal.value = await contract.getDataBatch(keys);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query global getDataBatch';
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
  <c-card title="LSP8 Token Query">
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
      <c-button :disabled="!canQuery" @click="queryTotalSupply">
        Query Total Supply
      </c-button>
    </div>

    <c-input-text v-model:value="totalSupply" label="Total Supply: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

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

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="tokenOwnerOfId"
        placeholder="Token ID..."
        label="Token Owner Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryTokenOwner">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="tokenOwnerResult" label="Owner: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="tokenIdsOfAddress"
        placeholder="Address to check token IDs..."
        label="Token IDs Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryTokenIds">
        Query
      </c-button>
    </div>

    <div v-if="tokenIdsResult.length > 0">
      <p>Token IDs:</p>
      <ul>
        <li v-for="tokenId in tokenIdsResult" :key="tokenId">
          {{ tokenId }}
        </li>
      </ul>
    </div>

    <div class="separator" mb-3 />

    <c-input-text v-model:value="getDataTokenId" label="Token ID: " label-position="left" label-align="right" label-width="100px" placeholder="Token ID for getData..." mb-2 />
    <c-input-text v-model:value="getDataKey" label="Data Key: " label-position="left" label-align="right" label-width="100px" placeholder="Data key for getData..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryGetData">
        Query Get Data
      </c-button>
    </div>

    <c-input-text v-model:value="getDataResult" label="Data: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="getDataBatchTokenIds" label="Token IDs: " label-position="left" label-align="right" label-width="100px" placeholder="Comma-separated Token IDs for getDataBatch..." mb-2 />
    <c-input-text v-model:value="getDataBatchKeys" label="Data Keys: " label-position="left" label-align="right" label-width="100px" placeholder="Comma-separated Data keys for getDataBatch..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryGetDataBatch">
        Query Get Data Batch
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

    <div class="separator" mb-3 />

    <c-input-text v-model:value="isOperatorForAddress" label="Operator: " label-position="left" label-align="right" label-width="100px" placeholder="Operator address..." mb-2 />
    <c-input-text v-model:value="isOperatorForTokenId" label="Token ID: " label-position="left" label-align="right" label-width="100px" placeholder="Token ID for isOperatorFor..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryIsOperatorFor">
        Query Is Operator For
      </c-button>
    </div>

    <c-input-text v-model:value="isOperatorResult" label="Is Operator: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getOperatorsOfTokenId"
        placeholder="Token ID for getOperatorsOf..."
        label="Get Operators Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetOperatorsOf">
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
        v-model:value="getDataKeyGlobal"
        placeholder="Data key for global getData..."
        label="Get Data (Global): "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetDataGlobal">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="getDataResultGlobal" label="Data: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getDataBatchKeysGlobal"
        placeholder="Comma-separated Data keys for global getDataBatch..."
        label="Get Data Batch (Global): "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetDataBatchGlobal">
        Query
      </c-button>
    </div>

    <div v-if="getDataBatchResultGlobal.length > 0">
      <p>Global Data Batch Results:</p>
      <ul>
        <li v-for="(data, index) in getDataBatchResultGlobal" :key="index">
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

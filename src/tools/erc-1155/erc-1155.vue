<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC1155_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function uri(uint256 id) view returns (string)',
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

const balanceAddress = ref('');
const balanceTokenId = ref('');
const balanceResult = ref('');

const batchBalanceAddresses = ref('');
const batchBalanceTokenIds = ref('');
const batchBalanceResult = ref('');

const isApprovedForAllAccount = ref('');
const isApprovedForAllOperator = ref('');
const isApprovedForAllResult = ref('');

const tokenURIId = ref('');
const tokenURIResult = ref('');

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
  balanceResult.value = '';
  batchBalanceResult.value = '';
  isApprovedForAllResult.value = '';
  tokenURIResult.value = '';
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

    const contract = new ethers.Contract(contractAddressInput.value, ERC1155_ABI, provider);
    tokenName.value = await contract.name();
    tokenSymbol.value = await contract.symbol();
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
    const contract = new ethers.Contract(contractAddressInput.value, ERC1155_ABI, provider);
    const balance = await contract.balanceOf(balanceAddress.value, balanceTokenId.value);
    balanceResult.value = balance.toString();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query balance';
    console.error(error);
  }
}

async function queryBatchBalance() {
  const addresses = batchBalanceAddresses.value.split(',').map(addr => addr.trim());
  const tokenIds = batchBalanceTokenIds.value.split(',').map(id => id.trim());

  if (addresses.some(addr => !isValidAddress(addr))) {
    errorMessage.value = 'Invalid address(es) for batch balance query';
    return;
  }

  if (addresses.length !== tokenIds.length) {
    errorMessage.value = 'Number of addresses must match number of token IDs';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC1155_ABI, provider);
    const balances = await contract.balanceOfBatch(addresses, tokenIds);
    batchBalanceResult.value = balances.map(b => b.toString()).join(', ');
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query batch balance';
    console.error(error);
  }
}

async function queryIsApprovedForAll() {
  if (!isValidAddress(isApprovedForAllAccount.value) || !isValidAddress(isApprovedForAllOperator.value)) {
    errorMessage.value = 'Invalid address(es) for isApprovedForAll query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC1155_ABI, provider);
    isApprovedForAllResult.value = await contract.isApprovedForAll(isApprovedForAllAccount.value, isApprovedForAllOperator.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query isApprovedForAll';
    console.error(error);
  }
}

async function queryTokenURI() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC1155_ABI, provider);
    tokenURIResult.value = await contract.uri(tokenURIId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query token URI';
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
  <c-card title="ERC1155 Token Query">
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

    <div class="separator" mb-3 />

    <c-input-text v-model:value="balanceAddress" label="Address: " label-position="left" label-align="right" label-width="100px" placeholder="Address to check balance..." mb-2 />
    <c-input-text v-model:value="balanceTokenId" label="Token ID: " label-position="left" label-align="right" label-width="100px" placeholder="Token ID..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryBalance">
        Query Balance
      </c-button>
    </div>

    <c-input-text v-model:value="balanceResult" label="Balance: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="batchBalanceAddresses" label="Addresses: " label-position="left" label-align="right" label-width="100px" placeholder="Comma-separated addresses..." mb-2 />
    <c-input-text v-model:value="batchBalanceTokenIds" label="Token IDs: " label-position="left" label-align="right" label-width="100px" placeholder="Comma-separated token IDs..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryBatchBalance">
        Query Batch Balance
      </c-button>
    </div>

    <c-input-text v-model:value="batchBalanceResult" label="Balances: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="isApprovedForAllAccount" label="Account: " label-position="left" label-align="right" label-width="100px" placeholder="Account address..." mb-2 />
    <c-input-text v-model:value="isApprovedForAllOperator" label="Operator: " label-position="left" label-align="right" label-width="100px" placeholder="Operator address..." mb-2 />

    <div class="button-container" mb-2>
      <c-button :disabled="!canQuery" @click="queryIsApprovedForAll">
        Query isApprovedForAll
      </c-button>
    </div>

    <c-input-text v-model:value="isApprovedForAllResult" label="Is Approved: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="tokenURIId"
        placeholder="Token ID..."
        label="Token ID: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryTokenURI">
        Query URI
      </c-button>
    </div>

    <c-input-text v-model:value="tokenURIResult" label="URI: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

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

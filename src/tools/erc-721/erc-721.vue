<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThemeVars } from 'naive-ui';
import { ethers } from 'ethers';

// Constants
const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function tokenURI(uint256 tokenId) view returns (string)',
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
const balanceResult = ref('');

const ownerOfTokenId = ref('');
const ownerOfResult = ref('');

const getApprovedTokenId = ref('');
const getApprovedResult = ref('');

const isApprovedForAllOwner = ref('');
const isApprovedForAllOperator = ref('');
const isApprovedForAllResult = ref('');

const tokenURITokenId = ref('');
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
  ownerOfResult.value = '';
  getApprovedResult.value = '';
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

    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
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
    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
    const balance = await contract.balanceOf(balanceAddress.value);
    balanceResult.value = balance.toString();
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query balance';
    console.error(error);
  }
}

async function queryOwnerOf() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
    ownerOfResult.value = await contract.ownerOf(ownerOfTokenId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query owner';
    console.error(error);
  }
}

async function queryGetApproved() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
    getApprovedResult.value = await contract.getApproved(getApprovedTokenId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query approved address';
    console.error(error);
  }
}

async function queryIsApprovedForAll() {
  if (!isValidAddress(isApprovedForAllOwner.value) || !isValidAddress(isApprovedForAllOperator.value)) {
    errorMessage.value = 'Invalid address(es) for isApprovedForAll query';
    return;
  }

  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
    isApprovedForAllResult.value = await contract.isApprovedForAll(isApprovedForAllOwner.value, isApprovedForAllOperator.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query isApprovedForAll';
    console.error(error);
  }
}

async function queryTokenURI() {
  try {
    const contract = new ethers.Contract(contractAddressInput.value, ERC721_ABI, provider);
    tokenURIResult.value = await contract.tokenURI(tokenURITokenId.value);
  }
  catch (error) {
    errorMessage.value = 'Error: Failed to query tokenURI';
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
  <c-card title="ERC721 Token Query">
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
        v-model:value="ownerOfTokenId"
        placeholder="Token ID..."
        label="Owner Of: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryOwnerOf">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="ownerOfResult" label="Owner: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <div class="input-container" mb-2>
      <c-input-text
        v-model:value="getApprovedTokenId"
        placeholder="Token ID..."
        label="Approval For:"
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryGetApproved">
        Query
      </c-button>
    </div>

    <c-input-text v-model:value="getApprovedResult" label="Approved: " label-position="left" label-align="right" label-width="100px" readonly mb-2 />

    <div class="separator" mb-3 />

    <c-input-text v-model:value="isApprovedForAllOwner" label="Owner: " label-position="left" label-align="right" label-width="100px" placeholder="Owner address..." mb-2 />
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
        v-model:value="tokenURITokenId"
        placeholder="Token ID..."
        label="Token URI: "
        label-position="left"
        label-align="right"
        label-width="100px"
      />
      <c-button :disabled="!canQuery" @click="queryTokenURI">
        Query
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

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

// State for signing
const privateKey = ref('');
const walletConnected = ref(false);
const textInput = ref('');
const hexInput = ref('');
const erc191Hash = ref('');
const signatureResult = ref('');
const errorMessageSign = ref('');

// State for recovery
const signatureToRecover = ref('');
const textToRecover = ref('');
const hexToRecover = ref('');
const erc191HashToRecover = ref('');
const recoveredAddress = ref('');
const errorMessageRecover = ref('');

// Signer
let signer: ethers.Wallet | ethers.JsonRpcSigner | null = null;

// Computed properties
const canSign = computed(() => (privateKey.value || walletConnected.value) && (textInput.value || hexInput.value));
const canRecover = computed(() =>
  signatureToRecover.value
  && ((textToRecover.value || hexToRecover.value) || erc191HashToRecover.value),
);

// Helper functions
function isValidPrivateKey(key: string): boolean {
  const keyWithPrefix = key.startsWith('0x') ? key : `0x${key}`;
  return /^0x[0-9a-fA-F]{64}$/.test(keyWithPrefix);
}

function isValidHex(hex: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(hex);
}

function resetSignStatus() {
  erc191Hash.value = '';
  signatureResult.value = '';
  errorMessageSign.value = '';
}

function resetRecoverStatus() {
  recoveredAddress.value = '';
  errorMessageRecover.value = '';
}

// Wallet connection
async function connectWallet() {
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      walletConnected.value = true;
      privateKey.value = '';
    }
    catch (error) {
      errorMessageSign.value = 'Failed to connect to the wallet';
      console.error(error);
    }
  }
  else {
    errorMessageSign.value = 'No Ethereum provider found. Please install MetaMask.';
  }
}

function disconnectWallet() {
  signer = null;
  walletConnected.value = false;
  resetSignStatus();
}

// Main functionality
async function sign() {
  resetSignStatus();

  if (!canSign.value) {
    errorMessageSign.value = 'Please provide a private key or connect a wallet, and enter either text or hex to sign.';
    return;
  }

  try {
    if (!signer) {
      const formattedKey = privateKey.value.startsWith('0x') ? privateKey.value : `0x${privateKey.value}`;
      if (!isValidPrivateKey(formattedKey)) {
        throw new Error('Invalid private key');
      }
      signer = new ethers.Wallet(formattedKey);
    }

    let messageToSign: string | Uint8Array;

    if (textInput.value) {
      messageToSign = textInput.value;
    }
    else if (hexInput.value) {
      if (!isValidHex(hexInput.value)) {
        throw new Error('Invalid hex input');
      }
      messageToSign = ethers.getBytes(hexInput.value);
    }
    else {
      throw new Error('No message to sign');
    }

    // Calculate ERC-191 hash
    erc191Hash.value = ethers.hashMessage(messageToSign);

    // Sign the message
    signatureResult.value = await signer.signMessage(messageToSign);
  }
  catch (error) {
    errorMessageSign.value = `Error: ${(error as Error).message}`;
    console.error(error);
  }
}

async function recover() {
  resetRecoverStatus();

  if (!canRecover.value) {
    errorMessageRecover.value = 'Please provide a signature and either text/hex to recover from or an ERC-191 hash.';
    return;
  }

  try {
    let recoveredAddr: string;

    if (erc191HashToRecover.value) {
      // Recover using the provided ERC-191 hash
      const recoveredPublicKey = ethers.SigningKey.recoverPublicKey(
        erc191HashToRecover.value,
        signatureToRecover.value,
      );
      recoveredAddr = ethers.computeAddress(recoveredPublicKey);
    }
    else {
      // Recover using the text or hex input
      let messageToRecover: string | Uint8Array;

      if (textToRecover.value) {
        messageToRecover = textToRecover.value;
      }
      else if (hexToRecover.value) {
        if (!isValidHex(hexToRecover.value)) {
          throw new Error('Invalid hex input');
        }
        messageToRecover = ethers.getBytes(hexToRecover.value);
      }
      else {
        throw new Error('No message to recover from');
      }

      recoveredAddr = ethers.verifyMessage(messageToRecover, signatureToRecover.value);
    }

    recoveredAddress.value = recoveredAddr;
  }
  catch (error) {
    errorMessageRecover.value = `Error: ${(error as Error).message}`;
    console.error(error);
  }
}
</script>

<template>
  <div class="card-container">
    <c-card title="EIP-191 Signing" class="card">
      <div class="grid-container">
        <div class="label">
          Private Key:
        </div>
        <div class="input-container">
          <c-input-text
            v-model:value="privateKey"
            :placeholder="walletConnected ? 'Wallet connected' : 'Enter private key (with or without 0x)...'"
            :readonly="walletConnected"
            type="password"
          />
          <c-button @click="walletConnected ? disconnectWallet() : connectWallet()">
            {{ walletConnected ? 'Disconnect Wallet' : 'Connect Wallet' }}
          </c-button>
        </div>

        <div class="label">
          Text to Sign:
        </div>
        <c-input-text v-model:value="textInput" placeholder="Enter text to sign..." />

        <div class="label">
          Hex to Sign:
        </div>
        <c-input-text v-model:value="hexInput" placeholder="Enter hex to sign (0x...)..." />

        <div class="label" />
        <div class="button-container">
          <c-button :disabled="!canSign" @click="sign">
            Sign Message
          </c-button>
        </div>

        <div class="label">
          ERC-191 Hash:
        </div>
        <c-input-text v-model:value="erc191Hash" readonly />

        <div class="label">
          Signature:
        </div>
        <c-input-text v-model:value="signatureResult" readonly />
      </div>

      <div v-if="errorMessageSign" class="error-message">
        {{ errorMessageSign }}
      </div>
    </c-card>

    <c-card title="EIP-191 Recovery" class="card">
      <div class="grid-container">
        <div class="label">
          Signature:
        </div>
        <c-input-text v-model:value="signatureToRecover" placeholder="Enter signature to recover from..." />

        <div class="label">
          Text:
        </div>
        <c-input-text v-model:value="textToRecover" placeholder="Enter text to recover from..." />

        <div class="label">
          Hex:
        </div>
        <c-input-text v-model:value="hexToRecover" placeholder="Enter hex to recover from (0x...)..." />

        <div class="label">
          ERC-191 Hash:
        </div>
        <c-input-text v-model:value="erc191HashToRecover" placeholder="Enter ERC-191 hash to recover from..." />

        <div class="label" />
        <div class="button-container">
          <c-button :disabled="!canRecover" @click="recover">
            Recover Address
          </c-button>
        </div>

        <div class="label">
          Recovered Address:
        </div>
        <c-input-text v-model:value="recoveredAddress" readonly />
      </div>

      <div v-if="errorMessageRecover" class="error-message">
        {{ errorMessageRecover }}
      </div>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.card-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
}

.card {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  align-items: center;
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

.button-container {
  display: flex;
  justify-content: flex-start;
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

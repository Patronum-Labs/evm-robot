<script setup lang="ts">
import { ref, watch } from 'vue';
import { ethers } from 'ethers';

const privateKey = ref('');
const publicKeyUncompressed = ref('');
const publicKeyCompressed = ref('');
const address = ref('');
const errorMessage = ref('');

function updateFromPrivateKey(key: string) {
  try {
    const formattedKey = key.startsWith('0x') ? key : `0x${key}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
      throw new Error('Invalid private key format');
    }
    const signingKey = new ethers.SigningKey(formattedKey);
    publicKeyUncompressed.value = signingKey.publicKey;
    publicKeyCompressed.value = signingKey.compressedPublicKey;
    errorMessage.value = '';
    privateKey.value = formattedKey;
  }
  catch (error) {
    resetFields();
    errorMessage.value = 'Invalid private key';
  }
}

function updateFromPublicKey(key: string, isCompressed: boolean) {
  try {
    const formattedKey = key.startsWith('0x') ? key : `0x${key}`;
    if (isCompressed) {
      if (!/^0x0[23][0-9a-fA-F]{64}$/.test(formattedKey)) {
        throw new Error('Invalid compressed public key format');
      }
      publicKeyCompressed.value = formattedKey;
      // We can't derive uncompressed from compressed, so we leave it empty
      publicKeyUncompressed.value = '';
    }
    else {
      if (!/^0x04[0-9a-fA-F]{128}$/.test(formattedKey)) {
        throw new Error('Invalid uncompressed public key format');
      }
      publicKeyUncompressed.value = formattedKey;
      // Derive compressed key from uncompressed
      publicKeyCompressed.value = compressPublicKey(formattedKey);
    }
    privateKey.value = ''; // Clear private key as we can't derive it from public key
    errorMessage.value = '';
  }
  catch (error) {
    resetFields();
    errorMessage.value = (error as Error).message;
  }
}

function compressPublicKey(uncompressedKey: string): string {
  // Remove '0x04' prefix
  const key = uncompressedKey.slice(4);
  const x = key.slice(0, 64);
  const y = key.slice(64);
  const prefix = BigInt(`0x${y}`) % 2n === 0n ? '02' : '03';
  return `0x${prefix}${x}`;
}

watch(privateKey, (newValue) => {
  if (newValue) {
    updateFromPrivateKey(newValue);
  }
  else {
    resetFields();
  }
});

function resetFields() {
  publicKeyUncompressed.value = '';
  publicKeyCompressed.value = '';
  address.value = '';
}

function generateAddress() {
  try {
    let addr = '';
    if (privateKey.value) {
      const signingKey = new ethers.SigningKey(privateKey.value);
      addr = ethers.computeAddress(signingKey.publicKey);
    }
    else if (publicKeyUncompressed.value) {
      addr = ethers.computeAddress(publicKeyUncompressed.value);
    }
    else if (publicKeyCompressed.value) {
      addr = ethers.computeAddress(publicKeyCompressed.value);
    }
    else {
      throw new Error('Please enter a private key or public key');
    }
    address.value = addr;
    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error generating address:', error);
    errorMessage.value = `Error generating address: ${(error as Error).message}`;
    address.value = '';
  }
}
</script>

<template>
  <c-card title="Public - Private Key">
    <div class="grid-container">
      <div class="label">
        Private Key:
      </div>
      <c-input-text
        v-model:value="privateKey"
        placeholder="Enter private key (with or without 0x prefix)"
        type="password"
        @input="updateFromPrivateKey($event.target.value)"
      />

      <div class="label">
        Uncompressed Public Key:
      </div>
      <c-input-text
        v-model:value="publicKeyUncompressed"
        placeholder="Uncompressed public key (132 characters)"
        @input="updateFromPublicKey($event.target.value, false)"
      />

      <div class="label">
        Compressed Public Key:
      </div>
      <c-input-text
        v-model:value="publicKeyCompressed"
        placeholder="Compressed public key (68 characters)"
        @input="updateFromPublicKey($event.target.value, true)"
      />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!privateKey && !publicKeyUncompressed && !publicKeyCompressed" @click="generateAddress">
          Generate Address
        </c-button>
      </div>

      <div class="label">
        Address:
      </div>
      <c-input-text :value="address" placeholder="Generated Ethereum address" readonly />
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 10px;
  align-items: center;
}

.label {
  text-align: right;
  padding-right: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
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

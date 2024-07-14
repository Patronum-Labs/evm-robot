<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

const hash = ref('');
const signature = ref('');
const publicKeyCompressed = ref('');
const publicKeyUncompressed = ref('');
const address = ref('');
const errorMessage = ref('');

const isValidHash = computed(() => {
  return /^0x[0-9a-fA-F]{64}$/.test(hash.value);
});

const isValidSignature = computed(() => {
  return /^0x[0-9a-fA-F]{130}$/.test(signature.value);
});

function compressPublicKey(uncompressedKey: string): string {
  // Remove '0x04' prefix
  const key = uncompressedKey.slice(4);
  const x = key.slice(0, 64);
  const y = key.slice(64);
  const prefix = BigInt(`0x${y}`) % 2n === 0n ? '02' : '03';
  return `0x${prefix}${x}`;
}

const canRecover = computed(() => isValidHash.value && isValidSignature.value);

function recoverAddress() {
  if (!canRecover.value) {
    errorMessage.value = 'Please enter valid inputs';
    publicKeyCompressed.value = '';
    publicKeyUncompressed.value = '';
    address.value = '';
    return;
  }

  try {
    const recoveredPublicKey = ethers.SigningKey.recoverPublicKey(hash.value, signature.value);
    const recoveredAddress = ethers.computeAddress(recoveredPublicKey);

    publicKeyUncompressed.value = recoveredPublicKey;
    publicKeyCompressed.value = compressPublicKey(recoveredPublicKey);
    address.value = recoveredAddress;
    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error recovering public key and address:', error);
    errorMessage.value = 'Error recovering public key and address';
    publicKeyCompressed.value = '';
    publicKeyUncompressed.value = '';
    address.value = '';
  }
}
</script>

<template>
  <c-card title="Recover address">
    <div class="grid-container">
      <div class="label">
        Hash:
      </div>
      <c-input-text v-model:value="hash" placeholder="Enter hash..." />

      <div class="label">
        Signature:
      </div>
      <c-input-text v-model:value="signature" placeholder="Enter signature..." />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!canRecover" @click="recoverAddress">
          Recover
        </c-button>
      </div>

      <div class="label">
        Public key (compressed):
      </div>
      <c-input-text :value="publicKeyCompressed" placeholder="Compressed public key..." readonly />

      <div class="label">
        Public key (uncompressed):
      </div>
      <c-input-text :value="publicKeyUncompressed" placeholder="Uncompressed public key..." readonly />

      <div class="label">
        Address:
      </div>
      <c-input-text :value="address" placeholder="Address..." readonly />
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

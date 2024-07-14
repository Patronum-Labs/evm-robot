<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

const textInput = ref('');
const bytesInput = ref('');
const hashResult = ref('');
const errorMessage = ref('');

const canCompute = computed(() => textInput.value || bytesInput.value);

function isValidHex(hex: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(hex);
}

function computeHash() {
  errorMessage.value = '';
  hashResult.value = '';

  try {
    let dataToHash: string | Uint8Array;

    if (textInput.value) {
      // Convert text to bytes
      dataToHash = ethers.toUtf8Bytes(textInput.value);
    }
    else if (bytesInput.value) {
      if (!isValidHex(bytesInput.value)) {
        throw new Error('Invalid hex input');
      }
      dataToHash = bytesInput.value;
    }
    else {
      throw new Error('No input provided');
    }

    // Compute keccak256 hash
    hashResult.value = ethers.keccak256(dataToHash);
  }
  catch (error) {
    errorMessage.value = `Error: ${(error as Error).message}`;
    console.error(error);
  }
}
</script>

<template>
  <c-card title="Keccak256 Hash Calculator">
    <div class="grid-container">
      <div class="label">
        Text Input:
      </div>
      <c-input-text
        v-model:value="textInput"
        placeholder="Enter text to hash..."
        @input="bytesInput = ''"
      />

      <div class="label">
        Bytes Input:
      </div>
      <c-input-text
        v-model:value="bytesInput"
        placeholder="Enter bytes to hash (0x...)..."
        @input="textInput = ''"
      />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!canCompute" @click="computeHash">
          Compute Hash
        </c-button>
      </div>

      <div class="label">
        Keccak256 Hash:
      </div>
      <c-input-text v-model:value="hashResult" readonly />
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

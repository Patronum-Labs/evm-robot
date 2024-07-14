<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

const deployerAddress = ref('');
const nonce = ref('');
const precalculatedAddress = ref('');
const errorMessage = ref('');

const isValidAddress = computed(() => {
  if (!deployerAddress.value) {
    return false;
  }
  return /^0x[0-9a-fA-F]{40}$/.test(deployerAddress.value);
});

const isValidNonce = computed(() => {
  if (nonce.value === '') {
    return false;
  }
  const nonceNum = Number(nonce.value);
  return !Number.isNaN(nonceNum) && nonceNum >= 0 && Number.isInteger(nonceNum);
});

const canCalculate = computed(() => isValidAddress.value && isValidNonce.value);

function calculateContractAddress() {
  if (!canCalculate.value) {
    errorMessage.value = 'Please enter a valid address and nonce';
    precalculatedAddress.value = '';
    return;
  }

  try {
    const from = ethers.getAddress(deployerAddress.value); // Ensure the address is checksummed
    const nonceNum = BigInt(nonce.value);
    precalculatedAddress.value = ethers.getCreateAddress({ from, nonce: nonceNum });
    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error calculating contract address:', error);
    errorMessage.value = 'Error calculating contract address';
    precalculatedAddress.value = '';
  }
}
</script>

<template>
  <c-card title="Precalculate Contract Address">
    <div class="grid-container">
      <div class="label">
        Deployer Address:
      </div>
      <c-input-text v-model:value="deployerAddress" placeholder="Enter deployer address..." />

      <div class="label">
        Nonce:
      </div>
      <c-input-text v-model:value="nonce" placeholder="Enter nonce..." type="number" min="0" step="1" />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!canCalculate" @click="calculateContractAddress">
          Calculate
        </c-button>
      </div>

      <div class="label">
        Precalculated Address:
      </div>
      <c-input-text :value="precalculatedAddress" placeholder="Precalculated contract address..." readonly />
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

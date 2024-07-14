<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ethers } from 'ethers';

const deployerAddress = ref('');
const salt = ref('');
const initCode = ref('');
const initCodeHash = ref('');
const precalculatedAddress = ref('');
const errorMessage = ref('');

const isValidAddress = computed(() => {
  if (!deployerAddress.value) {
    return false;
  }
  return /^0x[0-9a-fA-F]{40}$/.test(deployerAddress.value);
});

const isValidSalt = computed(() => {
  if (!salt.value) {
    return false;
  }
  return /^0x[0-9a-fA-F]{64}$/.test(salt.value);
});

const isValidInitCode = computed(() => {
  if (!initCode.value) {
    return true;
  } // Empty is valid
  return /^0x[0-9a-fA-F]*$/.test(initCode.value) && initCode.value.length % 2 === 0;
});

const isValidInitCodeHash = computed(() => {
  if (!initCodeHash.value) {
    return true;
  } // Empty is valid
  return /^0x[0-9a-fA-F]{64}$/.test(initCodeHash.value);
});

const canCalculate = computed(
  () =>
    isValidAddress.value
    && isValidSalt.value
    && (isValidInitCode.value || isValidInitCodeHash.value)
    && (initCode.value || initCodeHash.value), // Ensure at least one of initCode or initCodeHash is provided
);

watch(initCode, (newValue) => {
  if (newValue) {
    initCodeHash.value = ethers.keccak256(newValue);
  }
  else {
    initCodeHash.value = '';
  }
});

watch(initCodeHash, (newValue) => {
  if (newValue && !initCode.value) {
    // Only clear initCode if it wasn't the source of this hash
    initCode.value = '';
  }
});

function calculateContractAddress() {
  if (!canCalculate.value) {
    errorMessage.value = 'Please enter valid inputs';
    precalculatedAddress.value = '';
    return;
  }

  try {
    const from = ethers.getAddress(deployerAddress.value);
    const saltBytes32 = salt.value;
    const codeHash = initCodeHash.value || ethers.keccak256(initCode.value);

    precalculatedAddress.value = ethers.getCreate2Address(from, saltBytes32, codeHash);
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
  <c-card title="Precalculate2 Contract Address">
    <div class="grid-container">
      <div class="label">
        Deployer Address:
      </div>
      <c-input-text v-model:value="deployerAddress" placeholder="Enter deployer address..." />

      <div class="label">
        Salt:
      </div>
      <c-input-text v-model:value="salt" placeholder="Enter salt (bytes32)..." />

      <div class="label">
        Init Code:
      </div>
      <c-input-text v-model:value="initCode" placeholder="Enter init code..." />

      <div class="label">
        Init Code Hash:
      </div>
      <c-input-text v-model:value="initCodeHash" placeholder="Enter init code hash..." :readonly="!!initCode" />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!canCalculate" @click="calculateContractAddress">
          Calculate
        </c-button>
      </div>

      <div class="label">
        Precalculated:
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

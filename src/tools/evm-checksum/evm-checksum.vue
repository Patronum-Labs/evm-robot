<script setup lang="ts">
import { computed, ref } from 'vue';
import { ethers } from 'ethers';

const addressInput = ref('');
const errorMessage = ref('');

const isValidAddress = computed(() => {
  if (!addressInput.value) {
    return false;
  }
  return /^0x[0-9a-fA-F]{40}$/.test(addressInput.value);
});

const checksummedAddress = computed(() => {
  if (!isValidAddress.value) {
    return '';
  }
  try {
    // First, try to checksum the address as-is
    return ethers.getAddress(addressInput.value);
  }
  catch (error) {
    // If that fails, convert to lowercase and try again
    try {
      return ethers.getAddress(addressInput.value.toLowerCase());
    }
    catch (error) {
      // If it still fails, it's not a valid address
      return '';
    }
  }
});

const isChecksummed = computed(() => {
  if (!isValidAddress.value) {
    return false;
  }
  return addressInput.value === checksummedAddress.value;
});

function validateAddress() {
  if (!addressInput.value) {
    errorMessage.value = 'Please enter an address';
  }
  else if (!isValidAddress.value) {
    errorMessage.value = 'Invalid address format';
  }
  else if (checksummedAddress.value === '') {
    errorMessage.value = 'Unable to checksum this address';
  }
  else {
    errorMessage.value = '';
  }
}
</script>

<template>
  <c-card title="Address Checksum Validator">
    <div class="grid-container">
      <div class="label">
        Address:
      </div>
      <c-input-text v-model:value="addressInput" placeholder="Enter Ethereum address..." @blur="validateAddress" />

      <div class="label">
        Is Checksummed:
      </div>
      <c-input-text :value="isChecksummed ? 'Yes' : 'No'" placeholder="Is address checksummed..." readonly />

      <div class="label">
        Checksummed:
      </div>
      <c-input-text :value="checksummedAddress" placeholder="Checksummed address..." readonly />
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

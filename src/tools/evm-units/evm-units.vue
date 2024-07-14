<script setup lang="ts">
import { ref } from 'vue';
import { formatEther, formatUnits, parseEther, parseUnits } from 'ethers';

const etherValue = ref('');
const gweiValue = ref('');
const weiValue = ref('');
const errorMessage = ref('');

function updateValues(value: string, unit: 'ether' | 'gwei' | 'wei') {
  try {
    if (value === '') {
      etherValue.value = gweiValue.value = weiValue.value = '';
      errorMessage.value = '';
      return;
    }

    let weiAmount: bigint;

    switch (unit) {
      case 'ether':
        weiAmount = parseEther(value);
        break;
      case 'gwei':
        weiAmount = parseUnits(value, 'gwei');
        break;
      case 'wei':
        weiAmount = BigInt(value);
        break;
    }

    weiValue.value = weiAmount.toString();
    gweiValue.value = formatUnits(weiAmount, 'gwei');
    etherValue.value = formatEther(weiAmount);

    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error updating values:', error);
    errorMessage.value = `Invalid input: ${(error as Error).message}`;
  }
}
</script>

<template>
  <c-card title="Ethereum Unit Converter">
    <div class="grid-container">
      <div class="unit-row">
        <div class="label">
          Ether:
        </div>
        <div class="input-wrapper">
          <input
            v-model="etherValue"
            placeholder="Enter Ether value"
            @input="updateValues(etherValue, 'ether')"
          >
        </div>
      </div>
      <div class="unit-row">
        <div class="label">
          Gwei:
        </div>
        <div class="input-wrapper">
          <input
            v-model="gweiValue"
            placeholder="Enter Gwei value"
            @input="updateValues(gweiValue, 'gwei')"
          >
        </div>
      </div>
      <div class="unit-row">
        <div class="label">
          Wei:
        </div>
        <div class="input-wrapper">
          <input
            v-model="weiValue"
            placeholder="Enter Wei value"
            @input="updateValues(weiValue, 'wei')"
          >
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.grid-container {
  display: grid;
  gap: 16px;
}

.unit-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: right;
  padding-right: 16px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981; // Changed to a green color
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); // Adjusted the shadow color to match
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}

:deep(.c-card) {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 24px;
}
</style>

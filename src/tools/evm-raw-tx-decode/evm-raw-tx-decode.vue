<script setup lang="ts">
import { ref } from 'vue';
import { ethers } from 'ethers';

const rawTransaction = ref('');
const decodedTx = ref({
  type: '',
  typeName: '',
  to: '',
  nonce: '',
  gasLimit: '',
  gasPrice: '',
  maxPriorityFeePerGas: '',
  maxFeePerGas: '',
  data: '',
  value: '',
  chainId: '',
  v: '',
  r: '',
  s: '',
  signature: '',
  accessList: '',
  from: '',
  hash: '',
  unsignedHash: '',
} as Record<string, string>);
const errorMessage = ref('');

function decodeTransaction() {
  try {
    const tx = ethers.Transaction.from(rawTransaction.value);

    decodedTx.value = {
      type: tx.type?.toString() ?? '',
      typeName: tx.type === 0 ? 'Legacy' : tx.type === 1 ? 'EIP-2930' : tx.type === 2 ? 'EIP-1559' : '',
      to: tx.to ?? '',
      nonce: tx.nonce?.toString() ?? '',
      gasLimit: tx.gasLimit?.toString() ?? '',
      gasPrice: tx.gasPrice?.toString() ?? '',
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString() ?? '',
      maxFeePerGas: tx.maxFeePerGas?.toString() ?? '',
      data: tx.data ?? '',
      value: tx.value?.toString() ?? '',
      chainId: tx.chainId?.toString() ?? '',
      v: tx.signature?.v?.toString() ?? '',
      r: tx.signature?.r ?? '',
      s: tx.signature?.s ?? '',
      signature: tx.signature ? ethers.Signature.from(tx.signature).serialized : '',
      accessList: JSON.stringify(tx.accessList ?? ''),
      from: tx.from ?? '',
      hash: tx.hash ?? '',
      unsignedHash: tx.unsignedHash,
    };

    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error decoding transaction:', error);
    errorMessage.value = `Error decoding transaction: ${(error as Error).message}`;
    resetDecodedTx();
  }
}

function resetDecodedTx() {
  for (const key in decodedTx.value) {
    decodedTx.value[key] = '';
  }
}
</script>

<template>
  <c-card title="Decode Raw Transaction">
    <div class="grid-container">
      <div class="label">
        Raw Transaction:
      </div>
      <c-input-text v-model:value="rawTransaction" placeholder="Enter raw transaction (0x...)" />

      <div class="label" />
      <div class="button-container">
        <c-button @click="decodeTransaction">
          Decode
        </c-button>
      </div>

      <div class="label">
        Type:
      </div>
      <c-input-text :value="decodedTx.type" readonly />

      <div class="label">
        Type Name:
      </div>
      <c-input-text :value="decodedTx.typeName" readonly />

      <div class="label">
        To:
      </div>
      <c-input-text :value="decodedTx.to" readonly />

      <div class="label">
        Nonce:
      </div>
      <c-input-text :value="decodedTx.nonce" readonly />

      <div class="label">
        Gas Limit:
      </div>
      <c-input-text :value="decodedTx.gasLimit" readonly />

      <div class="label">
        Gas Price:
      </div>
      <c-input-text :value="decodedTx.gasPrice" readonly />

      <div class="label">
        Max Priority Fee Per Gas:
      </div>
      <c-input-text :value="decodedTx.maxPriorityFeePerGas" readonly />

      <div class="label">
        Max Fee Per Gas:
      </div>
      <c-input-text :value="decodedTx.maxFeePerGas" readonly />

      <div class="label">
        Data:
      </div>
      <c-input-text :value="decodedTx.data" readonly />

      <div class="label">
        Value:
      </div>
      <c-input-text :value="decodedTx.value" readonly />

      <div class="label">
        Chain ID:
      </div>
      <c-input-text :value="decodedTx.chainId" readonly />

      <div class="label">
        Signature:
      </div>
      <c-input-text :value="decodedTx.signature" readonly />

      <div class="label">
        V:
      </div>
      <c-input-text :value="decodedTx.v" readonly />

      <div class="label">
        R:
      </div>
      <c-input-text :value="decodedTx.r" readonly />

      <div class="label">
        S:
      </div>
      <c-input-text :value="decodedTx.s" readonly />

      <div class="label">
        Access List:
      </div>
      <c-input-text :value="decodedTx.accessList" readonly />

      <div class="label">
        From:
      </div>
      <c-input-text :value="decodedTx.from" readonly />

      <div class="label">
        Hash:
      </div>
      <c-input-text :value="decodedTx.hash" readonly />

      <div class="label">
        Unsigned Hash:
      </div>
      <c-input-text :value="decodedTx.unsignedHash" readonly />
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

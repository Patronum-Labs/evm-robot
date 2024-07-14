<script setup lang="ts">
import { ref } from 'vue';
import { ethers } from 'ethers';
import { ens_normalize } from '@adraffy/ens-normalize';

const domainName = ref('');
const nameHashResult = ref('');
const errorMessage = ref('');

function namehash(name: string): string {
  let result = new Uint8Array(32).fill(0);
  if (!name) {
    return ethers.hexlify(result);
  }

  const labels = name.split('.');
  for (let i = labels.length - 1; i >= 0; i--) {
    // Normalize each label before hashing
    const normalizedLabel = ens_normalize(labels[i]);
    const labelSha = ethers.keccak256(ethers.toUtf8Bytes(normalizedLabel));
    result = ethers.toBeArray(ethers.keccak256(ethers.concat([result, ethers.toBeArray(labelSha)])));
  }
  return ethers.hexlify(result);
}

function calculateNameHash() {
  if (!domainName.value) {
    errorMessage.value = 'Please enter a domain name';
    nameHashResult.value = '';
    return;
  }

  try {
    // Normalize the entire domain name
    const normalizedDomain = domainName.value
      .split('.')
      .map(label => ens_normalize(label))
      .join('.');
    nameHashResult.value = namehash(normalizedDomain);
    errorMessage.value = '';
  }
  catch (error) {
    console.error('Error calculating nameHash:', error);
    errorMessage.value = `Error calculating nameHash: ${(error as Error).message}`;
    nameHashResult.value = '';
  }
}
</script>

<template>
  <c-card title="NameHash Calculator">
    <div class="grid-container">
      <div class="label">
        Domain Name:
      </div>
      <c-input-text v-model:value="domainName" placeholder="Enter domain name (e.g., 0xYamen.eth)" />

      <div class="label" />
      <div class="button-container">
        <c-button :disabled="!domainName" @click="calculateNameHash">
          Calculate NameHash
        </c-button>
      </div>

      <div class="label">
        NameHash Result:
      </div>
      <c-input-text :value="nameHashResult" placeholder="NameHash result..." readonly />
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

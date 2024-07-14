import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Keccak256 Hash',
  path: '/evm-keccak256',
  description: 'Apply Kecak256 hash function to a string or bytes',
  keywords: ['keccak256', 'solidity hash', 'hash', 'keccak256 hash'],
  component: () => import('./evm-keccak256.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Raw Tx Decoder',
  path: '/evm-raw-tx-decode',
  description: 'Decode raw EVM transaction data',
  keywords: ['raw transaction', 'signed tx', 'raw tx'],
  component: () => import('./evm-raw-tx-decode.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-17'),
});

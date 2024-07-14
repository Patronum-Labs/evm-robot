import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Precaculate Contract Address',
  path: '/evm-create',
  description: 'Precalculate the address of a contract deployed on the EVM network based on CREATE opcode.',
  keywords: ['CREATE Opcode', 'RLP encoding', 'Create precalculation'],
  component: () => import('./evm-create.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

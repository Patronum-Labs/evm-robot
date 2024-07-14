import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Precaculate2 Contract Address',
  path: '/evm-create2',
  description: 'Precalculate2 the address of a contract deployed on the EVM network based on CREATE2 opcode.',
  keywords: ['CREATE2 Opcode', 'RLP encoding', 'Create2 precalculation'],
  component: () => import('./evm-create2.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

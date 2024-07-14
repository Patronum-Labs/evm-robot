import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC173',
  path: '/erc-173',
  description: 'Calls the contract with owner() function, and return the address of contract owner',
  keywords: ['ERC173', 'Ownable', 'Smart contract owner', 'owner()'],
  component: () => import('./erc-173.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

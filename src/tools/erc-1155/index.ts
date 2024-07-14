import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC1155',
  path: '/erc-1155',
  description: 'Checks the ERC1155 standard common interface functions, including balance checks, info, and approvals.',
  keywords: ['ERC1155', 'NFTs', 'Non Fungible Token', 'Multi Token'],
  component: () => import('./erc-1155.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

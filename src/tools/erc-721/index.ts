import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC721',
  path: '/erc-721',
  description: 'Checks the ERC721 standard common interface functions, including balance checks, info, and approvals.',
  keywords: ['ERC721', 'NFTs', 'BAYC', 'Punks', 'Non Fungible Token'],
  component: () => import('./erc-721.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

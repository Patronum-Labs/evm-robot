import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC1167',
  path: '/erc-1167',
  description: 'Extract the implementation address from an ERC1167 minimal proxy',
  keywords: ['ERC1167', 'Minimal Proxy', 'Implementation address', 'base contract address'],
  component: () => import('./erc-1167.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

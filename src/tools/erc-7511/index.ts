import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC7511',
  path: '/erc-7511',
  description: 'Extract the implementation address from an ERC7511 minimal proxy',
  keywords: ['ERC7511', 'Minimal Proxy', 'Implementation address', 'base contract address'],
  component: () => import('./erc-7511.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-09-04'),
});

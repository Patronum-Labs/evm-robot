import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC165',
  path: '/erc-165',
  description:
    'Calls the contract with supportsInterface(bytes4) function, and return whether the interfaceId is supported or not',
  keywords: ['ERC165', 'supportsInterface', 'interfaceId', 'interface detection'],
  component: () => import('./erc-165.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

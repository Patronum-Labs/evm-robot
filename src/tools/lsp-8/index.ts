import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'LSP8',
  path: '/lsp-8',
  description:
    'Checks the LSP8 standard common interface functions, including balance checks, info, and authorizations.',
  keywords: ['LSP8', 'Non Fungible Token', 'Token', 'LUKSO', 'LSP', 'NFT 2.0'],
  component: () => import('./lsp-8.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-29'),
});

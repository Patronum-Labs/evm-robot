import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'LSP7',
  path: '/lsp-7',
  description:
    'Checks the LSP7 standard common interface functions, including balance checks, info, and authorizations.',
  keywords: ['LSP7', 'Fungible Token', 'Token', 'LUKSO', 'LSP'],
  component: () => import('./lsp-7.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-29'),
});

import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC191',
  path: '/erc-191',
  description: 'Signs and recovers messages according to the ERC191 Standard version 0x45 (Ethereum Signed Message)',
  keywords: ['ERC191', 'EIP191', 'Ethereum Signed Message', 'Sign message', 'eth_sign'],
  component: () => import('./erc-191.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});

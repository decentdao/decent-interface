import { createMiddleware } from 'hono/factory';
import { isAddress } from 'viem';
import { moralisSupportedChainIds } from '../../src/providers/NetworkConfig/useNetworkConfigStore';
import type { Env, Var } from '../types';

export const getParams = createMiddleware<{ Bindings: Env; Variables: Var }>(async (c, next) => {
  const address = c.req.query('address');
  if (!address) {
    return c.json({ error: 'Address is required' }, 400);
  }
  if (!isAddress(address)) {
    return c.json({ error: 'Provided address is not a valid address' }, 400);
  }
  c.set('address', address);

  const network = c.req.query('network');
  if (!network) {
    return c.json({ error: 'Network is required' }, 400);
  }
  const chainId = parseInt(network);
  if (!moralisSupportedChainIds.includes(chainId)) {
    return c.json({ error: 'Requested network is not supported' }, 400);
  }
  c.set('network', network);

  await next();
});

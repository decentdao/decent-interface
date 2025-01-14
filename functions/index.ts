import { Hono } from 'hono';
import { router as balancesRouter } from './balances';
import { type Env } from './types';

const app = new Hono<{ Bindings: Env }>().basePath('/api').route('/balances', balancesRouter);

export type AppType = typeof app;
export default app;

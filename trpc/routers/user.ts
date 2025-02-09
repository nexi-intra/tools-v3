// src/trpc/routers/post.ts

import { z } from 'zod';
import getTrpc from '..';
import { userLogin } from '../handlers';

export const t = getTrpc();

export const userRouter = t.router({
	login: t.procedure.input(z.string()).query(userLogin),
});

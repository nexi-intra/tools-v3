import getTrpc from '..';

// Routers

import { postRouter } from './post';
import { userRouter } from './user';

const t = getTrpc();

export const trpcRouter = t.router({
	post: postRouter,
	user: userRouter,
});

export type AppRouter = typeof trpcRouter;

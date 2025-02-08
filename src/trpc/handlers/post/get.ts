// src/trpc/handlers/post/get.ts

export async function handlerGetPost({ input }: { input: string }) {
	return {
		title: input,
	};
}

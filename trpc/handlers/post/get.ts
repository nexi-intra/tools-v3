export async function handlerGetPost({ input }: { input: string }) {
	return {
		title: input,
	};
}

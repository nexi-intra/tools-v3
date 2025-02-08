export async function handlerGetAuthor({ input }: { input: string }) {
	return {
		name: input,
	};
}

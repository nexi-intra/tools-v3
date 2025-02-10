import { tokenizeInput } from '@/lib/search';

export async function main() {
	console.log('Hello, world!');
	const tokens = tokenizeInput('word1 word2 category:category1 category:category2 area:one');
	tokens.forEach(token => {
		if (token.value.trim()) console.log(token.value);
	});
}

main();

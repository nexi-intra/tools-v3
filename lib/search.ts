export interface Token {
	value: string;
	start: number;
	end: number;
}

// Function to tokenize the input with positions, including spaces
export function tokenizeInput(input: string): Token[] {
	const regex = /(\s+)|"([^"]*)"|'([^']*)'|[^\s"]+/g;
	let match: RegExpExecArray | null;
	const tokens: Token[] = [];
	while ((match = regex.exec(input)) !== null) {
		tokens.push({
			value: match[0],
			start: match.index,
			end: regex.lastIndex,
		});
	}
	return tokens;
}
export function extractSearchTokens(input: string) {
	const tokens = tokenizeInput(input);
	return tokens
		.filter(token => {
			return token.value.trim().length > 0;
		})
		.map(token => {
			return token.value;
		});
}

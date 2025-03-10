export function imgWidth(src: string, width: number) {
	if (!src?.includes('blob')) {
		return src;
	}

	const [url, params] = src.split('?');
	const urlParams = new URLSearchParams(params);
	urlParams.set('width', width.toString());
	return `${url}?${urlParams.toString()}`;
}

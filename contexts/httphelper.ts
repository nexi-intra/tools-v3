// ---- Utility Functions / Types ----

/**
 * Sleep utility to pause execution for a specified time.
 * @param ms Number of milliseconds to pause
 */
const sleep = (ms: number) => {
	return new Promise(resolve => {
		setTimeout(() => resolve(1), ms);
	});
};

export interface Result<T> {
	hasError: boolean;
	timedOut?: boolean;
	errorMessage?: string;
	data?: T;
}

export interface PartialResult<T> {
	hasError: boolean;
	nextLink?: string;
	timedOut?: boolean;
	errorMessage?: string;
	data?: T;
}

// ---- Main HTTPS Function ----

/**
 * Universal HTTP method using Fetch.
 * @param token         Bearer token (if any). If provided, will be set as `Authorization: Bearer {token}`
 * @param method        HTTP method (GET, POST, PUT, DELETE, etc)
 * @param url           Request URL
 * @param data          Optional request payload
 * @param contentType   Content-Type header (defaults to application/json if not provided)
 * @param additionalConfig Additional fetch configuration
 */
export const https = <T>(
	token: string,
	method: string,
	url: string,
	data?: any,
	contentType?: string,
	additionalConfig?: RequestInit,
): Promise<Result<T>> => {
	return new Promise(resolve => {
		const headers: Record<string, string> = {
			'Content-Type': contentType ?? 'application/json',
			Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly',
			ConsistencyLevel: 'eventual',
		};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		// If data is provided and not a string, convert it to JSON
		const isStringData = typeof data === 'string';
		const body = data ? (isStringData ? data : JSON.stringify(data)) : null;

		/**
		 * Internal function to perform the fetch with retry logic.
		 * @param retryNumber Current retry attempt
		 */
		const send = async (retryNumber: number) => {
			try {
				const response = await fetch(url, {
					method,
					headers,
					body,
					...additionalConfig,
				});

				// If it’s a 40x error (client error)
				if ([400, 401, 404].includes(response.status)) {
					return resolve({
						hasError: true,
						errorMessage: `${response.status} - ${response.statusText}`,
					});
				}

				// For other errors, retry up to 3 times
				if (response.status > 400) {
					if (retryNumber < 3) {
						// Wait before next retry attempt
						await sleep(1000 * (retryNumber + 1));
						return send(retryNumber + 1);
					} else {
						return resolve({
							hasError: true,
							errorMessage: `${response.status} - ${response.statusText}`,
						});
					}
				}

				// If successful, parse JSON
				const responseData = await response.json();
				resolve({ hasError: false, data: responseData, errorMessage: '' });
			} catch (error) {
				// Network or other fetch-related error
				resolve({
					hasError: true,
					errorMessage: JSON.stringify(error),
				});
			}
		};

		// Initiate the first request
		send(0);
	});
};

// ---- Pagination Helpers ----

/**
 * Fetch all pages of data by following `@odata.nextLink`.
 * @param token   Bearer token
 * @param url     Initial URL to fetch
 * @param options Options such as a maximum number of rows
 */
export const httpsGetAll = <T>(token: string, url: string, options?: { maxRows?: number }): Promise<Result<T[]>> => {
	return new Promise(resolve => {
		const data: T[] = [];
		const maxResponseItems = options?.maxRows ?? 1000000;

		const fetchNext = async (nextUrl: string) => {
			const response = await https<any>(token, 'GET', nextUrl);

			if (response.hasError) {
				return resolve({ hasError: true, errorMessage: response.errorMessage });
			}

			data.push(...(response.data?.value ?? []));
			console.log('Fetched items so far:', data.length);

			if (data.length > maxResponseItems) {
				// Exceeded our desired limit
				return resolve({ hasError: false, data });
			}

			// If there's another page, follow it
			const nextLink = response.data?.['@odata.nextLink'];
			if (nextLink) {
				fetchNext(nextLink);
			} else {
				// No more pages
				resolve({ hasError: false, data });
			}
		};

		// Start fetching pages
		fetchNext(url);
	});
};

/**
 * Fetch one page of data, returning a `nextLink` if it exists.
 * @param token   Bearer token
 * @param url     URL to fetch
 * @param options Options such as a maximum number of rows
 */
export const httpsGetPage = <T>(
	token: string,
	url: string,
	options?: { maxRows?: number },
): Promise<PartialResult<T[]>> => {
	return new Promise(resolve => {
		const data: T[] = [];
		const maxResponseItems = options?.maxRows ?? 1000000;

		const fetchNext = async (nextUrl: string) => {
			const response = await https<any>(token, 'GET', nextUrl);

			if (response.hasError) {
				return resolve({ hasError: true, errorMessage: response.errorMessage });
			}

			data.push(...(response.data?.value ?? []));
			console.log('Fetched items:', data.length);

			// If we exceed maxRows, stop
			if (data.length > maxResponseItems) {
				return resolve({ hasError: false, data });
			}

			// Return just this page + optional next link
			const nextLink = response.data?.['@odata.nextLink'];
			resolve({ hasError: false, data, nextLink });
		};

		fetchNext(url);
	});
};

// ---- Optional Console Helpers ----

let lastProgress = '';

/**
 * Write progress text without new lines, overwriting previous text in console.
 * @param text Text to display
 */
export const consoleShowProgress = (text: string) => {
	lastProgress = text;
	process.stdout.write('\b'.repeat(text.length) + text);
};

/**
 * Clears the last progress text from console.
 */
export const consoleClearProgress = () => {
	process.stdout.write('\b'.repeat(lastProgress.length));
};

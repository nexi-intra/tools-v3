// OfficeGraphClient.ts
// Requires Node.js 18+ (for native fetch) or install node-fetch for earlier versions.
// If you need node-fetch, install it and uncomment the following line:
// import fetch from 'node-fetch';
import { z, ZodSchema } from 'zod';
import { LoggerInterface } from '@/interfaces/Logger';

/**
 * A simple default logger that uses console.
 */
const defaultLogger: LoggerInterface = {
	verbose: (message?: any, ...optionalParams: any[]) => console.debug(`[VERBOSE]`, message, optionalParams),
	info: (message?: any, ...optionalParams: any[]) => console.info(`[INFO]`, message, optionalParams),
	warn: (message?: any, ...optionalParams: any[]) => console.warn(`[WARN]`, message, optionalParams),
	error: (message?: any, ...optionalParams: any[]) => console.error(`[ERROR]`, message, optionalParams),
	highlight: function (message?: any, ...optionalParams: any[]): void {
		console.info(`[HIGHLIGHT]`, message, optionalParams);
	},
};

export class OfficeGraphClient {
	private tenantId: string;
	private clientId: string;
	private clientSecret: string;
	private tokenUrl: string;
	private scope: string;
	private accessToken: string | null = null;
	private tokenExpiresAt: number = 0;
	logger: LoggerInterface;
	private readonly maxRetries = 3; // maximum number of attempts

	/**
	 * Create a new OfficeGraphClient instance.
	 *
	 * @param tenantId - Your Azure AD tenant ID.
	 * @param clientId - Your Azure AD app's client ID.
	 * @param clientSecret - Your Azure AD app's client secret.
	 * @param logger - An optional logger. If not provided, a default logger using console is used.
	 */
	constructor(tenantId: string, clientId: string, clientSecret: string, logger?: LoggerInterface) {
		this.tenantId = tenantId;
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
		this.scope = 'https://graph.microsoft.com/.default';
		this.logger = logger || defaultLogger;
		this.logger.info('OfficeGraphClient instance created.');
	}

	/**
	 * A helper method to delay execution.
	 *
	 * @param ms - Milliseconds to wait.
	 */
	private async delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Executes a fetch request with a built-in retry mechanism.
	 *
	 * @param url - The request URL.
	 * @param options - The fetch options.
	 * @param method - The HTTP method (used for logging).
	 * @param attempt - The current attempt number (used internally).
	 * @returns The Response from fetch.
	 */
	private async executeFetch(
		url: string,
		options: RequestInit,
		method: string,
		attempt: number = 1,
	): Promise<Response> {
		try {
			const response = await fetch(url, options);

			// If the response is not OK, decide whether to retry.
			if (!response.ok) {
				// Check if we have throttling or temporary issues.
				if (response.status === 429 || response.status === 503) {
					// If throttled, use the Retry-After header if available.
					const retryAfterHeader = response.headers.get('Retry-After');
					const delayMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : attempt * 1000;
					if (attempt < this.maxRetries) {
						this.logger.warn(
							`${method} ${url} returned ${response.status}. Throttling detected. Retrying attempt ${attempt} after ${delayMs}ms.`,
						);
						await this.delay(delayMs);
						return this.executeFetch(url, options, method, attempt + 1);
					}
				} else {
					// For other non-OK responses, also attempt a retry.
					if (attempt < this.maxRetries) {
						const delayMs = attempt * 1000;
						this.logger.warn(
							`${method} ${url} returned ${response.status}. Retrying attempt ${attempt} after ${delayMs}ms.`,
						);
						await this.delay(delayMs);
						return this.executeFetch(url, options, method, attempt + 1);
					}
				}
			}
			return response;
		} catch (error) {
			// Network or other fetch errors.
			if (attempt < this.maxRetries) {
				const delayMs = attempt * 1000;
				this.logger.warn(
					`Network error during ${method} ${url}: ${error}. Retrying attempt ${attempt} after ${delayMs}ms.`,
				);
				await this.delay(delayMs);
				return this.executeFetch(url, options, method, attempt + 1);
			}
			this.logger.error(`Failed ${method} ${url} after ${attempt} attempts: ${error}`);
			throw error;
		}
	}

	/**
	 * Retrieves an access token using the client credentials flow and caches it.
	 *
	 * @returns A promise that resolves to the access token.
	 */
	private async getToken(): Promise<string | null> {
		const now = Date.now();
		if (!this.accessToken || now > this.tokenExpiresAt) {
			this.logger.info('Access token is missing or expired. Fetching a new token.');
			const params = new URLSearchParams();
			params.append('grant_type', 'client_credentials');
			params.append('client_id', this.clientId);
			params.append('client_secret', this.clientSecret);
			params.append('scope', this.scope);

			let response;
			try {
				response = await this.executeFetch(
					this.tokenUrl,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: params.toString(),
					},
					'POST',
				);
			} catch (err) {
				this.logger.error(`Error fetching token from ${this.tokenUrl}: ${err}`);
				throw new Error(`Error fetching token from ${this.tokenUrl}: ${err}`);
			}

			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`Failed to obtain token from ${this.tokenUrl}: ${response.status} ${errorText}`);
				throw new Error(`Failed to obtain token: ${response.status} ${errorText} at ${this.tokenUrl}`);
			}

			const tokenResponse = await response.json();
			this.accessToken = tokenResponse.access_token;
			// expires_in is in seconds; subtract 60 seconds as a safety buffer.
			this.tokenExpiresAt = now + (tokenResponse.expires_in - 60) * 1000;
			this.logger.verbose('Token fetched and cached successfully.');
		} else {
			this.logger.verbose('Using cached access token.');
		}
		return this.accessToken;
	}

	/**
	 * Constructs the headers required for Microsoft Graph API calls.
	 *
	 * @returns A promise that resolves to an object containing the headers.
	 */
	private async getHeaders(): Promise<HeadersInit> {
		const token = await this.getToken();
		return {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		};
	}

	// ---------------------------------------------------------------------------
	// GET method overloads
	public async get<T>(endpoint: string, params: Record<string, string>, schema: ZodSchema<T>): Promise<T>;
	public async get(endpoint: string, params?: Record<string, string>): Promise<any>;
	public async get<T = any>(
		endpoint: string,
		params: Record<string, string> = {},
		schema?: ZodSchema<T>,
	): Promise<T> {
		const urlObj = new URL(`https://graph.microsoft.com/v1.0/${endpoint}`);
		Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
		const url = urlObj.toString();

		this.logger.info(`GET request: ${url}`);
		const headers = await this.getHeaders();
		const options: RequestInit = {
			method: 'GET',
			headers,
		};

		try {
			const response = await this.executeFetch(url, options, 'GET');
			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`GET request failed [${url}]: ${response.status} ${errorText}`);
				throw new Error(`GET request failed: ${response.status} ${errorText} at ${url}`);
			}
			const json = await response.json();
			this.logger.verbose(`GET response: ${JSON.stringify(json)}`);
			return schema ? schema.parse(json) : json;
		} catch (error) {
			this.logger.error(`Error during GET request at ${url}: ${error}`);
			throw error;
		}
	}

	// ---------------------------------------------------------------------------
	// POST method overloads
	public async post<T>(endpoint: string, data: any, schema: ZodSchema<T>): Promise<T>;
	public async post(endpoint: string, data?: any): Promise<any>;
	public async post<T = any>(endpoint: string, data: any = {}, schema?: ZodSchema<T>): Promise<T> {
		const url = `https://graph.microsoft.com/v1.0/${endpoint}`;
		this.logger.info(`POST request: ${url} with payload ${JSON.stringify(data)}`);
		const headers = await this.getHeaders();
		const options: RequestInit = {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		};

		try {
			const response = await this.executeFetch(url, options, 'POST');
			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`POST request failed [${url}]: ${response.status} ${errorText}`);
				throw new Error(`POST request failed: ${response.status} ${errorText} at ${url}`);
			}
			const json = await response.json();
			this.logger.verbose(`POST response: ${JSON.stringify(json)}`);
			return schema ? schema.parse(json) : json;
		} catch (error) {
			this.logger.error(`Error during POST request at ${url}: ${error}`);
			throw error;
		}
	}

	// ---------------------------------------------------------------------------
	// PUT method overloads
	public async put<T>(endpoint: string, data: any, schema: ZodSchema<T>): Promise<T>;
	public async put(endpoint: string, data?: any): Promise<any>;
	public async put<T = any>(endpoint: string, data: any = {}, schema?: ZodSchema<T>): Promise<T> {
		const url = `https://graph.microsoft.com/v1.0/${endpoint}`;
		this.logger.info(`PUT request: ${url} with payload ${JSON.stringify(data)}`);
		const headers = await this.getHeaders();
		const options: RequestInit = {
			method: 'PUT',
			headers,
			body: JSON.stringify(data),
		};

		try {
			const response = await this.executeFetch(url, options, 'PUT');
			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`PUT request failed [${url}]: ${response.status} ${errorText}`);
				throw new Error(`PUT request failed: ${response.status} ${errorText} at ${url}`);
			}
			const json = await response.json();
			this.logger.verbose(`PUT response: ${JSON.stringify(json)}`);
			return schema ? schema.parse(json) : json;
		} catch (error) {
			this.logger.error(`Error during PUT request at ${url}: ${error}`);
			throw error;
		}
	}

	// ---------------------------------------------------------------------------
	// DELETE method overloads
	public async delete<T>(endpoint: string, schema: ZodSchema<T>): Promise<T>;
	public async delete(endpoint: string): Promise<any>;
	public async delete<T = any>(endpoint: string, schema?: ZodSchema<T>): Promise<T> {
		const url = `https://graph.microsoft.com/v1.0/${endpoint}`;
		this.logger.info(`DELETE request: ${url}`);
		const headers = await this.getHeaders();
		const options: RequestInit = {
			method: 'DELETE',
			headers,
		};

		try {
			const response = await this.executeFetch(url, options, 'DELETE');
			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`DELETE request failed [${url}]: ${response.status} ${errorText}`);
				throw new Error(`DELETE request failed: ${response.status} ${errorText} at ${url}`);
			}
			if (response.status === 204) {
				// No Content.
				this.logger.verbose('DELETE request returned no content (204).');
				return {} as T;
			}
			const json = await response.json();
			this.logger.verbose(`DELETE response: ${JSON.stringify(json)}`);
			return schema ? schema.parse(json) : json;
		} catch (error) {
			this.logger.error(`Error during DELETE request at ${url}: ${error}`);
			throw error;
		}
	}

	// ---------------------------------------------------------------------------
	// getAllPages method overloads
	// public async getAllPages<T>(
	//   endpoint: string,
	//   params: Record<string, string>,
	//   maxPages: number,
	//   schema: ZodSchema<T[]>
	// ): Promise<T[]>;
	// public async getAllPages(
	//   endpoint: string,
	//   params?: Record<string, string>,
	//   maxPages?: number
	// ): Promise<any[]>;
	public async getAllPages<T = any>(
		endpoint: string,
		params: Record<string, string> = {},
		maxPages: number = Infinity,
		schema?: ZodSchema<T[]>,
	): Promise<T[]> {
		let items: T[] = [];
		let pageCount = 0;

		const urlObj = new URL(`https://graph.microsoft.com/v1.0/${endpoint}`);
		Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
		let nextUrl: string | null = urlObj.toString();

		this.logger.info(`Starting paged GET request: ${nextUrl}`);
		while (nextUrl && pageCount < maxPages) {
			this.logger.verbose(`Fetching page ${pageCount + 1}: ${nextUrl}`);
			const headers = await this.getHeaders();
			const options: RequestInit = {
				method: 'GET',
				headers,
			};

			try {
				const response = await this.executeFetch(nextUrl, options, 'GET');
				if (!response.ok) {
					const errorText = await response.text();
					this.logger.error(`Paged GET request failed [${nextUrl}]: ${response.status} ${errorText}`);
					throw new Error(`GET request failed: ${response.status} ${errorText} at ${nextUrl}`);
				}
				const json = await response.json();
				// Assume the items are contained in the "value" property.
				const pageItems: T[] = json.value;
				items = items.concat(pageItems);
				nextUrl = json['@odata.nextLink'] || null;
				pageCount++;
			} catch (error) {
				this.logger.error(`Error during paged GET request at ${nextUrl}: ${error}`);
				throw error;
			}
		}
		this.logger.info(`Paged GET completed. Fetched ${pageCount} page(s) with ${items.length} total items.`);
		return schema ? schema.parse(items) : items;
	}
}

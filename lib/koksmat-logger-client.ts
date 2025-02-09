import { koksmatLogServer } from '@/dev/koksmat-logger-server';

function stringifyArg(arg: any): string {
	if (typeof arg === 'string') {
		return arg;
	} else if (arg instanceof Error) {
		return `Error: ${arg.message}\nStack: ${arg.stack}`;
	} else if (typeof arg === 'object') {
		try {
			return JSON.stringify(arg);
		} catch (error) {
			return `[Circular or Non-Serializable Object: ${Object.prototype.toString.call(arg)}]`;
		}
	} else {
		return String(arg);
	}
}
export type moduleType = 'applogic' | 'client' | 'server' | 'library' | 'component' | 'endpoint' | 'provider';

async function kLog(
	level: 'verbose' | 'info' | 'warning' | 'error' | 'fatal',

	correlationId: string | undefined,
	moduleType: moduleType,
	...args: any[]
): Promise<void> {
	const stringArgs = args.map(stringifyArg);
	await koksmatLogServer({
		level,
		moduleType,
		args: stringArgs,
		correlationId,
	});
}

export async function kVerbose(
	//correlationId: string | undefined,
	module: moduleType,
	...args: any[]
): Promise<void> {
	await kLog('verbose', '', module, ...args);
}

export async function kInfo(
	//correlationId: string | undefined,
	module: moduleType,
	...args: any[]
): Promise<void> {
	await kLog('info', '', module, ...args);
}

export async function kWarn(
	//correlationId: string | undefined,
	module: moduleType,
	...args: any[]
): Promise<void> {
	await kLog('warning', '', module, ...args);
}

export async function kError(
	//correlationId: string | undefined,
	module: moduleType,
	...args: any[]
): Promise<void> {
	await kLog('error', '', module, ...args);
}

export async function kVerboseTracking(
	module: moduleType,
	correlationId: string | undefined,
	...args: any[]
): Promise<void> {
	await kLog('verbose', correlationId, module, ...args);
}

export async function kInfoTracking(
	module: moduleType,
	correlationId: string | undefined,
	...args: any[]
): Promise<void> {
	await kLog('info', correlationId, module, ...args);
}

export async function kWarnTracking(
	module: moduleType,
	correlationId: string | undefined,
	...args: any[]
): Promise<void> {
	await kLog('warning', correlationId, module, ...args);
}

export async function kErrorTracking(
	module: moduleType,
	correlationId: string | undefined,
	...args: any[]
): Promise<void> {
	await kLog('error', correlationId, module, ...args);
}

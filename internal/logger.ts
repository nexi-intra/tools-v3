import { LoggerInterface } from '@/models/Logger';

const loglevel = process.env.LOG_LEVEL || 'warn';
export const logger: LoggerInterface = {
	verbose: (message?: any, ...optionalParams: any[]) => {
		if (loglevel === 'verbose') console.log(`[VERBOSE]`, message, ...optionalParams);
	},

	info: (message?: any, ...optionalParams: any[]) => {
		if (loglevel === 'verbose' || loglevel === 'info') console.log(`[INFO]`, message, optionalParams);
	},
	highlight: (message?: any, ...optionalParams: any[]) => {
		if (loglevel === 'verbose' || loglevel === 'info' || loglevel === 'highlight')
			console.log(`[highlight]`, message, ...optionalParams);
	},
	warn(message, ...optionalParams) {
		if (loglevel === 'warn' || loglevel === 'info' || loglevel === 'verbose' || loglevel === 'highlight')
			console.log(`[WARNING]`, message, ...optionalParams);
	},
	error: (message?: any, ...optionalParams: any[]) => {
		console.error(`[ERROR]`, message, ...optionalParams);
	},
};

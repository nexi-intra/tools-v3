'use server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { getKoksmat } from './koksmat'; // Adjust the path as necessary

import { kError, kInfo, kVerbose, kWarn } from '@/lib/koksmat-logger-client';
import { findPageFileForUrl } from './findPage';
// Define the base path for sessions
const DEV_BASE_PATH = process.cwd();

/**
 * Open a file in VS Code within the current session path
 * @param input Object containing the session ID, file name, and correlationId
 * @returns A promise that resolves when the file is opened in VS Code
 */
export async function openInCode(relativeFilePath: string): Promise<void> {
	if (process.env.NODE_ENV === 'production') throw new Error('Not allowed in production 14');
	try {
		const fullFilePath = path.join(DEV_BASE_PATH, relativeFilePath);
		kVerbose('component', `Opening file in VS Code: ${fullFilePath}`);

		return new Promise((resolve, reject) => {
			exec(`code ${fullFilePath}`, (error, stdout, stderr) => {
				if (error) {
					kError('component', `Error opening file in VS Code: ${error.message}`, error);
					reject(new Error(`Failed to open file in VS Code: ${error.message}`));
					return;
				}
				if (stderr) {
					kWarn('component', `VS Code stderr: ${stderr}`);
				}
				kInfo('component', `File opened successfully in VS Code: ${fullFilePath}`);
				resolve();
			});
		});
	} catch (error) {
		kError('component', 'Error opening file in VS Code:', error);
		throw new Error('Failed to open file in VS Code');
	}
}

export async function findFilePathForUrl(url: string, appPath: string): Promise<string> {
	return findPageFileForUrl(url, appPath);
}

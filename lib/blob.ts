/**
 * Converts a data URL (Base64 encoded) into a Buffer.
 * @param dataUrl - The full data URL string.
 * @returns A Buffer representing the binary image.
 */
export function convertDataUrlToBuffer(dataUrl: string): Buffer {
	// Regex to extract the mime type and Base64 part.
	const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	if (!matches || matches.length !== 3) {
		throw new Error('Invalid data URL format.');
	}
	// Decode the Base64 string to a Buffer.
	return Buffer.from(matches[2], 'base64');
}

export function convertBufferToDataUrl(buffer: Buffer): string {
	return `data:image/png;base64,${buffer.toString('base64')}`;
}
import crypto from 'crypto';

/**
 * Calculates a SHA-256 hash for the image data contained in a data URL.
 * @param dataUrl - The data URL string containing the Base64 encoded image.
 * @returns A hexadecimal string representing the hash.
 */
export function calculateDataUrlHash(dataUrl: string): string {
	// Extract the Base64 portion using a regular expression.
	const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	if (!matches || matches.length !== 3) {
		throw new Error('Invalid data URL format.');
	}
	// Decode the Base64 part to obtain the binary image data.
	const buffer = Buffer.from(matches[2], 'base64');

	// Create a SHA-256 hash from the binary data.
	const hash = crypto.createHash('sha256');
	hash.update(buffer);
	return hash.digest('hex');
}

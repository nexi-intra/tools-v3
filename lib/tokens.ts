import jwt from 'jsonwebtoken';

// Microsoft's common JWKS endpoint
const msftJwksUri = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';

// JWKS client for verifying JWT signatures

export function decodeJwt(token: string): jwt.JwtPayload {
	return jwt.decode(token) as jwt.JwtPayload;
}

import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";

export const secret = process.env.JWT_SECRET || "0xfuse";

export const jwtMiddleware = expressjwt({
	secret: secret,
	algorithms: ["HS256"],
}).unless({
	path: ["/", "/register", "/login"],
});

export function generateToken(payload: any): string {
	return jwt.sign(payload, secret, {
		expiresIn: "12h",
		issuer: "0xFuse"
	});
}

export function verifyToken(token: string, secretKey: string) {
	try {
		const decoded = jwt.verify(token, secretKey);
		return { valid: true, decoded };
	} catch (error) {
		return { valid: false, error: JSON.stringify(error) };
	}
}

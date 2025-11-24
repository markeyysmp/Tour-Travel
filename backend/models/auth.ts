import bcrypt from "bcrypt";
import { generateToken } from "../controller/authen/jwt";
import { pool } from "./db";

export async function register(
	firstname: string,
	lastname: string,
	email: string,
	password: string | null,
	regType: "email" | "gmail",
	googleId?: string
): Promise<{ success: boolean; message: string; token?: string }> {

	try {
		// validate email
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return { success: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
		}

		// เช็ค email ซ้ำ
		const [exists]: any = await pool.query(
			"SELECT COUNT(*) AS count FROM users WHERE email = ?",
			[email]
		);

		if (exists[0].count > 0) {
			return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" };
		}

		// -------------------------------------------------------------
		// REGISTER ผ่าน GOOGLE → password = null + ต้องส่ง googleId
		// -------------------------------------------------------------
		if (regType === "gmail") {
			const [insert]: any = await pool.query(
				`INSERT INTO users (email, firstname, lastname, password, regType, googleId, role)
				VALUES (?, ?, ?, NULL, 'gmail', ?, 'user')`,
				[email, firstname, lastname, googleId]
			);

			const uid = insert.insertId;

			const token = generateToken({
				uid,
				email,
				firstname,
				lastname,
				role: "user",
				regType: "gmail",
				googleId
			});

			return { success: true, message: "สมัครผ่าน Google สำเร็จ", token };
		}

		// -------------------------------------------------------------
		// REGISTER EMAIL/PASSWORD
		// -------------------------------------------------------------
		if (regType === "email") {

			if (!password || password.length < 6) {
				return { success: false, message: "รหัสผ่านอย่างน้อย 6 ตัวอักษร" };
			}

			const validName = /^[ก-๏a-zA-Z\s]+$/;
			if (!validName.test(firstname) || !validName.test(lastname)) {
				return { success: false, message: "ชื่อและนามสกุลต้องเป็นตัวอักษรเท่านั้น" };
			}

			const hashed = await bcrypt.hash(password, 10);

			// สมัครผู้ใช้ email
			const [insert]: any = await pool.query(
				`INSERT INTO users (email, firstname, lastname, password, regType, role)
				VALUES (?, ?, ?, ?, 'email', 'user')`,
				[email, firstname, lastname, hashed]
			);

			const uid = insert.insertId;

			const token = generateToken({
				uid,
				email,
				firstname,
				lastname,
				role: "user",
				regType: "email"
			});

			return { success: true, message: "สมัครสมาชิกสำเร็จ", token };

		}

		return { success: false, message: "ประเภทการสมัครไม่ถูกต้อง" };

	} catch (err: any) {
		return { success: false, message: "เกิดข้อผิดพลาด: " + err.message };
	}
}


// ============================
// LOGIN EMAIL/PASSWORD
// ============================
export async function login(email: string, password: string) {

	const [rows]: any = await pool.query(
		"SELECT * FROM users WHERE email = ?",
		[email]
	);

	if (rows.length === 0)
		throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

	const user = rows[0];

	// user google → ไม่สามารถ login ผ่าน password ได้
	if (user.regType === "gmail")
		throw new Error("บัญชีนี้ต้องเข้าสู่ระบบด้วย Google เท่านั้น");

	const match = await bcrypt.compare(password, user.password);
	if (!match)
		throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

	const token = generateToken({
		uid: user.uid,
		email: user.email,
		firstname: user.firstname,
		lastname: user.lastname,
		role: user.role,
		regType: "email"
	});

	return { token };
}

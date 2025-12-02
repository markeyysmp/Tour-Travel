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

export async function login(email: string, password: string) {

    // ================
    // 1. ตรวจตาราง USERS (ผู้ใช้ทั่วไป)
    // ================
    const [userRows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

	if (userRows.length > 0) {
		const user = userRows[0];

		// user google ไม่มี password ให้ใช้ login form
		if (user.regType === "gmail") {
			throw new Error("บัญชีนี้ต้องเข้าสู่ระบบด้วย Google เท่านั้น");
		}

		// เช็คสถานะ (แบน)
		if (user.status === "banned") {
			throw new Error("บัญชีนี้ถูกแบน ไม่สามารถเข้าสู่ระบบได้");
		}

		// ตรวจรหัสผ่าน
		const match = await bcrypt.compare(password, user.password);
		if (!match) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

		// สร้าง JWT
		const token = generateToken({
			uid: user.uid,
			email: user.email,
			firstname: user.firstname,
			lastname: user.lastname,
			role: user.role,
			regType: user.regType
		});

		return { token, role: user.role };
	}

    // ================
    // 2. ตรวจตาราง COMPANIES
    // ================
	const [companyRows]: any = await pool.query(
		"SELECT * FROM companies WHERE email = ?",
		[email]
	);

	if (companyRows.length > 0) {
		const company = companyRows[0];

		// เช็คสถานะบริษัทก่อน
		if (company.status === "pending") {
			throw new Error("บัญชีบริษัทของคุณอยู่ระหว่างรอการอนุมัติ กรุณารอผู้ดูแลระบบตรวจสอบ");
		}

		if (company.status === "rejected") {
			throw new Error("คำขอสมัครบริษัทของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ");
		}

		// ตรวจรหัสผ่าน
		const match = await bcrypt.compare(password, company.password);
		if (!match) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

		// JWT สำหรับบริษัท
		const token = generateToken({
			companyId: company.company_id,
			email: company.email,
			companyName: company.company_name,
			role: "company",
			regType: "email"
		});

		return { token, role: "company" };
	}

    // ================
    // 3. ตรวจตาราง ADMINS
    // ================
    const [adminRows]: any = await pool.query(
        "SELECT * FROM admins WHERE email = ?",
        [email]
    );

    if (adminRows.length > 0) {
        const admin = adminRows[0];

        const match = await bcrypt.compare(password, admin.password);
        if (!match) throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

        // JWT สำหรับ Admin
        const token = generateToken({
            adminId: admin.id,
            email: admin.email,
            firstname: admin.firstname,
            lastname: admin.lastname,
            role: "admin",
            regType: "email"
        });

        return { token, role: "admin" };
    }


    // ================
    // 4. ไม่พบในทุกตาราง
    // ================
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
}


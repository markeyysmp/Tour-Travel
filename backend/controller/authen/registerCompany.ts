import { pool } from "../../models/db";
import { createCompany } from "../../models/companyModel";
import { generateToken } from "./jwt";
import bcrypt from "bcrypt";

export async function registerCompany(req: any, res: any) {
	try {
		const {
			firstname,
			lastname,
			email,
			companyName,
			taxId,
			phone,
			line,
			bank,
			bankNumber,
			bankAccountName,
			companyAddress,
			password,
			passwordConfirm
		} = req.body;

		// ===============================
		// Validate: ข้อมูลพื้นฐาน
		// ===============================
		if (!firstname || !lastname || !email || !companyName || !phone) {
			return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ success: false, message: "รูปแบบอีเมลไม่ถูกต้อง" });
		}

		// Validate password
		if (password !== passwordConfirm) {
			return res.status(400).json({ success: false, message: "รหัสผ่านไม่ตรงกัน" });
		}

		if (password.length < 8) {
			return res.status(400).json({ success: false, message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
		}

		// Validate phone number
		if (!/^[0-9]+$/.test(phone)) {
			return res.status(400).json({ success: false, message: "เบอร์โทรต้องเป็นตัวเลขเท่านั้น" });
		}

		// Validate taxId (มายื่นไทยมักเป็น 13 หลัก)
		if (!/^[0-9]{13}$/.test(taxId)) {
			return res.status(400).json({ success: false, message: "เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก" });
		}

		// Validate bank number
		if (bankNumber && !/^[0-9]+$/.test(bankNumber)) {
			return res.status(400).json({ success: false, message: "เลขบัญชีธนาคารต้องเป็นตัวเลขเท่านั้น" });
		}

		// ===============================
		// Validate: ไฟล์เอกสาร PDF
		// ===============================
		if (!req.file) {
			return res.status(400).json({ success: false, message: "กรุณาอัปโหลดไฟล์เอกสารบริษัท" });
		}

		// ตรวจ MIME-Type และนามสกุล
		if (req.file.mimetype !== "application/pdf") {
			return res.status(400).json({ success: false, message: "อนุญาตเฉพาะไฟล์ PDF เท่านั้น" });
		}

		const ext = req.file.originalname.split(".").pop().toLowerCase();
		if (ext !== "pdf") {
			return res.status(400).json({ success: false, message: "ไฟล์ต้องเป็นนามสกุล .pdf" });
		}

		const documentPath = "/uploads/companyDocs/" + req.file.filename;

		// ===============================
		// ตรวจ email ซ้ำใน companies
		// ===============================
		const [exists]: any = await pool.query(
			"SELECT company_id FROM companies WHERE email = ?",
			[email]
		);

		if (exists.length > 0) {
			return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้สมัครบริษัทแล้ว" });
		}
        // Hash Password ก่อนบันทึกลง DB
        const hashedPassword = await bcrypt.hash(password, 10);

		// ===============================
		// INSERT ข้อมูลบริษัท
		// ===============================
        const companyId = await createCompany({
            firstname,
            lastname,
            email,
            companyName,
            taxId,
            phone,
            line,
            bank,
            bankNumber,
            bankAccountName,
            companyAddress,
            documentPath,
            password: hashedPassword, // <<< ส่ง hash เข้า model
            status: "pending"
        });


		// สร้าง JWT
		// const token = generateToken({
		// 	companyId,
		// 	email,
		// 	companyName,
		// 	role: "company",
		// 	regType: "email"
		// });

		return res.json({
			success: true,
			message: "สมัครบริษัทสำเร็จ",
			companyId
			// token
		});

	} catch (err: any) {
		console.error("Register Company Error:", err);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
}

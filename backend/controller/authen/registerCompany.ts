import { pool } from "../../models/db";
import { createCompany } from "../../models/companyModel";
import { generateToken } from "./jwt";

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

        // Validate
        if (!firstname || !lastname || !email || !companyName || !phone) {
            return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: "รหัสผ่านไม่ตรงกัน" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "กรุณาอัปโหลดเอกสารบริษัท" });
        }

        const documentPath = "/uploads/companyDocs/" + req.file.filename;

        // 1) ตรวจสอบ Email ซ้ำ
        const [exists]: any = await pool.query(
            "SELECT uid FROM users WHERE email = ?",
            [email]
        );

        let uid;

        if (exists.length === 0) {
            // 2) สมัคร user ก่อน (regType = company)
            const [insert]: any = await pool.query(
                `INSERT INTO users (firstname, lastname, email, password, regType, role)
                 VALUES (?, ?, ?, ?, 'company', 'user')`,
                [firstname, lastname, email, password, "company"]
            );
            uid = insert.insertId;
        } else {
            uid = exists[0].uid;
        }

        // 3) สร้างข้อมูลบริษัท
        await createCompany({
            uid,
            companyName,
            taxId,
            phone,
            line,
            bank,
            bankNumber,
            bankAccountName,
            companyAddress,
            documentPath,
            status: "pending"
        });

        const token = generateToken({ uid, email, firstname, lastname, role: "company", regType: "email" });

        res.json({ success: true, message: "สมัครบริษัทสำเร็จ", token });

    } catch (err: any) {
        console.error("Register Company Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

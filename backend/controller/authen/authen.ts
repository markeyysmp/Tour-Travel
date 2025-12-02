import express from "express";
import { register, login } from "../../models/auth";
export const auth = express.Router();
import passport from "passport";
import { pool } from "../../models/db";
import { generateToken } from "./jwt";
import multer from "multer";
import path from "path";
import { registerCompany } from "./registerCompany";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/companyDocs/");
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, unique + ext);
	}
});

const upload = multer({ storage });


// ===============================
// GOOGLE LOGIN REDIRECT
// ===============================
auth.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
auth.get("/google/callback",
    passport.authenticate("google", { session: false }),
    async (req: any, res) => {

        const profile = req.user;

        const googleId = profile.id;
        const email = profile.emails[0].value;
        const firstname = profile.name.givenName;
        const lastname = profile.name.familyName;

        // เช็ค user
        const [rows]: any = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        let uid;

        if (rows.length === 0) {

            // สมัครใหม่ผ่าน model
            const reg = await register(
                firstname,
                lastname,
                email,
                null,          // password = null เพราะใช้ google
                "gmail",
                googleId
            );

            // ดึง user ที่สมัครใหม่
            const [dbUser]: any = await pool.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            uid = dbUser[0].uid;

        } else {

            const user = rows[0];

            // ✔ เช็คสถานะแบน
            if (user.status === "banned") {
                return res.redirect(
                    `${process.env.FRONTEND_URL}/auth/callback?error=บัญชีนี้ถูกแบน`
                );
            }

            // user เคยมีแล้ว → update googleId ถ้าไม่มี
            uid = user.uid;

            if (!user.googleId) {
                await pool.query(
                    "UPDATE users SET googleId = ?, regType='gmail' WHERE uid = ?",
                    [googleId, uid]
                );
            }
        }

        // JWT
        const token = generateToken({
            uid,
            email,
            firstname,
            lastname,
            role: "user",
            regType: "gmail"
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// REGISTER COMPANY
auth.post("/register-company", upload.single("document"), registerCompany);
// ===============================
// REGISTER (email)
// ===============================
auth.post("/register", async (req: any, res: any) => {

    const { firstname, lastname, email, password, passwordConfirm, regType } = req.body;

    if (regType === "email" && (!firstname || !lastname || !email || !password || !passwordConfirm)) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const validPattern = /^[A-Za-z\u0E00-\u0E7F]+$/;

    if (!validPattern.test(firstname) || !validPattern.test(lastname)) {
        return res.status(400).json({
            message: "ชื่อผู้ใช้ต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น",
        });
    }

    if (password !== passwordConfirm)
        return res.status(400).json({ message: "รหัสผ่านไม่ตรงกัน" });

    try {
        const result = await register(firstname, lastname, email, password, regType);

        if (!result.success)
            return res.status(409).json({ message: result.message });

        res.status(201).json(result);

    } catch (error: any) {
        console.error("เกิดข้อผิดพลาดในการสมัคร:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ===============================
// LOGIN EMAIL/PASSWORD
// ===============================
auth.post("/login", async (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });

    try {
        const result = await login(email, password);

        res.status(200).json({
            success: true,
            token: result.token
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(401).json({ success: false, message: error.message });
    }
});


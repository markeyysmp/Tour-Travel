import { pool } from "./db";

// CREATE USER (email หรือ google)
export async function insertUser(data: any) {

  const sql = `
    INSERT INTO users 
    (firstname, lastname, email, password, regType, googleId, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.firstname,
    data.lastname,
    data.email,
    data.password ?? null,     // google จะเป็น null
    data.regType ?? "email",   // ถ้าไม่ใส่ default = email
    data.googleId ?? null,
    data.role ?? "user"
  ];

  const [rows]: any = await pool.query(sql, params);
  return rows;
}

// READ ALL USERS
export async function selectUsers() {
  const [rows]: any = await pool.query(`
    SELECT uid, firstname, lastname, email, regType, googleId, role
    FROM users
  `);
  return rows;
}

// READ ONE USER
export async function selectUserById(id: string) {
  const [rows]: any = await pool.query(
    `SELECT uid, firstname, lastname, email, regType, googleId, role FROM users WHERE uid = ?`,
    [id]
  );
  return rows[0];
}

// UPDATE USER
export async function updateUserById(id: string, data: any) {
  const sql = `
    UPDATE users 
    SET firstname=?, lastname=?, email=?, role=?, regType=?, googleId=? 
    WHERE uid=?
  `;

  const params = [
    data.firstname,
    data.lastname,
    data.email,
    data.role ?? "user",
    data.regType ?? "email",
    data.googleId ?? null,
    id
  ];

  const [rows]: any = await pool.query(sql, params);
  return rows;
}

// DELETE USER
export async function deleteUserById(id: string) {
  const [rows]: any = await pool.query(`DELETE FROM users WHERE uid = ?`, [id]);
  return rows;
}

import { pool } from "./db";

export async function createCompany(data: any) {
	const sql = `
		INSERT INTO companies
		(uid, company_name, tax_id, phone, line_contact, bank, bank_number,
		 bank_account_name, company_address, document_path, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const params = [
		data.uid,
		data.companyName,
		data.taxId,
		data.phone,
		data.line,
		data.bank,
		data.bankNumber,
		data.bankAccountName,
		data.companyAddress,
		data.documentPath,
		data.status || "pending"   // default = pending
	];

	const [rows]: any = await pool.query(sql, params);
	return rows;
}

export async function getCompanyByUid(uid: number) {
    const [rows]: any = await pool.query(
        "SELECT * FROM companies WHERE uid = ?",
        [uid]
    );
    return rows[0];
}

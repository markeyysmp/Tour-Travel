import { pool } from "./db";

export async function createCompany(data: any) {
	const [result]: any = await pool.query(
		`INSERT INTO companies 
		(firstname, lastname, email, company_name, tax_id, phone, line_contact, bank, bank_number, bank_account_name, company_address, document_path, password, status) 
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			data.firstname,
			data.lastname,
			data.email,
			data.companyName,
			data.taxId,
			data.phone,
			data.line,
			data.bank,
			data.bankNumber,
			data.bankAccountName,
			data.companyAddress,
			data.documentPath,
			data.password,
			data.status
		]
	);

	return result.insertId; // company_id
}

export async function getCompanyById(companyId: number) {
	const [rows]: any = await pool.query(
		"SELECT * FROM companies WHERE company_id = ?",
		[companyId]
	);
	return rows[0];
}

import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "tour_travel",
    decimalNumbers: true,
    charset: "utf8mb4",
});
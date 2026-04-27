import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'libero_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (text, params) => {
    const [rows] = await pool.execute(text, params);
    return { rows };
};

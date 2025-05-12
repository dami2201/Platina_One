import mysql from 'mysql2/promise';

export const db: any = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'platina_one',
});

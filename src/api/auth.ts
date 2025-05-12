import { db } from './db.ts';
import bcrypt from 'bcryptjs';

// ==== REGISZTRÁCIÓ ====
export async function registerUser(username: string, email: string, password: string) {
  // Ellenőrizzük, hogy van-e már ilyen email
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const users = rows as any[];

  if (users.length > 0) {
    throw new Error('Email already in use');
  }

  // Jelszó hash-elés
  const hashedPassword = await bcrypt.hash(password, 10);

  // Új user beszúrása
  await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );

  return { message: 'User created' };
}

// ==== LOGIN ====
export async function loginUser(email: string, password: string) {
  // Email alapján keresés
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const users = rows as any[];

  if (users.length === 0) {
    throw new Error('No user found');
  }

  const user = users[0];

  // Jelszó ellenőrzése
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  // Sikeres bejelentkezés – user adatok visszaadása
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    rank: user.rank,
  };
}

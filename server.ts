import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { registerUser, loginUser } from './src/api/auth.ts';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './src/api/db.ts';
import mime from 'mime';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());

// === REGISZTRÁCIÓ ===
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser(username, email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// === LOGIN ===
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// === LOOP FELTÖLTÉS ===
app.post('/api/loops/upload', upload.single('loop'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { user_id, title, description } = req.body;

    if (!file || !title || !user_id) {
      res.status(400).json({ message: 'Hiányzik a fájl, cím vagy user azonosító.' });
      return;
    }

    await db.query(
      'INSERT INTO loops (title, description, file_url, user_id) VALUES (?, ?, ?, ?)',
      [title, description || null, file.filename, user_id]
    );

    res.json({ message: 'Loop sikeresen feltöltve.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === LOOP LISTÁZÁS ===
app.get('/api/loops', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT loops.*, users.username, 
             CONCAT('http://localhost:3001/uploads/', loops.file_url) AS file_url 
      FROM loops 
      JOIN users ON loops.user_id = users.id 
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === USER PROFIL LEKÉRÉS ===
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const [users] = await db.query(
      'SELECT id, username, email, rank FROM users WHERE username = ?',
      [username]
    );

    if ((users as any[]).length === 0) {
      res.status(404).json({ message: 'User nem található' });
      return;
    }

    const user = (users as any[])[0];

    const [loops] = await db.query(
      'SELECT * FROM loops WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    res.json({ user, loops });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === STATIKUS AUDIO KISZOLGÁLÁS ===
app.get('/uploads/:filename', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'A fájl nem található' });
    return;
  }

  const contentType = mime.getType(filePath) || 'application/octet-stream';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Type', contentType);

  res.sendFile(filePath);
});

// === LOOP ÉRTÉKELÉS + KOMMENT ===
app.post('/api/ratings', async (req: Request, res: Response) => {
  const { user_id, loop_id, rating, comment } = req.body;

  if (!user_id || !loop_id) {
    res.status(400).json({ message: 'Hiányzó adat: user_id vagy loop_id.' });
    return;
  }

  try {
    const [existing] = await db.query(
      'SELECT * FROM ratings WHERE user_id = ? AND loop_id = ?',
      [user_id, loop_id]
    );

    if ((existing as any[]).length > 0) {
      await db.query(
        'UPDATE ratings SET rating = ?, comment = ?, created_at = NOW() WHERE user_id = ? AND loop_id = ?',
        [rating ?? null, comment ?? null, user_id, loop_id]
      );
    } else {
      await db.query(
        'INSERT INTO ratings (user_id, loop_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, loop_id, rating ?? null, comment ?? null]
      );
    }

    res.json({ message: 'Értékelés / komment elmentve' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === ÉRTÉKELÉS STATISZTIKA ===
app.get('/api/loops/:id/ratings', async (req: Request, res: Response) => {
  const loopId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT rating, COUNT(*) as count 
       FROM ratings 
       WHERE loop_id = ? 
       GROUP BY rating`,
      [loopId]
    );

    const result = {
      gold: 0,
      diamond: 0,
      platina: 0,
    };

    (rows as any[]).forEach((row) => {
      if (row.rating === 1) result.gold = row.count;
      if (row.rating === 2) result.diamond = row.count;
      if (row.rating === 3) result.platina = row.count;
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === KOMMENTEK LOOPHOZ ===
app.get('/api/loops/:id/comments', async (req: Request, res: Response) => {
  try {
    const loopId = req.params.id;

    const [rows] = await db.query(
      `SELECT ratings.comment, ratings.created_at, users.username 
       FROM ratings
       JOIN users ON ratings.user_id = users.id
       WHERE ratings.loop_id = ? AND ratings.comment IS NOT NULL
       ORDER BY ratings.created_at DESC`,
      [loopId]
    );

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === ÜZENETEK LEKÉRÉSE ===
app.get('/api/messages', async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id } = req.query;

    if (sender_id && receiver_id) {
      // privát üzenetek
      const [rows] = await db.query(
        `SELECT messages.*, users.username AS sender_username
         FROM messages
         JOIN users ON messages.sender_id = users.id
         WHERE 
           ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
           AND receiver_id IS NOT NULL
         ORDER BY created_at ASC`,
        [sender_id, receiver_id, receiver_id, sender_id]
      );
      res.json(rows);
    } else {
      // nyilvános chat (receiver_id IS NULL)
      const [rows] = await db.query(
        `SELECT messages.*, users.username AS sender_username
         FROM messages
         JOIN users ON messages.sender_id = users.id
         WHERE messages.receiver_id IS NULL
         ORDER BY created_at ASC`
      );
      res.json(rows);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// === ÜZENET KÜLDÉSE ===
app.post('/api/messages', async (req: Request, res: Response) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message) {
    res.status(400).json({ message: 'Hiányzó adat: sender_id, receiver_id vagy message.' });
    return;
  }

  try {
    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [sender_id, receiver_id, message]
    );

    res.json({ message: 'Üzenet sikeresen elküldve.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === ÖSSZES FELHASZNÁLÓ LEKÉRÉSE (CHAT DROP DOWNHOZ) ===
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const [users] = await db.query('SELECT id, username FROM users ORDER BY username ASC');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === NYILVÁNOS ÜZENETEK LEKÉRÉSE ===
app.get('/api/public-messages', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT public_messages.*, users.username AS sender_username
       FROM public_messages
       JOIN users ON public_messages.sender_id = users.id
       ORDER BY public_messages.created_at ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// === NYILVÁNOS ÜZENET KÜLDÉSE ===
app.post('/api/public-messages', async (req: Request, res: Response) => {
  const { sender_id, message } = req.body;

  if (!sender_id || !message) {
    res.status(400).json({ message: 'Hiányzó adat: sender_id vagy message.' });
    return;
  }

  try {
    await db.query(
      'INSERT INTO public_messages (sender_id, message) VALUES (?, ?)',
      [sender_id, message]
    );

    res.json({ message: 'Üzenet sikeresen elküldve (nyilvános).' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// === SERVER INDÍTÁS ===
app.listen(3001, () => {
  console.log('🔥 API sikeresen elindítva -- http://localhost:3001');
});

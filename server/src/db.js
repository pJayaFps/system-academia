import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = process.env.DB_PATH || './server/data/store.sqlite';

const seedProducts = [
  {
    id: 'nk-tee-01',
    name: 'Camiseta Nike Essential',
    brand: 'Nike',
    category: 'Camiseta',
    price: 129.9,
    description: 'Camiseta premium em algodão macio, corte moderno e ótimo caimento para uso diário.',
    audience: 'Homens',
    type: 'Camisetas',
    image: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'ad-hd-01',
    name: 'Moletom Adidas Street',
    brand: 'Adidas',
    category: 'Moletom',
    price: 289.9,
    description: 'Moletom com interior felpado, visual urbano e acabamento premium para dias frios.',
    audience: 'Homens',
    type: 'Moletons',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'sl-chn-01',
    name: 'Chinelo Slide Sport',
    brand: 'Nike',
    category: 'Calçado',
    price: 99.9,
    description: 'Chinelo esportivo leve com palmilha macia para descanso no pós-treino.',
    audience: 'Homens',
    type: 'Chinelos',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'bt-tr-01',
    name: 'Bota Trail Explorer',
    brand: 'Adidas',
    category: 'Calçado',
    price: 459.9,
    description: 'Bota de trilha com solado aderente e proteção reforçada para terrenos variados.',
    audience: 'Mulheres',
    type: 'Bota de trilha',
    image: 'https://images.unsplash.com/photo-1520219306100-ec7af38df143?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'ch-ft-01',
    name: 'Chuteira Campo Pro',
    brand: 'Nike',
    category: 'Calçado',
    price: 399.9,
    description: 'Chuteira de campo com tração otimizada para mudanças rápidas de direção.',
    audience: 'Crianças',
    type: 'Chuteiras',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80'
  }
];

export async function initDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      audience TEXT,
      type TEXT,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      payment_id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      customer_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      payment_json TEXT NOT NULL,
      status TEXT NOT NULL,
      pix_key TEXT,
      qr_code_image TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
  `);


  await db.exec('ALTER TABLE products ADD COLUMN audience TEXT').catch(() => null);
  await db.exec('ALTER TABLE products ADD COLUMN type TEXT').catch(() => null);

  return db;
}

export async function seedDatabase(db, adminEmail, adminPassword) {
  const admin = await db.get('SELECT id FROM admin_users WHERE email = ?', adminEmail);
  if (!admin) {
    await db.run('INSERT INTO admin_users (email, password) VALUES (?, ?)', adminEmail, adminPassword);
  }

  const productCount = await db.get('SELECT COUNT(*) as total FROM products');
  if ((productCount?.total ?? 0) === 0) {
    for (const product of seedProducts) {
      await db.run(
        'INSERT INTO products (id, name, brand, category, price, description, audience, type, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        product.id,
        product.name,
        product.brand,
        product.category,
        product.price,
        product.description,
        product.audience,
        product.type,
        product.image
      );
    }
  }
}

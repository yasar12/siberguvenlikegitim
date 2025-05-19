const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || '1',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Bağlantı havuzu hata yönetimi
pool.on('error', (err) => {
    console.error('Beklenmeyen veritabanı hatası:', err);
    process.exit(-1);
});

// Test bağlantısı
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('PostgreSQL bağlantı hatası:', err);
    } else {
        console.log('PostgreSQL bağlantısı başarılı!');
    }
});

module.exports = pool; 
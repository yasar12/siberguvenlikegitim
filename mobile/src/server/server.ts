import express, { Request as ExpressRequest, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import session from 'express-session';

// Session tipi için interface
declare module 'express-session' {
  interface Session {
    userId?: number;
    userEmail?: string;
  }
}

const app = express();
const PORT = 3000;
const JWT_SECRET = 'siber-guvenlik-egitim-jwt-secret-key-2024'; // Güvenli JWT secret key

// Tipler
interface User {
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  bio?: string;
  role?: string;
}

interface CustomRequest extends ExpressRequest {
  user?: User;
}

interface PathwayType {
  id: number;
  title: string;
  description: string;
  level: string;
  duration_weeks: number;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Middleware
const authenticateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Kullanıcı bilgilerini veritabanından al
    const userResult = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(401).json({ message: 'Geçersiz token' });
  }
};

// Debug middleware
app.use((req: ExpressRequest, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// CORS ayarları
app.use(cors({
  origin: ['http://172.20.10.3:3000', 'exp://172.20.10.3:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'siber-egitim-gizli-anahtar',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 saat
  }
}));

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '1',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// PostgreSQL bağlantı testi
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL bağlantı hatası:', err.message);
    return;
  }
  release();
  console.log('✅ PostgreSQL bağlantısı başarılı!');
  console.log('📊 Bağlantı bilgileri:', {
    host: pool.options.host,
    database: pool.options.database,
    port: pool.options.port,
    user: pool.options.user
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('👤 Login isteği alındı:', req.body);
  console.log('📍 İstek başlıkları:', req.headers);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Email veya şifre eksik');
    return res.status(400).json({ message: 'Email ve şifre gerekli' });
  }

  try {
    // Test amaçlı sabit kullanıcı kontrolü
    if (email === 'yasar.gormez28@gmail.com' && password === 'ERTYyasar12!') {
      const token = jwt.sign(
        { 
          userId: 1,
          email: email,
          role: 'user'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Test kullanıcısı için başarılı giriş:', email);
      if (req.session) {
        req.session.userId = 1;
        req.session.userEmail = email;
      }
      return res.json({
        token,
        user: {
          id: 1,
          email: email,
          role: 'user',
          full_name: 'Test User'
        }
      });
    }

    // Kullanıcıyı veritabanında ara
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('🔍 Veritabanı sorgu sonucu:', result.rows);

    const user = result.rows[0];
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı:', email);
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Geçersiz şifre:', email);
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Kullanıcı aktif değilse
    if (!user.is_active) {
      console.log('❌ Hesap aktif değil:', email);
      return res.status(403).json({ message: 'Hesabınız aktif değil' });
    }

    // Son giriş tarihini güncelle
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('✅ Başarılı giriş:', email);
    if (req.session) {
      req.session.userId = user.id;
      req.session.userEmail = user.email;
    }
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('❌ Login hatası:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Dashboard data endpoint
app.get('/api/dashboard/data', async (req: ExpressRequest, res: Response) => {
  console.log('📊 Dashboard verisi istendi');

  if (!req.session.userId) {
    return res.status(401).json({ message: 'Oturum bulunamadı' });
  }

  try {
    // Kullanıcı bilgilerini al
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = userResult.rows[0];

    // Kayıtlı kariyer yollarını al
    const pathwaysQuery = `
      SELECT 
        p.*,
        COUNT(DISTINCT cl.lesson_id) as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons,
        ROUND(COUNT(DISTINCT cl.lesson_id)::numeric / COUNT(DISTINCT l.id)::numeric * 100) as progress_percentage
      FROM pathways p
      LEFT JOIN pathway_lessons pl ON p.id = pl.pathway_id
      LEFT JOIN lessons l ON pl.lesson_id = l.id
      LEFT JOIN completed_lessons cl ON l.id = cl.lesson_id AND cl.user_id = $1
      WHERE p.id IN (SELECT pathway_id FROM user_pathways WHERE user_id = $1)
      GROUP BY p.id
    `;
    const pathwaysResult = await pool.query(pathwaysQuery, [req.session.userId]);
    const enrolledPathways = pathwaysResult.rows;

    // Tamamlanan ve toplam ders sayılarını al
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT cl.lesson_id) as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons
      FROM lessons l
      LEFT JOIN completed_lessons cl ON l.id = cl.lesson_id AND cl.user_id = $1
      WHERE l.id IN (
        SELECT lesson_id 
        FROM pathway_lessons pl
        WHERE pl.pathway_id IN (
          SELECT pathway_id 
          FROM user_pathways 
          WHERE user_id = $1
        )
      )
    `;
    const statsResult = await pool.query(statsQuery, [req.session.userId]);
    const stats = statsResult.rows[0];

    res.json({
      user,
      enrolledPathways,
      completedLessons: parseInt(stats.completed_lessons) || 0,
      totalLessons: parseInt(stats.total_lessons) || 0
    });
  } catch (error: any) {
    console.error('❌ Dashboard verisi alınırken hata:', error);
    res.status(500).json({ 
      message: 'Dashboard verisi alınırken hata oluştu',
      error: error.message 
    });
  }
});

// Enrolled pathways endpoint
app.get('/api/pathways/enrolled', async (req: ExpressRequest, res: Response) => {
  console.log('🛣️ Kayıtlı kariyer yolları istendi');

  if (!req.session.userId) {
    return res.status(401).json({ message: 'Oturum bulunamadı' });
  }

  try {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT cl.lesson_id) as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons,
        ROUND(COUNT(DISTINCT cl.lesson_id)::numeric / COUNT(DISTINCT l.id)::numeric * 100) as progress_percentage
      FROM pathways p
      LEFT JOIN pathway_lessons pl ON p.id = pl.pathway_id
      LEFT JOIN lessons l ON pl.lesson_id = l.id
      LEFT JOIN completed_lessons cl ON l.id = cl.lesson_id AND cl.user_id = $1
      WHERE p.id IN (SELECT pathway_id FROM user_pathways WHERE user_id = $1)
      GROUP BY p.id
    `;
    const result = await pool.query(query, [req.session.userId]);
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Kariyer yolları alınırken hata:', error);
    res.status(500).json({ 
      message: 'Kariyer yolları alınırken hata oluştu',
      error: error.message 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req: ExpressRequest, res: Response) => {
  console.log('👋 Çıkış yapılıyor');
  
  if (!req.session) {
    return res.status(200).json({ message: 'Zaten çıkış yapılmış' });
  }

  req.session.destroy((error: any) => {
    if (error) {
      console.error('❌ Çıkış yaparken hata:', error);
      return res.status(500).json({ message: 'Çıkış yapılırken hata oluştu' });
    }
    res.json({ message: 'Başarıyla çıkış yapıldı' });
  });
});

// Error handling middleware
app.use((err: Error, req: ExpressRequest, res: Response, next: NextFunction) => {
  console.error('❌ Sunucu hatası:', err);
  res.status(500).json({ message: 'Sunucu hatası oluştu' });
});

// Dashboard endpoint'i
app.get('/api/dashboard', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    console.log('Dashboard isteği alındı');
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının kayıtlı olduğu yolları al
    const pathwaysQuery = `
      SELECT 
        up.id as user_pathway_id,
        up.status as enrollment_status,
        up.start_date,
        up.completion_date,
        p.id as pathway_id,
        p.title,
        p.description,
        p.level,
        p.duration_weeks,
        p.image_url,
        p.is_active,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT ul.lesson_id) FILTER (WHERE ul.status = 'completed') as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons,
        ROUND(
          (COUNT(DISTINCT ul.lesson_id) FILTER (WHERE ul.status = 'completed')::numeric / 
          NULLIF(COUNT(DISTINCT l.id), 0)::numeric) * 100,
          1
        ) as progress_percentage
      FROM user_pathways up
      JOIN pathways p ON up.pathway_id = p.id
      LEFT JOIN modules m ON m.pathway_id = p.id
      LEFT JOIN lessons l ON l.module_id = m.id
      LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = up.user_id
      WHERE up.user_id = $1
      GROUP BY up.id, p.id, up.status, up.start_date, up.completion_date, p.title, p.description, p.level, p.duration_weeks, p.image_url, p.is_active, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
    `;
    
    const pathwaysResult = await pool.query(pathwaysQuery, [user.id]);
    console.log('Kayıtlı yollar veritabanı sonucu:', pathwaysResult.rows);
    const enrolledPathways = pathwaysResult.rows;

    // Toplam istatistikleri hesapla
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT up.pathway_id) as registered_pathways,
        COUNT(DISTINCT ul.lesson_id) FILTER (WHERE ul.status = 'completed') as completed_lessons,
        COUNT(DISTINCT l.id) as total_lessons
      FROM user_pathways up
      JOIN modules m ON m.pathway_id = up.pathway_id
      JOIN lessons l ON l.module_id = m.id
      LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = up.user_id
      WHERE up.user_id = $1
    `;
    
    const statsResult = await pool.query(statsQuery, [user.id]);
    const stats = statsResult.rows[0];

    const response = {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        profile_image: user.profile_image,
        bio: user.bio,
        role: user.role
      },
      stats: {
        registeredPathways: parseInt(stats.registered_pathways) || 0,
        completedLessons: parseInt(stats.completed_lessons) || 0,
        totalLessons: parseInt(stats.total_lessons) || 0
      },
      enrolledPathways: enrolledPathways.map(p => ({
        id: p.user_pathway_id,
        start_date: p.start_date,
        completion_date: p.completion_date,
        progress_percentage: parseFloat(p.progress_percentage) || 0,
        status: p.enrollment_status,
        pathway: {
          id: p.pathway_id,
          title: p.title,
          description: p.description,
          level: p.level,
          duration_weeks: p.duration_weeks,
          image_url: p.image_url,
          is_active: p.is_active,
          created_at: p.created_at,
          updated_at: p.updated_at
        }
      }))
    };

    console.log('Dashboard yanıtı:', response);
    res.json(response);
  } catch (error) {
    console.error('Dashboard hatası:', error);
    res.status(500).json({ message: 'Dashboard verisi alınamadı' });
  }
});

// Kayıtlı yollar endpoint'i
app.get('/api/pathways', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    console.log('Tüm kariyer yolları isteği alındı');
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('Kullanıcı ID:', user.id);

    const query = `
      SELECT 
        p.*,
        CASE 
          WHEN up.id IS NOT NULL THEN true 
          ELSE false 
        END as is_enrolled,
        up.status as enrollment_status
      FROM pathways p
      LEFT JOIN user_pathways up ON p.id = up.pathway_id AND up.user_id = $1
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `;
    
    console.log('SQL sorgusu çalıştırılıyor...');
    const result = await pool.query(query, [user.id]);
    console.log('Veritabanı sonucu:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('Hiç kariyer yolu bulunamadı');
      return res.json([]);
    }
    
    const response = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      level: row.level,
      duration_weeks: row.duration_weeks,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_enrolled: row.is_enrolled,
      enrollment_status: row.enrollment_status
    }));
    
    console.log('Dönüş verisi:', response);
    res.json(response);
  } catch (error: any) {
    console.error('Kariyer yolları hatası:', error);
    res.status(500).json({ message: 'Kariyer yolları alınamadı', error: error.message });
  }
});

// Kariyer yolu detayları endpoint'i
app.get('/api/pathways/:id/details', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    console.log('Kariyer yolu detayları isteği alındı:', req.params.id);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    const pathwayId = req.params.id;

    // Modülleri ve dersleri çek
    const query = `
      SELECT 
        m.id as module_id,
        m.title as module_title,
        m.description as module_description,
        l.id as lesson_id,
        l.title as lesson_title,
        l.content as lesson_content,
        CASE 
          WHEN ul.status IS NOT NULL THEN ul.status
          ELSE 'not_started'
        END as lesson_status
      FROM modules m
      LEFT JOIN lessons l ON l.module_id = m.id
      LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = $1
      WHERE m.pathway_id = $2
      ORDER BY m.id, l.id
    `;

    const result = await pool.query(query, [user.id, pathwayId]);

    // Sonuçları düzenle
    const modules = result.rows.reduce((acc: any[], row) => {
      let module = acc.find(m => m.id === row.module_id);
      
      if (!module) {
        module = {
          id: row.module_id,
          title: row.module_title,
          description: row.module_description,
          lessons: []
        };
        acc.push(module);
      }

      if (row.lesson_id) {
        module.lessons.push({
          id: row.lesson_id,
          title: row.lesson_title,
          content: row.lesson_content,
          status: row.lesson_status
        });
      }

      return acc;
    }, []);

    res.json({
      modules: modules.sort((a, b) => a.id - b.id)
    });
  } catch (error) {
    console.error('Kariyer yolu detayları hatası:', error);
    res.status(500).json({ message: 'Kariyer yolu detayları alınamadı' });
  }
});

// Kullanıcı profili endpoint'i
app.get('/api/user/profile', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    console.log('Profil bilgileri istendi');
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı bilgilerini veritabanından al
    const userQuery = `
      SELECT id, full_name, email, bio, role, profile_image, is_active
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(userQuery, [user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const userData = result.rows[0];
    
    const response = {
      id: userData.id,
      full_name: userData.full_name,
      email: userData.email,
      bio: userData.bio,
      role: userData.role,
      profile_image: userData.profile_image,
      is_active: userData.is_active
    };

    console.log('Profil yanıtı:', response);
    res.json(response);
  } catch (error) {
    console.error('Profil bilgileri hatası:', error);
    res.status(500).json({ message: 'Profil bilgileri alınamadı' });
  }
});

// Ders detayları endpoint'i
app.get('/api/lessons/:id', authenticateToken, async (req: CustomRequest, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    console.log('Ders detayları isteniyor:', lessonId);

    // Ders bilgilerini veritabanından al
    const result = await pool.query(
      `SELECT l.*, m.title as module_title 
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ders bulunamadı' });
    }

    const lesson = result.rows[0];
    
    // Kullanıcının ders durumunu kontrol et
    const userLessonResult = await pool.query(
      `SELECT status FROM user_lessons 
       WHERE user_id = $1 AND lesson_id = $2`,
      [req.user?.id, lessonId]
    );

    lesson.status = userLessonResult.rows[0]?.status || 'not_started';

    res.json(lesson);
  } catch (error) {
    console.error('Ders detayları hatası:', error);
    res.status(500).json({ message: 'Ders detayları alınamadı' });
  }
});

// Ders tamamlama endpoint'i
app.post('/api/lessons/:id/complete', authenticateToken, async (req: CustomRequest, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    console.log('Ders tamamlanıyor:', lessonId);

    // Dersin var olduğunu kontrol et
    const lessonResult = await pool.query(
      'SELECT id FROM lessons WHERE id = $1',
      [lessonId]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ message: 'Ders bulunamadı' });
    }

    // Kullanıcının ders durumunu güncelle
    await pool.query(
      `INSERT INTO user_lessons (user_id, lesson_id, status)
       VALUES ($1, $2, 'completed')
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET status = 'completed'`,
      [req.user?.id, lessonId]
    );

    res.json({ message: 'Ders başarıyla tamamlandı' });
  } catch (error) {
    console.error('Ders tamamlama hatası:', error);
    res.status(500).json({ message: 'Ders tamamlanamadı' });
  }
});

// Modül derslerini getir endpoint'i
app.get('/api/modules/:id/lessons', authenticateToken, async (req: CustomRequest, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    console.log('Modül dersleri isteniyor:', moduleId);

    // Modüldeki dersleri getir
    const result = await pool.query(
      `SELECT l.*, 
              CASE 
                WHEN ul.status IS NOT NULL THEN ul.status
                ELSE 'not_started'
              END as status
       FROM lessons l
       LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
       WHERE l.module_id = $2
       ORDER BY l.id`,
      [req.user?.id, moduleId]
    );

    res.json({ lessons: result.rows });
  } catch (error) {
    console.error('Modül dersleri hatası:', error);
    res.status(500).json({ message: 'Modül dersleri alınamadı' });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Mobil uygulama sunucusu ${PORT} portunda çalışıyor`);
}); 
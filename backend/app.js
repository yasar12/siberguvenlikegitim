const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const port = 3001;

// Database bağlantısı
const pool = require('./config/database');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log('İstek detayları:');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Base URL:', req.baseUrl);
    if (req.url.includes('.css')) {
        console.log('CSS dosya yolu:', path.join(__dirname, 'public', req.url));
        console.log('CSS dosyası mevcut mu:', require('fs').existsSync(path.join(__dirname, 'public', req.url)));
    }
    next();
});

// Statik dosyalar için public klasörü
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Session ayarları
app.use(session({
    secret: 'siber-egitim-gizli-anahtar',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hafta
        httpOnly: true,
        sameSite: 'lax'
    },
    name: 'sessionId' // Session cookie ismi
}));

// Auth middleware - tüm sayfalarda session kontrolü
const authMiddleware = (req, res, next) => {
    // Public dosyalara ve auth sayfalarına izin ver
    if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico)$/i) || 
        req.path === '/login' || 
        req.path === '/register' || 
        req.path === '/' || 
        req.path.startsWith('/admin')) {
        return next();
    }

    // Session kontrolü
    if (!req.session.userId) {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            // AJAX istekleri için JSON yanıtı
            return res.status(401).json({ error: 'Oturum süresi doldu', redirectUrl: '/login' });
        } else {
            // Normal sayfa istekleri için yönlendirme
            return res.redirect('/login');
        }
    }
    next();
};

// Middleware sıralaması önemli
app.use(authMiddleware);

// View engine ayarı
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ana sayfa route'u
app.get('/', async (req, res) => {
    try {
        // Kullanıcı bilgilerini al
        let user = null;
        if (req.session.userId) {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
            user = result.rows[0];
        }

        // İlk 3 pathway'i çek
        const pathwaysQuery = `
            SELECT * FROM pathways 
            WHERE is_active = true 
            ORDER BY id 
            LIMIT 3
        `;
        const pathwaysResult = await pool.query(pathwaysQuery);
        const popularCareerPaths = pathwaysResult.rows;

        res.render('index', {
            title: 'Ana Sayfa',
            user: user,
            popularCareerPaths: popularCareerPaths || [],
            courses: [],
            modules: []
        });
    } catch (error) {
        console.error('Ana sayfa yüklenirken hata:', error);
        res.status(500).render('error', {
            title: 'Hata',
            message: 'Ana sayfa yüklenirken bir hata oluştu.',
            user: user
        });
    }
});

// Login sayfası route'u
app.get('/login', (req, res) => {
    res.render('login');
});

// Login işlemi
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Geçersiz şifre' });
        }

        // Session'a kullanıcı bilgilerini kaydet
        req.session.userId = user.id;
        req.session.userEmail = user.email;

        res.json({ success: true, redirectUrl: '/dashboard' });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
    }
});

// Kayıt sayfası route'u
app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register');
});

// Kayıt işlemi
app.post('/register', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // E-posta kontrolü
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Kullanıcıyı oluştur
        const result = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
            [fullname, email, password_hash]
        );

        const user = result.rows[0];

        // Session'a kullanıcı bilgilerini kaydet
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.fullname = user.full_name;

        res.json({ success: true, redirectUrl: '/dashboard' });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ error: 'Kayıt işlemi sırasında bir hata oluştu' });
    }
});

// Dashboard sayfası
app.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        // Kullanıcı bilgilerini al
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
        const user = userResult.rows[0];

        // Kullanıcının kayıtlı olduğu kariyer yollarını ve ilerleme durumunu al
        const pathwaysQuery = `
            SELECT 
                p.*,
                up.status as enrollment_status,
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
            GROUP BY p.id, up.status
            ORDER BY p.id
        `;
        
        const pathwaysResult = await pool.query(pathwaysQuery, [req.session.userId]);
        const enrolledPathways = pathwaysResult.rows;

        // Toplam istatistikleri hesapla
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT ul.lesson_id) FILTER (WHERE ul.status = 'completed') as completed_lessons,
                COUNT(DISTINCT l.id) as total_lessons
            FROM user_pathways up
            JOIN modules m ON m.pathway_id = up.pathway_id
            JOIN lessons l ON l.module_id = m.id
            LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = up.user_id
            WHERE up.user_id = $1
        `;
        
        const statsResult = await pool.query(statsQuery, [req.session.userId]);
        const stats = statsResult.rows[0];

        res.render('dashboard', {
            user: user,
            enrolledPathways: enrolledPathways,
            completedLessons: stats.completed_lessons || 0,
            totalLessons: stats.total_lessons || 0
        });
    } catch (error) {
        console.error('Dashboard hatası:', error);
        res.status(500).render('error', { 
            message: 'Bir hata oluştu',
            user: req.session.userId ? await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]) : null
        });
    }
});

// Pathways sayfası
app.get('/pathways', async (req, res) => {
    try {
        // Kullanıcı bilgilerini al
        let user = null;
        if (req.session.userId) {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
            user = result.rows[0];
        }

        // Pathway'leri veritabanından al
        const pathwaysQuery = `
            SELECT 
                p.*,
                COUNT(DISTINCT m.id) as module_count,
                COUNT(DISTINCT up.user_id) as student_count,
                COALESCE(
                    (SELECT COUNT(*) FROM user_pathways up2 
                    WHERE up2.pathway_id = p.id 
                    AND up2.status = 'completed'), 
                0) as completed_count
            FROM pathways p
            LEFT JOIN modules m ON p.id = m.pathway_id
            LEFT JOIN user_pathways up ON p.id = up.pathway_id
            WHERE p.is_active = true
            GROUP BY p.id
            ORDER BY p.id
        `;

        const pathwaysResult = await pool.query(pathwaysQuery);

        // Her pathway için ilk 3 modülü al
        const pathways = await Promise.all(pathwaysResult.rows.map(async (pathway) => {
            const modulesQuery = `
                SELECT title 
                FROM modules 
                WHERE pathway_id = $1 
                ORDER BY order_number 
                LIMIT 3
            `;
            const modulesResult = await pool.query(modulesQuery, [pathway.id]);
            
            return {
                ...pathway,
                preview_modules: modulesResult.rows.map(m => m.title)
            };
        }));

        res.render('pathways', { 
            user: user,
            pathways: pathways
        });
    } catch (error) {
        console.error('Pathways yüklenirken hata:', error);
        res.status(500).send('Bir hata oluştu');
    }
});

// Pathway detay sayfası
app.get('/pathway/:id', async (req, res) => {
    try {
        const pathwayId = req.params.id;
        
        // Kullanıcı bilgilerini al
        let user = null;
        if (req.session.userId) {
            const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
            user = userResult.rows[0];
        }

        // Pathway detaylarını al
        const pathwayQuery = `
            SELECT 
                p.*,
                COUNT(DISTINCT up.user_id) as student_count,
                COALESCE(
                    (SELECT COUNT(*) FROM user_pathways up2 
                    WHERE up2.pathway_id = p.id 
                    AND up2.status = 'completed'), 
                0) as completed_count
            FROM pathways p
            LEFT JOIN user_pathways up ON p.id = up.pathway_id
            WHERE p.id = $1 AND p.is_active = true
            GROUP BY p.id
        `;
        
        const pathwayResult = await pool.query(pathwayQuery, [pathwayId]);
        
        if (pathwayResult.rows.length === 0) {
            return res.status(404).render('error', { 
                message: 'Eğitim yolu bulunamadı',
                user: user
            });
        }

        const pathway = pathwayResult.rows[0];

        // Modülleri ve dersleri al
        const modulesQuery = `
            SELECT 
                m.*,
                COUNT(DISTINCT l.id) as lesson_count,
                json_agg(
                    json_build_object(
                        'id', l.id,
                        'title', l.title,
                        'description', l.content,
                        'order_number', l.order_number,
                        'duration_minutes', l.duration_minutes,
                        'video_url', l.video_url,
                        'content', l.content
                    )
                ) as lessons
            FROM modules m
            LEFT JOIN lessons l ON m.id = l.module_id
            LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
            WHERE m.pathway_id = $2
            GROUP BY m.id
            ORDER BY m.order_number
        `;

        const modulesResult = await pool.query(modulesQuery, [req.session.userId || null, pathwayId]);
        pathway.modules = modulesResult.rows;

        // Kullanıcının kayıt durumunu kontrol et
        let userProgress = null;
        if (user) {
            const progressQuery = `
                SELECT 
                    up.*,
                    COUNT(DISTINCT ul.lesson_id) FILTER (WHERE ul.status = 'completed') as completed_lessons,
                    COUNT(DISTINCT l.id) as total_lessons
                FROM user_pathways up
                LEFT JOIN modules m ON m.pathway_id = up.pathway_id
                LEFT JOIN lessons l ON l.module_id = m.id
                LEFT JOIN user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = up.user_id
                WHERE up.user_id = $1 AND up.pathway_id = $2
                GROUP BY up.id
            `;
            
            const progressResult = await pool.query(progressQuery, [user.id, pathwayId]);
            userProgress = progressResult.rows[0] || null;
        }

        res.render('pathway-details', {
            user: user,
            pathway: pathway,
            userProgress: userProgress
        });
    } catch (error) {
        console.error('Pathway detay sayfası hatası:', error);
        res.status(500).render('error', { 
            message: 'Bir hata oluştu',
            user: req.session.userId ? await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]) : null
        });
    }
});

// Pathway'e kayıt olma
app.post('/pathway/:id/enroll', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });
        }

        const pathwayId = parseInt(req.params.id);
        const userId = req.session.userId;

        // Kullanıcının daha önce kayıt olup olmadığını kontrol et
        const checkResult = await pool.query(
            'SELECT * FROM user_pathways WHERE user_id = $1 AND pathway_id = $2',
            [userId, pathwayId]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'Bu eğitim yoluna zaten kayıtlısınız' });
        }

        // İlk modülün ilk dersini bul
        const firstLessonQuery = `
            SELECT l.id, l.title
            FROM modules m
            JOIN lessons l ON m.id = l.module_id
            WHERE m.pathway_id = $1
            ORDER BY m.order_number, l.order_number
            LIMIT 1
        `;
        
        const firstLessonResult = await pool.query(firstLessonQuery, [pathwayId]);
        const firstLesson = firstLessonResult.rows[0];

        if (!firstLesson) {
            return res.status(400).json({ error: 'Bu eğitim yolunda henüz ders bulunmuyor' });
        }

        // Yeni kayıt oluştur
        await pool.query(
            'INSERT INTO user_pathways (user_id, pathway_id, status, start_date) VALUES ($1, $2, $3, NOW())',
            [userId, pathwayId, 'in_progress']
        );

        // İlk dersi başlatılmış olarak işaretle
        await pool.query(
            'INSERT INTO user_lessons (user_id, lesson_id, status, completion_date, last_watched_position) VALUES ($1, $2, $3, NULL, 0)',
            [userId, firstLesson.id, 'in_progress']
        );

        res.json({ 
            success: true, 
            message: 'Eğitim yoluna başarıyla kaydoldunuz',
            redirectUrl: `/lesson/${firstLesson.id}`
        });
    } catch (error) {
        console.error('Pathway kaydı sırasında hata:', error);
        res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
    }
});

// Çıkış yapma route'u
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Oturum kapatma hatası:', err);
            return res.status(500).send('Çıkış yapılırken bir hata oluştu');
        }
        res.redirect('/');
    });
});

// Session kontrolü için test endpoint'i
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            isAuthenticated: true, 
            userId: req.session.userId,
            userEmail: req.session.userEmail 
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = userResult.rows[0];
    res.render('profile', { user });
});

// Profili düzenle (GET)
app.get('/profile/edit', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = userResult.rows[0];
    res.render('profile-edit', { user });
});

// Profili düzenle (POST)
app.post('/profile/edit', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const { full_name, bio, profile_image } = req.body;
    await pool.query(
        'UPDATE users SET full_name = $1, bio = $2, profile_image = $3, updated_at = NOW() WHERE id = $4',
        [full_name, bio, profile_image, req.session.userId]
    );
    res.redirect('/profile?success=1');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sessiz.oyuncu068@gmail.com',
        pass: 'lvvq ozqx zyyw thbn'
    }
});

// E-posta değişim süreci: Eski e-posta adresine kod gönder
app.post('/profile/change-email/start', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapmalısınız.' });
    const { new_email } = req.body;
    if (!new_email) return res.status(400).json({ error: 'Yeni e-posta adresi gerekli.' });

    // Kullanıcının mevcut e-posta adresini al
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    // 6 haneli kod üret
    const oldCode = Math.floor(100000 + Math.random() * 900000).toString();
    const oldCodeSentAt = Date.now();
    req.session.emailChange = {
        step: 'old',
        oldCode,
        oldCodeSentAt,
        newEmail: new_email
    };

    // Kodun süresi 2 dakika
    // E-posta gönderimi
    try {
        await transporter.sendMail({
            from: 'Siber Güvenlik Akademi <sessiz.oyuncu068@gmail.com>',
            to: user.email,
            subject: 'E-posta Değişim Kodu',
            text: `E-posta değişimi için kodunuz: ${oldCode}\nKod 2 dakika geçerlidir.`
        });
    } catch (err) {
        return res.status(500).json({ error: 'Kod gönderilemedi. Lütfen tekrar deneyin.' });
    }

    res.json({ success: true, message: 'Kod eski e-posta adresinize gönderildi.' });
});

// Eski e-posta kodunu doğrula, yeni e-posta adresine kod gönder
app.post('/profile/change-email/verify-old', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapmalısınız.' });
    const { old_email_code } = req.body;
    const emailChange = req.session.emailChange;
    if (!emailChange || emailChange.step !== 'old') {
        return res.status(400).json({ error: 'E-posta değişim süreci başlatılmadı.' });
    }
    // Kod ve süre kontrolü
    if (!old_email_code || old_email_code !== emailChange.oldCode) {
        return res.status(400).json({ error: 'Kod hatalı.' });
    }
    if (Date.now() - emailChange.oldCodeSentAt > 2 * 60 * 1000) {
        return res.status(400).json({ error: 'Kodun süresi doldu. Lütfen tekrar kod isteyin.' });
    }
    // Yeni kod üret ve yeni e-postaya gönder
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newCodeSentAt = Date.now();
    req.session.emailChange = {
        ...emailChange,
        step: 'new',
        newCode,
        newCodeSentAt
    };
    // Kodun süresi 2 dakika
    // E-posta gönderimi
    try {
        await transporter.sendMail({
            from: 'Siber Güvenlik Akademi <sessiz.oyuncu068@gmail.com>',
            to: emailChange.newEmail,
            subject: 'E-posta Değişim Kodu',
            text: `E-posta değişimi için kodunuz: ${newCode}\nKod 2 dakika geçerlidir.`
        });
    } catch (err) {
        return res.status(500).json({ error: 'Kod gönderilemedi. Lütfen tekrar deneyin.' });
    }
    res.json({ success: true, message: 'Kod yeni e-posta adresinize gönderildi.' });
});

// Yeni e-posta kodunu doğrula ve e-posta adresini değiştir
app.post('/profile/change-email/verify-new', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapmalısınız.' });
    const { new_email_code, new_email } = req.body;
    const emailChange = req.session.emailChange;
    if (!emailChange || emailChange.step !== 'new') {
        return res.status(400).json({ error: 'E-posta değişim süreci başlatılmadı.' });
    }
    if (!new_email_code || new_email_code !== emailChange.newCode) {
        return res.status(400).json({ error: 'Kod hatalı.' });
    }
    if (Date.now() - emailChange.newCodeSentAt > 2 * 60 * 1000) {
        return res.status(400).json({ error: 'Kodun süresi doldu. Lütfen tekrar kod isteyin.' });
    }
    // E-posta adresini güncelle
    await pool.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [emailChange.newEmail, req.session.userId]);
    // Session'daki e-posta bilgisini de güncelle
    req.session.userEmail = emailChange.newEmail;
    // Süreci temizle
    delete req.session.emailChange;
    res.json({ success: true, message: 'E-posta adresiniz başarıyla değiştirildi.' });
});

// Ders görüntüleme sayfası
app.get('/lesson/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const lessonId = req.params.id;

        // Ders ve modül bilgilerini al
        const lessonQuery = `
            SELECT 
                l.*,
                m.id as module_id,
                m.title as module_title,
                m.pathway_id,
                COALESCE(ul.status, 'not_started') as status,
                ul.last_watched_position,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', c.id,
                            'content_text', c.content_text,
                            'order_number', c.order_number
                        ) ORDER BY c.order_number
                    )
                    FROM contents c
                    WHERE c.lesson_id = l.id AND c.is_active = true
                ) as contents
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
            WHERE l.id = $2
        `;
        
        const lessonResult = await pool.query(lessonQuery, [req.session.userId, lessonId]);

        if (lessonResult.rows.length === 0) {
            return res.status(404).render('error', { 
                message: 'Ders bulunamadı',
                user: req.session.userId ? await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]) : null
            });
        }

        const lesson = lessonResult.rows[0];

        // Modüldeki tüm dersleri al
        const moduleLessonsQuery = `
            SELECT 
                l.*,
                COALESCE(ul.status, 'not_started') as status,
                ul.last_watched_position
            FROM lessons l
            LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
            WHERE l.module_id = $2
            ORDER BY l.order_number
        `;
        
        const moduleLessonsResult = await pool.query(moduleLessonsQuery, [req.session.userId, lesson.module_id]);
        const moduleLessons = moduleLessonsResult.rows;

        // Önceki ve sonraki dersleri bul
        const currentIndex = moduleLessons.findIndex(l => l.id === parseInt(lessonId));
        const previousLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;

        // Modül ilerleme durumunu hesapla
        const moduleProgressQuery = `
            SELECT 
                COUNT(DISTINCT l.id) as total_lessons,
                COUNT(DISTINCT CASE WHEN ul.status = 'completed' THEN l.id END) as completed_lessons
            FROM lessons l
            LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
            WHERE l.module_id = $2
        `;
        
        const moduleProgressResult = await pool.query(moduleProgressQuery, [req.session.userId, lesson.module_id]);
        const moduleProgress = moduleProgressResult.rows[0];
        const progressPercentage = Math.round((moduleProgress.completed_lessons / moduleProgress.total_lessons) * 100);

        // Kullanıcının bu derse erişim yetkisi var mı kontrol et
        const accessQuery = `
            SELECT 1
            FROM user_pathways up
            WHERE up.user_id = $1 AND up.pathway_id = $2
        `;
        
        const accessResult = await pool.query(accessQuery, [req.session.userId, lesson.pathway_id]);
        
        if (accessResult.rows.length === 0) {
            return res.status(403).render('error', { 
                message: 'Bu derse erişim yetkiniz yok',
                user: req.session.userId ? await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]) : null
            });
        }

        // Dersi başlatılmış olarak işaretle
        if (lesson.status === 'not_started') {
            await pool.query(
                'INSERT INTO user_lessons (user_id, lesson_id, status, last_watched_position) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, lesson_id) DO NOTHING',
                [req.session.userId, lessonId, 'in_progress', 0]
            );
            lesson.status = 'in_progress';
        }

        res.render('lesson', {
            user: await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]),
            lesson: lesson,
            module: {
                id: lesson.module_id,
                title: lesson.module_title,
                lessons: moduleLessons
            },
            moduleProgress: progressPercentage,
            previousLesson: previousLesson,
            nextLesson: nextLesson
        });
    } catch (error) {
        console.error('Ders görüntüleme hatası:', error);
        res.status(500).render('error', { 
            message: 'Bir hata oluştu',
            user: req.session.userId ? await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]).then(result => result.rows[0]) : null
        });
    }
});

// Ders ilerleme durumunu kaydet
app.post('/lesson/:id/progress', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Oturum süresi doldu' });
        }

        const lessonId = req.params.id;
        const { position } = req.body;

        await pool.query(
            'UPDATE user_lessons SET last_watched_position = $1 WHERE user_id = $2 AND lesson_id = $3',
            [position, req.session.userId, lessonId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ders ilerleme kaydetme hatası:', error);
        res.status(500).json({ error: 'İlerleme kaydedilirken bir hata oluştu' });
    }
});

// Dersi tamamla
app.post('/lesson/:id/complete', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Oturum süresi doldu' });
        }

        const lessonId = req.params.id;

        await pool.query(
            'UPDATE user_lessons SET status = $1, completion_date = NOW() WHERE user_id = $2 AND lesson_id = $3',
            ['completed', req.session.userId, lessonId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Ders tamamlama hatası:', error);
        res.status(500).json({ error: 'Ders tamamlanırken bir hata oluştu' });
    }
});

// Modülü tamamla
app.post('/module/:moduleId/complete', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
        }

        // Modülün tüm derslerini tamamlandı olarak işaretle
        const updateQuery = `
            UPDATE user_lessons ul
            SET status = 'completed', completion_date = NOW()
            FROM lessons l
            WHERE l.module_id = $1
            AND ul.lesson_id = l.id
            AND ul.user_id = $2
            AND ul.status != 'completed'
        `;
        await pool.query(updateQuery, [moduleId, userId]);

        // Modülün pathway_id'sini al
        const pathwayQuery = 'SELECT pathway_id FROM modules WHERE id = $1';
        const pathwayResult = await pool.query(pathwayQuery, [moduleId]);
        let redirectUrl = '/dashboard';
        if (pathwayResult.rows.length > 0) {
            const pathwayId = pathwayResult.rows[0].pathway_id;
            redirectUrl = `/pathway/${pathwayId}`;
        }

        res.json({ 
            success: true, 
            redirectUrl: redirectUrl 
        });
    } catch (error) {
        console.error('Modül tamamlama hatası:', error);
        res.status(500).json({ 
            error: 'Modül tamamlanırken bir hata oluştu' 
        });
    }
});

// Admin paneli route'ları
app.get('/admin', async (req, res) => {
    try {
        // Tüm pathway'leri getir
        const pathwaysQuery = `
            SELECT 
                p.*,
                COUNT(DISTINCT m.id) as module_count,
                COUNT(DISTINCT up.user_id) as student_count
            FROM pathways p
            LEFT JOIN modules m ON p.id = m.pathway_id
            LEFT JOIN user_pathways up ON p.id = up.pathway_id
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const pathwaysResult = await pool.query(pathwaysQuery);
        const pathways = pathwaysResult.rows;

        res.render('admin/index', {
            title: 'Admin Paneli',
            pathways: pathways
        });
    } catch (error) {
        console.error('Admin paneli hatası:', error);
        res.status(500).render('error', { message: 'Bir hata oluştu' });
    }
});

// Pathway ekleme sayfası
app.get('/admin/pathway/add', (req, res) => {
    res.render('admin/pathway-add', { title: 'Yeni Pathway Ekle' });
});

// Pathway ekleme işlemi
app.post('/admin/pathway/add', async (req, res) => {
    try {
        const { title, description, image_url, level, duration_weeks } = req.body;
        
        const result = await pool.query(
            'INSERT INTO pathways (title, description, image_url, level, duration_weeks, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *',
            [title, description, image_url, level, duration_weeks]
        );

        res.redirect('/admin');
    } catch (error) {
        console.error('Pathway ekleme hatası:', error);
        res.status(500).render('error', { message: 'Pathway eklenirken bir hata oluştu' });
    }
});

// Modül ekleme sayfasını göster
app.get('/admin/module/add', async (req, res) => {
    try {
        const selectedPathwayId = req.query.pathway_id;
        const pathwayResult = await pool.query('SELECT id, title FROM pathways ORDER BY title ASC');
        const pathways = pathwayResult.rows;
        
        res.render('admin/module-add', { 
            title: 'Yeni Modül Ekle',
            pathways: pathways,
            selectedPathwayId: selectedPathwayId
        });
    } catch (error) {
        console.error('Pathway listesi çekilirken hata:', error);
        res.status(500).render('error', { message: 'Pathway listesi alınırken bir hata oluştu' });
    }
});

// Modül ekleme işlemi
app.post('/admin/module/add', async (req, res) => {
    try {
        const { pathway_id, title, description, order_number, duration_hours } = req.body;
        
        const result = await pool.query(
            'INSERT INTO modules (pathway_id, title, description, order_number, duration_hours, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
            [pathway_id, title, description, order_number, duration_hours]
        );

        res.redirect('/admin/pathway/' + pathway_id);
    } catch (error) {
        console.error('Modül ekleme hatası:', error);
        res.status(500).render('error', { message: 'Modül eklenirken bir hata oluştu' });
    }
});

// Ders ekleme sayfası
app.get('/admin/lesson/add/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleResult = await pool.query('SELECT * FROM modules WHERE id = $1', [moduleId]);
        const module = moduleResult.rows[0];

        res.render('admin/lesson-add', { 
            title: 'Yeni Ders Ekle',
            module: module
        });
    } catch (error) {
        console.error('Ders ekleme sayfası hatası:', error);
        res.status(500).render('error', { message: 'Bir hata oluştu' });
    }
});

// Ders ekleme işlemi
app.post('/admin/lesson/add/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const { title, description, content, duration_minutes, video_url, order_number } = req.body;

        // Önce dersi ekle
        const lessonResult = await pool.query(
            'INSERT INTO lessons (module_id, title, content, duration_minutes, video_url, order_number, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
            [moduleId, title, description, duration_minutes, video_url, order_number]
        );

        const lessonId = lessonResult.rows[0].id;

        // Sonra içeriği ekle
        if (content) {
            await pool.query(
                'INSERT INTO contents (lesson_id, content_text, order_number, is_active, created_at, updated_at) VALUES ($1, $2, 1, true, NOW(), NOW())',
                [lessonId, content]
            );
        }

        res.redirect(`/admin/module/${moduleId}`);
    } catch (error) {
        console.error('Ders ekleme hatası:', error);
        res.status(500).render('error', { message: 'Ders eklenirken bir hata oluştu' });
    }
});

// Pathway detay sayfası (admin)
app.get('/admin/pathway/:id', async (req, res) => {
    try {
        const pathwayId = req.params.id;
        
        // Pathway detaylarını al
        const pathwayQuery = `
            SELECT 
                p.*,
                COUNT(DISTINCT up.user_id) as student_count
            FROM pathways p
            LEFT JOIN user_pathways up ON p.id = up.pathway_id
            WHERE p.id = $1
            GROUP BY p.id
        `;
        
        const pathwayResult = await pool.query(pathwayQuery, [pathwayId]);
        const pathway = pathwayResult.rows[0];

        if (!pathway) {
            return res.status(404).render('error', { message: 'Pathway bulunamadı' });
        }

        // Modülleri al
        const modulesQuery = `
            SELECT 
                m.*,
                COUNT(DISTINCT l.id) as lesson_count,
                json_agg(
                    json_build_object(
                        'id', l.id,
                        'title', l.title,
                        'description', l.content,
                        'order_number', l.order_number,
                        'duration_minutes', l.duration_minutes,
                        'video_url', l.video_url,
                        'content', l.content
                    )
                ) as lessons
            FROM modules m
            LEFT JOIN lessons l ON m.id = l.module_id
            WHERE m.pathway_id = $1
            GROUP BY m.id
            ORDER BY m.order_number
        `;

        const modulesResult = await pool.query(modulesQuery, [pathwayId]);
        const modules = modulesResult.rows.map(module => ({
            ...module,
            lessons: module.lessons[0] ? module.lessons : []
        }));

        res.render('admin/pathway-details', {
            title: pathway.title,
            pathway: pathway,
            modules: modules
        });
    } catch (error) {
        console.error('Pathway detay sayfası hatası:', error);
        res.status(500).render('error', { message: 'Bir hata oluştu' });
    }
});

// Modül detay sayfası (admin)
app.get('/admin/module/:id', async (req, res) => {
    try {
        const moduleId = req.params.id;
        
        // Modül detaylarını al
        const moduleQuery = `
            SELECT 
                m.*,
                p.title as pathway_title,
                p.id as pathway_id
            FROM modules m
            JOIN pathways p ON m.pathway_id = p.id
            WHERE m.id = $1
        `;
        
        const moduleResult = await pool.query(moduleQuery, [moduleId]);
        const module = moduleResult.rows[0];

        // Dersleri al
        const lessonsQuery = `
            SELECT *
            FROM lessons
            WHERE module_id = $1
            ORDER BY order_number
        `;

        const lessonsResult = await pool.query(lessonsQuery, [moduleId]);
        module.lessons = lessonsResult.rows;

        res.render('admin/module-details', {
            title: module.title,
            module: module
        });
    } catch (error) {
        console.error('Modül detay sayfası hatası:', error);
        res.status(500).render('error', { message: 'Bir hata oluştu' });
    }
});

// Ders silme işlemi
app.delete('/admin/lesson/:id/delete', async (req, res) => {
    try {
        const lessonId = req.params.id;
        
        // Önce dersin modülünü bul
        const moduleQuery = 'SELECT module_id FROM lessons WHERE id = $1';
        const moduleResult = await pool.query(moduleQuery, [lessonId]);
        
        if (moduleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ders bulunamadı' });
        }

        const moduleId = moduleResult.rows[0].module_id;

        // Dersi sil
        await pool.query('DELETE FROM lessons WHERE id = $1', [lessonId]);

        res.json({ success: true, redirectUrl: `/admin/module/${moduleId}` });
    } catch (error) {
        console.error('Ders silme hatası:', error);
        res.status(500).json({ error: 'Ders silinirken bir hata oluştu' });
    }
});

// AI Routes
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// Hata sayfası
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        user: req.session.user || null
    });
});

// 404 sayfası
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Sayfa bulunamadı.',
        user: req.session.user || null
    });
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
}); 
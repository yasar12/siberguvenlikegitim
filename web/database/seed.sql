-- Pathways tablosuna gerekli sütunları ekleme
ALTER TABLE pathways ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE pathways ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;
ALTER TABLE pathways ADD COLUMN IF NOT EXISTS instructor VARCHAR(100);
ALTER TABLE pathways ADD COLUMN IF NOT EXISTS price VARCHAR(50);
ALTER TABLE pathways ADD COLUMN IF NOT EXISTS duration_weeks INTEGER NOT NULL DEFAULT 0;

-- Pathways verilerini ekleme
INSERT INTO pathways (title, description, level, duration_weeks, is_active, created_at, updated_at)
VALUES 
('SOC Analisti Kariyer Yolu', 'Saldırı tespit, olay müdahale ve güvenlik operasyonları merkezi (SOC) analistliği için gereken tüm yetenekleri kazanın.', 'beginner', 24, true, NOW(), NOW()),
('Penetrasyon Test Uzmanı Kariyer Yolu', 'Etik hacker ve penetrasyon test uzmanı olma yolunda ihtiyacınız olan tüm teknik becerileri öğrenin.', 'intermediate', 32, true, NOW(), NOW()),
('Adli Bilişim Uzmanı Kariyer Yolu', 'Dijital kanıt analizi, olay yeri inceleme ve adli bilişim araçlarının kullanımını öğrenerek uzman olun.', 'intermediate', 28, true, NOW(), NOW());

-- Modules verilerini ekleme
INSERT INTO modules (pathway_id, title, description, "order", is_active, created_at, updated_at)
VALUES 
-- SOC Analisti modülleri
(1, 'SOC Temelleri', 'Güvenlik operasyon merkezi yapısı ve temel kavramlar', 1, true, NOW(), NOW()),
(1, 'SIEM Sistemleri', 'SIEM araçları ve log analizi', 2, true, NOW(), NOW()),
(1, 'Tehdit Avı', 'Tehdit avı teknikleri ve araçları', 3, true, NOW(), NOW()),
(1, 'Olay Müdahale', 'Güvenlik olaylarına müdahale ve yönetimi', 4, true, NOW(), NOW()),

-- Penetrasyon Test Uzmanı modülleri
(2, 'Sızma Testi Temelleri', 'Metodoloji ve etik hacking temelleri', 1, true, NOW(), NOW()),
(2, 'Web Uygulama Güvenliği', 'Web uygulamalarında güvenlik testleri', 2, true, NOW(), NOW()),
(2, 'Ağ Güvenliği Testleri', 'Ağ sistemlerinde penetrasyon testleri', 3, true, NOW(), NOW()),
(2, 'Mobil Uygulama Testleri', 'Mobil uygulamalarda güvenlik testleri', 4, true, NOW(), NOW()),

-- Adli Bilişim Uzmanı modülleri
(3, 'Adli Bilişim Temelleri', 'Temel kavramlar ve metodoloji', 1, true, NOW(), NOW()),
(3, 'Dijital Delil Analizi', 'Dijital delillerin toplanması ve analizi', 2, true, NOW(), NOW()),
(3, 'Bellek Analizi', 'RAM ve bellek analiz teknikleri', 3, true, NOW(), NOW()),
(3, 'Olay Yeri İnceleme', 'Dijital olay yeri inceleme teknikleri', 4, true, NOW(), NOW());

-- Lessons verilerini ekleme
INSERT INTO lessons (module_id, title, description, "order", is_active, created_at, updated_at)
VALUES 
-- SOC Temelleri dersleri
(1, 'SOC Nedir?', 'SOC yapısı ve çalışma prensipleri', 1, true, NOW(), NOW()),
(1, 'Güvenlik Altyapısı', 'SOC güvenlik altyapı bileşenleri', 2, true, NOW(), NOW()),
(1, 'Vardiya Yönetimi', 'SOC vardiya ve operasyon yönetimi', 3, true, NOW(), NOW()),

-- SIEM Sistemleri dersleri
(2, 'SIEM Kavramları', 'SIEM sistemleri ve kullanım alanları', 1, true, NOW(), NOW()),
(2, 'Log Yönetimi', 'Log toplama ve analiz teknikleri', 2, true, NOW(), NOW()),
(2, 'Alarm Yönetimi', 'Alarm yapılandırma ve yönetimi', 3, true, NOW(), NOW()),

-- Tehdit Avı dersleri
(3, 'Tehdit İstihbaratı', 'Tehdit istihbarat kaynakları ve analizi', 1, true, NOW(), NOW()),
(3, 'IOC Analizi', 'Tehdit göstergelerinin analizi', 2, true, NOW(), NOW()),
(3, 'Proaktif Tehdit Avı', 'Proaktif tehdit tespit teknikleri', 3, true, NOW(), NOW()),

-- Olay Müdahale dersleri
(4, 'Olay Müdahale Planı', 'Olay müdahale planı oluşturma', 1, true, NOW(), NOW()),
(4, 'Olayların Sınıflandırılması', 'Güvenlik olaylarını sınıflandırma', 2, true, NOW(), NOW()),
(4, 'Müdahale Prosedürleri', 'Olay müdahale prosedürleri', 3, true, NOW(), NOW()),

-- Sızma Testi Temelleri dersleri
(5, 'Etik Hacking', 'Etik hacking ve yasal çerçeve', 1, true, NOW(), NOW()),
(5, 'Test Metodolojileri', 'Penetrasyon test metodolojileri', 2, true, NOW(), NOW()),
(5, 'Raporlama', 'Test sonuçlarının raporlanması', 3, true, NOW(), NOW()),

-- Web Uygulama Güvenliği dersleri
(6, 'OWASP Top 10', 'OWASP Top 10 zafiyetleri', 1, true, NOW(), NOW()),
(6, 'API Güvenliği', 'API güvenlik testleri', 2, true, NOW(), NOW()),
(6, 'Web Shell Kullanımı', 'Web shell ve bypass teknikleri', 3, true, NOW(), NOW()),

-- Ağ Güvenliği Testleri dersleri
(7, 'Ağ Haritalama', 'Ağ haritalama ve keşif', 1, true, NOW(), NOW()),
(7, 'Zafiyet Tarama', 'Ağ zafiyet tarama teknikleri', 2, true, NOW(), NOW()),
(7, 'Pivot Teknikleri', 'Ağ içinde pivot teknikleri', 3, true, NOW(), NOW()),

-- Mobil Uygulama Testleri dersleri
(8, 'Android Güvenliği', 'Android uygulama testleri', 1, true, NOW(), NOW()),
(8, 'iOS Güvenliği', 'iOS uygulama testleri', 2, true, NOW(), NOW()),
(8, 'Mobil API Testleri', 'Mobil API güvenlik testleri', 3, true, NOW(), NOW()),

-- Adli Bilişim Temelleri dersleri
(9, 'Adli Bilişim Süreci', 'Adli bilişim süreç yönetimi', 1, true, NOW(), NOW()),
(9, 'Yasal Çerçeve', 'Adli bilişimde yasal konular', 2, true, NOW(), NOW()),
(9, 'Delil Zinciri', 'Delil zinciri yönetimi', 3, true, NOW(), NOW()),

-- Dijital Delil Analizi dersleri
(10, 'Disk İmajlama', 'Disk imajı alma teknikleri', 1, true, NOW(), NOW()),
(10, 'Dosya Analizi', 'Silinmiş dosya kurtarma', 2, true, NOW(), NOW()),
(10, 'Metadata Analizi', 'Metadata analiz teknikleri', 3, true, NOW(), NOW()),

-- Bellek Analizi dersleri
(11, 'RAM Analizi', 'RAM dump analizi', 1, true, NOW(), NOW()),
(11, 'Malware Tespiti', 'Bellekte zararlı yazılım tespiti', 2, true, NOW(), NOW()),
(11, 'Süreç Analizi', 'Bellek süreç analizi', 3, true, NOW(), NOW()),

-- Olay Yeri İnceleme dersleri
(12, 'İnceleme Metodolojisi', 'Dijital olay yeri inceleme', 1, true, NOW(), NOW()),
(12, 'Kanıt Toplama', 'Dijital kanıt toplama teknikleri', 2, true, NOW(), NOW()),
(12, 'Dokümantasyon', 'Olay yeri dokümantasyonu', 3, true, NOW(), NOW()); 
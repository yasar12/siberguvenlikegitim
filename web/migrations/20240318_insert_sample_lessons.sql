-- Önce bir pathway oluştur
INSERT INTO pathways (title, description, level, estimated_duration, image_url, is_active)
VALUES ('SOC Analisti Eğitimi', 'Güvenlik operasyon merkezi analistliği için gerekli temel bilgiler', 'Başlangıç', 120, '/images/soc-analyst.jpg', true)
RETURNING id INTO pathway_id;

-- Modülleri oluştur
INSERT INTO modules (pathway_id, title, description, order_number, is_active)
VALUES 
    (1, 'SOC Temelleri', 'SOC''un temel kavramları ve işleyişi', 1, true),
    (1, 'Güvenlik Altyapısı', 'Temel güvenlik bileşenleri ve mimarisi', 2, true),
    (1, 'Tehdit Analizi', 'Tehdit tespiti ve analiz yöntemleri', 3, true);

-- Dersleri oluştur
INSERT INTO lessons (module_id, title, description, video_url, duration_minutes, order_number, is_active)
VALUES 
    -- SOC Temelleri modülü dersleri
    (1, 'SOC Nedir?', 'Güvenlik Operasyon Merkezi''nin tanımı ve temel görevleri', 'https://example.com/videos/soc-intro.mp4', 30, 1, true),
    
    -- Güvenlik Altyapısı modülü dersleri
    (2, 'Güvenlik Altyapısı', 'Temel güvenlik bileşenleri ve çalışma prensipleri', 'https://example.com/videos/security-infrastructure.mp4', 45, 1, true),
    
    -- Tehdit Analizi modülü dersleri
    (3, 'Veritabanı Güvenliği', 'Veritabanı güvenlik kontrolleri ve best practice''ler', 'https://example.com/videos/database-security.mp4', 35, 1, true);

-- Eklenen kayıtları kontrol et
SELECT m.title as modul_adi, l.title as ders_adi, l.duration_minutes
FROM modules m
JOIN lessons l ON m.id = l.module_id
ORDER BY m.order_number, l.order_number; 
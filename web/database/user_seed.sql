-- Kullanıcılar tablosuna veri ekleme
INSERT INTO users (full_name, email, password_hash, profile_image, bio, is_active, role, created_at, updated_at)
VALUES 
('Ahmet Yılmaz', 'ahmet@example.com', '$2b$10$1234567890123456789012', 'default.jpg', 'SOC Analist adayı, SIEM ve tehdit avı konularında kendimi geliştiriyorum.', true, 'user', NOW(), NOW()),
('Mehmet Demir', 'mehmet@example.com', '$2b$10$1234567890123456789012', 'default.jpg', 'Penetrasyon testi uzmanı olmak istiyorum, etik hacking ile ilgileniyorum.', true, 'user', NOW(), NOW()),
('Ayşe Kaya', 'ayse@example.com', '$2b$10$1234567890123456789012', 'default.jpg', 'Adli bilişim alanında kariyer hedefliyorum, dijital delil analizi konusunda çalışıyorum.', true, 'user', NOW(), NOW());

-- Kullanıcı pathway kayıtları
INSERT INTO user_pathways (user_id, pathway_id, enrollment_date, progress_percentage, last_accessed_at, created_at, updated_at)
VALUES 
(1, 1, NOW(), 30.0, NOW(), NOW(), NOW()), -- Ahmet - SOC Analisti
(2, 2, NOW(), 45.0, NOW(), NOW(), NOW()), -- Mehmet - Penetrasyon Testi
(3, 3, NOW(), 15.0, NOW(), NOW(), NOW()); -- Ayşe - Adli Bilişim

-- Kullanıcı ders ilerleme durumları
INSERT INTO user_lessons (user_id, lesson_id, completion_date, status, last_watched_position, created_at, updated_at)
VALUES 
-- Ahmet'in dersleri (SOC Analisti)
(1, 1, NOW(), 'completed', 100, NOW(), NOW()),    -- SOC Nedir?
(1, 2, NOW(), 'in_progress', 50, NOW(), NOW()),   -- Güvenlik Altyapısı
(1, 3, NULL, 'not_started', 0, NOW(), NOW()),     -- Vardiya Yönetimi

-- Mehmet'in dersleri (Penetrasyon Testi)
(2, 13, NOW(), 'completed', 100, NOW(), NOW()),   -- Etik Hacking
(2, 14, NOW(), 'completed', 100, NOW(), NOW()),   -- Test Metodolojileri
(2, 15, NOW(), 'in_progress', 75, NOW(), NOW()),  -- Raporlama

-- Ayşe'nin dersleri (Adli Bilişim)
(3, 25, NOW(), 'completed', 100, NOW(), NOW()),   -- Adli Bilişim Süreci
(3, 26, NULL, 'not_started', 0, NOW(), NOW()),    -- Yasal Çerçeve
(3, 27, NULL, 'not_started', 0, NOW(), NOW());    -- Delil Zinciri

-- Kullanıcı rozetleri
INSERT INTO badges (name, description, image_url, created_at, updated_at)
VALUES 
('SOC Çaylağı', 'SOC eğitimine başladı', 'soc_beginner.png', NOW(), NOW()),
('Etik Hacker Adayı', 'İlk penetrasyon testini tamamladı', 'ethical_hacker.png', NOW(), NOW()),
('Dijital Dedektif', 'İlk dijital delil analizini tamamladı', 'digital_detective.png', NOW(), NOW());

INSERT INTO user_badges (user_id, badge_id, earned_date, created_at, updated_at)
VALUES 
(1, 1, NOW(), NOW(), NOW()),  -- Ahmet - SOC Çaylağı
(2, 2, NOW(), NOW(), NOW()),  -- Mehmet - Etik Hacker Adayı
(3, 3, NOW(), NOW(), NOW());  -- Ayşe - Dijital Dedektif

-- Kullanıcı değerlendirmeleri
INSERT INTO reviews (user_id, pathway_id, rating, comment, created_at, updated_at)
VALUES 
(1, 1, 5, 'SOC Analisti kariyer yolu çok iyi planlanmış. SIEM sistemleri ve tehdit avı konularında pratik yapma imkanı sunuyor.', NOW(), NOW()),
(2, 2, 4, 'Penetrasyon testi eğitimi gerçek dünya senaryolarıyla çok iyi hazırlanmış. Lab ortamında pratik yapma imkanı süper.', NOW(), NOW()),
(3, 3, 5, 'Adli bilişim eğitimi çok kapsamlı. Özellikle dijital delil toplama ve analiz konularındaki uygulamalı eğitimler çok faydalı.', NOW(), NOW());

-- Sertifikalar
INSERT INTO certificates (user_id, pathway_id, issue_date, certificate_url, created_at, updated_at)
VALUES 
(2, 2, NOW(), 'certificates/ethical-hacker-cert-001.pdf', NOW(), NOW()); 
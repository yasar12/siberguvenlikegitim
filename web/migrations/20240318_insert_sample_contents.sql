-- SOC Nedir? dersi için içerikler
INSERT INTO contents (lesson_id, content_text, order_number) VALUES
(1, '# SOC (Security Operations Center) Nedir?

Güvenlik Operasyon Merkezi (SOC), bir organizasyonun bilgi güvenliği olaylarını 7/24 izleyen, tespit eden, analiz eden ve yanıt veren özel bir birimdir.

## SOC''un Temel Görevleri

1. **Sürekli İzleme**: 
   - Ağ trafiğinin gerçek zamanlı izlenmesi
   - Güvenlik olaylarının tespiti
   - Sistem loglarının analizi

2. **Tehdit Tespiti**:
   - Anormal aktivitelerin belirlenmesi
   - Zararlı yazılım tespiti
   - Sızma girişimlerinin tespit edilmesi

3. **Olay Müdahalesi**:
   - Güvenlik olaylarına hızlı yanıt
   - Tehdit izolasyonu
   - Sistemlerin normale döndürülmesi

## SOC Ekibinin Yapısı

- SOC Yöneticisi
- Güvenlik Analistleri
- Tehdit Avcıları
- Adli Bilişim Uzmanları', 1),

(1, '## SOC''ta Kullanılan Temel Araçlar

1. **SIEM (Security Information and Event Management)**
   - Log toplama ve analizi
   - Olay korelasyonu
   - Raporlama

2. **EDR (Endpoint Detection and Response)**
   - Uç nokta izleme
   - Tehdit tespiti
   - Otomatik yanıt

3. **SOAR (Security Orchestration, Automation and Response)**
   - Olay otomasyonu
   - İş akışı yönetimi
   - Entegrasyon yetenekleri

## SOC Olgunluk Seviyeleri

1. **Seviye 1: Temel SOC**
   - Temel izleme
   - Manuel analiz
   - Sınırlı yanıt

2. **Seviye 2: Gelişmiş SOC**
   - 7/24 izleme
   - Otomatik analiz
   - Proaktif yanıt

3. **Seviye 3: Entegre SOC**
   - Tam otomasyon
   - Yapay zeka desteği
   - Proaktif tehdit avcılığı', 2),

-- Güvenlik Altyapısı dersi için içerikler
(2, '# Güvenlik Altyapısı Bileşenleri

Güvenlik altyapısı, bir organizasyonun bilgi varlıklarını korumak için kullanılan tüm donanım, yazılım ve politikaları kapsar.

## Temel Güvenlik Bileşenleri

1. **Güvenlik Duvarları (Firewall)**
   - Ağ trafiği kontrolü
   - Paket filtreleme
   - Durum takibi
   - Uygulama katmanı filtreleme

2. **IDS/IPS Sistemleri**
   - Saldırı tespiti
   - Anormal davranış analizi
   - Otomatik engelleme
   - Log kayıtları', 1),

(2, '## Güvenlik Altyapısı Katmanları

1. **Fiziksel Güvenlik**
   - Veri merkezi güvenliği
   - Erişim kontrolü
   - Çevresel kontroller

2. **Ağ Güvenliği**
   - Segmentasyon
   - VPN çözümleri
   - NAC sistemleri

3. **Uç Nokta Güvenliği**
   - Antivirüs yazılımları
   - Disk şifreleme
   - DLP çözümleri

4. **Uygulama Güvenliği**
   - WAF sistemleri
   - Kod güvenliği
   - Güvenli geliştirme', 2),

-- Veritabanı Güvenliği dersi için içerikler
(3, '# Veritabanı Güvenliği

Veritabanı güvenliği, kritik verilerin korunması için temel bir gerekliliktir.

## Veritabanı Güvenlik Kontrolleri

1. **Kimlik Doğrulama**
   - Kullanıcı yönetimi
   - Şifre politikaları
   - Çok faktörlü kimlik doğrulama

2. **Yetkilendirme**
   - Rol tabanlı erişim kontrolü
   - En az ayrıcalık prensibi
   - Dinamik veri maskeleme', 1),

(3, '## Veritabanı İzleme ve Denetim

1. **Aktivite İzleme**
   - SQL sorgu logları
   - Kullanıcı aktiviteleri
   - Performans metrikleri

2. **Güvenlik Denetimi**
   - Düzenli güvenlik taramaları
   - Zafiyet değerlendirmesi
   - Uyumluluk kontrolleri

3. **Veri Şifreleme**
   - Durağan veri şifreleme
   - İletim halindeki veri şifreleme
   - Anahtar yönetimi', 2);

-- Yeni eklenen içeriklerin doğruluğunu kontrol et
SELECT l.title as ders_adi, c.order_number as sira, 
       LEFT(c.content_text, 50) as icerik_baslangici
FROM contents c
JOIN lessons l ON c.lesson_id = l.id
ORDER BY l.id, c.order_number; 
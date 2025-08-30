# Multikart Admin Panel

Modern ve kullanıcı dostu e-ticaret yönetim paneli. Angular 18 ile geliştirilmiş, responsive tasarım ve kapsamlı yönetim özellikleri sunar.

## 🚀 Özellikler

### 📊 Dashboard
- Satış istatistikleri ve grafikler
- Günlük, haftalık, aylık raporlar
- Hızlı erişim widget'ları
- Gerçek zamanlı veriler

### 🛍️ Ürün Yönetimi
- Ürün ekleme, düzenleme ve silme
- Kategori yönetimi
- Stok takibi
- Toplu ürün işlemleri
- Ürün görseli yönetimi
- Fiyat ve indirim yönetimi

### 👥 Kullanıcı Yönetimi
- Müşteri listesi ve detayları
- Kullanıcı rolleri ve yetkileri
- Profil yönetimi
- Aktivite takibi

### 📦 Sipariş Yönetimi
- Sipariş listesi ve detayları
- Sipariş durumu güncelleme
- Kargo takibi
- Fatura oluşturma

### 💰 Finansal Yönetim
- Satış raporları
- Gelir-gider takibi
- Ödeme yöntemleri
- Vergi hesaplamaları

### ⚙️ Sistem Ayarları
- Genel ayarlar
- E-posta konfigürasyonu
- Ödeme gateway ayarları
- Tema ve görünüm ayarları

## 🛠️ Teknolojiler

- **Frontend Framework:** Angular 18
- **UI Framework:** Bootstrap 5
- **CSS Preprocessor:** SCSS
- **Icons:** Font Awesome
- **Charts:** Chart.js
- **Build Tool:** Angular CLI
- **Package Manager:** npm

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm (v9 veya üzeri)
- Angular CLI (v18 veya üzeri)

## 🚀 Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/luqequax1a-new/multikart-admin.git
   cd multikart-admin
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   ng serve
   ```

4. **Tarayıcıda açın:**
   ```
   http://localhost:4200
   ```

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   ├── core/               # Temel servisler ve guard'lar
│   ├── shared/             # Paylaşılan modüller ve yardımcılar
│   └── errors/             # Hata sayfaları
├── assets/                 # Statik dosyalar
├── environments/           # Ortam konfigürasyonları
└── styles.scss            # Global stiller
```

### Komutlar

- **Geliştirme sunucusu:** `ng serve`
- **Build (production):** `ng build --configuration production`
- **Test:** `ng test`
- **Linting:** `ng lint`
- **Kod formatı:** `npm run format`

### Kod Standartları

- TypeScript strict mode kullanılır
- ESLint kuralları uygulanır
- Prettier ile kod formatı sağlanır
- Angular style guide takip edilir

## 🌐 Deployment

### Production Build
```bash
npm run build:prod
```

### Docker ile Deploy
```bash
docker build -t multikart-admin .
docker run -p 80:80 multikart-admin
```

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- XSS koruması
- CSRF koruması
- Güvenli API endpoint'leri

## 📱 Responsive Tasarım

- Mobile-first yaklaşım
- Bootstrap grid sistemi
- Tüm cihazlarda uyumlu
- Touch-friendly arayüz

## 🌍 Çoklu Dil Desteği

- Türkçe (varsayılan)
- İngilizce
- Angular i18n kullanılır
- Dinamik dil değiştirme

## 📊 Performans

- Lazy loading modülleri
- OnPush change detection
- Tree shaking optimizasyonu
- Gzip sıkıştırma
- CDN entegrasyonu

## 🧪 Test

- Unit testler: Jasmine + Karma
- E2E testler: Cypress
- Test coverage raporları
- Automated testing pipeline

## 📝 Changelog

### v1.0.0 (2024)
- İlk sürüm yayınlandı
- Temel admin panel özellikleri
- Ürün yönetimi sistemi
- Kullanıcı yönetimi
- Dashboard ve raporlama
- Quick edit özelliği kaldırıldı (güvenlik ve performans)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Geliştirici:** luqequax1a-new
- **GitHub:** [https://github.com/luqequax1a-new](https://github.com/luqequax1a-new)
- **Repository:** [https://github.com/luqequax1a-new/multikart-admin](https://github.com/luqequax1a-new/multikart-admin)

## 🙏 Teşekkürler

- Angular ekibine framework için
- Bootstrap ekibine UI framework için
- Açık kaynak topluluğuna katkıları için

---

**Not:** Bu proje aktif olarak geliştirilmektedir. Önerileriniz ve katkılarınız memnuniyetle karşılanır.

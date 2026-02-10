# Hatırlat (ReminderApp)

Hatırlat, React Native ve Expo ile geliştirilmiş, SQLite tabanlı, tamamen çevrimdışı çalışan modern ve güçlü bir hatırlatıcı uygulamasıdır. Kullanıcı dostu arayüzü, gelişmiş özellikleri ve akıcı animasyonları ile günlük görevlerinizi yönetmenizi kolaylaştırır.

## 🌟 Özellikler

Uygulama, temel bir hatırlatıcı uygulamasının çok ötesine geçen özelliklerle donatılmıştır:

*   **⚡ Akıllı Listeler ve Filtreleme:**
    *   **Tümü:** Tüm aktif görevlerinizi tek bir yerde görün.
    *   **Bugün:** Sadece bugün yapılması gereken veya gecikmiş görevler.
    *   **Yaklaşan:** Yarın ve sonrası için planlanan görevler.
    *   **Önemli:** Yüksek öncelikli olarak işaretlediğiniz görevler.
    *   **Tamamlanan:** Bitirdiğiniz görevlerin arşivi.

*   **✅ Alt Görevler (Subtasks):**
    *   Tek bir hatırlatıcı altına birden fazla kontrol edilebilir alt adım ekleyebilirsiniz.
    *   Örneğin "Market Alışverişi" görevi altında "Süt", "Ekmek", "Yumurta" gibi maddeler oluşturabilirsiniz.

*   **🔄 Gelişmiş Tekrar Mantığı (Recurring Reminders):**
    *   Görevlerinizi Günlük, Haftalık veya Aylık olarak tekrarlayacak şekilde ayarlayabilirsiniz.
    *   Bir tekrarlı görevi tamamladığınızda, uygulama bir sonraki tekrar tarihini otomatik olarak hesaplar ve yeni bir görev oluşturur.

*   **📊 İstatistikler Ekranı:**
    *   Verimliliğinizi takip edin!
    *   Toplam, tamamlanan ve aktif görev sayıları.
    *   Görev tamamlanma oranınız (Progress Bar).
    *   Kategorilere göre görev dağılımı grafikleri.

*   **🎨 Modern Animasyonlar ve UX:**
    *   **Kaydırarak Sil (Swipe to Delete):** Görevleri sola kaydırarak kolayca silebilirsiniz.
    *   **Layout Animations:** Liste elemanları eklenirken veya silinirken akıcı animasyonlar (Reanimated 3).
    *   **Haptics:** İşlemlerde hafif titreşim geri bildirimleri.

*   **🔔 Etkileşimli Bildirimler:**
    *   Bildirim üzerinden uygulamayı açmadan "Tamamla" veya "Ertele" (15 dk) işlemleri yapabilirsiniz.
    *   Özel bildirim sesleri ve öncelik seviyeleri.

*   **📂 Kategori Yönetimi:**
    *   Görevlerinizi renkli kategorilerle (İş, Kişisel, Alışveriş vb.) düzenleyin.

*   **📱 Widget Desteği (Android):**
    *   Ana ekranınızdan yaklaşan görevleri görüntülemek için Widget desteği.

## 🛠️ Teknolojiler

Bu proje aşağıdaki modern teknolojiler kullanılarak geliştirilmiştir:

-   **Framework:** React Native (Expo) - New Architecture Enabled
-   **Dil:** TypeScript
-   **Veritabanı:** Expo SQLite (Async Storage for flags)
-   **Navigasyon:** Expo Router (File-based routing)
-   **Animasyonlar:** React Native Reanimated 3, React Native Gesture Handler
-   **Bildirimler:** Expo Notifications
-   **UI Bileşenleri:** Lucide Icons, Custom Components

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
-   Node.js (LTS sürümü önerilir)
-   npm veya yarn
-   Expo Go uygulaması (Telefonda test etmek için) veya Android Ehulator

### Adımlar

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/mediaconfig55-afk/ReminderApp.git
    cd ReminderApp
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    # veya
    yarn install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npx expo start
    ```

4.  **Test Edin:**
    -   Çıkan QR kodunu telefonunuzdaki **Expo Go** uygulaması ile taratın.
    -   Veya `a` tuşuna basarak Android Emulator'de çalıştırın.

## 📦 Build (APK Oluşturma)

Proje Expo EAS Build sistemine hazırdır. APK oluşturmak için:

1.  **EAS CLI Yükleyin:** `npm install -g eas-cli`
2.  **Giriş Yapın:** `eas login`
3.  **Build Alın:**
    ```bash
    eas build -p android --profile preview
    ```
    *(Not: Cloud build limitleri geçerlidir. Yerel build almak için `npx expo prebuild` ve ardından `cd android && ./gradlew assembleRelease` komutlarını kullanabilirsiniz.)*

## 📁 Proje Yapısı

```
/app                 # Expo Router sayfaları (Ekranlar)
  /(tabs)            # Ana sekme navigasyonu (index.tsx buradadır)
  modal.tsx          # Hatırlatıcı Ekleme/Düzenleme Ekranı
  stats.tsx          # İstatistikler Ekranı
  _layout.tsx        # Kök Layout ve Provider'lar

/src
  /components        # Yeniden kullanılabilir UI bileşenleri
    /reminders       # Hatırlatıcı ile ilgili bileşenler (ReminderItem)
    /ui              # Temel UI (Button, Input, Layout vb.)
  /database          # Veritabanı işlemleri (SQLite)
  /context           # React Context (ThemeContext vb.)
  /hooks             # Custom Hooks (useReminders)
  /utils             # Yardımcı fonksiyonlar (Notifications, Date formatting)

/assets              # Görseller ve Fontlar
```

---
Geliştirici: [Senin Adın/Kullanıcı Adın]
Lisans: MIT

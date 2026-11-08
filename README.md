# TaskFlow – Görev ve Proje Yönetim Sistemi API

Node.js ve Express.js ile geliştirilmiş, bir yazılım ekibindeki görevlerin oluşturulmasını, çalışanlara atanmasını ve takip edilmesini sağlayan REST API.

> Node.js ile Backend Programlama Eğitimi – Bitirme Projesi

## Özellikler

- Görev ekleme, listeleme, detay, güncelleme ve silme (CRUD)
- Kullanıcı ekleme, listeleme, detay, tam/kısmi güncelleme ve silme
- Görev durumu (`pending`, `in-progress`, `completed`) ve öncelik (`low`, `medium`, `high`) yönetimi
- Görevlerin meslek grubu eşleşen çalışanlara atanması (`assigneeId`)
- Kullanıcıların aktif görev sayısı ve listesinin görevlerden hesaplanması
- Durum, öncelik, atanan kişi ve başlık/açıklama metnine göre görev filtreleme
- Her isteği konsola ve `logs/requests.log` dosyasına yazan **Logger middleware**
- Merkezi hata yönetimi ve 404 middleware
- PostgreSQL veritabanında görev ve kullanıcı saklama

## Gereksinimler

- [Node.js](https://nodejs.org/) v18 veya üzeri
- PostgreSQL
- npm (Node.js ile birlikte gelir)
- Test için [Postman](https://www.postman.com/) (isteğe bağlı)

## Kurulum

```bash
# 1. Repoyu klonlayın
git clone https://github.com/Berdowski22/Taskflow-Managment-System.git

# 2. Proje klasörüne girin
cd Taskflow-Managment-System

# 3. Bağımlılıkları yükleyin
npm install

```

Proje kökünde `.env` oluşturun ve `DATABASE_URL` değerini kendi PostgreSQL bağlantı bilgilerinizle güncelleyin. Örnek:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskflow
PORT=3000
```

`taskflow` veritabanı PostgreSQL'de önceden oluşturulmuş ve PostgreSQL çalışıyor olmalıdır. `.env` dosyasını paylaşmayın veya Git'e eklemeyin; parolada URL özel karakterleri varsa yüzde kodlaması kullanın.

Başlangıçta yoksa `users` ve `tasks` tabloları oluşturulur; mevcut `tasks` tablosunda `assignee_id` yoksa eklenir. Var olan sütunun yabancı anahtarı veya silme kuralı otomatik olarak düzeltilmez. Görev ve kullanıcı verileri PostgreSQL'den okunur; eski JSON verileri otomatik aktarılmaz. Önceden mevcut kayıtlar silinmez.

## Çalıştırma

```bash
# Normal mod
npm start

# Geliştirme modu (dosya değiştikçe otomatik yeniden başlar)
npm run dev
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Farklı bir port için `PORT` ortam değişkeni kullanılabilir.

Tarayıcıda `http://localhost:3000` adresine gidildiğinde şu yanıt görülmelidir:

```json
{ "success": true, "message": "TaskFlow API is running" }
```

## Proje Yapısı

```
├── src/
│   ├── controllers/   # İsteği karşılar ve HTTP yanıtlarını yönetir
│   ├── database/      # PostgreSQL bağlantısı ve başlangıç şeması
│   ├── models/        # Görev ve kullanıcı alanları, izinli değerler, doğrulama
│   ├── repositories/  # PostgreSQL görev ve kullanıcı sorguları
│   ├── routes/        # URL → controller eşlemesi
│   ├── middlewares/   # logger, notFound, errorHandler
│   ├── app.js         # Express uygulaması
│   └── server.js      # Sunucuyu başlatır
├── logs/              # requests.log (çalışınca otomatik oluşur)
├── docs/              # API dokümanları ve Postman senaryoları
└── package.json
```

## Endpoint'ler

| Method | Endpoint | Açıklama | Başarılı | Hata |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Sağlık kontrolü | `200` | – |
| `POST` | `/tasks` | Yeni görev ekler | `201` | `400` |
| `GET` | `/tasks` | Görevleri listeler ve filtreler | `200` | `400` |
| `GET` | `/tasks/:id` | Görev detayını getirir | `200` | `404` |
| `PATCH` | `/tasks/:id` | Görevi günceller | `200` | `400`, `404` |
| `DELETE` | `/tasks/:id` | Görevi siler | `200` | `404` |
| `POST` | `/users` | Yeni kullanıcı ekler | `201` | `400`, `409` |
| `GET` | `/users` | Kullanıcıları aktif görev sayısı ve görev listesiyle getirir | `200` | – |
| `GET` | `/users/:id` | Kullanıcı detayını getirir | `200` | `404` |
| `PUT` | `/users/:id` | Kullanıcıyı günceller (tüm alanlar zorunlu) | `200` | `400`, `404`, `409` |
| `PATCH` | `/users/:id` | Kullanıcının alanlarını günceller | `200` | `400`, `404`, `409` |
| `DELETE` | `/users/:id` | Kullanıcıyı siler (görevlerinin `assigneeId` değeri `null` olur) | `200` | `404` |
| `POST` | `/users/:taskId/assign/:userId` | Görevi kullanıcıya atar | `200` | `400`, `404` |

### Veri modeli ve doğrulama

| Alan | Açıklama |
| --- | --- |
| Kullanıcı `fullName`, `email`, `department` | Oluşturma ve PUT için zorunlu; e-posta geçerli ve benzersiz olmalı. |
| Kullanıcı `activeTaskCount`, `activeTasks` | Salt okunur; yalnızca `pending` ve `in-progress` görevlerden hesaplanır. |
| Görev `title` | Zorunlu meslek grubu; görev ayrıntısı `description` alanına yazılır. |
| Görev `description` | Metin; varsayılan `""`. |
| Görev `status`, `priority` | İsteğe bağlı; varsayılanlar sırasıyla `pending` ve `medium`. |
| Görev `assigneeId` | Pozitif kullanıcı ID'si veya `null`; varsayılan `null`. Yanıttaki `assignee` kullanıcının adıdır. |

`PUT /users/:id` üç kullanıcı alanının tamamını, `PATCH /users/:id` ve `PATCH /tasks/:id` ise en az bir geçerli alanı gerektirir. Geçersiz isteklerde `400`, mevcut olmayan kayıt için `404`, tekrar eden e-posta için `409` döner. JSON sözdizimi hatası da `400` döner.

### Kullanıcılar

`POST /users` gövdesi: `{ "fullName": "Ali Veli", "email": "ali@example.com", "department": "Yazılım Mühendisi" }`. E-posta benzersizdir; tekrarında `409 Conflict` döner. Yanıtlarda `activeTaskCount` ve `activeTasks` (durumu `pending` veya `in-progress` olan görevler) `tasks` tablosundan hesaplanır.

Görevin `title` ve kullanıcının `department` alanı şu değerlerden biri olmalıdır: `Yazılım Sorumlusu`, `Yazılım Mühendisi`, `İnsan Kaynakları`. Görevin ayrıntısı `description` alanına yazılır. Atama yalnızca bu iki alan eşleştiğinde yapılır; bu kural `POST /tasks`, `PATCH /tasks/:id` ve `POST /users/:taskId/assign/:userId` için geçerlidir. Departman değiştirildiğinde kullanıcıya atanmış uyumsuz görevlerin ataması kaldırılır.

Önceden oluşturulmuş kayıtlar otomatik olarak değiştirilmez. Eski görev başlıkları ve departmanlar yeni değerlerle güncellenmeli veya kayıtlar yeniden oluşturulmalıdır. Mevcut uyumsuz atamaları kontrol edin; yeni atamalar için eşleşme zorunludur.

### Görevleri Filtreleme

`GET /tasks` isteğinde aşağıdaki query parametreleri birlikte kullanılabilir. Birden fazla filtre gönderildiğinde tüm koşulları sağlayan görevler döner. `keyword`, başlık ve açıklama içinde büyük/küçük harf duyarsız arama yapar; `assignee` eşleşmesi de büyük/küçük harf duyarsızdır.

| Parametre | Açıklama | Örnek |
| --- | --- | --- |
| `status` | Görev durumu: `pending`, `in-progress`, `completed` | `?status=in-progress` |
| `priority` | Öncelik: `low`, `medium`, `high` | `?priority=high` |
| `assigneeId` | Atanan kullanıcının `id` değeri | `?assigneeId=2` |
| `assignee` | Atanan kullanıcının tam adı | `?assignee=Musa Yılmaz` |
| `keyword` | Başlık veya açıklamada aranacak metin | `?keyword=backend` |

Örnek: `GET /tasks?status=pending&priority=high&assigneeId=2`

Filtrelenmiş yanıttaki `count`, eşleşen görev sayısını gösterir. Geçersiz veya bilinmeyen filtreler `400 Bad Request` ve açıklayıcı bir hata listesi döndürür.

### Örnek İstekler

**Görev ekleme** – `POST /tasks`

```json
{
  "title": "Yazılım Mühendisi",
  "description": "Basit kullanıcı girişi",
  "priority": "high",
  "assigneeId": 2
}
```

Yanıt (`201 Created`):

```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Yazılım Mühendisi",
    "description": "Basit kullanıcı girişi",
    "status": "pending",
    "priority": "high",
    "assigneeId": 2,
    "assignee": "Musa Yılmaz",
    "createdAt": "2026-10-19T17:35:31.513Z",
    "updatedAt": "2026-10-19T17:35:31.513Z"
  }
}
```

**Görev güncelleme** – `PATCH /tasks/4` (sadece gönderilen alanlar güncellenir)

```json
{ "status": "completed" }
```

**Hatalı istek** – `title` olmadan `POST /tasks` (`400 Bad Request`):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["title must be one of: Yazılım Sorumlusu, Yazılım Mühendisi, İnsan Kaynakları"]
}
```

## Logger

Her istek şu formatta konsola ve `logs/requests.log` dosyasına yazılır:

```
[2026-10-19T17:35:31.279Z] POST /tasks 201 - 5ms
```

## Dokümantasyon

- [Proje Tanıtım Dokümanı](./docs/proje-tanitim.md)
- [API Tasarım Dokümanı](./docs/api-tasarim.md)
- [Postman senaryoları ve ekran görüntüleri](./docs/screenshots/README.md)

## Test

Postman ile sıralı CRUD, atama, filtre ve doğrulama senaryoları için yukarıdaki rehberi kullanın. Yerel ortamda mevcutsa otomatik testler `node --test tests/assignment.test.js` ile çalıştırılabilir; veritabanı entegrasyon testi `DATABASE_URL` gerektirir ve geçici tablolar kullanır. `tests/` mevcut Git ayarlarında takip edilmez.

## Teknolojiler

- Node.js
- Express.js 5
- PostgreSQL
- Postman (test)

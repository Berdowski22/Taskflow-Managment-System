# TaskFlow – Görev ve Proje Yönetim Sistemi API

Node.js ve Express.js ile geliştirilmiş, bir yazılım ekibindeki görevlerin oluşturulmasını, çalışanlara atanmasını ve takip edilmesini sağlayan REST API.

> Node.js ile Backend Programlama Eğitimi – Bitirme Projesi

## Özellikler

- Görev ekleme, listeleme, detay, güncelleme ve silme (CRUD)
- Görev durumu (`pending`, `in-progress`, `completed`) ve öncelik (`low`, `medium`, `high`) yönetimi
- Görevlerin çalışanlara atanması (`assignee`)
- Durum, öncelik, atanan kişi ve başlık/açıklama metnine göre görev filtreleme
- Her isteği konsola ve `logs/requests.log` dosyasına yazan **Logger middleware**
- Merkezi hata yönetimi ve 404 middleware
- PostgreSQL veritabanında görev saklama

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

# 4. Örnek ortam dosyasını kopyalayın
cp .env.example .env
```

`.env` dosyasındaki `DATABASE_URL` değerini PostgreSQL kullanıcı bilgilerinizle güncelleyin. Örnek:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskflow
PORT=3000
```

Bağlantıdaki `taskflow` veritabanı PostgreSQL'de önceden oluşturulmuş olmalıdır. Sunucu başladığında `tasks` tablosu yoksa otomatik oluşturulur. `src/data/tasks.json` veritabanına aktarılmaz ve uygulama tarafından kullanılmaz; API ilk açılışta boş görev tablosuyla başlar.

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
│   ├── models/        # Görev alanları, izinli değerler, doğrulama
│   ├── repositories/  # PostgreSQL görev sorguları
│   ├── routes/        # URL → controller eşlemesi
│   ├── middlewares/   # logger, notFound, errorHandler
│   ├── app.js         # Express uygulaması
│   └── server.js      # Sunucuyu başlatır
├── logs/              # requests.log (çalışınca otomatik oluşur)
├── .env.example       # PostgreSQL bağlantı ayarı örneği
└── package.json
```

## Endpoint'ler

| Method | Endpoint | Açıklama | Başarılı | Hata |
|---|---|---|---|---|
| `GET` | `/` | Sağlık kontrolü | `200` | – |
| `POST` | `/tasks` | Yeni görev ekler | `201` | `400` |
| `GET` | `/tasks` | Görevleri listeler ve filtreler | `200` | `400` |
| `GET` | `/tasks/:id` | Görev detayını getirir | `200` | `404` |
| `PATCH` | `/tasks/:id` | Görevi günceller | `200` | `400`, `404` |
| `DELETE` | `/tasks/:id` | Görevi siler | `200` | `404` |

### Görevleri Filtreleme

`GET /tasks` isteğinde aşağıdaki query parametreleri birlikte kullanılabilir. Birden fazla filtre gönderildiğinde tüm koşulları sağlayan görevler döner. `keyword`, başlık ve açıklama içinde büyük/küçük harf duyarsız arama yapar; `assignee` eşleşmesi de büyük/küçük harf duyarsızdır.

| Parametre | Açıklama | Örnek |
|---|---|---|
| `status` | Görev durumu: `pending`, `in-progress`, `completed` | `?status=in-progress` |
| `priority` | Öncelik: `low`, `medium`, `high` | `?priority=high` |
| `assignee` | Atanan kişinin adı | `?assignee=musa` |
| `keyword` | Başlık veya açıklamada aranacak metin | `?keyword=backend` |

Örnek: `GET /tasks?status=pending&priority=high&assignee=musa`

Filtrelenmiş yanıttaki `count`, eşleşen görev sayısını gösterir. Geçersiz veya bilinmeyen filtreler `400 Bad Request` ve açıklayıcı bir hata listesi döndürür.

### Örnek İstekler

**Görev ekleme** – `POST /tasks`

```json
{
  "title": "Login endpoint'ini yaz",
  "description": "Basit kullanıcı girişi",
  "priority": "high",
  "assignee": "musa"
}
```

Yanıt (`201 Created`):

```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Login endpoint'ini yaz",
    "description": "Basit kullanıcı girişi",
    "status": "pending",
    "priority": "high",
    "assignee": "musa",
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
  "errors": ["title is required and must be a non-empty string"]
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
- [Postman Test Ekran Görüntüleri](./docs/screenshots/README.md)

## Teknolojiler

- Node.js
- Express.js 5
- PostgreSQL
- Postman (test)

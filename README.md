# TaskFlow – Görev ve Proje Yönetim Sistemi API

Node.js ve Express.js ile geliştirilmiş, bir yazılım ekibindeki görevlerin oluşturulmasını, çalışanlara atanmasını ve takip edilmesini sağlayan REST API.

> Node.js ile Backend Programlama Eğitimi – Bitirme Projesi

## Özellikler

- Görev ekleme, listeleme, detay, güncelleme ve silme (CRUD)
- Görev durumu (`pending`, `in-progress`, `completed`) ve öncelik (`low`, `medium`, `high`) yönetimi
- Görevlerin çalışanlara atanması (`assignee`)
- Her isteği konsola ve `logs/requests.log` dosyasına yazan **Logger middleware**
- Merkezi hata yönetimi ve 404 middleware
- JSON dosyası ile veri saklama (`src/data/tasks.json`)

## Gereksinimler

- [Node.js](https://nodejs.org/) v18 veya üzeri
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
│   ├── controllers/   # İsteği karşılar, CRUD ve JSON işlemlerini yönetir
│   ├── models/        # Görev alanları, izinli değerler, doğrulama
│   ├── routes/        # URL → controller eşlemesi
│   ├── middlewares/   # logger, notFound, errorHandler
│   ├── data/          # tasks.json (veri dosyası)
│   ├── app.js         # Express uygulaması
│   └── server.js      # Sunucuyu başlatır
├── logs/              # requests.log (çalışınca otomatik oluşur)
└── package.json
```

## Endpoint'ler

| Method | Endpoint | Açıklama | Başarılı | Hata |
|---|---|---|---|---|
| `GET` | `/` | Sağlık kontrolü | `200` | – |
| `POST` | `/tasks` | Yeni görev ekler | `201` | `400` |
| `GET` | `/tasks` | Tüm görevleri listeler | `200` | – |
| `GET` | `/tasks/:id` | Görev detayını getirir | `200` | `404` |
| `PATCH` | `/tasks/:id` | Görevi günceller | `200` | `400`, `404` |
| `DELETE` | `/tasks/:id` | Görevi siler | `200` | `404` |

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

## Teknolojiler

- Node.js
- Express.js 5
- Postman (test)

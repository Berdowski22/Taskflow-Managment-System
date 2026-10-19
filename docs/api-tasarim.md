# TaskFlow – API Tasarım Dokümanı

Bu doküman, TaskFlow Görev Yönetim API'sinin veri modelini, endpoint listesini ve mimarisini tanımlar.

## 1. Mimari

Katmanlı yapı kullanılmıştır. Her katmanın tek bir sorumluluğu vardır:

| Katman | Klasör | Sorumluluk |
|---|---|---|
| Routes | `src/routes/` | URL ve HTTP method'larını controller fonksiyonlarına bağlar |
| Controllers | `src/controllers/` | İsteği karşılar, iş mantığını yürütür ve HTTP yanıtı döner |
| Models | `src/models/` | Görev alanları, izinli değerler ve doğrulama |
| Middlewares | `src/middlewares/` | Logger, 404 ve merkezi hata yakalama |
| Data | `src/data/tasks.json` | Görevlerin JSON olarak saklandığı veri dosyası |

**İstek akışı:** `İstemci → logger → routes → controller → tasks.json`

## 2. Veri Modeli – Task

| Alan | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `id` | number | otomatik | artan sayı | Benzersiz görev kimliği |
| `title` | string | **evet** | – | Görev başlığı |
| `description` | string | hayır | `""` | Görev açıklaması |
| `status` | string | hayır | `"pending"` | `pending`, `in-progress`, `completed` |
| `priority` | string | hayır | `"medium"` | `low`, `medium`, `high` |
| `assignee` | string \| null | hayır | `null` | Görevin atandığı çalışan |
| `createdAt` | ISO tarih | otomatik | oluşturma anı | Oluşturulma zamanı |
| `updatedAt` | ISO tarih | otomatik | oluşturma anı | Son güncelleme zamanı |

**Örnek:**

```json
{
  "id": 1,
  "title": "Login endpoint'ini yaz",
  "description": "Basit kullanıcı girişi",
  "status": "in-progress",
  "priority": "high",
  "assignee": "musa",
  "createdAt": "2026-10-16T12:00:00.000Z",
  "updatedAt": "2026-10-16T12:30:00.000Z"
}
```

## 3. Endpoint Listesi

| # | Method | Endpoint | Açıklama | Başarılı | Hata |
|---|---|---|---|---|---|
| 1 | `POST` | `/tasks` | Yeni görev ekler | `201` | `400` |
| 2 | `GET` | `/tasks` | Tüm görevleri listeler | `200` | – |
| 3 | `GET` | `/tasks/:id` | Görev detayını getirir | `200` | `404` |
| 4 | `PATCH` | `/tasks/:id` | Gönderilen alanları günceller | `200` | `400`, `404` |
| 5 | `DELETE` | `/tasks/:id` | Görevi siler | `200` | `404` |
| – | `GET` | `/` | Sağlık kontrolü | `200` | – |

## 4. Yanıt Formatı

```json
// Tekil başarılı yanıt
{ "success": true, "data": { "id": 1, "title": "..." } }

// Listeleme
{ "success": true, "count": 2, "data": [ ... ] }

// Hata
{ "success": false, "message": "Task with id 99 not found" }

// Doğrulama hatası (400)
{ "success": false, "message": "Validation failed", "errors": ["title is required and must be a non-empty string"] }
```

## 5. HTTP Durum Kodları

| Kod | Anlamı | Ne zaman |
|---|---|---|
| `200` | OK | Başarılı okuma, güncelleme, silme |
| `201` | Created | Görev oluşturuldu |
| `400` | Bad Request | `title` eksik veya geçersiz değer |
| `404` | Not Found | Görev ya da route bulunamadı |
| `500` | Internal Server Error | Beklenmeyen sunucu hatası |

## 6. Logger

Her istek konsola ve `logs/requests.log` dosyasına şu formatta yazılır:

```
[2026-10-16T12:00:00.000Z] GET /tasks 200 - 4ms
```

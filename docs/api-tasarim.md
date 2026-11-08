# TaskFlow – API Tasarım Dokümanı

Bu doküman, TaskFlow Görev Yönetim API'sinin veri modelini, endpoint listesini ve mimarisini tanımlar.

## 1. Mimari

Katmanlı yapı kullanılmıştır. Her katmanın tek bir sorumluluğu vardır:

| Katman | Klasör | Sorumluluk |
| --- | --- | --- |
| Routes | `src/routes/` | URL ve HTTP method'larını controller fonksiyonlarına bağlar |
| Controllers | `src/controllers/` | İsteği karşılar, iş mantığını yürütür ve HTTP yanıtı döner |
| Models | `src/models/` | Görev alanları, izinli değerler ve doğrulama |
| Middlewares | `src/middlewares/` | Logger, 404 ve merkezi hata yakalama |
| Repository | `src/repositories/` | Parametreli PostgreSQL sorgularıyla görev verisine erişim |
| Database | `src/database/` | PostgreSQL bağlantısı ve `tasks` tablosunun başlangıç şeması |

**İstek akışı:** `İstemci → logger → routes → controller → repository → PostgreSQL`

## 2. Veri Modeli – Task

| Alan | Tip | Zorunlu | Varsayılan | Açıklama |
| --- | --- | --- | --- | --- |
| `id` | number | otomatik | artan sayı | Benzersiz görev kimliği |
| `title` | string | **evet** | – | Görevi alabilecek meslek grubu |
| `description` | string | hayır | `""` | Görev açıklaması |
| `status` | string | hayır | `"pending"` | `pending`, `in-progress`, `completed` |
| `priority` | string | hayır | `"medium"` | `low`, `medium`, `high` |
| `assigneeId` | number \| null | hayır | `null` | Görevin atandığı kullanıcının `users.id` değeri (veritabanında `assignee_id`) |
| `assignee` | string \| null | salt okunur | – | Atanan kullanıcının tam adı; `users` tablosundan gelir |
| `createdAt` | ISO tarih | otomatik | oluşturma anı | Oluşturulma zamanı |
| `updatedAt` | ISO tarih | otomatik | oluşturma anı | Son güncelleme zamanı |

Veriler PostgreSQL'deki `tasks` tablosunda tutulur. Tablo sunucu başlarken yoksa oluşturulur. Bağlantı `DATABASE_URL` ortam değişkeninden alınır; görevler JSON dosyasından okunmaz veya içe aktarılmaz.

`title` ve kullanıcının `department` alanı `Yazılım Sorumlusu`, `Yazılım Mühendisi`, `İnsan Kaynakları` değerlerinden biridir. Görev açıklaması `description` alanına yazılır. Atamada bu alanların eşleşmesi zorunludur; kullanıcı departmanı değiştiğinde uyumsuz görevler atanmamış duruma gelir. Eski kayıtlar otomatik dönüştürülmez.

### Kullanıcı modeli

`fullName`, `email` ve `department` kullanıcı oluştururken ve `PUT` isteğinde zorunludur. E-posta geçerli ve benzersiz olmalıdır; `PATCH` en az bir alan gerektirir. Yanıttaki `activeTaskCount` ve `activeTasks` sadece `pending` ve `in-progress` görevlerden hesaplanır. Kullanıcı silindiğinde görev atamalarının kaldırılması veritabanındaki `ON DELETE SET NULL` yabancı anahtarına bağlıdır.

**Örnek:**

```json
{
  "id": 1,
  "title": "Yazılım Mühendisi",
  "description": "Basit kullanıcı girişi",
  "status": "in-progress",
  "priority": "high",
  "assigneeId": 2,
  "assignee": "Musa Yılmaz",
  "createdAt": "2026-10-16T12:00:00.000Z",
  "updatedAt": "2026-10-16T12:30:00.000Z"
}
```

## 3. Endpoint Listesi

| # | Method | Endpoint | Açıklama | Başarılı | Hata |
| --- | --- | --- | --- | --- | --- |
| 1 | `POST` | `/tasks` | Yeni görev ekler | `201` | `400` |
| 2 | `GET` | `/tasks` | Tüm görevleri listeler | `200` | – |
| 3 | `GET` | `/tasks/:id` | Görev detayını getirir | `200` | `404` |
| 4 | `PATCH` | `/tasks/:id` | Gönderilen alanları günceller | `200` | `400`, `404` |
| 5 | `DELETE` | `/tasks/:id` | Görevi siler | `200` | `404` |
| 6 | `POST` | `/users/:taskId/assign/:userId` | Görevi uygun meslek grubundaki kullanıcıya atar | `200` | `400`, `404` |
| 7 | `POST` | `/users` | Kullanıcı oluşturur | `201` | `400`, `409` |
| 8 | `GET` | `/users` | Kullanıcıları ve aktif görevlerini listeler | `200` | – |
| 9 | `GET` | `/users/:id` | Kullanıcı detayını getirir | `200` | `404` |
| 10 | `PUT` | `/users/:id` | Kullanıcıyı tüm alanlarıyla günceller | `200` | `400`, `404`, `409` |
| 11 | `PATCH` | `/users/:id` | Kullanıcının gönderilen alanlarını günceller | `200` | `400`, `404`, `409` |
| 12 | `DELETE` | `/users/:id` | Kullanıcıyı siler | `200` | `404` |
| – | `GET` | `/` | Sağlık kontrolü | `200` | – |

### Görev Listeleme Filtreleri

`GET /tasks` endpoint'i aşağıdaki query parametrelerini destekler. Birden fazla parametre birlikte kullanıldığında koşullar AND mantığıyla uygulanır:

| Parametre | Geçerli değer / davranış |
| --- | --- |
| `status` | `pending`, `in-progress` veya `completed` |
| `priority` | `low`, `medium` veya `high` |
| `assigneeId` | Atanan kullanıcının `id` değeri (pozitif tam sayı) |
| `assignee` | Atanan kullanıcının tam adıyla eşleşme (büyük/küçük harf duyarsız) |
| `keyword` | Başlık veya açıklama içinde kısmi arama (büyük/küçük harf duyarsız) |

Örnek: `GET /tasks?status=in-progress&priority=high&keyword=backend`

Filtre uygulanmadığında tüm görevler listelenir. Yanıttaki `count`, filtrelerden sonra kalan görev sayısıdır. Bilinmeyen filtreler, boş değerler veya geçersiz `status`/`priority` değerleri `400 Bad Request` ile reddedilir.

## 4. Yanıt Formatı

```json
// Tekil başarılı yanıt
{ "success": true, "data": { "id": 1, "title": "..." } }

// Listeleme
{ "success": true, "count": 2, "data": [ ... ] }

// Hata
{ "success": false, "message": "Task with id 99 not found" }

// Doğrulama hatası (400)
{ "success": false, "message": "Validation failed", "errors": ["title must be one of: Yazılım Sorumlusu, Yazılım Mühendisi, İnsan Kaynakları"] }
```

## 5. HTTP Durum Kodları

| Kod | Anlamı | Ne zaman |
| --- | --- | --- |
| `200` | OK | Başarılı okuma, güncelleme, silme |
| `201` | Created | Görev oluşturuldu |
| `400` | Bad Request | `title` eksik veya geçersiz değer |
| `400` | Bad Request | Listeleme filtresi geçersiz |
| `404` | Not Found | Görev ya da route bulunamadı |
| `409` | Conflict | E-posta zaten kullanılıyor |
| `500` | Internal Server Error | Beklenmeyen sunucu hatası |

## 6. Logger

Her istek konsola ve `logs/requests.log` dosyasına şu formatta yazılır:

```
[2026-10-16T12:00:00.000Z] GET /tasks 200 - 4ms
```

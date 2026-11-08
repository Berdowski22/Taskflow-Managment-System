# TaskFlow – Proje Tanıtım Dokümanı

## Amaç

TaskFlow, bir yazılım ekibindeki görevlerin oluşturulmasını, çalışanlara atanmasını ve takip edilmesini sağlayan bir **REST API**'dir. Proje, Node.js ile Backend Programlama eğitiminin bitirme projesi olarak geliştirilmiştir.

## Senaryo

Bir yazılım şirketi; ekip içindeki görevleri, projeleri ve çalışanların sorumluluklarını tek bir sistem üzerinden takip etmek istemektedir. TaskFlow bu ihtiyaca yönelik olarak:

- Görev oluşturmayı,
- Çalışan oluşturmayı, listelemeyi ve bilgilerini güncellemeyi,
- Görevleri çalışanlara atamayı,
- Meslek grubu eşleşmeyen atamaları engellemeyi,
- Görev durumlarını (`pending`, `in-progress`, `completed`) takip etmeyi,
- Görevlere öncelik (`low`, `medium`, `high`) vermeyi

destekler.

## Sistem Özeti

| Başlık | Açıklama |
|---|---|
| Teknolojiler | Node.js, Express.js, PostgreSQL |
| Mimari | Katmanlı yapı: routes → controllers → repositories → PostgreSQL |
| Veri saklama | PostgreSQL (`tasks` ve `users` tabloları) |
| Temel işlevler | Görev ve kullanıcı CRUD, atama ve görev filtreleme |
| Middleware | İstekleri konsola ve dosyaya kaydeden Logger |
| Test | Postman |

PostgreSQL bağlantısı `DATABASE_URL` ortam değişkeniyle yapılandırılır. Uygulama başlangıcında `tasks` ve `users` tabloları yoksa oluşturulur; eski JSON verileri otomatik aktarılmaz. Çalışanın aktif görev sayısı ve listesi `pending` ve `in-progress` görevlerden hesaplanır.

## Endpoint Özeti

| Method | Endpoint | İşlev |
|---|---|---|
| `POST` | `/tasks` | Görev ekleme |
| `GET` | `/tasks` | Görev listeleme |
| `GET` | `/tasks/:id` | Görev detayı |
| `PATCH` | `/tasks/:id` | Görev güncelleme |
| `DELETE` | `/tasks/:id` | Görev silme |
| `POST` | `/users` | Çalışan ekleme |
| `GET` | `/users` | Çalışanları ve aktif görevlerini listeleme |
| `GET` | `/users/:id` | Çalışan detayı |
| `PUT`, `PATCH` | `/users/:id` | Çalışan güncelleme |
| `DELETE` | `/users/:id` | Çalışan silme |
| `POST` | `/users/:taskId/assign/:userId` | Görevi uygun çalışanla eşleştirme |

Detaylı veri modeli ve endpoint açıklamaları için bkz. [api-tasarim.md](./api-tasarim.md).

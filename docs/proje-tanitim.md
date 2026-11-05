# TaskFlow – Proje Tanıtım Dokümanı

## Amaç

TaskFlow, bir yazılım ekibindeki görevlerin oluşturulmasını, çalışanlara atanmasını ve takip edilmesini sağlayan bir **REST API**'dir. Proje, Node.js ile Backend Programlama eğitiminin bitirme projesi olarak geliştirilmiştir.

## Senaryo

Bir yazılım şirketi; ekip içindeki görevleri, projeleri ve çalışanların sorumluluklarını tek bir sistem üzerinden takip etmek istemektedir. TaskFlow bu ihtiyaca yönelik olarak:

- Görev oluşturmayı,
- Görevleri çalışanlara atamayı,
- Görev durumlarını (`pending`, `in-progress`, `completed`) takip etmeyi,
- Görevlere öncelik (`low`, `medium`, `high`) vermeyi

destekler.

## Sistem Özeti

| Başlık | Açıklama |
|---|---|
| Teknolojiler | Node.js, Express.js, PostgreSQL |
| Mimari | Katmanlı yapı: routes → controllers → repositories → PostgreSQL |
| Veri saklama | PostgreSQL (`tasks` tablosu) |
| Temel işlevler | Görev ekleme, listeleme, detay, güncelleme, silme (CRUD) |
| Middleware | İstekleri konsola ve dosyaya kaydeden Logger |
| Test | Postman |

PostgreSQL bağlantısı `DATABASE_URL` ortam değişkeniyle yapılandırılır. Uygulama başlangıcında `tasks` tablosu yoksa oluşturulur; eski `src/data/tasks.json` verileri otomatik aktarılmaz.

## Endpoint Özeti

| Method | Endpoint | İşlev |
|---|---|---|
| `POST` | `/tasks` | Görev ekleme |
| `GET` | `/tasks` | Görev listeleme |
| `GET` | `/tasks/:id` | Görev detayı |
| `PATCH` | `/tasks/:id` | Görev güncelleme |
| `DELETE` | `/tasks/:id` | Görev silme |

Detaylı veri modeli ve endpoint açıklamaları için bkz. [api-tasarim.md](./api-tasarim.md).

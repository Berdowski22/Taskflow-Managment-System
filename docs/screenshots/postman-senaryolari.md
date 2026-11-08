# TaskFlow – Postman senaryoları

Bu rehber PostgreSQL, kullanıcılar, görevler, filtreler ve meslek grubu kontrolünü yeniden test etmek için örnek istekleri içerir. Alınan görüntüler ve açıklamaları [ekran görüntüsü galerisinde](./README.md) yer alır. Görüntülerdeki ID'ler, adlar, departmanlar ve veri durumu buradaki örneklerden farklı olabilir; bazı görüntüler önceden mevcut kayıtlarla alınmıştır.

## Hazırlık

1. PostgreSQL'i ve projeyi ana [kurulum rehberine](../../README.md) göre başlatın. JSON içeren isteklerde Postman'de **Body → raw → JSON** seçin; böylece `Content-Type: application/json` gönderilir. `GET`, `DELETE` ve atama `POST` isteği için body gerekmez.
2. Tercihen ayrı bir **test veritabanı** kullanın: aşağıdaki adımlar veri oluşturur, değiştirir ve siler. Hiçbir tabloda toplu silme yapmayın. Örnek e-postalar daha önce kullanıldıysa benzersiz başka e-postalar seçin ve sonraki isteklerde aynı değerleri kullanın.
3. Postman collection/environment değişkeni olarak `baseUrl` = `http://localhost:3000` ekleyin. Port farklıysa değiştirin. Yeni kullanıcılardan ve görevlerden dönen `data.id` değerlerini aşağıdaki adlarla kaydedin. Postman'de değişkenleri collection **Variables** veya aktif environment üzerinden elle tanımlayabilirsiniz.
4. `{{absentId}}` için veritabanında bulunmadığını `GET /tasks/{{absentId}}` ve `GET /users/{{absentId}}` ile doğruladığınız pozitif bir ID seçin. ID'ler otomatik artar; `1` olduklarını varsaymayın.
5. Görüntüde HTTP metodu, URL, varsa body veya Params, yanıt durumu ve ilgili yanıt gövdesi görünsün. Veritabanı parolası veya başka gizli bilgileri görüntüye almayın.

**İzinli meslek grupları:** `Yazılım Sorumlusu`, `Yazılım Mühendisi`, `İnsan Kaynakları`. `title` ve `department` tam olarak aynı grupta olmalı. Durumlar `pending`, `in-progress`, `completed`; öncelikler `low`, `medium`, `high`.

## 1. Başlangıç ve kullanıcı oluşturma

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 01 | `GET {{baseUrl}}/` | `200`, servis mesajı | `01-health.png` |
| 02 | `GET {{baseUrl}}/users` | `200`, `success`, `count`, `data` | `02-list-users.png` |
| 03 | `POST {{baseUrl}}/users` → `{"fullName":"Ayşe Demir","email":"ayse.test@example.com","department":"Yazılım Mühendisi"}` | `201`; `data.id` → `engineerId`. Yeni kullanıcının aktif görev sayısı `0`, listesi `[]`. Görüntüde farklı bir meslek grubu kullanılmıştır. | `03-create-user.png` |
| 05 | `GET {{baseUrl}}/users/{{engineerId}}` | `200`, oluşturulan çalışan | `06-get-user.png` |
| 06 | `GET {{baseUrl}}/users/{{absentId}}` | `404`, kullanıcı bulunamadı | `07-user-not-found.png` |

## 2. Kullanıcı doğrulama ve güncelleme

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 07 | `POST /users` → `{}` | `400`, zorunlu alan hataları | `08-user-required.png` |
| 08 | `POST /users` → `{"fullName":" ","email":"yanlis","department":"IT"}` | `400`, ad, e-posta ve departman hataları | `09-user-invalid-fields.png` |
| 09 | `POST /users` → 03'teki body ile aynı e-posta | `409`, e-posta kullanılıyor | `10-user-duplicate-email.png` |

## 3. Kullanıcı güncelleme ve görev oluşturma

Aşağıda yolların başına `{{baseUrl}}` ekleyin. Tablo numaraları önceki rehberden korunmuştur; dosya adlarındaki numaralarla her zaman aynı değildir.

**Devam etmeden önce:** `GET /users` ile mevcut kayıtlarınız arasından `department` değeri `Yazılım Mühendisi` olan bir test kullanıcısı seçip ID'sini `engineerId` olarak kaydedin. `PUT` isteğinde **o kullanıcıya ait mevcut ad ve e-postayı** kullanın; örnekleri kendi kayıtlarınızla değiştirin. Farklı departmandan bir test kullanıcısı seçip ID'sini `otherUserId` olarak kaydedin. Böyle bir kullanıcı yoksa yeni kullanıcı oluşturun. Böylece önceki adımlarda farklı ad veya departman kullanmış olsanız bile devam edebilirsiniz.

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 10 | `PUT /users/{{engineerId}}` → `{"fullName":"Ayşe Demir","email":"ayse.test@example.com","department":"Yazılım Mühendisi"}` | `200`, tüm kullanıcı alanları güncellenir; örnek ad ve e-postayı seçtiğiniz kullanıcıya göre değiştirin | `11-update-user-put.png` |
| 11 | `PATCH /users/{{engineerId}}` → `{"fullName":"Ayşe Yılmaz"}` | `200`, yalnızca ad güncellenir | `12-update-user-patch.png` |
| 12 | `GET /tasks` | `200`, görevler listelenir | `13-list-tasks.png` |
| 13 | `POST /tasks` → `{"title":"Yazılım Mühendisi","description":"Backend giriş endpointi","priority":"high"}` | `201`, `pending`, `assigneeId: null`; `data.id` → `taskId` | `14-create-task.png` |
| 14 | `POST /tasks` → `{"title":"Backend geliştir","status":"done","priority":"urgent"}` | `400`, geçersiz meslek grubu, durum ve öncelik | `15-task-invalid-fields.png` |
| 15 | `GET /tasks/{{taskId}}` | `200`, oluşturulan görev detayları | `16-get-task.png` |

Postman değişkenleri JSON body içinde tırnaksız kullanılır: `{{engineerId}}` sayısal bir ID değerine dönüşmelidir.

## 4. Atama, aktif görev ve güncelleme

Atama endpoint'inde **önce görev ID'si, sonra kullanıcı ID'si** gelir. `otherUserId` için departmanı `Yazılım Mühendisi` olmayan bir kullanıcı seçtiğinizden emin olun.

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 16 | `POST /users/{{taskId}}/assign/{{otherUserId}}` | `400`, meslek grupları uyuşmadığı için atama reddedilir | `17-assign-group-mismatch.png` |
| 17 | `POST /users/{{taskId}}/assign/{{engineerId}}` | `200`, görev uygun kullanıcıya atanır | `18-assign-task.png` |
| 18 | `GET /users/{{engineerId}}` | `200`, `activeTasks` içinde `taskId` ve güncel aktif görev sayısı | `19-user-active-tasks.png` |
| 19 | `PATCH /tasks/{{taskId}}` → `{"status":"in-progress","priority":"high"}` | `200`, görev güncellenir; atama korunur | `20-update-task.png` |
| 20 | `PATCH /tasks/{{taskId}}` → `{"status":"completed"}` | `200`, görev tamamlanır | `21-complete-task.png` |
| 21 | `GET /users/{{engineerId}}` | `200`, tamamlanan `taskId` artık `activeTasks` içinde değildir | `22-completed-task-not-active.png` |

## 5. Filtreleme ve silme

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 22 | `GET /tasks?status=completed&priority=high&assigneeId={{engineerId}}` | `200`, 20. adımda tamamlanan `taskId` eşleşir | `23-filter-tasks.png` |
| 23 | `GET /tasks?status=done` | `400`, geçersiz durum filtresi | `24-invalid-status-filter.png` |
| 24 | `DELETE /tasks/{{taskId}}` | `200`, oluşturduğunuz test görevi silinir | `25-delete-task.png` |
| 25 | `GET /tasks/{{taskId}}` | `404`, silinen görev bulunamaz | `26-deleted-task-not-found.png` |
| 26 | `POST /users` → `{"fullName":"Test Kullanıcısı","email":"silinecek.test@example.com","department":"İnsan Kaynakları"}` | `201`; `data.id` → `deleteUserId`. E-posta kullanımdaysa benzersiz bir değer seçin | `27-create-user-for-deletion.png` |
| 27 | `DELETE /users/{{deleteUserId}}` | `200`, yalnızca 26. adımda oluşturduğunuz test kullanıcısı silinir | `28-delete-user.png` |

Kullanıcı silme senaryosunda mevcut gerçek çalışanları silmeyin. Görevlerin atamasının kullanıcı silindiğinde kaldırılması veritabanındaki `ON DELETE SET NULL` kuralına bağlıdır; bu test kullanıcısına görev atanmadığı için 27. adım bu kuralı test etmez.

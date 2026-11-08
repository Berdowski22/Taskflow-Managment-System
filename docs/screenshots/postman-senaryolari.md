# TaskFlow – Postman senaryoları

Bu rehber PostgreSQL, kullanıcılar, görevler, filtreler ve meslek grubu kontrolünü kapsar. İstekleri sırayla gönderin; her satır bir testtir. Görüntüleri alıp bu klasöre satırdaki önerilen dosya adıyla kaydedebilirsiniz. Dosyalar henüz oluşturulmadığı için bu rehberde kırık görsel bağlantıları yoktur. Eski görüntüler [README'de](./README.md) korunur.

## Hazırlık

1. PostgreSQL'i ve projeyi ana [kurulum rehberine](../../README.md) göre başlatın. JSON içeren isteklerde Postman'de **Body → raw → JSON** seçin; böylece `Content-Type: application/json` gönderilir. `GET`, `DELETE` ve atama `POST` isteği için body gerekmez.
2. Tercihen ayrı bir **test veritabanı** kullanın: aşağıdaki adımlar veri oluşturur, değiştirir ve siler. Hiçbir tabloda toplu silme yapmayın. Örnek e-postalar daha önce kullanıldıysa benzersiz başka e-postalar seçin ve sonraki isteklerde aynı değerleri kullanın.
3. Postman collection/environment değişkeni olarak `baseUrl` = `http://localhost:3000` ekleyin. Port farklıysa değiştirin. Yeni kullanıcılardan ve görevlerden dönen `data.id` değerlerini aşağıdaki adlarla kaydedin. Postman'de değişkenleri collection **Variables** veya aktif environment üzerinden elle tanımlayabilirsiniz.
4. `{{absentId}}` için veritabanında bulunmadığını `GET /tasks/{{absentId}}` ve `GET /users/{{absentId}}` ile doğruladığınız pozitif bir ID seçin. ID'ler otomatik artar; `1` olduklarını varsaymayın.
5. Görüntüde HTTP metodu, URL, varsa body veya Params, yanıt durumu ve ilgili yanıt gövdesi görünsün. Veritabanı parolası veya başka gizli bilgileri görüntüye almayın.

Bir görüntüyü örneğin `19-create-task.png` adıyla bu klasöre kaydettikten sonra, göstermek istediğiniz dokümana şu satırı ekleyebilirsiniz: `![Görev oluşturma](./19-create-task.png)`. Diğer görüntüler için açıklama ve dosya adını değiştirin.

**İzinli meslek grupları:** `Yazılım Sorumlusu`, `Yazılım Mühendisi`, `İnsan Kaynakları`. `title` ve `department` tam olarak aynı grupta olmalı. Durumlar `pending`, `in-progress`, `completed`; öncelikler `low`, `medium`, `high`.

## 1. Başlangıç ve kullanıcı oluşturma

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 01 | `GET {{baseUrl}}/` | `200`, servis mesajı | `01-health.png` |
| 02 | `GET {{baseUrl}}/users` | `200`, `success`, `count`, `data` | `02-list-users.png` |
| 03 | `POST {{baseUrl}}/users` → `{"fullName":"Ayşe Demir","email":"ayse.test@example.com","department":"Yazılım Mühendisi"}` | `201`; `data.id` → `engineerId`. Yeni kullanıcının aktif görev sayısı `0`, listesi `[]`. | `03-create-engineer.png` |
| 04 | `POST {{baseUrl}}/users` → `{"fullName":"Mehmet Kaya","email":"mehmet.test@example.com","department":"İnsan Kaynakları"}` | `201`; `data.id` → `hrId` | `04-create-hr.png` |
| 05 | `POST {{baseUrl}}/users` → `{"fullName":"Selin Yıldız","email":"selin.test@example.com","department":"Yazılım Sorumlusu"}` | `201`; `data.id` → `managerId` | `05-create-manager.png` |
| 06 | `GET {{baseUrl}}/users/{{engineerId}}` | `200`, oluşturulan çalışan | `06-get-user.png` |
| 07 | `GET {{baseUrl}}/users/{{absentId}}` | `404`, kullanıcı bulunamadı | `07-user-not-found.png` |

## 2. Kullanıcı doğrulama ve güncelleme

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 08 | `POST /users` → `{}` | `400`, zorunlu alan hataları | `08-user-required.png` |
| 09 | `POST /users` → `{"fullName":" ","email":"yanlis","department":"IT"}` | `400`, ad, e-posta ve departman hataları | `09-user-invalid-fields.png` |
| 10 | `POST /users` → 03'teki body ile aynı e-posta | `409`, e-posta kullanılıyor | `10-user-duplicate-email.png` |
| 11 | `PUT /users/{{engineerId}}` → `{"fullName":"Ayşe Demir","email":"ayse.test@example.com","department":"Yazılım Mühendisi"}` | `200`, tüm alanlarla güncelleme | `11-user-put.png` |
| 12 | `PUT /users/{{engineerId}}` → `{"fullName":"Ayşe"}` | `400`, eksik `email` ve `department` | `12-user-put-missing-fields.png` |
| 13 | `PATCH /users/{{engineerId}}` → `{"fullName":"Ayşe Yılmaz"}` | `200`, yalnızca ad değişir | `13-user-patch.png` |
| 14 | `PATCH /users/{{engineerId}}` → `{}` | `400`, en az bir alan gerekir | `14-user-empty-patch.png` |
| 15 | `PATCH /users/{{engineerId}}` → `{"email":"mehmet.test@example.com"}` | `409`, 04'teki e-posta kullanılıyor | `15-user-patch-duplicate.png` |
| 16 | `PATCH /users/{{engineerId}}` → `{"department":"Satış"}` | `400`, geçersiz meslek grubu | `16-user-invalid-department.png` |
| 17 | `GET /users/abc` | `404`, geçersiz ID bulunamadı olarak değerlendirilir | `17-user-invalid-id.png` |

Buradan itibaren kısaltılmış yollara `{{baseUrl}}` ekleyin. 10 ve 15'te e-postaları hazırlık sırasında değiştirdiyseniz eşdeğerini kullanın.

## 3. Görev oluşturma ve doğrulama

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 18 | `GET /tasks` | `200`, görev listesi | `18-list-tasks.png` |
| 19 | `POST /tasks` → `{"title":"Yazılım Mühendisi","description":"Backend giriş endpointi","priority":"high"}` | `201`, `pending`, `assigneeId: null`; `data.id` → `taskId` | `19-create-task.png` |
| 20 | `POST /tasks` → `{"title":"İnsan Kaynakları","description":"İşe alım görüşmesi","status":"in-progress","priority":"low"}` | `201`; `data.id` → `hrTaskId` | `20-create-hr-task.png` |
| 21 | `POST /tasks` → `{"title":"Yazılım Sorumlusu","description":"Ekip planlaması"}` | `201`; `data.id` → `managerTaskId`; varsayılan `pending`, `medium` | `21-create-manager-task.png` |
| 22 | `POST /tasks` → `{}` | `400`, `title` zorunlu | `22-task-missing-title.png` |
| 23 | `POST /tasks` → `{"title":"Backend geliştir"}` | `400`, title izinli gruplardan değil | `23-task-invalid-title.png` |
| 24 | `POST /tasks` → `{"title":"Yazılım Mühendisi","status":"done","priority":"urgent"}` | `400`, durum ve öncelik hataları | `24-task-invalid-status-priority.png` |
| 25 | `POST /tasks` → `{"title":"Yazılım Mühendisi","description":123,"assigneeId":-1}` | `400`, açıklama tipi ve ID hataları | `25-task-invalid-types.png` |
| 26 | `POST /tasks` → `{"title":"Yazılım Mühendisi","assigneeId":{{absentId}}}` | `400`, kullanıcı yok | `26-task-assignee-not-found.png` |
| 27 | `POST /tasks` → `{"title":"İnsan Kaynakları","assigneeId":{{engineerId}}}` | `400`, meslek grubu uyuşmuyor | `27-task-create-mismatch.png` |
| 28 | `GET /tasks/{{taskId}}` | `200`, 19'daki görev | `28-get-task.png` |
| 29 | `GET /tasks/{{absentId}}` | `404`, görev yok | `29-task-not-found.png` |
| 30 | `GET /tasks/abc` | `404`, geçersiz ID bulunamadı olarak değerlendirilir | `30-task-invalid-id.png` |

Postman değişkenleri JSON body içinde tırnaksız kullanılır: `{{engineerId}}` gibi bir sayı değerine dönüşmelidir.

## 4. Atama, aktif görevler ve güncelleme

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 31 | `POST /users/{{taskId}}/assign/{{hrId}}` | `400`, görev ve çalışan grubu farklı | `31-assign-mismatch.png` |
| 32 | `POST /users/{{taskId}}/assign/{{engineerId}}` | `200`, yanıtta `taskId` ve `userId` | `32-assign-success.png` |
| 33 | `GET /tasks/{{taskId}}` | `200`, `assigneeId` mühendisin ID'si, `assignee` adı | `33-assigned-task.png` |
| 34 | `GET /users/{{engineerId}}` | `200`, `activeTasks` içinde `taskId`; aktif sayı görev eklenmeden önceye göre artmış | `34-user-active-tasks.png` |
| 35 | `POST /users/{{absentId}}/assign/{{engineerId}}` | `404`, görev yok | `35-assign-task-not-found.png` |
| 36 | `POST /users/{{taskId}}/assign/{{absentId}}` | `400`, kullanıcı yok | `36-assign-user-not-found.png` |
| 37 | `POST /users/abc/assign/{{engineerId}}` | `400`, geçersiz ID | `37-assign-invalid-id.png` |
| 38 | `PATCH /tasks/{{taskId}}` → `{"assigneeId":{{hrId}}}` | `400`, meslek grubu uyuşmuyor | `38-patch-assign-mismatch.png` |
| 39 | `PATCH /tasks/{{taskId}}` → `{"title":"İnsan Kaynakları"}` | `400`, mevcut atananla uyuşmuyor | `39-patch-title-mismatch.png` |
| 40 | `PATCH /tasks/{{taskId}}` → `{"status":"in-progress","priority":"high"}` | `200`, diğer alanlar korunur | `40-patch-task.png` |
| 41 | `PATCH /tasks/{{taskId}}` → `{}` | `400`, en az bir alan gerekli | `41-task-empty-patch.png` |
| 42 | `PATCH /tasks/{{taskId}}` → `{"status":"completed"}` | `200`, görev tamamlanır | `42-complete-task.png` |
| 43 | `GET /users/{{engineerId}}` | `200`, tamamlanan `taskId` artık `activeTasks` içinde değildir | `43-completed-not-active.png` |
| 44 | `PATCH /tasks/{{taskId}}` → `{"status":"pending"}` | `200`, sonraki testler için görev tekrar aktif | `44-reopen-task.png` |
| 45 | `PATCH /users/{{engineerId}}` → `{"department":"İnsan Kaynakları"}` | `200`, uyumsuz görevin ataması kaldırılır | `45-change-department.png` |
| 46 | `GET /tasks/{{taskId}}` | `200`, `assigneeId: null` ve `assignee: null` | `46-unassigned-on-department-change.png` |
| 47 | `PATCH /users/{{engineerId}}` → `{"department":"Yazılım Mühendisi"}` | `200`, eski atama otomatik geri gelmez | `47-restore-department.png` |
| 48 | `PATCH /tasks/{{taskId}}` → `{"assigneeId":{{engineerId}}}` | `200`, görev tekrar atanır | `48-patch-assignment.png` |
| 49 | `POST /tasks` → `{"title":"İnsan Kaynakları","assigneeId":{{hrId}}}` | `201`, oluştururken uyumlu atama; `data.id` → `assignedTaskId` | `49-create-with-assignment.png` |

`POST /users/:taskId/assign/:userId` yolunda **önce görev ID'si**, sonra kullanıcı ID'si gelir. 45. adım `pending`, `in-progress` ve `completed` dahil uyumsuz atanmış görevleri etkiler; bu nedenle test verisi kullanın.

## 5. Filtreleme

Filtreler Postman **Params** sekmesinden de girilebilir. Birden fazla filtre AND ile birleştirilir. Başka kayıtlar da varsa listelerde başka eşleşmeler bulunabilir.

| # | İstek | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 50 | `GET /tasks?status=pending&priority=high` | `200`; 19'daki `taskId` eşleşir | `50-filter-status-priority.png` |
| 51 | `GET /tasks?status=in-progress&priority=low` | `200`; `hrTaskId` eşleşir | `51-filter-in-progress.png` |
| 52 | `GET /tasks?assigneeId={{engineerId}}` | `200`; `taskId` eşleşir | `52-filter-assignee-id.png` |
| 53 | `GET /tasks?assignee=Ayşe%20Yılmaz` | `200`; 13'teki tam adla atanmış görevler, `taskId` dahil | `53-filter-assignee-name.png` |
| 54 | `GET /tasks?keyword=backend` | `200`; açıklamasında backend geçen `taskId` dahil | `54-filter-keyword.png` |
| 55 | `GET /tasks?keyword=eslesmeyen-benzersiz-test-metni` | `200`, boş `data` ve `count: 0` | `55-filter-no-results.png` |
| 56 | `GET /tasks?status=done` | `400`, geçersiz durum | `56-filter-invalid-status.png` |
| 57 | `GET /tasks?priority=urgent` | `400`, geçersiz öncelik | `57-filter-invalid-priority.png` |
| 58 | `GET /tasks?assigneeId=0` | `400`, pozitif ID gerekli | `58-filter-invalid-assignee.png` |
| 59 | `GET /tasks?keyword=` | `400`, boş filtre | `59-filter-empty.png` |
| 60 | `GET /tasks?unknown=x` | `400`, desteklenmeyen filtre | `60-filter-unknown.png` |
| 61 | `GET /tasks?status=pending&status=completed` | `400`, tekrarlı parametre metin olarak kabul edilmez | `61-filter-duplicate.png` |

## 6. Hatalı JSON ve silme

Bu adımlar test kayıtlarını değiştirir ve siler; sırayı izleyin.

| # | İstek ve body | Beklenti | Önerilen görüntü |
| --- | --- | --- | --- |
| 62 | `POST /tasks` → raw JSON olarak `{"title":` | `400`, `Invalid JSON body` | `62-invalid-json.png` |
| 63 | `DELETE /users/{{hrId}}` | `200`, test kullanıcısı silinir | `63-delete-user.png` |
| 64 | `GET /tasks/{{assignedTaskId}}` | `200`, `assigneeId: null`; mevcut veritabanındaki yabancı anahtarda `ON DELETE SET NULL` bulunmalıdır | `64-user-delete-unassigns-task.png` |
| 65 | `DELETE /users/{{hrId}}` | `404`, ikinci silme | `65-delete-user-again.png` |
| 66 | `DELETE /tasks/{{taskId}}` | `200`, görev silinir | `66-delete-task.png` |
| 67 | `GET /tasks/{{taskId}}` | `404`, silinen görev bulunamaz | `67-deleted-task-not-found.png` |
| 68 | `DELETE /tasks/{{taskId}}` | `404`, ikinci silme | `68-delete-task-again.png` |
| 69 | `GET /olmayan-yol` | `404`, route bulunamadı | `69-route-not-found.png` |

İsterseniz oluşturduğunuz diğer test görevlerini ve kullanıcılarını da kendi ID'leriyle silin. `ON DELETE SET NULL` beklenildiği gibi çalışmıyorsa mevcut `tasks.assignee_id` yabancı anahtarının kuralını kontrol edin; başlangıç kodu önceden var olan bir sütunun kısıtını değiştirmez.

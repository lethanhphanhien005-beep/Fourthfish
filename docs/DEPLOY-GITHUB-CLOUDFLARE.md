# Fourthfish: GitHub → Cloudflare chính thức; ZIP cũ để test local

Ngày chuẩn bị: 07/11/2026.

## 1. Hai bản độc lập

| Nội dung | Bản local cũ | Bản Cloudflare mới |
|---|---|---|
| Mã nguồn | ZIP `Fourthfish-Buoc-4.zip` đã tải | Thư mục/gói `Fourthfish-Cloudflare` |
| Mục đích | Test trên máy của bạn | Website công khai |
| Backend | Node.js / Express | Cloudflare Worker |
| Database | SQLite trên máy | D1 trên tài khoản Cloudflare của bạn |
| Cập nhật | Bạn sửa và chạy local | Commit vào main → Cloudflare build/deploy |
| API key | File `.env` trên máy | Worker Secrets trên Cloudflare |
| Tác động qua lại | Sửa local không tự sửa website | Deploy không ghi vào SQLite local |

ZIP cũ được giữ nguyên. SHA-256: `388b9ae917a241353b0a2f1ab1a99fb8d5b508c9870e0ea5c1e1f4ade64acb1b`.

GitHub plugin trong ChatGPT giúp hỗ trợ làm việc với repository. Kết nối GitHub bên trong Cloudflare là kết nối riêng để tự động triển khai. Chỉ kết nối plugin ChatGPT chưa làm website xuất hiện trên Internet.

## 2. Tạo nơi lưu code trên GitHub

Cách thao tác thuận tiện trên Mac là GitHub Desktop: https://desktop.github.com/download/ .

1. Đăng nhập tài khoản GitHub trong GitHub Desktop.
2. Chọn File → New Repository, đặt tên `fourthfish`, chọn vị trí trên máy và tạo repository.
3. Mở thư mục repository bằng Show in Finder. Sao chép **nội dung bên trong** thư mục `Fourthfish-Cloudflare` vào repository. Ở cấp gốc phải có `package.json`, `wrangler.jsonc`, `src/`, `cloudflare/`.
4. Trong Finder dùng Command + Shift + dấu chấm để thấy file bắt đầu bằng dấu chấm; nhớ sao chép `.gitignore`.
5. Kiểm tra Changes: không có `.env`, `.dev.vars`, database, `node_modules`, `.wrangler` hoặc secret thật.
6. Commit với nội dung `Prepare Fourthfish for Cloudflare`.
7. Publish repository, giữ tùy chọn private nếu bạn muốn mã nguồn riêng tư. Website vẫn có thể công khai dù repo private.

Bạn có thể chọn repository có sẵn thay vì tạo mới. Cần xác định chính xác repo đích trước khi đẩy code từ ChatGPT.

## 3. Tạo D1 production trước khi deploy

1. Vào https://dash.cloudflare.com và đăng nhập.
2. Tìm D1 trong mục lưu trữ/cơ sở dữ liệu; tạo database `fourthfish-production`.
3. Mở database vừa tạo, sao chép Database ID.
4. Mở `wrangler.jsonc` trong repository. Thay `REPLACE_WITH_YOUR_PRODUCTION_D1_ID` bằng Database ID thực tế.
5. Trong D1 Console, mở nội dung file `cloudflare/migrations/0001_orders.sql`, dán và chạy để tạo bảng. Đây là database production mới dành riêng website.
6. Commit và push thay đổi Database ID lên GitHub. ID database là cấu hình, không phải API secret.

Cách CLI thay thế, chỉ chạy trong thư mục bản Cloudflare:

```bash
npm ci
npx wrangler login
npx wrangler d1 create fourthfish-production
# Điền ID trả về vào wrangler.jsonc trước bước tiếp.
npm run cf:migrate:production
```

Không dùng lệnh `--remote` để test dữ liệu cá nhân. Nó thao tác lên database thật của website. Bản local cũ tiếp tục dùng SQLite riêng.

## 4. Nối GitHub vào Cloudflare Workers Builds

1. Vào Workers & Pages → tạo ứng dụng/Worker mới → chọn kết nối GitHub/import repository.
2. Khi Cloudflare yêu cầu GitHub access, chọn đúng repository `fourthfish` cần deploy.
3. Chọn repository đó và nhánh production là `main`.
4. Tên Worker phải là **`fourthfish-production`**, giống `name` trong `wrangler.jsonc`.
5. Nhập các cấu hình:

| Mục | Giá trị |
|---|---|
| Root directory | `/` (repo chứa trực tiếp package.json) |
| Production branch | `main` |
| Build command | `npm run test:backend && npm run test:cloudflare && npm run build` |
| Deploy command | `npm run cf:deploy` |
| Node build version | `24` |
| Non-production branch builds | Tắt trong giai đoạn chỉ test local |

Cloudflare cài dependencies từ package-lock. Nếu cần khai báo Node, thêm build variable `NODE_VERSION=24` tại Settings → Builds → Build variables.

6. Chọn deploy và chờ log thành công. Worker sẽ cung cấp URL HTTPS dạng `https://fourthfish-production.<subdomain-cua-ban>.workers.dev`.
7. Mở URL trên cửa sổ ẩn danh để kiểm tra người khác truy cập được. Không bật Cloudflare Access yêu cầu đăng nhập cho website công khai.

Lần deploy đầu chưa mở bán: `STORE_ENABLED=false` cho phép xem trang nhưng dừng tạo đơn bằng thông báo chuẩn bị mở bán. Chỉ bật khi nhập catalogue thật và hoàn tất cấu hình thanh toán/vận chuyển cần thiết.

Kết nối Workers Builds tự tạo hoặc cho chọn token triển khai. Với deploy code thông thường dùng token do Cloudflare cung cấp. Nếu chọn tùy chọn nâng cao `cf:release` có chạy D1 migrations, token còn cần quyền D1 Edit trong đúng tài khoản. Hướng dẫn cơ bản ở đây dùng `cf:deploy`, schema đã tạo ở bước 3.

## 5. Điền URL chính thức và Secrets

Sau khi biết URL website, sửa `wrangler.jsonc`:

```json
"vars": {
  "APP_ORIGIN": "https://fourthfish-production.SUBDOMAIN-CUA-BAN.workers.dev",
  "STORE_ENABLED": "false",
  "NOTIFICATIONS_ENABLED": "false",
  "EMAIL_FROM": "Fourthfish <orders@domain-cua-ban.vn>"
}
```

Dùng URL thực tế, không thêm dấu `/` cuối. Commit/push sẽ triển khai lại. Các biến thường ở `vars` được quản lý bằng file này; cập nhật trong Git để lần deploy sau giữ đúng giá trị.

Trong Worker → Settings → Variables and Secrets, thêm dưới dạng **Secret**:

- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `RESEND_API_KEY` (khi dùng email)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (khi dùng SMS)

Đây là runtime secrets của Worker. Không đưa các khóa PayOS/email/SMS vào phần build variable hay biến `VITE_*`.

Dùng một kênh PayOS **Fourthfish Production** riêng cho website. Webhook của kênh production:

```
https://URL-CHINH-THUC-CUA-BAN/api/webhooks/payos
```

Bản local nếu cần thử PayOS dùng kênh/khóa riêng; không đổi webhook kênh production về local. PayOS không có sandbox riêng, nên thử chuyển khoản vẫn là giao dịch thật.

Backend tự đọc Secrets và QR trả về từ PayOS. `APP_ORIGIN` phải khớp domain người dùng truy cập. Nếu thêm domain riêng, cập nhật APP_ORIGIN và webhook theo domain chính mới.

Đổi `STORE_ENABLED=true` khi sẵn sàng nhận đơn thật; đổi `NOTIFICATIONS_ENABLED=true` khi đã cấu hình và muốn gửi email/SMS thật. Thông báo chờ trong 20 giờ gần nhất cũng có thể được gửi khi bật cờ này. Cron xử lý tối đa 10 tác vụ mỗi 5 phút trong bản khởi đầu; cần điều chỉnh theo lượng đơn.

## 6. Quy trình cập nhật về sau

1. Thử thay đổi trong môi trường local.
2. Đưa thay đổi đã chọn vào một nhánh như `dev` của repo Cloudflare.
3. Kiểm tra trước khi merge vào `main`.
4. Merge/push lên `main` → Workers Builds kiểm tra → build React → deploy Worker và assets.
5. Nếu kiểm tra/build lỗi, bản production trước tiếp tục phục vụ; xem log để sửa rồi push lại.

ZIP local là một bản chụp mã nguồn. Sửa nó không tự đồng bộ lên repo; muốn đưa tính năng mới vào website cần chuyển các thay đổi phù hợp sang repo Cloudflare. Frontend có thể chia sẻ thay đổi, backend SQLite và D1 cần giữ adapter riêng.

Chỉ deploy chính thức từ `main`. Tắt non-production branch builds giúp tránh dùng nhầm database và Secrets production cho bản thử trên nhánh khác. Nếu sau này cần staging online, tạo Worker + D1 + kênh PayOS riêng.

## 7. Thay đổi database về sau

Migration đầu đã có `IF NOT EXISTS`. Khi thay đổi schema, thêm file migration mới theo thứ tự, chạy theo cơ chế Wrangler và theo dõi d1_migrations. Sau khi đã khởi tạo lần đầu bằng D1 Console, chạy `npm run cf:migrate:production` trước khi áp dụng migration tiếp theo; migration 0001 sẽ chạy lại an toàn rồi được ghi nhận.

Nếu tự động cả migrations mỗi lần deploy, đổi Deploy command thành `npm run cf:release`, dùng token đủ quyền D1 Edit và chỉ đưa migration tương thích ngược vào main. Rollback Worker không tự rollback database; không dùng DROP/reset bảng production để thử.

## 8. Chạy thử bản Cloudflare trên máy (tùy chọn)

Đây là cách kiểm tra cùng runtime trước deploy, bổ sung cho ZIP local cũ:

```bash
npm ci
npm run build
cp .dev.vars.example .dev.vars
npm run cf:migrate:local
npm run cf:dev
```

Mở `http://localhost:8787`. Nếu muốn tạo đơn COD giả trong emulator, đặt `STORE_ENABLED=true` trong `.dev.vars`. D1 local nằm trong `.wrangler/state`, không phải D1 production. Các lệnh này không tự deploy.

## 9. Kiểm tra và giới hạn thực tế

Đã đạt: test tính giá và validate; test Worker API với adapter SQLite giả lập D1 (COD, idempotency, quyền tra cứu, payload thay đổi, store khóa, thiếu cấu hình VietQR); kiểm chữ ký webhook PayOS; Vite build; Wrangler dry-run đóng gói Worker và bindings.

Chưa kiểm tra trên tài khoản Cloudflare thật: D1/network/runtime Workers, domain, PayOS thật, Resend/Twilio thật. Cần cấu hình tài khoản và test trước khi mở bán. Gói này vẫn có catalogue/ảnh mẫu, chưa có admin/tồn kho, chưa kết nối hãng giao hàng. Giữ `STORE_ENABLED=false` trong lúc hoàn thiện dữ liệu thật.

## Tài liệu chính thức

- Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- Cấu hình build/deploy: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Nhánh production/preview: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- SPA: https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
- D1: https://developers.cloudflare.com/d1/get-started/
- Migrations: https://developers.cloudflare.com/d1/reference/migrations/

# Fourthfish — Cloudflare Production

Bản chuẩn bị triển khai công khai qua GitHub → Cloudflare Workers Builds. Backend Workers + D1, frontend React/Vite. ZIP `Fourthfish-Buoc-4.zip` cũ được giữ nguyên để chạy Node/SQLite local.

Hướng dẫn: [docs/DEPLOY-GITHUB-CLOUDFLARE.md](docs/DEPLOY-GITHUB-CLOUDFLARE.md).

Trước deploy: tạo D1, thay Database ID trong `wrangler.jsonc`, tạo bảng từ migration 0001, push lên repo, kết nối Workers Builds. Sau deploy: cập nhật APP_ORIGIN theo URL thật và thêm runtime Secrets.

```bash
npm ci
npm run test:backend
npm run test:cloudflare
npm run build
npm run cf:check
```

Build command trên Cloudflare:

```bash
npm run test:backend && npm run test:cloudflare && npm run build
```

Deploy command:

```bash
npm run cf:deploy
```

STORE_ENABLED và NOTIFICATIONS_ENABLED mặc định false. Cấu hình tài khoản/dữ liệu thật trước khi bật. Chưa có URL công khai cho đến khi triển khai trong tài khoản của bạn.

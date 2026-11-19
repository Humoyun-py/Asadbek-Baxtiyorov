# Asadbek Baxtiyorov — Portfolio (sayt + Django backend + admin panel)

```
.
├── src/ …            ommaviy sayt (React + Vite + Tailwind v4)
├── backend/          Django 5 + DRF + PostgreSQL (REST API, JWT, Django Admin)
├── admin-panel/      React + TS admin dashboard  →  /admin
├── docker-compose.yml  lokal PostgreSQL
└── netlify.toml      sayt + admin ni bitta Netlify saytida joylaydi
```

Sayt API ishlamasa yoki `VITE_API_URL` bo'sh bo'lsa `src/data/` dagi statik ma'lumotga qaytadi (sayt hech qachon buzilmaydi).

## 1. Tezkor ishga tushirish (lokal)

```bash
# 1) PostgreSQL (alohida konteyner, port 55433)
docker compose up -d db

# 2) Backend
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # SECRET_KEY ni almashtiring
python manage.py migrate
python manage.py createsuperuser   # birinchi SUPERADMIN (ommaviy ro'yxatdan o'tish yo'q)
python manage.py seed_portfolio    # taqdimotdagi boshlang'ich ma'lumotlar (qayta ishlatsa ham xavfsiz)
python manage.py runserver         # http://localhost:8000

# 3) Admin panel (yangi terminal)
cd admin-panel && cp .env.example .env && npm install && npm run dev   # http://localhost:5174/admin/

# 4) Ommaviy sayt (yangi terminal, loyiha ildizida)
cp .env.example .env.local && npm install && npm run dev
```

- Swagger: <http://localhost:8000/api/docs/> · ReDoc: `/api/redoc/` · schema: `/api/schema/`
- Django Admin (mustaqil ishlaydi): <http://localhost:8000/django-admin/>
- Testlar: `cd backend && python manage.py test` (PostgreSQL kerak; `DATABASE_URL=sqlite:///db.sqlite3` bilan ham ishlaydi)

## 2. Backend

Ilovalar (`backend/apps/`): `accounts` (user, JWT, activity log), `portfolio` (profil), `projects`, `services`, `statistics`, `campaigns`, `contacts`, `testimonials`, `website_settings`, `analytics`, `common` (ruxsatlar, validatorlar, mixin'lar).

**Rollar**

| Rol | Imkoniyat |
|---|---|
| SUPERADMIN | hammasi: foydalanuvchilar, sayt sozlamalari, o'chirish |
| ADMIN | kontent (loyiha, xizmat, kampaniya, statistika, profil, xabarlar), analitika, activity log, o'chirish |
| EDITOR | loyihalarni yaratish/tahrirlash, rasm yuklash. O'chira olmaydi, foydalanuvchilarni boshqara olmaydi |

**Asosiy endpointlar** (`/api/v1/`): `auth/login|refresh|logout|profile|change-password|password-reset`, `portfolio/`, `portfolio/profile/`, `projects/`, `project-categories/`, `services/`, `statistics/`, `campaigns/`, `campaign-statistics/`, `contacts/`, `settings/`, `testimonials/`, `analytics/track/`, `admin/analytics/{overview,visits,projects,contacts}/`, `admin/activity-logs/`, `admin/users/`.
Ommaviy GET faqat nashr etilgan/faol kontentni qaytaradi. Har bir ro'yxatli resursda `POST …/reorder/ {"ids":[…]}` bor.

**Xavfsizlik**: JWT (access 30 daq, refresh 7 kun, aylantiriladi va blacklist qilinadi), login/kontakt/track uchun throttle, kontakt formada honeypot + spam evristikasi, rasmlar kengaytma + haqiqiy tarkib (Pillow) + hajm bo'yicha tekshiriladi, parollar Django hasher + validatorlari, `DEBUG=False` da HTTPS/HSTS/secure cookie, sirlar faqat `.env`da.
Analitika IP/UA saqlamaydi: faqat har kuni almashadigan sho'rlangan hash.

**Muhim:** universitet kampaniyalarining umumiy byudjeti (`$29 049`) va umumiy reklama byudjeti (`$180 000+`) alohida saqlanadi (`Statistic.category`: `UNIVERSITY` / `GENERAL`). Alohida kampaniyalar uchun uydirma raqam kiritilmagan, bo'sh maydonlar `null`.

## 3. Admin panel

`/admin` — login, parolni tiklash, Dashboard (haqiqiy API ma'lumotlari + grafiklar), Loyihalar (qidiruv, filtr, galereya, cover, drag-and-drop tartib), Kategoriyalar, Xizmatlar, Kampaniyalar (+ kampaniya statistikasi va skrinshotlar), Statistika, Xabarlar (yangi xabarlar soni sidebarda), Testimonials, Portfolio profil, Sayt sozlamalari, Admin foydalanuvchilar, Activity log. Sidebar foydalanuvchi roliga qarab ko'rinadi.

Tokenlar `localStorage`da saqlanadi; XSS xavfini kamaytirish uchun admin panelga uchinchi tomon skriptlarini qo'shmang.

## 4. Production

**Backend (Docker/Render/Railway/VPS)**
```bash
cd backend
docker build -t portfolio-api .
docker run -p 8000:8000 --env-file .env portfolio-api   # migrate + gunicorn
```
`.env` (production): `DEBUG=False`, uzun tasodifiy `SECRET_KEY`, `ALLOWED_HOSTS=api.example.com`, `DATABASE_URL=postgresql://user:pass@host:5432/db`, `CORS_ALLOWED_ORIGINS=https://example.com`, `CSRF_TRUSTED_ORIGINS=https://api.example.com`, `ADMIN_PANEL_URL=https://example.com/admin`, haqiqiy SMTP (`EMAIL_*`).
Birinchi marta: `python manage.py createsuperuser && python manage.py seed_portfolio`.
Statik fayllar WhiteNoise orqali beriladi. **Media** (yuklangan rasmlar) uchun doimiy disk yoki Cloudinary kerak: `pip install django-cloudinary-storage` va `CLOUDINARY_URL` ni o'rnating (sozlama tayyor).

**Frontend (Netlify)**: Netlify muhitida `VITE_API_URL=https://api.example.com/api/v1` ni belgilang. `netlify.toml` saytni ham, admin panelni ham (`/admin`) bitta deployda quradi.

## 5. Tekshirish

```bash
cd backend && python manage.py test          # 61 ta avtomatik test
cd admin-panel && npm run build              # tsc + vite
npm run build                                # ommaviy sayt
```

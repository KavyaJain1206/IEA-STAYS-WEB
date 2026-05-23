# IEA Stays Backend

FastAPI backend for the decoupled React frontend. It is intentionally simple for a single VPS deployment: FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, JWT auth, and bcrypt password hashing.

## Frontend Analysis

The existing React frontend has three data-entry flows:

- Visit request: `name`, `phone`, `email`, `home`, `date`, `time`, `message`
- Resident signup: personal details, KYC identifiers, address, work details, emergency contact, food preference, and password
- Resident login: `email`, `password`

Inferred entities:

- `visit_requests`: public lead/booking requests managed by admins.
- `residents`: resident application plus resident account. Passwords are hashed. Aadhaar/PAN are stored for verification but masked in API responses.
- `admin_users`: staff/admin accounts for dashboard operations.

No relationship table is needed yet because the frontend does not assign residents to properties or visits. When property inventory becomes real, add `properties` and optional `resident_property_assignments`.

## API Summary

Base path: `/api/v1`

Public:

- `POST /visits`
- `POST /residents/signup`
- `POST /residents/login`
- `GET /residents/me` with resident JWT

Admin:

- `POST /admin/login`
- `GET /admin/me`
- `GET /admin/visits?status=&search=&limit=&offset=`
- `GET /admin/visits/{visit_id}`
- `PATCH /admin/visits/{visit_id}/status`
- `GET /admin/residents?status=&search=&limit=&offset=`
- `GET /admin/residents/{resident_id}`
- `PATCH /admin/residents/{resident_id}/status`

## Validation Notes

Required fields match the React forms. Optional fields accept `null` or empty values converted by the frontend service.

Visit:

- Required: name, phone, email, home, preferred_time
- Optional: preferred_date, message
- `home`: `Studio`, `Nest`, `BNB`
- `preferred_time`: `Morning`, `Afternoon`, `Evening`

Resident:

- Required: full_name, mobile, email, password, Aadhaar, PAN, permanent address, residence address, occupation, next of kin, relationship, kin mobile, food preference
- Optional: alternate mobile, firm name, firm address, kin alternate mobile, food delivery provider
- Aadhaar must be 12 digits
- PAN is normalized to uppercase alphanumeric
- Password minimum is 8 characters

## Local Development

From `backend/`:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env`, then run migrations:

```powershell
alembic upgrade head
python -m app.utils.create_admin
uvicorn app.main:app --reload
```

API will run at:

```text
http://127.0.0.1:8000
```

Health check:

```text
GET /health
```

## PostgreSQL Setup On VPS

Install PostgreSQL and keep it private on localhost only.

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib python3-venv nginx
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE DATABASE iea_stays;
CREATE USER iea_stays WITH PASSWORD 'replace_with_strong_password';
GRANT ALL PRIVILEGES ON DATABASE iea_stays TO iea_stays;
\q
```

Confirm PostgreSQL listens locally in `/etc/postgresql/*/main/postgresql.conf`:

```text
listen_addresses = 'localhost'
```

Do not open port `5432` publicly in the firewall.

## Production Environment

Create `/var/www/iea-stays/backend/.env`:

```env
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=postgresql+psycopg://iea_stays:replace_with_strong_password@127.0.0.1:5432/iea_stays
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["https://ieastays.com","https://www.ieastays.com"]
```

Generate a strong JWT secret:

```bash
openssl rand -hex 32
```

Run migrations:

```bash
cd /var/www/iea-stays/backend
source .venv/bin/activate
alembic upgrade head
python -m app.utils.create_admin
```

## Gunicorn Command

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 127.0.0.1:8000 \
  --workers 2 \
  --timeout 60
```

For a small VPS, start with 2 workers. Increase only if CPU/RAM allow.

## systemd Service

Create `/etc/systemd/system/iea-stays-api.service`:

```ini
[Unit]
Description=IEA Stays FastAPI backend
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/iea-stays/backend
EnvironmentFile=/var/www/iea-stays/backend/.env
ExecStart=/var/www/iea-stays/backend/.venv/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000 --workers 2 --timeout 60
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable iea-stays-api
sudo systemctl start iea-stays-api
sudo systemctl status iea-stays-api
```

## Nginx Reverse Proxy

Example API proxy under the same domain:

```nginx
server {
    server_name ieastays.com www.ieastays.com;

    root /var/www/iea-stays/website/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Add HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ieastays.com -d www.ieastays.com
```

## Frontend Integration

The React app uses:

```text
website/src/services/api.js
```

Set frontend environment:

```env
VITE_API_BASE_URL=https://ieastays.com/api/v1
```

Then build:

```bash
cd website
npm install
npm run build
```

The current forms are wired to:

- Visit page -> `POST /visits`
- Signup page -> `POST /residents/signup`
- Login page -> `POST /residents/login`

## Security Checklist

- Keep PostgreSQL bound to `127.0.0.1`
- Use HTTPS in production
- Set a long random `JWT_SECRET_KEY`
- Do not commit `.env`
- Use strong admin passwords
- Restrict admin endpoints to users with admin JWTs
- Store only password hashes, never plain passwords
- Aadhaar/PAN are masked in responses; add encryption-at-rest later if regulatory needs require it

# Deployment Guide

## Frontend → Vercel

1. **Connect repo** at vercel.com/new → select `ldoiainfo1-glitch/cobroker-website`
2. **Framework preset** will auto-detect Vite. Vercel uses `vercel.json` in the root — no extra config needed.
3. **Set environment variables** in Vercel Dashboard → Settings → Environment Variables:

   | Variable | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://ltdjflgoqfmvljiujpct.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | _(your anon key from Supabase Dashboard)_ |
   | `VITE_API_URL` | `https://api-backend.cobrokings.com/api/v1` |
   | `VITE_AWS_REGION` | `us-east-1` |
   | `VITE_AWS_S3_BUCKET` | `cobroking-media` |

4. **Deploy** — every push to `main` auto-deploys.
5. **Custom domain**: cobrokings.com → Vercel DNS settings.

---

## Backend → AWS EC2

### One-time server setup

```bash
# 1. SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 + nginx
sudo npm install -g pm2
sudo apt-get install -y nginx

# 4. Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

### Deploy the backend

```bash
# 5. Clone repo (or use git pull for updates)
git clone https://github.com/ldoiainfo1-glitch/cobroker-website.git /home/ubuntu/cobrokings
cd /home/ubuntu/cobrokings/backend

# 6. Create .env from example and fill in real values
cp .env.example .env
nano .env   # fill in all values

# 7. Install dependencies and build
npm install
npm run build   # outputs to dist/

# 8. Start with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # copy-paste the command it outputs to enable auto-start on reboot

# 9. Create log directory
sudo mkdir -p /var/log/cobrokings
sudo chown ubuntu:ubuntu /var/log/cobrokings
```

### Nginx + SSL

```bash
# 10. Copy nginx config
sudo cp /home/ubuntu/cobrokings/backend/nginx.conf /etc/nginx/sites-available/cobrokings-api
sudo ln -s /etc/nginx/sites-available/cobrokings-api /etc/nginx/sites-enabled/

# 11. Get SSL certificate
sudo certbot --nginx -d api-backend.cobrokings.com

# 12. Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Updating the backend

```bash
cd /home/ubuntu/cobrokings
git pull origin main
cd backend
npm install
npm run build
pm2 reload cobrokings-api
```

---

## Environment variables required on EC2 (`backend/.env`)

```
SUPABASE_URL=https://ltdjflgoqfmvljiujpct.supabase.co
SUPABASE_ANON_KEY=<from Supabase Dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard>
NODE_ENV=production
PORT=3001
APP_URL=https://api-backend.cobrokings.com
FRONTEND_URL=https://cobrokings.com
JWT_SECRET=<generate: openssl rand -hex 32>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<IAM user key>
AWS_SECRET_ACCESS_KEY=<IAM user secret>
AWS_S3_BUCKET=cobroking-media
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your gmail>
SMTP_PASS=<app password>
EMAIL_FROM=noreply@cobrokings.com
RAZORPAY_KEY_ID=<from Razorpay>
RAZORPAY_KEY_SECRET=<from Razorpay>
```

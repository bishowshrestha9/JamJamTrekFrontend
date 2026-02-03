# Deployment Guide for JamJam Frontend on Contabo with PM2

## Prerequisites
- Contabo VPS with Ubuntu/Debian
- Root or sudo access
- Backend already running at http://161.97.167.73:8001

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **SSH into your Contabo server**:
   ```bash
   ssh root@161.97.167.73
   ```

3. **Upload and run the deployment script**:
   ```bash
   # If you have the deploy.sh file locally, upload it:
   # scp deploy.sh root@161.97.167.73:/tmp/deploy.sh
   
   # Or create it directly on the server:
   cd /tmp
   wget https://raw.githubusercontent.com/DishantGiri/jamjam/main/deploy.sh
   # Or copy the deploy.sh content manually
   
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Deployment

1. **SSH into your Contabo server**:
   ```bash
   ssh root@161.97.167.73
   ```

2. **Install Node.js** (if not installed):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

4. **Clone your repository**:
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/DishantGiri/jamjam.git
   cd jamjam
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Build the application**:
   ```bash
   npm run build
   ```

7. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup systemd
   ```

## Configure Nginx (Optional but Recommended)

To serve your frontend on port 80/443 instead of 3000:

1. **Install Nginx**:
   ```bash
   apt-get update
   apt-get install nginx
   ```

2. **Create Nginx configuration**:
   ```bash
   nano /etc/nginx/sites-available/jamjam
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name 161.97.167.73;  # or your domain name

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the site**:
   ```bash
   ln -s /etc/nginx/sites-available/jamjam /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

## Useful PM2 Commands

- **View all processes**: `pm2 list`
- **View logs**: `pm2 logs jamjam-frontend`
- **Restart app**: `pm2 restart jamjam-frontend`
- **Stop app**: `pm2 stop jamjam-frontend`
- **Monitor resources**: `pm2 monit`
- **Delete from PM2**: `pm2 delete jamjam-frontend`

## Updating Your Application

When you make changes and want to redeploy:

```bash
ssh root@161.97.167.73
cd /var/www/jamjam
git pull origin main
npm install
npm run build
pm2 restart jamjam-frontend
```

## Troubleshooting

### Check if app is running:
```bash
pm2 list
```

### View application logs:
```bash
pm2 logs jamjam-frontend --lines 100
```

### Check if port 3000 is listening:
```bash
netstat -tulpn | grep 3000
```

### Restart the application:
```bash
pm2 restart jamjam-frontend
```

## Firewall Configuration

Make sure your firewall allows traffic on the required ports:

```bash
# For direct access to Next.js
ufw allow 3000/tcp

# For Nginx (if using)
ufw allow 80/tcp
ufw allow 443/tcp
```

## Access Your Application

- **Direct access**: http://161.97.167.73:3000
- **With Nginx**: http://161.97.167.73

## Notes

- The ecosystem.config.js file is configured to restart automatically on crashes
- PM2 is set up to start on system boot
- Application path is set to `/var/www/jamjam` - adjust if needed
- Make sure your backend at port 8001 is accessible from the frontend

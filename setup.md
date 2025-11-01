## Deployment Workflow

Local Development Reset Before Pushing:

```javascript

# Push clean project
git add .
git commit -m "Prepare for deployment"
git push
```

Production Server Initial Setup:

```javascript
# Install Node.js (Ubuntu/Debian example)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
mkdir -p /var/www/gym-cms
cd /var/www/gym-cms
```

Production Deployment Steps:

```javascript
# Clone repository
git clone https://github.com/yourusername/your-repo.git .

# Run setup script (installs deps, builds frontend, sets up DB)
node setup.js

# Create production env file (IMPORTANT)
cd server
cp .env.example .env.production
nano .env.production  # Edit with your production settings

# Start server with PM2
pm2 start server.js --name gym-cms --env production

# Make PM2 start on system boot
pm2 startup
# Run the command it outputs

# Save current processes to start on boot
pm2 save
```
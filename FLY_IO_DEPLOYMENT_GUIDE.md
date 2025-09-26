# 🚀 Fly.io Deployment Guide - IT Project Manager

Complete step-by-step guide to deploy your IT Project Manager application on Fly.io.

## 📋 Prerequisites

- Fly.io account (free tier available)
- GitHub repository with your code
- Fly CLI installed

## 🛠️ **Step 1: Install Fly CLI**

### Windows (PowerShell)
```powershell
# Run in PowerShell as Administrator
iwr https://fly.io/install.ps1 -useb | iex
```

### Alternative: Download from Website
1. Go to [fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
2. Download the Windows installer
3. Run the installer

### Verify Installation
```bash
fly version
```

## 🔐 **Step 2: Create Fly.io Account**

1. Go to [fly.io](https://fly.io)
2. Click "Sign Up"
3. Sign up with GitHub
4. Verify your email
5. **Free tier activated automatically**

## 🗄️ **Step 3: Create PostgreSQL Database**

### 3.1 Create Database
```bash
# Login to Fly.io
fly auth login

# Create PostgreSQL database
fly postgres create --name it-project-manager-db --region iad

# Note the connection string - you'll need it later
```

### 3.2 Get Database Connection String
```bash
# Get the connection string
fly postgres connect -a it-project-manager-db

# Or check the database info
fly postgres info -a it-project-manager-db
```

## 🐍 **Step 4: Deploy Backend (Django)**

### 4.1 Navigate to Backend Directory
```bash
cd backend/core
```

### 4.2 Initialize Fly App
```bash
# Initialize Fly app for backend
fly launch --no-deploy

# This will create fly.toml (already created for you)
```

### 4.3 Set Environment Variables
```bash
# Set secret key (generate a secure one)
fly secrets set SECRET_KEY="your-super-secret-key-here-make-it-very-long"

# Set other environment variables
fly secrets set DEBUG=False
fly secrets set ALLOWED_HOSTS="it-project-manager-backend.fly.dev"
fly secrets set CORS_ALLOWED_ORIGINS="https://it-project-manager-frontend.fly.dev"

# Set database URL (replace with your actual connection string)
fly secrets set DATABASE_URL="postgresql://username:password@host:port/database"
```

### 4.4 Deploy Backend
```bash
# Deploy the backend
fly deploy

# This will:
# 1. Build the Docker image
# 2. Run migrations
# 3. Collect static files
# 4. Start the application
```

### 4.5 Get Backend URL
```bash
# Get your backend URL
fly info

# Your backend will be available at:
# https://it-project-manager-backend.fly.dev
```

## ⚛️ **Step 5: Deploy Frontend (React)**

### 5.1 Navigate to Frontend Directory
```bash
cd ../../frontend
```

### 5.2 Initialize Fly App
```bash
# Initialize Fly app for frontend
fly launch --no-deploy

# This will create fly.toml (already created for you)
```

### 5.3 Set Environment Variables
```bash
# Set API URL pointing to your backend
fly secrets set REACT_APP_API_URL="https://it-project-manager-backend.fly.dev/api/"
```

### 5.4 Deploy Frontend
```bash
# Deploy the frontend
fly deploy

# This will:
# 1. Build the React app
# 2. Create a static server
# 3. Deploy to Fly.io
```

### 5.5 Get Frontend URL
```bash
# Get your frontend URL
fly info

# Your frontend will be available at:
# https://it-project-manager-frontend.fly.dev
```

## 🔄 **Step 6: Update Backend CORS Settings**

### 6.1 Update CORS in Backend
```bash
# Go back to backend directory
cd ../backend/core

# Update CORS to allow your frontend
fly secrets set CORS_ALLOWED_ORIGINS="https://it-project-manager-frontend.fly.dev"
```

### 6.2 Redeploy Backend
```bash
# Redeploy to apply CORS changes
fly deploy
```

## 👑 **Step 7: Create Super Admin Account**

### 7.1 Access Backend Shell
```bash
# Connect to your backend
fly ssh console -a it-project-manager-backend
```

### 7.2 Create Super Admin
```bash
# In the SSH console, run:
python manage.py create_superadmin

# Follow the prompts:
# Username: admin
# Email: admin@bouygues.com
# Password: your-secure-password
# Confirm password: same-password
```

### 7.3 Initialize Default Data
```bash
# In the same SSH console:
python manage.py shell

# Then in Python shell:
from calculations.services import MaterialManager
MaterialManager.create_default_categories()
MaterialManager.create_default_materials()
exit()
```

## 🧪 **Step 8: Test Your Deployment**

### 8.1 Test Backend
- Visit: `https://it-project-manager-backend.fly.dev/admin/`
- Login with your super admin credentials
- Should see Django admin dashboard

### 8.2 Test Frontend
- Visit: `https://it-project-manager-frontend.fly.dev`
- Should see your React application
- Try logging in and creating a project

### 8.3 Test API Connection
- Create a project in frontend
- Verify budget calculations work
- Test Excel export functionality

## 🎯 **Your Live URLs**

After successful deployment:
- **Backend API:** `https://it-project-manager-backend.fly.dev`
- **Frontend App:** `https://it-project-manager-frontend.fly.dev`
- **Admin Panel:** `https://it-project-manager-backend.fly.dev/admin/`

## 🔧 **Fly.io Commands Reference**

### App Management
```bash
# List all apps
fly apps list

# Get app info
fly info -a app-name

# View logs
fly logs -a app-name

# SSH into app
fly ssh console -a app-name
```

### Environment Variables
```bash
# List secrets
fly secrets list -a app-name

# Set secret
fly secrets set KEY=value -a app-name

# Remove secret
fly secrets unset KEY -a app-name
```

### Database Management
```bash
# List databases
fly postgres list

# Connect to database
fly postgres connect -a db-name

# Database info
fly postgres info -a db-name
```

## 🚨 **Troubleshooting**

### Backend Issues

#### 1. "Application Error" / 500 Error
```bash
# Check logs
fly logs -a it-project-manager-backend

# Common fixes:
# - Check if DATABASE_URL is set correctly
# - Verify SECRET_KEY is set
# - Check if migrations ran successfully
```

#### 2. Database Connection Error
```bash
# Check database status
fly postgres info -a it-project-manager-db

# Verify DATABASE_URL
fly secrets list -a it-project-manager-backend
```

#### 3. Static Files Not Loading
```bash
# SSH into backend and run:
fly ssh console -a it-project-manager-backend
python manage.py collectstatic --noinput
```

### Frontend Issues

#### 1. API Connection Failed
```bash
# Check REACT_APP_API_URL
fly secrets list -a it-project-manager-frontend

# Verify backend is running
fly info -a it-project-manager-backend
```

#### 2. Build Failed
```bash
# Check build logs
fly logs -a it-project-manager-frontend

# Common fixes:
# - Check if all dependencies are in package.json
# - Verify Node.js version compatibility
```

## 💰 **Fly.io Pricing**

### Free Tier
- **3 small VMs** (256MB RAM each)
- **160GB bandwidth** per month
- **Shared PostgreSQL** database
- **Perfect for development and testing**

### Paid Plans
- **Starter:** $1.94/month per VM
- **Performance:** $2.50/month per VM
- **Dedicated PostgreSQL:** $19/month

## 🔒 **Security Best Practices**

### Production Security
- [ ] Strong `SECRET_KEY` (50+ characters)
- [ ] `DEBUG=False` in production
- [ ] Specific `ALLOWED_HOSTS` (no wildcards)
- [ ] CORS limited to your frontend domain
- [ ] Strong super admin password
- [ ] HTTPS enabled (automatic with Fly.io)

### Environment Variables Security
- [ ] Never commit secrets to Git
- [ ] Use Fly.io secrets for sensitive data
- [ ] Different secrets for different environments

## 📊 **Monitoring & Maintenance**

### Fly.io Dashboard Features
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History and rollback options
- **Usage:** Track your resource consumption

### Regular Maintenance
1. **Monitor logs** for errors
2. **Update dependencies** regularly
3. **Backup database** (Fly.io Pro feature)
4. **Monitor resource usage**

## 🆘 **Support & Resources**

### Fly.io Resources
- [Fly.io Docs](https://fly.io/docs)
- [Fly.io Discord](https://fly.io/discord)
- [Fly.io Status](https://status.fly.io)

### Django Resources
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Django Production Settings](https://docs.djangoproject.com/en/stable/howto/deployment/)

## ✅ **Deployment Checklist**

### Pre-Deployment
- [ ] Fly CLI installed
- [ ] Fly.io account created
- [ ] GitHub repository ready
- [ ] Code pushed to GitHub

### During Deployment
- [ ] PostgreSQL database created
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables set
- [ ] CORS configured correctly

### Post-Deployment
- [ ] Super admin account created
- [ ] Default materials initialized
- [ ] Application tested end-to-end
- [ ] Security checklist completed
- [ ] Monitoring set up

## 🎉 **Success!**

Your IT Project Manager application is now live on Fly.io! 

**Your URLs:**
- Backend: `https://it-project-manager-backend.fly.dev`
- Frontend: `https://it-project-manager-frontend.fly.dev`
- Admin Panel: `https://it-project-manager-backend.fly.dev/admin/`

**Next Steps:**
1. Share the application with users
2. Monitor performance and usage
3. Set up regular backups
4. Plan for scaling as needed

---

**Need Help?** 
- Check the troubleshooting section above
- Review Fly.io documentation
- Check application logs with `fly logs`
- Join Fly.io Discord for community support

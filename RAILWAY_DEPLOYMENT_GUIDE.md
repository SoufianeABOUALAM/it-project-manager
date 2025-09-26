# 🚀 Railway Deployment Guide - IT Project Manager

Complete step-by-step guide to deploy your IT Project Manager application on Railway.

## 📋 What You Need

- Railway account (free tier available)
- GitHub account
- Your project code ready

## 🗂️ Project Structure (After Cleanup)

```
Bougues-Prjt-main/
├── backend/core/          # Django backend
├── frontend/             # React frontend  
├── requirements.txt      # Python dependencies
├── Procfile             # Railway process commands
├── railway.json         # Railway configuration
├── README.md            # Project documentation
└── RAILWAY_DEPLOYMENT_GUIDE.md
```

## 🌐 Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name: `it-project-manager`
4. Make it **Public** (for free Railway deployment)
5. Click "Create repository"

### 1.2 Push Your Code
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit - Railway ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/it-project-manager.git
git push -u origin main
```

## 🚂 Step 2: Deploy Backend on Railway

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your repositories

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `it-project-manager` repository
4. Click "Deploy Now"

### 2.3 Configure Environment Variables
In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add these variables:

```bash
# Required Variables
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=your-app-name.up.railway.app
DATABASE_URL=postgresql://... (Railway will provide this automatically)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Optional Variables
SUPERADMIN_USERNAME=admin
SUPERADMIN_EMAIL=admin@bouygues.com
SUPERADMIN_PASSWORD=your-secure-password
```

**🔐 Generate SECRET_KEY:**
```python
# Run this in Python
import secrets
print(secrets.token_urlsafe(50))
```

### 2.4 Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` variable

### 2.5 Deploy Backend
1. Railway will automatically build and deploy
2. Wait for deployment to complete (2-5 minutes)
3. Your backend URL will be: `https://your-app-name.up.railway.app`

## 🎨 Step 3: Deploy Frontend on Railway

### 3.1 Create Frontend Service
1. In the same Railway project, click "New Service"
2. Select "GitHub Repo" → Choose your repository again
3. Name it "frontend"

### 3.2 Configure Frontend Build
1. Go to frontend service settings
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm start`

### 3.3 Configure Frontend Environment
Add these variables to the frontend service:
```bash
REACT_APP_API_URL=https://your-backend-name.up.railway.app/api/
```

### 3.4 Update Backend CORS Settings
Update your backend's `CORS_ALLOWED_ORIGINS` variable:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-name.up.railway.app
```

## 🔧 Step 4: Setup Super Admin

### Option 1: Using Management Command (Recommended)
```bash
# In Railway backend service terminal
python manage.py create_superadmin
```

### Option 2: Using Environment Variables
Your backend is already configured to use these variables:
- `SUPERADMIN_USERNAME`
- `SUPERADMIN_EMAIL` 
- `SUPERADMIN_PASSWORD`

Run this command in Railway terminal:
```bash
python manage.py setup_admin
```

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-backend-name.up.railway.app/admin/`
- Should show Django admin login
- Login with your super admin credentials

### 5.2 Test Frontend
Visit: `https://your-frontend-name.up.railway.app`
- Should show your React application
- Try logging in and creating a project

### 5.3 Test API Connection
- Create a project in frontend
- Check if budget calculations work
- Try exporting to Excel

## 🚨 Troubleshooting

### Backend Issues

#### 1. "Application Error" / 500 Error
**Check Railway logs:**
1. Go to Railway dashboard
2. Click your backend service
3. Go to "Deployments" tab
4. Click latest deployment
5. Check "Build Logs" and "Deploy Logs"

**Common fixes:**
- Check `SECRET_KEY` is set
- Verify `DATABASE_URL` is available
- Ensure `ALLOWED_HOSTS` includes your Railway domain

#### 2. Database Connection Error
```bash
# Check if PostgreSQL service is running
# Verify DATABASE_URL variable is set correctly
```

#### 3. Static Files Not Loading
```bash
# Run this in Railway terminal
python manage.py collectstatic --noinput
```

### Frontend Issues

#### 1. API Connection Failed
- Check `REACT_APP_API_URL` points to your backend
- Verify CORS settings in backend
- Check network tab in browser dev tools

#### 2. Build Failed
```bash
# Check if all dependencies are in package.json
# Verify Node.js version compatibility
```

## 🔒 Security Checklist

### Production Security
- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (50+ characters)
- [ ] Specific `ALLOWED_HOSTS` (no wildcards)
- [ ] CORS limited to your frontend domain
- [ ] Strong super admin password
- [ ] HTTPS enabled (Railway does this automatically)

### Environment Variables Security
- [ ] Never commit secrets to Git
- [ ] Use Railway's environment variables
- [ ] Different secrets for different environments

## 📊 Step 6: Initialize Data

### 6.1 Create Default Materials
```bash
# In Railway backend terminal
python manage.py shell
>>> from calculations.services import MaterialManager
>>> MaterialManager.create_default_categories()
>>> MaterialManager.create_default_materials()
>>> exit()
```

### 6.2 Test Budget Calculations
1. Login to your frontend
2. Create a test project
3. Verify budget calculations work
4. Test Excel export functionality

## 🎯 Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In Railway dashboard
2. Go to your service settings
3. Click "Domains"
4. Add your custom domain
5. Update DNS records as instructed

### 7.2 Update Environment Variables
```bash
# Update these variables with your custom domain
ALLOWED_HOSTS=your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 📈 Monitoring & Maintenance

### Railway Dashboard Features
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History and rollback options
- **Usage**: Track your resource consumption

### Regular Maintenance
1. **Monitor logs** for errors
2. **Update dependencies** regularly
3. **Backup database** (Railway Pro feature)
4. **Monitor resource usage**

## 💰 Pricing

### Railway Free Tier
- $5 credit per month
- Enough for small applications
- Automatic sleeping after inactivity

### Railway Pro ($20/month)
- $20 credit + usage-based billing
- No sleeping
- Better performance
- Database backups

## 🆘 Support & Resources

### Railway Resources
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

### Django Resources
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Django Production Settings](https://docs.djangoproject.com/en/stable/howto/deployment/)

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Requirements.txt updated
- [ ] Settings configured for production
- [ ] Railway.json created
- [ ] Environment variables planned

### During Deployment
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Custom domains configured (if needed)

### Post-Deployment
- [ ] Super admin account created
- [ ] Default materials initialized
- [ ] Application tested end-to-end
- [ ] Security checklist completed
- [ ] Monitoring set up

## 🎉 Success!

Your IT Project Manager application is now live on Railway! 

**Your URLs:**
- Backend: `https://your-backend-name.up.railway.app`
- Frontend: `https://your-frontend-name.up.railway.app`
- Admin Panel: `https://your-backend-name.up.railway.app/admin/`

**Next Steps:**
1. Share the application with users
2. Monitor performance and usage
3. Set up regular backups
4. Plan for scaling as needed

---

**Need Help?** 
- Check the troubleshooting section above
- Review Railway documentation
- Check application logs in Railway dashboard

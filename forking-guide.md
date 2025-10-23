# Forking Guide: From Template to Your Own App

This guide walks you through transforming the django-react-template into your own application. Whether you're building a research dashboard, lab management system, or department portal, this guide will help you get started.

## 📋 Before You Begin

### What You'll Need
1. **Terminal** - Command line access (Mac/Linux Terminal, Windows PowerShell/WSL)
2. **Git** - For code management (Download: [GitHub Desktop](https://desktop.github.com/download/); alternative: [CLI](https://git-scm.com/))
2. **Docker Desktop** - Runs your development environment ([Download](https://www.docker.com/products/docker-desktop/))
3. **A text editor** - VS Code recommended ([Download](https://code.visualstudio.com/))
4. **15-30 minutes** - For initial setup

### What You Should Know
- Basic command line usage (opening terminal, navigating directories)
- This guide will take you through basic `git` usage (clone, add, commit, push)
- That's it! The template handles the rest.

## 🚀 Step 1: Create Your Project

### Fork on GitHub (Recommended)
```bash
# 1. Go to: https://github.itap.purdue.edu/AgIT/django-react-template
# 2. Click "Fork" button
# 3. Name it something like "lab-inventory" or "research-portal"
# 4. Clone YOUR fork:
git clone https://github.itap.purdue.edu/YOUR-USERNAME/YOUR-APP-NAME
cd YOUR-APP-NAME
```

## 🔧 Step 2: Initial Configuration

### Set Up Your Environment
```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor and update these key settings:
# - DEFAULT_SUPERUSER_PASSWORD (change from default!)
# - SECRET_KEY (generate a new one for production)
# - Any other settings specific to your needs
```

### Start Your Development Environment
```bash
# This single command starts everything:
docker compose up

# Wait for startup (about 30 seconds first time)
# You'll see: "Watching for file changes with StatReloader"
```

### Verify Everything Works
Open your browser and check:
- ✅ Frontend: http://localhost:5173
- ✅ API Documentation: http://localhost:5173/api/swagger/
- ✅ Admin Panel: http://localhost:5173/admin/
  - Username: `admin`
  - Password: (what you set in `.env`)

Note: The backend (port 8000) is tunneled through the frontend (port 5173), so all URLs go through [localhost:5173](http://localhost:5173).

## 📝 Step 3: Make It Yours

### Update Project Identity

#### 1. Update Browser Title and Metadata
```bash
# Edit the HTML template
docker compose exec frontend nano index.html
# Change: <title>Django React Template</title>
# To:     <title>Your App Name</title>
```

#### 2. Update Frontend App Name
```bash
# Edit package.json
docker compose exec frontend nano package.json
# Change "name": "frontend" to "name": "your-app-frontend"
```

#### 3. Update Backend App Name
Edit `backend/config/settings/base.py`:
```python
# Find and update:
ALLOWED_HOSTS = ['your-app.purdue.edu', 'localhost', '127.0.0.1']

# Update site name for admin
ADMIN_SITE_HEADER = "Your App Admin"
```

### Customize the Homepage

Edit `frontend/src/pages/Home.tsx`:
```typescript
// Change the welcome message and description
// Remove or modify the template features list
// Add your app's main purpose
```

Example:
```typescript
export default function Home() {
  return (
    <div className="container-content">
      <h1>Lab Inventory System</h1>
      <p>Track equipment, supplies, and experiments in one place.</p>
      {/* Your content here */}
    </div>
  );
}
```

### Update Logo/Header
Edit `frontend/src/components/Layout/Header.tsx`:
- Replace "Django React Template" with your app name
- Add your department/lab logo if needed

## 🛠️ Step 4: Add Your First Feature

Don't be intimidated by the code below! This is just an example to show you how pieces connect. You can copy-paste this to get started, then modify it for your needs. AI assistants are great at helping with these kinds of changes.

### Example: Adding a Simple Data Model

#### 1. Create a Django Model
```bash
# Open a backend shell
docker compose exec backend bash

# Create a new Django app for your feature
python manage.py startapp inventory

# Exit the shell
exit
```

Create `backend/inventory/models.py`:
```python
from django.db import models

class Equipment(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    quantity = models.IntegerField(default=1)
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
```

#### 2. Register the App and Create Database Tables
Add to `backend/config/settings/base.py`:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'inventory',  # Add your new app
]
```

Run migrations:
```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

#### 3. Create an API Endpoint
Create `backend/inventory/serializers.py`:
```python
from rest_framework import serializers
from .models import Equipment

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'
```

Create `backend/inventory/views.py`:
```python
from rest_framework import viewsets
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
```

Add to `backend/config/urls.py`:
```python
from inventory.views import EquipmentViewSet

router.register(r'equipment', EquipmentViewSet)
```

#### 4. Create a Frontend Component
Create `frontend/src/pages/Equipment.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    api.get('/equipment/').then(response => {
      setEquipment(response.data);
    });
  }, []);

  return (
    <div className="container-content">
      <h1>Equipment List</h1>
      {equipment.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

Add the route in `frontend/src/App.tsx`:
```typescript
import Equipment from './pages/Equipment';

// In the routes:
<Route path="/equipment" element={<Equipment />} />
```

### The Magic of AI Assistance

The above might look like a lot, but here's the secret: **you don't need to memorize any of it!** Just tell an AI assistant what you want:

- "I need to add a page that shows lab equipment with name, location, and quantity"
- "Help me create a form where users can submit experiment results"
- "I want to add a calendar view for scheduling equipment usage"

The AI will generate the specific code you need. The example above is just to show you that it's not magic—it's just a few files working together.

## 🧪 Step 5: Test Your Changes

### Run Tests
```bash
# Backend tests
docker compose exec backend pytest

# Frontend tests
docker compose exec frontend npm test

# Linting/formatting
docker compose exec backend black .
docker compose exec frontend npm run lint
```

### Manual Testing Checklist
- [ ] Can you log in/out?
- [ ] Does your new feature show up?
- [ ] Can you create/edit/delete data?
- [ ] Do the API endpoints work?

## 📤 Step 6: Save Your Work

```bash
# Add all your changes
git add .

# Commit with a descriptive message
git commit -m "Initial customization: Lab Inventory System"

# If using GitHub/GitLab, push to your repository
git push origin main
```

## 🚨 Common Issues & Solutions

### "Port already in use"
```bash
# Stop all containers
docker compose down

# Start fresh
docker compose up
```

### "Database connection refused"
```bash
# Ensure database is fully started
docker compose ps  # Check all services are "Up"

# Restart everything
docker compose restart
```

### "Module not found" (after adding packages)
```bash
# Backend Python packages
docker compose exec backend pip install your-package
# Add to requirements/base.txt

# Frontend npm packages
docker compose exec frontend npm install your-package
# This updates package.json automatically
```

### Changes not showing up
- Frontend: Should auto-refresh. If not, hard refresh browser (Ctrl+Shift+R)
- Backend: Should auto-reload. If not, restart: `docker compose restart backend`

## 📚 Next Steps

### Background Reading
1. **For Django (Backend)**:
   - [Django Tutorial](https://docs.djangoproject.com/en/5.1/intro/tutorial01/) - Official tutorial
   - [Django REST Framework](https://www.django-rest-framework.org/tutorial/quickstart/) - Building APIs

2. **For React (Frontend)**:
   - [React Quick Start](https://react.dev/learn) - Official React docs
   - [TypeScript for React](https://react-typescript-cheatsheet.netlify.app/) - TypeScript patterns

3. **For This Template**:
   - [Deployment Guide](deployment/README.md) - When ready for production
   - [CLAUDE.md](CLAUDE.md) - Using AI assistants effectively

### Recommended Development Flow
1. **Start Small**: Add one feature at a time
2. **Test Often**: Run tests after each change
3. **Commit Regularly**: Save your progress with git
4. **Ask for Help**: Use AI assistants (Claude, ChatGPT) with the template
5. **Deploy Early**: Get feedback from users quickly

### Getting Help with AI

When using AI assistants, you don't need to understand all the technical details. Just describe what you want in plain English:

**Good prompts:**
- "I'm using django-react-template and need to add a page that shows a list of students"
- "Help me add a search box to filter equipment by location"
- "I want users to be able to upload CSV files and see the data in a table"
- "Show me how to add email notifications when inventory is low"

**Even simpler:**
- "Add a calendar to my app"
- "I need a form for people to register for events"
- "Make a dashboard with charts"

The AI will ask clarifying questions if needed. The template includes `CLAUDE.md` which provides context to AI assistants automatically, so they understand your project structure.

## 🎯 Quick Reference

### Most Used Commands
```bash
# Start development
docker compose up

# Django admin commands
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

# Add packages
docker compose exec backend pip install package-name
docker compose exec frontend npm install package-name

# Run tests
docker compose exec backend pytest
docker compose exec frontend npm test

# Stop everything
docker compose down
```

### Project Structure Reminder
```
YOUR-APP-NAME/
├── backend/          # Django (Python) - APIs, database, auth
│   ├── config/       # Settings and main URLs
│   ├── apps/         # Your Django apps
│   └── manage.py     # Django CLI
├── frontend/         # React (TypeScript) - User interface
│   ├── src/          # Your React code
│   └── package.json  # npm packages
└── compose.yml       # Development environment
```

### Where to Add Code
- **New API endpoint**: `backend/apps/api/` or create new app
- **New page**: `frontend/src/pages/`
- **New component**: `frontend/src/components/`
- **Database models**: `backend/apps/*/models.py`
- **API integration**: `frontend/src/api/`

## 🚀 Ready to Deploy?

When you're ready to move beyond local development:

### Requesting Deployment to Dev/QA Servers

1. **Prepare your deployment files** (one-time setup):

   *Windows users: This script requires WSL or Git Bash. Alternatively, you can manually rename the files in `deployment/systemd/` from `template.*` to `your-app.*`*

   ```bash
   # Run from your project root
   ./deployment/rename-for-deployment.sh your-app-name

   # Review the changes it made
   git diff

   # Commit when ready
   git add deployment/ .env.production.example
   git commit -m "Customize deployment for your-app-name"
   git push
   ```

2. **Submit a deployment request:**
   - Send email to: **it@purdue.edu**
   - Subject: "Web App Deployment Request - [Your App Name]"
   - Include at the top: **"Please assign to RHTS Research Solutions"**
   - Provide:
     - Link to your Git repository
     - Which environment(s) you need (dev and/or qa)
     - Your app name (what you renamed from "template")
     - Requested URL (e.g., mylab.ag.purdue.edu)
     - Your contact information

3. **What happens next:**
   - A sysadmin will contact you to schedule the deployment
   - They'll set up your app on the requested server(s)
   - You'll receive confirmation of the URLs for your deployed application

### Production Deployment

*Coming soon: Production deployment requires a security review process. This section will be updated with the complete procedure.*

## 🏁 Success Checklist

You're ready to build when you can:
- ✅ Access your app at http://localhost:5173
- ✅ Log into admin at http://localhost:5173/admin
- ✅ See your custom app name/branding
- ✅ Make a small change and see it update
- ✅ Commit your changes to git

## 💡 Remember: You Don't Need to Know Everything!

This template aims to help you start building right away, using a modern stack. When you get stuck:
1. **Try something** - The worst that happens is an error message
2. **Ask AI** - "I got this error: [paste error]. How do I fix it?"
3. **Experiment** - Change something small and see what happens
4. **Learn as you go** - Each feature you add teaches you something new

Congratulations! You've successfully forked the template and are ready to build your application and bring your ideas to life.

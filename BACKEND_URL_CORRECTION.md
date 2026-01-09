# 🔧 Backend URL Correction

## Issue: Error Code -107

**Problem**: You're trying to access `https://localhost:8000/admin/` but the Django development server uses **HTTP** (not HTTPS).

## ✅ Correct URL:

Use **HTTP** (not HTTPS):
```
http://localhost:8000/admin/
```

NOT:
```
https://localhost:8000/admin/  ❌
```

## Why This Happens:

- Django's development server (`python manage.py runserver`) runs on **HTTP** by default
- Error code -107 is a network/SSL error that occurs when trying to use HTTPS with an HTTP server
- The development server doesn't have SSL certificates configured

## Correct URLs to Use:

| Service | Correct URL | Wrong URL |
|---------|------------|-----------|
| **Django Admin** | `http://localhost:8000/admin/` | `https://localhost:8000/admin/` ❌ |
| **API Root** | `http://localhost:8000/api/` | `https://localhost:8000/api/` ❌ |
| **Frontend** | `http://localhost:3000/` | `https://localhost:3000/` ❌ |

## Quick Fix:

1. **Change `https://` to `http://`** in your browser address bar
2. Or click this link: [http://localhost:8000/admin/](http://localhost:8000/admin/)

## For Production:

In production, you would:
- Use a reverse proxy (nginx, Apache) with SSL certificates
- Configure HTTPS properly
- But for development, HTTP is fine and expected

---

**Always use `http://` (not `https://`) when accessing the Django development server!**

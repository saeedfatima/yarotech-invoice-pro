# YAROTECH Invoice Pro - Django Backend

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 5. Setup Sample Data
```bash
python setup_django.py
```

### 6. Run Development Server
```bash
python manage.py runserver 8000
```

The Django backend will be available at: http://localhost:8000

## API Endpoints

- **Products**: `GET/POST http://localhost:8000/api/products/`
- **Customers**: `GET/POST http://localhost:8000/api/customers/`
- **Sales**: `GET/POST http://localhost:8000/api/sales/`
- **Sale Detail**: `GET http://localhost:8000/api/sales/{id}/`
- **Invoice Data**: `GET http://localhost:8000/api/sales/{id}/invoice_data/`

## Authentication Endpoints (Simplified for Local Development)

- **Auth Status**: `GET http://localhost:8000/api/auth/status/`
- **Sign In**: `POST http://localhost:8000/api/auth/signin/`
- **Sign Up**: `POST http://localhost:8000/api/auth/signup/`
- **Sign Out**: `POST http://localhost:8000/api/auth/signout/`

## Admin Panel

Access the Django admin at: http://localhost:8000/admin/

## Database

Uses SQLite for local development. Database file: `db.sqlite3`
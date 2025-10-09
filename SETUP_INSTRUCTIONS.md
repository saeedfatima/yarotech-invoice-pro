# YAROTECH Invoice Pro - Local Development Setup

This setup allows you to run the full invoice application locally with a Django backend and React frontend.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn package manager

## Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Database
```bash
# Create database migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional - for admin access)
python manage.py createsuperuser

# Setup sample data
python setup_django.py
```

### 5. Start Django Server
```bash
python manage.py runserver 8000
```

The Django backend will be running at: http://localhost:8000

## Frontend Setup (React)

### 1. Open New Terminal and Navigate to Project Root
```bash
# Make sure you're in the main project directory (not backend/)
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start React Development Server
```bash
npm run dev
```

The React frontend will be running at: http://localhost:5173

## Usage

1. **Access the Application**: Open http://localhost:5173 in your browser
2. **Authentication**: The app uses simplified auth for local development - any email/password will work
3. **Create Sales**: Use the "New Sale" tab to create invoices
4. **View History**: Use the "Sales History" tab to view and download invoices
5. **Admin Panel**: Access Django admin at http://localhost:8000/admin/ (if you created a superuser)

## Features Available

✅ **Working Features:**
- User authentication (simplified for local dev)
- Product management
- Customer management  
- Sales/Invoice creation
- Sales history viewing
- PDF invoice generation and download
- Responsive design
- Professional invoice layout with logo

⚠️ **Not Yet Implemented:**
- Email functionality (needs Django email backend setup)
- Advanced user management
- File uploads for custom logos

## API Endpoints

The Django backend provides these API endpoints:

- **Products**: `GET/POST http://localhost:8000/api/products/`
- **Customers**: `GET/POST http://localhost:8000/api/customers/`
- **Sales**: `GET/POST http://localhost:8000/api/sales/`
- **Sale Detail**: `GET http://localhost:8000/api/sales/{id}/`
- **Auth**: `http://localhost:8000/api/auth/`

## Database

- Uses SQLite for local development
- Database file: `backend/db.sqlite3`
- Includes sample products and customers
- All data persists between sessions

## Troubleshooting

### Backend Issues:
- Make sure virtual environment is activated
- Check that port 8000 is not in use
- Verify all Python dependencies are installed

### Frontend Issues:
- Make sure backend is running on port 8000
- Check that port 5173 is not in use
- Verify all Node dependencies are installed
- Check browser console for CORS errors

### CORS Issues:
- The Django backend is configured to allow requests from localhost:5173
- If you change ports, update `CORS_ALLOWED_ORIGINS` in `backend/yarotech_backend/settings.py`

## Next Steps

To enhance the application further, you can:

1. **Add Email Functionality**: Configure Django email backend and implement email sending
2. **Add File Upload**: Allow custom logo uploads
3. **Add User Management**: Implement proper user registration and profiles
4. **Add Reporting**: Create sales reports and analytics
5. **Deploy**: Deploy to production servers

## Support

If you encounter any issues during setup, check:
1. Python and Node.js versions
2. Virtual environment activation
3. Port availability
4. Console error messages
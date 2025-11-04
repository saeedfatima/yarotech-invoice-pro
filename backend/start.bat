@echo off
REM YAROTECH Backend Startup Script for Windows

echo 🚀 Starting YAROTECH Invoice Pro Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Run migrations
echo 🗄️  Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Setup sample data
echo 📊 Setting up sample data...
python setup_django.py

REM Start server
echo ✅ Starting Django development server on http://localhost:8000
python manage.py runserver 8000

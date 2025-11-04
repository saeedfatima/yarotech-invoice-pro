#!/bin/bash

# YAROTECH Backend Startup Script

echo "🚀 Starting YAROTECH Invoice Pro Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Setup sample data
echo "📊 Setting up sample data..."
python setup_django.py

# Start server
echo "✅ Starting Django development server on http://localhost:8000"
python manage.py runserver 8000

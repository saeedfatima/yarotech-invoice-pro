#!/usr/bin/env python
"""
Setup script for Django backend
Run this after installing requirements to set up the database and create sample data
"""

import os
import sys
import django
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarotech_backend.settings')
django.setup()

from invoices.models import Customer, Product, Sale, SaleItem

def setup_database():
    """Create sample data for testing"""
    print("Setting up database with sample data...")
    
    # Create sample customers
    customers_data = [
        {'name': 'John Doe', 'email': 'john@example.com', 'phone': '+234-800-1234', 'address': 'Lagos, Nigeria'},
        {'name': 'Jane Smith', 'email': 'jane@example.com', 'phone': '+234-800-5678', 'address': 'Abuja, Nigeria'},
        {'name': 'Ahmed Hassan', 'email': 'ahmed@example.com', 'phone': '+234-800-9012', 'address': 'Kano, Nigeria'},
    ]
    
    for customer_data in customers_data:
        customer, created = Customer.objects.get_or_create(
            name=customer_data['name'],
            defaults=customer_data
        )
        if created:
            print(f"Created customer: {customer.name}")
    
    # Create sample products
    products_data = [
        {'name': 'Laptop', 'price': Decimal('350000.00'), 'description': 'High-performance laptop'},
        {'name': 'Mouse', 'price': Decimal('5000.00'), 'description': 'Wireless mouse'},
        {'name': 'Keyboard', 'price': Decimal('15000.00'), 'description': 'Mechanical keyboard'},
        {'name': 'Monitor', 'price': Decimal('75000.00'), 'description': '24-inch LED monitor'},
        {'name': 'Headphones', 'price': Decimal('25000.00'), 'description': 'Noise-cancelling headphones'},
        {'name': 'Webcam', 'price': Decimal('12000.00'), 'description': 'HD webcam'},
        {'name': 'Speaker', 'price': Decimal('8000.00'), 'description': 'Bluetooth speaker'},
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults=product_data
        )
        if created:
            print(f"Created product: {product.name} - ₦{product.price}")
    
    print("Database setup complete!")
    print(f"Total customers: {Customer.objects.count()}")
    print(f"Total products: {Product.objects.count()}")
    print(f"Total sales: {Sale.objects.count()}")

if __name__ == '__main__':
    setup_database()
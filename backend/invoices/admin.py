from django.contrib import admin
from .models import Customer, Product, Sale, SaleItem

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['created_at']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'created_at']
    search_fields = ['name']
    list_filter = ['created_at']

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'total', 'issuer_name', 'sale_date']
    list_filter = ['sale_date', 'issuer_name']
    search_fields = ['customer__name', 'issuer_name']
    inlines = [SaleItemInline]
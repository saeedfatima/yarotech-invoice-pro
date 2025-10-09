from rest_framework import serializers
from .models import Customer, Product, Sale, SaleItem

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'address', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'created_at']

class SaleItemSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'total', 'created_at']

class SaleSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'customer', 'customer_name', 'sale_date', 'total', 'issuer_name', 'sale_items', 'created_at']

class SaleCreateSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(write_only=True)
    sale_items = serializers.ListField(write_only=True)
    
    class Meta:
        model = Sale
        fields = ['customer_name', 'issuer_name', 'sale_items']
    
    def create(self, validated_data):
        customer_name = validated_data.pop('customer_name')
        sale_items_data = validated_data.pop('sale_items')
        
        # Create or get customer
        customer, created = Customer.objects.get_or_create(
            name=customer_name,
            defaults={'name': customer_name}
        )
        
        # Calculate total
        total = sum(item['quantity'] * item['price'] for item in sale_items_data)
        
        # Create sale
        sale = Sale.objects.create(
            customer=customer,
            total=total,
            **validated_data
        )
        
        # Create sale items
        for item_data in sale_items_data:
            SaleItem.objects.create(
                sale=sale,
                product_id=item_data.get('product_id'),
                product_name=item_data['product_name'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        return sale

class SaleDetailSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True, read_only=True)
    customers = CustomerSerializer(source='customer', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'customers', 'sale_date', 'total', 'issuer_name', 'sale_items', 'created_at']
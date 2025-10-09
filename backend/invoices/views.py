from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Customer, Product, Sale, SaleItem
from .serializers import (
    CustomerSerializer, ProductSerializer, SaleSerializer, 
    SaleCreateSerializer, SaleDetailSerializer
)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().select_related('customer').prefetch_related('sale_items')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        elif self.action == 'retrieve':
            return SaleDetailSerializer
        return SaleSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()
        
        # Return the created sale with full details
        response_serializer = SaleDetailSerializer(sale)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def invoice_data(self, request, pk=None):
        """Get sale data formatted for invoice generation"""
        try:
            sale = self.get_object()
            serializer = SaleDetailSerializer(sale)
            return Response(serializer.data)
        except Sale.DoesNotExist:
            return Response(
                {'error': 'Sale not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Simple auth endpoints for local development
def auth_status(request):
    """Simple auth status endpoint"""
    return JsonResponse({
        'authenticated': True,
        'user': {
            'id': '1',
            'email': 'demo@yarotech.com.ng'
        }
    })

def auth_signin(request):
    """Simple signin endpoint"""
    if request.method == 'POST':
        return JsonResponse({
            'success': True,
            'user': {
                'id': '1',
                'email': 'demo@yarotech.com.ng'
            }
        })
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def auth_signup(request):
    """Simple signup endpoint"""
    if request.method == 'POST':
        return JsonResponse({
            'success': True,
            'user': {
                'id': '1',
                'email': 'demo@yarotech.com.ng'
            }
        })
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def auth_signout(request):
    """Simple signout endpoint"""
    return JsonResponse({'success': True})
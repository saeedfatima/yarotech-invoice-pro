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
    
    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send invoice email to info@yarotech.com.ng"""
        try:
            sale = self.get_object()
            
            # Generate PDF
            pdf_buffer = self.generate_invoice_pdf(sale)
            
            # Create email
            subject = f'New Invoice Generated - INV-{str(sale.id)[:8].upper()}'
            
            # Email content
            email_content = f"""
            Dear Admin,
            
            A new invoice has been generated. Please find the details below:
            
            Invoice ID: INV-{str(sale.id)[:8].upper()}
            Customer: {sale.customer.name if sale.customer else 'N/A'}
            Date: {sale.sale_date.strftime('%B %d, %Y at %I:%M %p')}
            Total Amount: ₦{sale.total:,.2f}
            Issued By: {sale.issuer_name}
            
            The invoice PDF is attached to this email.
            
            Best regards,
            YAROTECH Invoice System
            """
            
            # Create email message
            email = EmailMessage(
                subject=subject,
                body=email_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=['info@yarotech.com.ng'],
            )
            
            # Attach PDF
            email.attach(
                f'INV-{str(sale.id)[:8].upper()}.pdf',
                pdf_buffer.getvalue(),
                'application/pdf'
            )
            
            # Send email
            email.send()
            
            return Response({
                'success': True,
                'message': 'Invoice email sent successfully'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def generate_invoice_pdf(self, sale):
        """Generate PDF invoice"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Company header
        company_style = ParagraphStyle(
            'CompanyHeader',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2196F3'),
            alignment=1,  # Center
            spaceAfter=12
        )
        
        story.append(Paragraph("YAROTECH NETWORK LIMITED", company_style))
        
        # Company details
        company_details = ParagraphStyle(
            'CompanyDetails',
            parent=styles['Normal'],
            fontSize=10,
            alignment=1,  # Center
            spaceAfter=20
        )
        
        story.append(Paragraph(
            "No. 122 Lukoro Plaza A, Farm Center, Kano State<br/>"
            "Email: info@yarotech.com.ng",
            company_details
        ))
        
        # Invoice title
        invoice_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontSize=36,
            textColor=colors.HexColor('#2196F3'),
            alignment=2,  # Right
            spaceAfter=20
        )
        
        story.append(Paragraph("INVOICE", invoice_style))
        
        # Invoice details
        invoice_id = f"INV-{str(sale.id)[:8].upper()}"
        invoice_date = sale.sale_date.strftime("%b %d, %Y %H:%M")
        customer_name = sale.customer.name if sale.customer else 'N/A'
        
        details_data = [
            ['Invoice ID:', invoice_id, 'Date:', invoice_date],
            ['Bill To:', customer_name, 'Issued By:', sale.issuer_name]
        ]
        
        details_table = Table(details_data, colWidths=[1*inch, 2*inch, 1*inch, 2*inch])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        story.append(details_table)
        story.append(Spacer(1, 20))
        
        # Items table
        items_data = [['PRODUCT', 'QUANTITY', 'PRICE (₦)', 'TOTAL (₦)']]
        
        for item in sale.sale_items.all():
            items_data.append([
                item.product_name,
                str(item.quantity),
                f"{item.price:,.2f}",
                f"{item.total:,.2f}"
            ])
        
        # Add grand total row
        items_data.append(['', '', 'GRAND TOTAL', f"₦ {sale.total:,.2f}"])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2196F3')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -2), 10),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            
            # Grand total row
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#2196F3')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('ALIGN', (0, -1), (-1, -1), 'RIGHT'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 30))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#2196F3'),
            alignment=1,  # Center
            backColor=colors.HexColor('#2196F3'),
            textColor=colors.whitesmoke,
            borderPadding=10
        )
        
        story.append(Paragraph(
            "Thank you for your business with YAROTECH Network Limited!",
            footer_style
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer

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
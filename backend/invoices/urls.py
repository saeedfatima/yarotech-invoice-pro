from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'customers', views.CustomerViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'sales', views.SaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/status/', views.auth_status, name='auth_status'),
    path('auth/signin/', views.auth_signin, name='auth_signin'),
    path('auth/signup/', views.auth_signup, name='auth_signup'),
    path('auth/signout/', views.auth_signout, name='auth_signout'),
]
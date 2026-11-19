from django.urls import path

from .views import PortfolioProfileView, PortfolioView

urlpatterns = [
    path('portfolio/', PortfolioView.as_view(), name='portfolio'),
    path('portfolio/profile/', PortfolioProfileView.as_view(), name='portfolio-profile'),
]

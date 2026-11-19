from rest_framework.routers import SimpleRouter

from .views import StatisticViewSet

router = SimpleRouter()
router.register('statistics', StatisticViewSet, basename='statistic')
urlpatterns = router.urls

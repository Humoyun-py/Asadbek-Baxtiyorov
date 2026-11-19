from rest_framework.routers import SimpleRouter

from .views import CampaignStatisticViewSet, CampaignViewSet

router = SimpleRouter()
router.register('campaigns', CampaignViewSet, basename='campaign')
router.register('campaign-statistics', CampaignStatisticViewSet, basename='campaign-statistic')
urlpatterns = router.urls

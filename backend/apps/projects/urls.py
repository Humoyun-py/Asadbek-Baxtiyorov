from rest_framework.routers import SimpleRouter

from .views import ProjectCategoryViewSet, ProjectViewSet

router = SimpleRouter()
router.register('project-categories', ProjectCategoryViewSet, basename='project-category')
router.register('projects', ProjectViewSet, basename='project')
urlpatterns = router.urls

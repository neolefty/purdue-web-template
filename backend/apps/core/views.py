"""
Core views for serving the React app
"""
from django.views.generic import TemplateView
from django.conf import settings


class ReactAppView(TemplateView):
    """
    Serve the React app
    """
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['debug'] = settings.DEBUG
        context['auth_method'] = settings.AUTH_METHOD
        return context
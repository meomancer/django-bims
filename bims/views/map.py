# coding=utf-8
from django.views.generic import TemplateView
from bims.utils.get_key import get_key
from bims.models.biological_collection_record import BiologicalCollectionRecord


class MapPageView(TemplateView):
    """Template view for map page"""
    template_name = 'map.html'

    def get_context_data(self, **kwargs):
        """Get the context data which is passed to a template.

        :param kwargs: Any arguments to pass to the superclass.
        :type kwargs: dict

        :returns: Context data which will be passed to the template.
        :rtype: dict
        """
        context = super(MapPageView, self).get_context_data(**kwargs)
        context['bing_map_key'] = get_key('BING_MAP_KEY')
        context['map_tiler_key'] = get_key('MAP_TILER_KEY')
        context['geocontext_url'] = get_key('GEOCONTEXT_URL')
        context['collectors'] = \
            BiologicalCollectionRecord.objects.all().values_list(
                'collector', flat=True).distinct().order_by('collector')
        return context

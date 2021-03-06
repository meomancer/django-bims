import json
from rest_framework import serializers
from bims.models.location_site import LocationSite
from bims.serializers.location_site_serializer import LocationSiteSerializer
from bims.enums.taxonomic_rank import TaxonomicRank


class LocationSiteDetailSerializer(LocationSiteSerializer):
    """
    Serializer for location site detail.
    """
    geometry = serializers.SerializerMethodField()
    location_context_document_json = serializers.SerializerMethodField()

    def get_geometry(self, obj):
        geometry = obj.get_geometry()
        if geometry:
            return obj.get_geometry().json
        return ''

    def get_location_context_document_json(self, obj):
        if obj.location_context:
            return json.loads(obj.location_context)
        else:
            return {}

    class Meta:
        model = LocationSite
        fields = [
            'id',
            'name',
            'geometry',
            'location_type',
            'location_context_document_json',
            'refined_geomorphological',
        ]

    def get_site_detail_info(self, obj):
        site_coordinates = "{latitude}, {longitude}".format(
            latitude=round(obj.geometry_point.x, 3),
            longitude=round(obj.geometry_point.y, 3))

        def parse_string(string_in):
            return "Unknown" if not string_in else string_in

        try:
            river_name = parse_string(obj.river.name)
        except AttributeError:
            river_name = 'Unknown'
        site_detail_info = {
            'fbis_site_code': parse_string(obj.site_code),
            'site_coordinates': parse_string(site_coordinates),
            'site_description': parse_string(obj.site_description),
            'river': river_name
        }
        return site_detail_info

    def get_class_from_taxonomy(self, taxonomy):
        if taxonomy.rank != TaxonomicRank.CLASS.name:
            if taxonomy.parent:
                return self.get_class_from_taxonomy(taxonomy.parent)
        else:
            return taxonomy.canonical_name
        return None

    def get_site_climate_data(self, context_document):
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                  'Sep', 'Oct', 'Nov', 'Dec']
        site_climate_data = {}
        site_climate_data['temperature_chart'] = {}
        site_climate_data['temperature_chart']['values'] = []
        site_climate_data['temperature_chart']['keys'] = []
        site_climate_data['rainfall_chart'] = {}
        site_climate_data['rainfall_chart']['values'] = []
        site_climate_data['rainfall_chart']['keys'] = []

        if context_document:
            context_document_dictionary = json.loads(context_document)
            monthly_annual_temperature_values = (
                context_document_dictionary
                ['context_group_values']
                ['monthly_mean_daily_average_temperature_group']
                ['service_registry_values'])
            monthly_annual_rainfall_values = (
                context_document_dictionary
                ['context_group_values']
                ['rainfall_group']
                ['service_registry_values'])
            count = 0
            for month_temperature in \
                monthly_annual_temperature_values.iteritems():
                site_climate_data['temperature_chart']['values'].append(round(
                    month_temperature[1]['value'], 2))
                site_climate_data['temperature_chart']['keys'].append(
                    str(months[count]))
                count += 1
            count = 0

            for month_rainfall in monthly_annual_rainfall_values.iteritems():
                site_climate_data['rainfall_chart']['values'].append(round(
                    month_rainfall[1]['value'], 2))
                site_climate_data['rainfall_chart']['keys'].append(
                    str(months[count]))
                count += 1
        site_climate_data['temperature_chart']['title'] = 'Annual Temperature'
        site_climate_data['rainfall_chart']['title'] = 'Annual Rainfall'
        return site_climate_data

    def to_representation(self, instance):
        result = super(
            LocationSiteDetailSerializer, self).to_representation(
            instance)
        records_occurrence = {}
        try:
            climate_data = self.get_site_climate_data(
                instance.location_context)
        except KeyError:
            climate_data = {}
        try:
            site_detail_info = self.get_site_detail_info(instance)
        except KeyError:
            site_detail_info = {}

        result['climate_data'] = climate_data
        result['records_occurrence'] = records_occurrence
        result['site_detail_info'] = site_detail_info

        return result

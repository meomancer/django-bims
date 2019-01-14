# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from sass.scripts.fbis_user_importer import FbisUserImporter
from sass.scripts.fbis_site_importer import FbisSiteImporter
from sass.scripts.fbis_river_importer import FbisRiverImporter
from sass.scripts.fbis_site_visit_importer import FbisSiteVisitImporter
from sass.scripts.fbis_sass_biotope_importer import FbisSassBiotopeImporter
from sass.scripts.fbis_rate_importer import FbisRateImporter
from sass.scripts.fbis_site_visit_sass_biotope_importer import (
    FbisSiteVisitSassBiotopeImporter
)
from sass.scripts.fbis_taxon_importer import FbisTaxonImporter
from sass.scripts.fbis_taxon_group_importer import FbisTaxonGroupImporter


class Command(BaseCommand):
    help = 'Migrate data from fbis database'
    import_scripts = {
        'user': FbisUserImporter,
        'site': FbisSiteImporter,
        'river': FbisRiverImporter,
        'site_visit': FbisSiteVisitImporter,
        'sass_biotope': FbisSassBiotopeImporter,
        'rate': FbisRateImporter,
        'site_visit_sass_biotope': FbisSiteVisitSassBiotopeImporter,
        'taxon_group': FbisTaxonGroupImporter,
        'taxon': FbisTaxonImporter
    }

    def add_arguments(self, parser):
        parser.add_argument(
            '-f',
            '--accdb-file',
            dest='accdb_file',
            default=None,
            help='Accessdb filename'
        )
        parser.add_argument(
            '-t',
            '--table',
            dest='table_name',
            default=None,
            help='Accessdb table to be imported'
        )

    def handle(self, *args, **options):
        # check if file exists
        accdb_filename = options.get('accdb_file', None)
        accdb_table = options.get('table_name', None)

        if not accdb_filename:
            print('You need to provide a name for accessdb file')
            return

        if not accdb_table:
            print('Import all table')
            for table_name in self.import_scripts:
                print('Import %s' % table_name)
                self.import_scripts[table_name](accdb_filename)
        else:
            accdb_table = accdb_table.lower()
            if accdb_table in self.import_scripts:
                print('Import %s table' % accdb_table)
                importer = self.import_scripts[accdb_table](accdb_filename)
                importer.import_data()
            else:
                print('Table %s not found' % accdb_table)

# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-01-17 07:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('bims', '0107_biologicalcollectionrecord_source_collection'),
        ('sass', '0023_sitevisitchem'),
    ]

    operations = [
        migrations.CreateModel(
            name='SASS5Sheet',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('rhp_site_code', models.CharField(blank=True, max_length=10, null=True)),
                ('collector_sampler', models.CharField(blank=True, max_length=255, null=True)),
                ('temp_centigrade', models.FloatField(blank=True, null=True)),
                ('ph', models.FloatField(blank=True, null=True)),
                ('do_mg_per_litre', models.FloatField(blank=True, null=True)),
                ('flow', models.FloatField(blank=True, null=True)),
                ('riparian_disturbance', models.CharField(blank=True, max_length=100, null=True)),
                ('instream_disturbance', models.CharField(blank=True, max_length=100, null=True)),
                ('zonation', models.CharField(blank=True, max_length=100, null=True)),
                ('biotype_stones_in_current', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_stones_out_of_current', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_bedrock', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_aquatic_vegetation', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_margin_veg_in_current', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_margin_veg_out_of_current', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_gravel', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_sand', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_mud', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('biotype_hand_picking', models.CharField(blank=True, choices=[(b'RATING_1', b'1'), (b'RATING_2', b'2'), (b'RATING_3', b'3'), (b'RATING_4', b'4'), (b'RATING_5', b'5')], max_length=10, null=True)),
                ('time_minutes', models.IntegerField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('other_biota', models.TextField(blank=True, null=True)),
                ('sass_score', models.FloatField(blank=True, null=True)),
                ('location_site', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='bims.LocationSite')),
            ],
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-02-03 09:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bims', '0110_auto_20190203_0849'),
    ]

    operations = [
        migrations.AddField(
            model_name='rivercatchment',
            name='location_sites',
            field=models.ManyToManyField(blank=True, null=True, related_name='location_sites', to='bims.LocationSite'),
        ),
    ]
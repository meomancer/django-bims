define(['shared', 'backbone', 'underscore', 'jquery', 'ol', 'views/layer_style'], function (Shared, Backbone, _, $, ol, LayerStyle) {
    return Backbone.View.extend({
        // source of layers
        biodiversitySource: null,
        highlightVectorSource: null,
        highlightVector: null,
        highlightPinnedVectorSource: null,
        highlightPinnedVector: null,
        layers: {},
        currentAdministrativeLayer: "",
        administrativeKeyword: "Administrative",
        initialLoadBiodiversityLayersToMap: false,
        administrativeLayersName: ["Administrative Provinces", "Administrative Municipals", "Administrative Districts"],
        initialize: function () {
            this.layerStyle = new LayerStyle();
        },
        isBiodiversityLayerLoaded: function () {
            return this.initialLoadBiodiversityLayersToMap
        },
        isBiodiversityLayerShow: function () {
            var $checkbox = $('.layer-selector-input[value="Biodiversity"]');
            if ($checkbox.length === 0) {
                return true
            }
            return $checkbox.is(':checked');
        },
        isAdministrativeLayerSelected: function () {
            var $checkbox = $('.layer-selector-input[value="Administrative"]');
            if ($checkbox.length === 0) {
                return true
            }
            return $checkbox.is(':checked');
        },
        initLayer: function (layer, layerName, visibleInDefault) {
            var layerOptions = layer.getSource()['i'];
            var layerType = layerName;
            if(layerOptions !== null) {
                layerType = layer.getSource()['i']['layers'];
            }
            if (layerName.indexOf(this.administrativeKeyword) >= 0) {
                layerType = layerName;
            }
            this.layers[layerType] = {
                'layer': layer,
                'visibleInDefault': visibleInDefault,
                'layerName': layerName
            };
            if (!visibleInDefault) {
                layer.setVisible(false);
            }
        },
        addBiodiveristyLayersToMap: function (map) {
            var self = this;
            // ---------------------------------
            // HIGHLIGHT PINNED LAYER
            // ---------------------------------
            self.highlightPinnedVectorSource = new ol.source.Vector({});
            self.highlightPinnedVector = new ol.layer.Vector({
                source: self.highlightPinnedVectorSource,
                style: function (feature) {
                    var geom = feature.getGeometry();
                    return self.layerStyle.getPinnedHighlightStyle(geom.getType());
                }
            });
            map.addLayer(self.highlightPinnedVector);

            // ---------------------------------
            // BIODIVERSITY LAYERS
            // ---------------------------------
            self.biodiversitySource = new ol.source.Vector({});
            self.initLayer(new ol.layer.Vector({
                source: self.biodiversitySource,
                style: function (feature) {
                    return self.layerStyle.getBiodiversityStyle(feature);
                }
            }), 'Biodiversity', true);

            if(!self.initialLoadBiodiversityLayersToMap) {
               self.initialLoadBiodiversityLayersToMap = true;
            }

            // RENDER LAYERS
            $.each(self.layers, function (key, value) {
                map.addLayer(value['layer']);
            });

            // ---------------------------------
            // HIGHLIGHT LAYER
            // ---------------------------------
            self.highlightVectorSource = new ol.source.Vector({});
            self.highlightVector = new ol.layer.Vector({
                source: self.highlightVectorSource,
                style: function (feature) {
                    var geom = feature.getGeometry();
                    return self.layerStyle.getHighlightStyle(geom.getType());
                }
            });
            map.addLayer(self.highlightVector);
            this.renderLayers();
        },
        addLayersToMap: function (map) {
            var self = this;
            this.map = map;
            $.ajax({
                type: 'GET',
                url: listNonBiodiversityLayerAPIUrl,
                dataType: 'json',
                success: function (data) {
                    $.each(data.reverse(), function (index, value) {
                        if (value['name'].indexOf(self.administrativeKeyword) >= 0) {
                            return;
                        }
                        var options = {
                            url: value.wms_url,
                            params: {
                                layers: value.wms_layer_name,
                                format: value.wms_format
                            }
                        };
                        self.initLayer(
                            new ol.layer.Tile({
                                source: new ol.source.TileWMS(options)
                            }),
                            value.name, false
                        );
                        self.renderLegend(
                            value.name,
                            options['url'],
                            options['params']['layers'],
                            false
                        );
                    });
                    self.addLayersFromGeonode(map, data);
                },
                error: function (err) {
                    self.addBiodiveristyLayersToMap(map);
                 }
            });
        },
        addLayersFromGeonode: function (map, nonbiodiversityData) {
            // Adding layer from GeoNode, filtering is done by the API
            var default_wms_url =  ogcServerDefaultLocation + 'wms';
            var default_wms_format = 'image/png';
            var self = this;

            $.ajax({
                type: 'GET',
                url: '/api/layers',
                dataType: 'json',
                success: function (data) {

                    $.each(data['objects'].reverse(), function (index, value) {
                        if (value['title'].indexOf(self.administrativeKeyword) >= 0) {
                            return;
                        }
                        var options = {
                            url: default_wms_url,
                            params: {
                                layers: value.typename,
                                format: default_wms_format
                            }
                        };

                        self.initLayer(
                            new ol.layer.Tile({
                                source: new ol.source.TileWMS(options)
                            }),
                            value.title, false
                        );

                        self.renderLegend(
                            value.title,
                            options['url'],
                            options['params']['layers'],
                            false
                        );
                    });

                    self.renderAdministrativeLayer(nonbiodiversityData);
                    self.addBiodiveristyLayersToMap(map);
                    Shared.Dispatcher.trigger('map:reloadXHR');
                }
            })
        },
        changeLayerAdministrative: function (administrative) {
            var self = this;
            if(!self.isAdministrativeLayerSelected()) {
                return false;
            }
            switch (administrative) {
                case 'province':
                    self.currentAdministrativeLayer = self.administrativeLayersName[0];
                    break;
                case 'district':
                    self.currentAdministrativeLayer = self.administrativeLayersName[1];
                    break;
                case 'municipal':
                    self.currentAdministrativeLayer = self.administrativeLayersName[2];
                    break;
            }
            $.each(self.administrativeLayersName, function (idx, layerName) {
                if (self.layers[layerName]) {
                    self.layers[layerName]['layer'].setVisible(false);
                }
            });
            this.changeLayerVisibility(this.administrativeKeyword, true);
        },
        changeLayerVisibility: function (layerName, visible) {
            if (Object.keys(this.layers).length === 0) {
                return false;
            }
            if (layerName !== this.administrativeKeyword) {
                this.layers[layerName]['layer'].setVisible(visible);
            } else {
                if (this.currentAdministrativeLayer in this.layers) {
                    this.layers[this.currentAdministrativeLayer]['layer'].setVisible(visible);
                }
            }
        },
        changeLayerTransparency: function (layername, opacity) {
            if (Object.keys(this.layers).length === 0) {
                return false;
            }
            if (layername !== this.administrativeKeyword) {
                this.layers[layername]['layer'].setOpacity(opacity);
            } else {
                if (this.currentAdministrativeLayer in this.layers) {
                    this.layers[this.currentAdministrativeLayer]['layer'].setOpacity(opacity);
                }
            }
        },
        selectorChanged: function (layerName, selected) {
            if (layerName === "Biodiversity" && this.isBiodiversityLayerLoaded()) {
                Shared.Dispatcher.trigger('map:reloadXHR');
            }
            this.changeLayerVisibility(layerName, selected);

            // show/hide legend
            if (selected) {
                this.getLegendElement(layerName).show();
            } else {
                this.getLegendElement(layerName).hide();
            }
        },
        ol3_checkLayer: function (layer) {
            var res = false;
            for (var i = 0; i < this.map.getLayers().getLength(); i++) {
                //check if layer exists
                if (this.map.getLayers().getArray()[i] === layer) {
                    //if exists, return true
                    res = true;
                }
            }
            return res;
        },
        moveLayerToTop: function (layer) {
            if (layer) {
                if (this.ol3_checkLayer(layer)) {
                    this.map.removeLayer(layer);
                    this.map.getLayers().insertAt(this.map.getLayers().getLength(), layer);
                } else {
                    console.log('not found')
                }
            }
        },
        moveLegendToTop: function (layerName) {
            this.getLegendElement(layerName).detach().prependTo('#map-legend');
        },
        getLegendElement: function (layerName) {
            return $(".control-drop-shadow").find(
                "[data-name='" + layerName + "']");
        },
        renderLegend: function (id, url, layer, visibleDefault) {
            var scr = url + '?request=GetLegendGraphic&format=image/png&width=40&height=40&layer=' + layer;
            if (url.indexOf('.qgs') != -1) {
                scr = url + '&service=WMS&request=GetLegendGraphic&format=image/png&transparent=true&width=40&height=40&layer=' + layer;
            }
            var html =
                '<div data-name="' + id + '" class="legend-row"';
            if (!visibleDefault) {
                html += ' style="display: None"'
            }
            html += '>' +
                '<b>' + id + '</b><br>' +
                '<img src="' + scr + '"></div>';
            $('#map-legend').prepend(html);
        },
        renderAdministrativeLayer: function (data) {
            var self = this;
            var currentIndex = 0;
            $.each(this.administrativeLayersName, function (idx, layerName) {
                $.each(data, function (index, value) {
                    if (value.name !== layerName) {
                        return
                    }
                    var options = {
                        url: value.wms_url,
                        params: {
                            layers: value.wms_layer_name,
                            format: value.wms_format
                        }
                    };
                    var initVisible = false;
                    if (currentIndex === 0) {
                        initVisible = true;
                        self.currentAdministrativeLayer = layerName;
                    }
                    self.initLayer(
                        new ol.layer.Tile({
                            source: new ol.source.TileWMS(options)
                        }),
                        value.name, initVisible
                    );
                    currentIndex += 1;
                    return false;
                });
            });

        },
        renderLayersSelector: function (key, name, visibleInDefault) {
            if ($('.layer-selector-input[value="' + key + '"]').length > 0) {
                return
            }
            var mostTop = 'Biodiversity';
            var selector = '<li class="ui-state-default">' +
                '<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>' +
                '<input type="checkbox" value="' + key + '" class="layer-selector-input" ';
            if (visibleInDefault) {
                selector += 'checked';
            }
            selector += '>';
            if (name === mostTop) {
                selector += '<b>' + name + '</b>';
            } else {
                selector += name;
            }
            selector += '<div class="layer-transparency"></div>';
            selector += '</li>';

            $('#layers-selector').append(selector);
        },
        renderLayers: function () {
            var self = this;
            $(document).ready(function () {
                var keys = Object.keys(self.layers);
                keys.reverse();
                $.each(keys, function (index, key) {
                    var value = self.layers[key];
                    if (value['layerName'].indexOf(self.administrativeKeyword) >= 0) {
                        self.renderLayersSelector('Administrative', 'Administrative', true);
                    } else {
                        self.renderLayersSelector(key, value['layerName'], value['visibleInDefault']);
                    }
                });
                $('.layer-transparency').slider({
                    range: 'max',
                    min: 1,
                    max: 100,
                    value: 100,
                    slide: function (event, ui) {
                        var layername = $(event.target).prev().val();
                        if(!layername) {
                            layername = 'Biodiversity';
                        }
                        self.changeLayerTransparency(layername, ui.value/100);
                    }
                });
                $('.layer-selector-input').change(function (e) {
                    self.selectorChanged($(e.target).val(), $(e.target).is(':checked'))
                });
                $('#layers-selector').sortable({
                    update: function () {
                        $($(".layer-selector-input").get().reverse()).each(function (index, value) {
                            var layerName = $(value).val();
                            if (layerName !== self.administrativeKeyword) {
                                self.moveLayerToTop(
                                    self.layers[layerName]['layer']);
                                self.moveLegendToTop(layerName);
                            } else {
                                $.each(self.administrativeLayersName, function (idx, layerName) {
                                    if (self.layers[layerName]) {
                                        self.moveLayerToTop(
                                            self.layers[layerName]['layer']);
                                        self.moveLegendToTop(layerName);
                                    }
                                });
                            }
                        });
                        self.moveLayerToTop(self.highlightPinnedVector);
                        self.moveLayerToTop(self.highlightVector);
                    }
                });
                $('#map-legend-wrapper').click(function () {
                    if ($(this).hasClass('hide-legend')) {
                        $(this).tooltip('option', 'content', 'Hide Legends');
                        $(this).removeClass('hide-legend');
                        $(this).addClass('show-legend');
                    } else {
                        $(this).tooltip('option', 'content', 'Show Legends');
                        $(this).addClass('hide-legend');
                        $(this).removeClass('show-legend');
                    }
                });
            });
        }
    })
});
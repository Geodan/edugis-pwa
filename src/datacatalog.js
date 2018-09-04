export default 
    [
        {"type": "group", "title": "Referentiekaarten", "sublayers": 
        [
            {"type": "style", "title": "Klokantech Basic (stijl)", "layerInfo": {
                "id" : "klokantechbasic",
                "type" : "style",
                "source" : "styles/openmaptiles/klokantech-basic.json"
            }},
            {"type": "style", "title": "OSM Bright (stijl)", "layerInfo": {
                "id" : "OsmBright",
                "type" : "style",
                "source" : "styles/openmaptiles/osmbright.json"
            }},
            {"type": "style", "title": "Positron (stijl)", "layerInfo": {
                "id" : "Positron",
                "type" : "style",
                "source" : "styles/openmaptiles/positron.json"
            }},
            {"type": "style", "title": "Openstreetmap (stijl)", "layerInfo": {
                "id" : "OsmRaster",
                "type" : "style",
                "source" : "styles/osmraster.json"
            }}
        ]},
        {"type": "group", "title": "WMS", "sublayers": 
        [
            {"type": "layer", "title": "PDOK Luchtfoto", "type":"wms", "layerInfo": {
                    "id" : "pdokluchtfoto",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles" : [
                            "https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&styles=default&layers=Actueel_ortho25&transparent=true"
                        ],
                        "attribution": "PDOK"
                    }
                }
            },
            {"type": "layer", "title": "Blaeu", "type":"wms", "layerInfo": {
                    "id" : "blaeu",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles" : [
                            "http://t1.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/blaeu.map&LAYERS=Nederland%2017e%20eeuw%20(Blaeu)&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A38573&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
                            "http://t2.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/blaeu.map&LAYERS=Nederland%2017e%20eeuw%20(Blaeu)&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A38573&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256"
                        ],
                        "attribution": "Edugis"
                    }
                }
            },
            {"type": "layer", "title": "Fietstocht Bert en Joep", "type":"wms", "layerInfo": {
                    "id" : "fietstocht",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles" : [
                            "https://services.geodan.nl/public/data/my/gws/ZLTO6584XXXX/ows?LAYERS=Route_06330481-61aa-4b74-b76a-33bf23e17acf&FORMAT=image%2Fpng&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICEKEY=3dc8818a-d126-11e7-a442-005056805b87&EXCEPTIONS=INIMAGE&SERVICE=WMS&REQUEST=GetMap&STYLES=&sld=https%3A%2F%2Fservices.geodan.nl%2Fpublic%2Fdocument%2FZLTO6584XXXX%2Fapi%2Fdata%2FZLTO6584XXXX%2Fstyles%2FZLTO6584XXXX_public%3ARoute_06330481-61aa-4b74-b76a-33bf23e17acf%3ARoute_zwart&CRS=EPSG%3A3857&bbox={bbox-epsg-3857}&WIDTH=256&HEIGHT=256"
                        ],
                        "attribution": "StevenF"
                    }
                }
            },            
            {"type": "layer", "title": "Actueel Hoogtebestand NL (DSM)", "type":"wmts", "layerInfo": {
                    "id" : "ahndsm",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles": [
                            "http://t1.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/hoogte.map&amp;&LAYERS=hoogtes&TRANSPARENT=true&FORMAT=image%2Fgif&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A900913&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
                            "http://t2.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/hoogte.map&amp;&LAYERS=hoogtes&TRANSPARENT=true&FORMAT=image%2Fgif&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A900913&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256"
                        ],
                        "attribution": ""
                    }
                }
            }  
        ]},
        {"type": "group", "title": "WMS Service", "sublayers": 
        [
            {"type": "layer", "title": "To do", "layerInfo": {}}
        ]},
        {"type": "group", "title": "WMTS", "sublayers": 
        [
            {"type": "layer", "title": "CBS (mapproxy + qgis)", "type": "wmts", "layerInfo": {
                    "id" : "cbsbevolking2017",
                    "type": "raster",
                    "source": {
                        "type": "raster",
                        "tileSize": 256,
                        "tiles": [
                            "https://saturnus.geodan.nl/mapproxy/cbsbevolking2017/wmts/cbsbevolking2017/spherical_mercator/{z}/{x}/{y}.png"
                        ],
                        "attribution": "&copy; Geodan, CBS"
                    }
                }
            },
            {"type": "layer", "title": "Openstreetmap (wmts)", "type":"wmts", "layerInfo": {
                    "id" : "openstreetmap",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles": [
                            "http://tiles.edugis.nl/mapproxy/osm/tiles/osm_EPSG900913/{z}/{x}/{y}.png?origin=nw"
                        ],
                        "attribution": "&copy; OpenStreetMap contributors"
                    }
                }
            },
            {"type": "layer", "title": "Openstreetmap gray", "type":"wmts", "layerInfo": {
                "id" : "openstreetmapgray",
                "type" : "raster",
                "source" : {
                    "type": "raster",
                    "tileSize" : 256,
                    "tiles": [
                        "https://saturnus.geodan.nl/mapproxy/osm/tiles/osmgrayscale_EPSG900913/{z}/{x}/{y}.png?origin=nw"
                    ],
                    "attribution": "&copy; OpenStreetMap contributors"
                }
            }
        },
            {"type": "layer", "title": "OSM frankrijk (wmts)", "type":"wmts", "layerInfo": {
                    "id" : "osmfr",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles": ["http://tile-c.openstreetmap.fr/hot/{z}/{x}/{y}.png"],
                        "attribution": "&copy; OpenStreetMap contributors"
                    }
                }
            },
            {"type": "layer", "title": "Mapbox satellite", "type":"wmts", "layerInfo": {
                    "id" : "satellite",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "url": "mapbox://mapbox.satellite"
                    }
                }
            },
            {"type": "layer", "title": "Terrein (Geodan Maps)", "type":"wmts", "layerInfo": {
                    "id" : "gmterrain",
                    "type" : "raster",
                    "metadata" : {
                        "insertgeodanmapskey" : "{key}"
                    },
                    "source" : {
                        "metadata" : {
                            "test": true
                        },
                        "type": "raster",
                        "tileSize" : 256,            
                        "tiles": [ "https://acc.geodan.nl/data/geodan/gws/world/streets/wmts/streets/EPSG%3A3857/{z}/{x}/{y}.png?servicekey={key}"],
                        "attribution": "&copy; GeodanMaps"
                    }
                }
            }
        ]},
        {"type": "group", "title": "TMS", "sublayers": 
        [
            {"type": "layer", "title": "To do", "layerInfo": {}}
        ]},
        {"type": "group", "title": "WFS", "sublayers": 
        [
            {"type": "layer", "title": "To do(via mvt proxy?)", "layerInfo": {}}
        ]},
        {"type": "group", "title": "GeoJSON", "sublayers": 
        [
            {"type": "layer", "title": "CBS Gemeenten (2.1 MB)", "layerInfo": {
                "id" : "cbsgemeenten2017",
                "type": "fill",
                "source" : {
                    "type": "geojson",
                    "data": "http://tiles.edugis.nl/geojson/cbsgebiedsindelingen_cbs_gemeente_2017_gegeneraliseerd.json",
                    "attribution": "cbs/pdok"
                },
                "paint": {
                    "fill-color": "#ccc",
                    "fill-opacity": 0.6,
                    "fill-outline-color": "#444"
                }
            }},
            {"type": "layer", "title": "Fietstocht Bert en Joep (punten)", "layerInfo": {
                "id" : "fietstochtpunten",
                "type": "circle",
                "metadata" : {
                    "crs" : "EPSG:3857"
                },
                "source" : {
                    "type": "geojson",
                    "data": "https://research.geodan.nl/cgi-py/getlocationhistory.py?id=3",
                    "attribution": "StevenF"
                },
                "paint": {
                    "circle-radius": 5,
                    "circle-color": "#FA0"
                }
            }},
        ]},
        {"type": "group", "title": "TopoJSON", "sublayers": 
        [
            {"type": "layer", "title": "CBS wijken (1.5 MB)", "layerInfo": {
                "id" : "cbswijken2017",
                "type": "fill",
                "metadata" : {
                    "topojson" : true
                },
                "source" : {
                    "type": "geojson",
                    "data": "http://tiles.edugis.nl/geojson/cbs_wijk_2017_gegeneraliseerd_topojson.json",
                    "attribution": "cbs/pdok"
                },
                "paint": {
                    "fill-color": "#cec",
                    "fill-opacity": 0.6,
                    "fill-outline-color": "#444"
                }
            }}
        ]},
        {"type": "group", "title": "Vector Tile", "sublayers": 
        [
            {"type": "layer", "title": "NL buildings", "layerInfo": 
                {
                    "id": "gebouwkenmerken",
                    "type": "fill",
                    "source": {
                        id: "gebouwkenmerken",
                        type: 'vector',
                        tiles:["https://saturnus.geodan.nl/mvt/gebouwkenmerken/{z}/{x}/{y}.mvt"],
                        minzoom: 13,
                        maxzoom: 18
                    },
                    "source-layer": "gebouwkenmerken",
                    "minzoom": 13,
                    "maxzoom": 24,
                    "layout": {
                      "visibility": "visible"
                    },
                    "paint": {
                      "fill-color": {
                        "property": "pandtype",
                        "type": "categorical",
                        "default": "rgba(44, 127, 184, 1)",
                        "stops": [
                          [
                            "",
                            "rgba(44, 127, 184, 1)"
                          ],
                          [
                            "kantoorpand",
                            "rgba(255, 0, 121, 1)"
                          ],
                          [
                            "tussenwoning",
                            "blue"
                          ],
                          [
                            "winkelgebouw",
                            "rgba(83, 16, 162, 1)"
                          ],
                          [
                            "appartement midden",
                            "rgba(146, 95, 48, 1)"
                          ],
                          [
                            "appartement laag",
                            "rgba(146, 140, 48, 1)"
                          ],
                          [
                            "appartement hoog",
                            "rgba(113, 107, 76, 1)"
                          ],
                          [
                            "schoolgebouw",
                            "rgba(50, 165, 81, 1)"
                          ],
                          [
                            "gemengd gebouw",
                            "rgba(88, 75, 84, 1)"
                          ],
                          [
                            "bijeenkomstgebouw",
                            "rgba(40, 128, 35, 1)"
                          ]
                        ]
                      },
                      "fill-outline-color": "rgba(193, 193, 177, 1)"
                    }
                }
            },
            {"type": "layer", "title": "NL buildings 3D", "layerInfo": {
                "id": "building3D",
                "type": "fill-extrusion",
                "source": {
                    id: "gebouwkenmerken2",
                    type: 'vector',
                    tiles:["https://saturnus.geodan.nl/mvt/gebouwkenmerken/{z}/{x}/{y}.mvt"],
                    minzoom: 13,
                    maxzoom: 18
                },
                "source-layer": "gebouwkenmerken",
                "minzoom": 13,
                "maxzoom": 24,
                "paint": {
                    "fill-extrusion-color": {
                    "property": "pandtype",
                    "type": "categorical",
                    "default": "rgba(44, 127, 184, 1)",
                    "stops": [
                        [
                        "",
                        "rgba(44, 127, 184, 1)"
                        ],
                        [
                        "kantoorpand",
                        "rgba(255, 0, 121, 1)"
                        ],
                        [
                        "tussenwoning",
                        "blue"
                        ],
                        [
                        "winkelgebouw",
                        "rgba(83, 16, 162, 1)"
                        ],
                        [
                        "appartement midden",
                        "rgba(146, 95, 48, 1)"
                        ],
                        [
                        "appartement laag",
                        "rgba(146, 140, 48, 1)"
                        ],
                        [
                        "appartement hoog",
                        "rgba(113, 107, 76, 1)"
                        ],
                        [
                        "schoolgebouw",
                        "rgba(50, 165, 81, 1)"
                        ],
                        [
                        "gemengd gebouw",
                        "rgba(88, 75, 84, 1)"
                        ],
                        [
                        "bijeenkomstgebouw",
                        "rgba(40, 128, 35, 1)"
                        ]
                    ]
                    },
                    "fill-extrusion-height": {
                    "property": "hoogte",
                    "type": "identity"
                    },
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.8
                }
            }}
        ]},
        { "type":"group", "title": "Hoogte rasters (DEM)", "sublayers":
        [
            {"type": "layer", "title": "Mapbox hillshading", "layerInfo": {
                "id": "hillshading",
                "type": "hillshade",
                "source": {
                    "type":"raster-dem",
                    "url": "mapbox://mapbox.terrain-rgb"
                }
            }}
        ]},
        {"type": "group", "title": "Google spreadsheet", "sublayers": 
        [
            {"type": "layer", "title": "Google spreadsheet layer", "layerInfo": {}}
        ]},
        {"type": "group", "title": "CSV", "sublayers": 
        [
            {"type": "layer", "title": "CSV Layer", "layerInfo": {}}
        ]}
];
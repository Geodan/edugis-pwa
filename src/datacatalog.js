export default 
    [
        {"type": "group", "title": "Referentiekaarten", "sublayers": 
        [
            {"type": "reference", "title": "Klokantech Basic (stijl)", "layerInfo": {
                "id" : "klokantechbasic",
                "type" : "style",
                "source" : "styles/openmaptiles/klokantech-basic.json",
                "metadata" : {"reference": true}
            }},
            {"type": "reference", "title": "OSM Bright (stijl)", "layerInfo": {
                "id" : "OsmBright",
                "type" : "style",
                "source" : "styles/openmaptiles/osmbright.json",
                "metadata" : {"reference": true}
            }},
            {"type": "reference", "title": "Positron (stijl)", "layerInfo": {
                "id" : "Positron",
                "type" : "style",
                "source" : "styles/openmaptiles/positron.json",
                "metadata" : {"reference": true}
            }},
            {"type": "reference", "title": "MapBox Streets v8 (stijl)", "layerInfo": {
                "id" : "streets-v8",
                "type" : "style",
                "source" : "mapbox://styles/mapbox/streets-v8",
                "metadata" : {"reference": true}
            }},
            {"type": "reference", "title": "MapBox Streets v9 (stijl)", "layerInfo": {
                "id" : "streets-v9",
                "type" : "style",
                "source" : "mapbox://styles/mapbox/streets-v9",
                "metadata" : {"reference": true}
            }},
            {"type": "reference", "title": "Openstreetmap (stijl)", "layerInfo": {
                "id" : "OsmRaster",
                "type" : "style",
                "source" : "styles/osmraster.json",
                "metadata" : {"reference": true}
            }},
            {"type": "layer", "title": "Streets (Geodan Maps)", "type":"wmts", "layerInfo": {
                "id" : "gmstreets",
                "metadata" : {"reference": true},
                "type" : "raster",
                "source" : {
                    "type": "raster",
                    "tileSize" : 256,            
                    "tiles": [ "https://services.geodan.nl/data/geodan/gws/world/streets/wmts/streets/EPSG%3A3857/{z}/{x}/{y}.png?servicekey={geodanmapskey}"],
                    "attribution": "&copy; GeodanMaps"
                }
            }
        }
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
                            "http://t1.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/blaeu.map&LAYERS=Nederland%2017e%20eeuw%20(Blaeu)&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256",
                            "http://t2.edugis.nl/tiles/tilecache.py?map=maps/edugis/cache/blaeu.map&LAYERS=Nederland%2017e%20eeuw%20(Blaeu)&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256"
                        ],
                        "attribution": "EduGIS"
                    }
                }
            },
            {"type": "layer", "title": "Pico hoogspanningsnet 2018", "type":"wms", "layerInfo": {
                "id" : "hoogspanningsnet_2018",
                "type" : "raster",
                "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles" : [
                            "https://pico.geodan.nl/cgi-bin/qgis_mapserv.fcgi?DPI=120&map=/usr/lib/cgi-bin/projects/Hoogspanningsnet_2018.qgs&layers=Hoogspanningsnet_2018&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256"
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
            },
            {"type": "layer", "title": "Neerslagradar KNMI", "type":"wms", "layerInfo": {
                "id" : "knmineerslag",
                "type" : "raster",
                "source" : {
                    "type": "raster",
                    "tileSize" : 256,
                    "tiles": [
                        "http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=RADNL_OPER_R___25PCPRR_L3_COLOR&WIDTH=1464&HEIGHT=488&CRS=EPSG%3A3857&BBOX={bbox-epsg-3857}&STYLES=rainbow%2Fnearest&FORMAT=image/png&TRANSPARENT=TRUE"                        
                    ],
                    "attribution": "KNMI"
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
            {"type": "layer", "title": "PDOK luchtfoto's (WMST)", "type":"wmts", "layerInfo": {
                    "id" : "pdokluchtfotowmts",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles": [
                            "https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wmts/2016_ortho25/EPSG:3857/{z}/{x}/{y}.jpeg"
                        ],
                        "attribution": "PDOK"
                    }
                },
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
            {"type": "layer", "title": "Streets (Geodan Maps)", "type":"wmts", "layerInfo": {
                    "id" : "gmterrain",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,            
                        "tiles": [ "https://services.geodan.nl/data/geodan/gws/world/streets/wmts/streets/EPSG%3A3857/{z}/{x}/{y}.png?servicekey={geodanmapskey}"],
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
                    "data": "http://tiles.edugis.nl/geojson/cbs2017_wijken_attr.json",
                    "attribution": "cbs/pdok"
                },
                "paint": {
                    'fill-color': {
                        'type': 'exponential',
                        'property': 'bevolkingsdichtheid',
                        'stops': [
                            [0, '#f7fcf0'],
                            [160, '#e0f3db'],
                            [320, '#ccebc5'],
                            [480, '#a8ddb5'],
                            [640, '#7bccc4'],
                            [800, '#4eb3d3'],
                            [960, '#2b8cbe'],
                            [1120, '#0868ac'],
                            [1280, '#084081']
                        ]
                    },
                    "fill-opacity": 0.6,
                    "fill-outline-color": "#444"
                }
            }},
            {"type": "layer", "title": "CBS bevolkingsdichtheid 2.5D", "layerInfo": {
                "id" : "cbswijken2017inwoners",
                "type": "fill-extrusion",
                "metadata" : {
                    "topojson" : true
                },
                "source" : {
                    "type": "geojson",
                    "data": "http://tiles.edugis.nl/geojson/cbs2017_wijken_attr.json",
                    "attribution": "cbs/pdok"
                },
                "paint": {
                    'fill-extrusion-color': {
                        'type': 'exponential',
                        'property': 'bevolkingsdichtheid',
                        'stops': [
                            [0, '#f7fcf0'],
                            [160, '#e0f3db'],
                            [320, '#ccebc5'],
                            [480, '#a8ddb5'],
                            [640, '#7bccc4'],
                            [800, '#4eb3d3'],
                            [960, '#2b8cbe'],
                            [1120, '#0868ac'],
                            [1280, '#084081']
                        ]
                    },
                    "fill-extrusion-opacity": 0.6,
                    "fill-extrusion-height": {
                        "property": "bevolkingsdichtheid",
                        "type": "identity"
                      }
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
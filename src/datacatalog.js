export default 
    [
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
                        "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                     ],
                    "attrubution": "&copy; OpenStreetMap contributors"
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
            {"type": "layer", "title": "To do(?)", "layerInfo": {}}
        ]},
        {"type": "group", "title": "GeoJSON", "sublayers": 
        [
            {"type": "layer", "title": "to do", "layerInfo": {}}
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
        {"type": "group", "title": "Google spreadsheet", "sublayers": 
        [
            {"type": "layer", "title": "Google spreadsheet layer", "layerInfo": {}}
        ]},
        {"type": "group", "title": "CSV", "sublayers": 
        [
            {"type": "layer", "title": "CSV Layer", "layerInfo": {}}
        ]}
];
export default 
    [
        {"type": "group", "title": "WMS", "sublayers": 
        [
            {"type": "layer", "title": "WMS Layer", "type":"wms", "layerInfo": {
                    "id" : "pdokluchtfoto",
                    "type" : "raster",
                    "source" : {
                        "type": "raster",
                        "tileSize" : 256,
                        "tiles" : [
                            "https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&styles=default&layers=Actueel_ortho25"
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
            {"type": "layer", "title": "WMS Capabilities", "layerInfo": {}}
        ]},
        {"type": "group", "title": "WMST", "sublayers": 
        [
            {"type": "layer", "title": "WMST Layer", "type": "wmst", "layerInfo": {
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
            {"type": "layer", "title": "Openstreetmap (wmst)", "type":"wmst", "layerInfo": {
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
            {"type": "layer", "title": "TMS Layer", "layerInfo": {}}
        ]},
        {"type": "group", "title": "WFS", "sublayers": 
        [
            {"type": "layer", "title": "WFS Layer", "layerInfo": {}}
        ]},
        {"type": "group", "title": "GeoJSON", "sublayers": 
        [
            {"type": "layer", "title": "GeoJSON Layer", "layerInfo": {}}
        ]},
        {"type": "group", "title": "Vector Tile", "sublayers": 
        [
            {"type": "layer", "title": "Vector Layer", "layerInfo": {}}
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
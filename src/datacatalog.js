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
                        "attrubution": "PDOK"
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
                }}
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
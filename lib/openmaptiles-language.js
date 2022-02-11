/* @preserve
 * https://github.com/klokantech/openmaptiles-language
 * (c) 2018 Klokan Technologies GmbH
 */
(function() {
    var langFallbackDecorate = function(style, cfg) {
      var layers = style.layers;
      var lf = cfg['layer-filter'];
      var decorators = cfg['decorators'];
      var lfProp = lf[1];
      var lfValues = lf.slice(2);
      let styleid = undefined;
      let styleTitle;
  
      for (var i = layers.length-1; i >= 0; i--) {
        var layer = layers[i];
        if (layer.source !== "openmaptiles") {
          continue;
        }
        if (!styleid && layer.metadata && layer.metadata.styleid) {
          styleid = layer.metadata.styleid;
          styleTitle = layer.metadata.styletitle;
        }
        if(!(
            lf[0]==='in'
            && lfProp==='layout.text-field'
            && layer.layout && layer.layout['text-field']
            && lfValues.indexOf(layer.layout['text-field'])>=0
        )) {
          continue;
        }
        for (var j = decorators.length-1; j >= 0; j--) {
          var decorator = decorators[j];
          var postfix = decorator['layer-name-postfix'] || '';
          postfix = postfix.replace(/(^-+|-+$)/g, '');
  
          if(j>0) {
            var newLayer = JSON.parse(JSON.stringify(layer));
            layer.metadata = Object.assign({}, newLayer.metadata, {"hidelegend": true, "reference": true, "hidelegend": true, "styleid": styleid, "styletitle": styleTitle});
            newLayer.metadata = Object.assign({}, newLayer.metadata, {"hidelegend": false, "reference": true, "styleid": styleid, "styletitle": styleTitle});
            layers.splice(i+1, 0, newLayer);
          } else {
            newLayer = layer;
          }
          newLayer.id += postfix ? '-'+postfix : '';
          newLayer.layout['text-field'] = decorator['layout.text-field'];
          if(newLayer.layout['symbol-placement']==='line') {
            newLayer.layout['text-field'] =
                newLayer.layout['text-field'].replace('\n', ' ');
          }
          var filterPart = decorator['filter-all-part'].concat();
          if(!newLayer.filter) {
            newLayer.filter = filterPart;
          } else if(newLayer.filter[0]=='all') {
            newLayer.filter.push(filterPart);
          } else {
            newLayer.filter = [
              'all',
              newLayer.filter,
              filterPart
            ];
          }
        }
      }
    };
  
    var setStyleMutex = false;
    var origSetStyle = mapboxgl.Map.prototype.setStyle;
    mapboxgl.Map.prototype.setStyle = function() {
  
      if (!setStyleMutex) {
        if (this.styleUndecorated) {
          this.styleUndecorated = undefined;
        }
        this.once('style.load', function() {
          if (this.languageOptions) {
            this.setLanguage(
              this.languageOptions.language,
              this.languageOptions.noAlt
            );
          }
        }.bind(this));
      }
      origSetStyle.apply(this, arguments);
    };
  
    mapboxgl.Map.prototype.setLanguage = function(language, noAlt) {
      this.languageOptions = {
        language: language,
        noAlt: noAlt
      };
      if (!this.styleUndecorated) {
        try {
          this.styleUndecorated = this.getStyle();
          if (this.styleUndecorated.layers.length === 0) {
            this.styleUndecorated = undefined;
          }
        } catch (e) {
          this.styleUndecorated = undefined;
        }
      }
      if (!this.styleUndecorated) {
        return;
      }
  
      var isNonlatin = [
        'ar', 'hy', 'be', 'bg', 'zh', 'ka', 'el', 'he',
        'ja', 'ja_kana', 'kn', 'kk', 'ko', 'mk', 'ru', 'sr',
        'th', 'uk'
      ].indexOf(language) >= 0;
  
      var style = JSON.parse(JSON.stringify(this.styleUndecorated));
      var langCfg = {
        "layer-filter": [
          "in",
          "layout.text-field",
          "{name}",
          "{name_de}",
          "{name_en}",
          "{name:latin}",
          "{name:latin} {name:nonlatin}",
          "{name:latin}\n{name:nonlatin}"
        ],
        "decorators": [
          {
            "layout.text-field": "{name:latin}" + (noAlt ? "" : "\n{name:nonlatin}"),
            "filter-all-part": [
              "!has",
              "name:" + language
            ]
          },
          {
            "layer-name-postfix": language,
            "layout.text-field": "{name:" + language + "}" + (noAlt ? "" : "\n{name:" + (isNonlatin ? 'latin' : 'nonlatin') + "}"),
            "filter-all-part": [
              "has",
              "name:" + language
            ]
          }
        ]
      };
      if (language == 'native') {
        langCfg['decorators'] = [
          {
            "layout.text-field": "{name}",
            "filter-all-part": ["all"]
          }
        ];
      }
      langFallbackDecorate(style, langCfg);
  
      setStyleMutex = true;
      for (const styleLayer of style.layers) {
        if (styleLayer.metadata && styleLayer.metadata.hidelegend) {
          const mapLayer = this.getLayer(styleLayer.id);
          if (mapLayer) {
            if (mapLayer.metadata) {
              mapLayer.metadata.hidelegend = true;
            } else {
              mapLayer.metadata = {hidelegend:true};
            }
          }
        }
      }
      this.setStyle(style);
      setStyleMutex = false;
    };
  
    mapboxgl.Map.prototype.autodetectLanguage = function(opt_fallback) {
      this.setLanguage(navigator.language.split('-')[0] || opt_fallback || 'native');
    };
  })();
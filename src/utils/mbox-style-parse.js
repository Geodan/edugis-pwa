class MBStyleParser
{
    getZoomDependentValue(zoom, value) {
        let result = value;
        if (Array.isArray(value) && value.length > 4 && value[0] === "interpolate" && Array.isArray(value[2]) && value[2][0] === "zoom") {      
          for (let i = 3; i < value.length - 1; i+=2) {
            result = value[i+1];
            if (zoom < value[i]) {
              break;
            } 
          }
        } else if (value === Object(value)) {
          if (value.stops && !value.hasOwnProperty('property')) {
            for (let i = 0; i < value.stops.length; i++) {
              result = value.stops[i][1];
              if (zoom < value.stops[i][0]) {
                break;
              } 
            }        
          }
        }
        return result;
      }
}

const mbStyleParser = new MBStyleParser();

export default mbStyleParser;


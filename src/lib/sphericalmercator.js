const cache = {};
const EPSLN = 1.0e-10;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
// 900913 properties.
const A = 6378137.0;
const MAXEXTENT = 20037508.342789244;

export class SphericalMercator {

// Closures including constants and other precalculated values.

    isFloat(n){
        return Number(n) === n && n % 1 !== 0;
    }

    // SphericalMercator constructor: precaches calculations
    // for fast tile lookups.
    constructor(options) {
        options = options || {};
        this.size = options.size || 256;
        this.expansion = (options.antimeridian === true) ? 2 : 1;
        if (!cache[this.size]) {
            var size = this.size;
            var c = cache[this.size] = {};
            c.Bc = [];
            c.Cc = [];
            c.zc = [];
            c.Ac = [];
            for (var d = 0; d < 30; d++) {
                c.Bc.push(size / 360);
                c.Cc.push(size / (2 * Math.PI));
                c.zc.push(size / 2);
                c.Ac.push(size);
                size *= 2;
            }
        }
        this.Bc = cache[this.size].Bc;
        this.Cc = cache[this.size].Cc;
        this.zc = cache[this.size].zc;
        this.Ac = cache[this.size].Ac;
    };

    // Convert lon lat to screen pixel value
    //
    // - `ll` {Array} `[lon, lat]` array of geographic coordinates.
    // - `zoom` {Number} zoom level.
    px(ll, zoom) {
        if (this.isFloat(zoom)) {
            var size = this.size * Math.pow(2, zoom);
            var d = size / 2;
            var bc = (size / 360);
            var cc = (size / (2 * Math.PI));
            var ac = size;
            var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
            var x = d + ll[0] * bc;
            var y = d + 0.5 * Math.log((1 + f) / (1 - f)) * -cc;
            (x > ac * this.expansion) && (x = ac * this.expansion);
            (y > ac) && (y = ac);
            //(x < 0) && (x = 0);
            //(y < 0) && (y = 0);
            return [x, y];
        } else {
            var d = this.zc[zoom];
            var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
            var x = Math.round(d + ll[0] * this.Bc[zoom]);
            var y = Math.round(d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]));
            (x > this.Ac[zoom] * this.expansion) && (x = this.Ac[zoom] * this.expansion);
            (y > this.Ac[zoom]) && (y = this.Ac[zoom]);
            //(x < 0) && (x = 0);
            //(y < 0) && (y = 0);
            return [x, y];
        }
    };

    // Convert screen pixel value to lon lat
    //
    // - `px` {Array} `[x, y]` array of geographic coordinates.
    // - `zoom` {Number} zoom level.
    ll (px, zoom) {
        if (this.isFloat(zoom)) {
            var size = this.size * Math.pow(2, zoom);
            var bc = (size / 360);
            var cc = (size / (2 * Math.PI));
            var zc = size / 2;
            var g = (px[1] - zc) / -cc;
            var lon = (px[0] - zc) / bc;
            var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
            return [lon, lat];
        } else {
            var g = (px[1] - this.zc[zoom]) / (-this.Cc[zoom]);
            var lon = (px[0] - this.zc[zoom]) / this.Bc[zoom];
            var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
            return [lon, lat];
        }
    };

    // Convert tile xyz value to bbox of the form `[w, s, e, n]`
    //
    // - `x` {Number} x (longitude) number.
    // - `y` {Number} y (latitude) number.
    // - `zoom` {Number} zoom.
    // - `tms_style` {Boolean} whether to compute using tms-style.
    // - `srs` {String} projection for resulting bbox (WGS84|900913).
    // - `return` {Array} bbox array of values in form `[w, s, e, n]`.
    bbox(x, y, zoom, tms_style, srs) {
        // Convert xyz into bbox with srs WGS84
        if (tms_style) {
            y = (Math.pow(2, zoom) - 1) - y;
        }
        // Use +y to make sure it's a number to avoid inadvertent concatenation.
        var ll = [x * this.size, (+y + 1) * this.size]; // lower left
        // Use +x to make sure it's a number to avoid inadvertent concatenation.
        var ur = [(+x + 1) * this.size, y * this.size]; // upper right
        var bbox = this.ll(ll, zoom).concat(this.ll(ur, zoom));

        // If web mercator requested reproject to 900913.
        if (srs === '900913') {
            return this.convert(bbox, '900913');
        } else {
            return bbox;
        }
    };

    // Convert bbox to xyx bounds
    //
    // - `bbox` {Number} bbox in the form `[w, s, e, n]`.
    // - `zoom` {Number} zoom.
    // - `tms_style` {Boolean} whether to compute using tms-style.
    // - `srs` {String} projection of input bbox (WGS84|900913).
    // - `@return` {Object} XYZ bounds containing minX, maxX, minY, maxY properties.
    xyz(bbox, zoom, tms_style, srs) {
        // If web mercator provided reproject to WGS84.
        if (srs === '900913') {
            bbox = this.convert(bbox, 'WGS84');
        }

        var ll = [bbox[0], bbox[1]]; // lower left
        var ur = [bbox[2], bbox[3]]; // upper right
        var px_ll = this.px(ll, zoom);
        var px_ur = this.px(ur, zoom);
        // Y = 0 for XYZ is the top hence minY uses px_ur[1].
        var x = [ Math.floor(px_ll[0] / this.size), Math.floor((px_ur[0] - 1) / this.size) ];
        var y = [ Math.floor(px_ur[1] / this.size), Math.floor((px_ll[1] - 1) / this.size) ];
        var bounds = {
            minX: Math.min.apply(Math, x) < 0 ? 0 : Math.min.apply(Math, x),
            minY: Math.min.apply(Math, y) < 0 ? 0 : Math.min.apply(Math, y),
            maxX: Math.max.apply(Math, x),
            maxY: Math.max.apply(Math, y)
        };
        if (tms_style) {
            var tms = {
                minY: (Math.pow(2, zoom) - 1) - bounds.maxY,
                maxY: (Math.pow(2, zoom) - 1) - bounds.minY
            };
            bounds.minY = tms.minY;
            bounds.maxY = tms.maxY;
        }
        return bounds;
    };

    // Convert projection of given bbox.
    //
    // - `bbox` {Number} bbox in the form `[w, s, e, n]`.
    // - `to` {String} projection of output bbox (WGS84|900913). Input bbox
    //   assumed to be the "other" projection.
    // - `@return` {Object} bbox with reprojected coordinates.
    convert(bbox, to) {
        if (to === '900913') {
            return this.forward(bbox.slice(0, 2)).concat(this.forward(bbox.slice(2,4)));
        } else {
            return this.inverse(bbox.slice(0, 2)).concat(this.inverse(bbox.slice(2,4)));
        }
    };

    // Convert lon/lat values to 900913 x/y.
    forward(ll) {
        var xy = [
            A * ll[0] * D2R,
            A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * ll[1] * D2R)))
        ];
        // if xy value is beyond maxextent (e.g. poles), return maxextent.
        (xy[0] > MAXEXTENT) && (xy[0] = MAXEXTENT);
        (xy[0] < -MAXEXTENT) && (xy[0] = -MAXEXTENT);
        (xy[1] > MAXEXTENT) && (xy[1] = MAXEXTENT);
        (xy[1] < -MAXEXTENT) && (xy[1] = -MAXEXTENT);
        return xy;
    };

    // Convert 900913 x/y values to lon/lat.
    inverse(xy) {
        return [
            (xy[0] * R2D / A),
            ((Math.PI*0.5) - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D
        ];
    };
}

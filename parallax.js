/* This program is free software. It comes without any warranty, to
* the extent permitted by applicable law. You can redistribute it
* and/or modify it under the terms of the Do What The Fuck You Want
* To Public License, Version 2, as published by Sam Hocevar. See
* http://sam.zoy.org/wtfpl/COPYING for more details. */

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function defaultTo(variable, defaultValue) {
  return (variable === undefined) ? defaultValue : variable;
}

function binarySearch(array, key, comparator) {
  var start = 0;
  var end = array.length - 1;
  while (start <= end) {
    var mid = start + Math.floor((end - start) / 2);
    var compare = comparator(key, array[mid]);
    if (compare == 0) {
      return mid;
    }
    else if (compare < 0) {
      end = mid - 1;
    }
    else {
      start = mid + 1;
    }
  }
  return null;
}

function preloadImages(images, callback) {
  var loadedCount = 0;
  var numberToLoad = 0;
  for (var key in images) {
    ++numberToLoad;
    images[key] = images[key] !== null ? images[key] : new Image();
    images[key].addEventListener("load", (function() {
      if(++loadedCount == numberToLoad) {
        callback();
      }
    }).bind(this), false);
    images[key].src = key;
  }
}

function SubImage(image, x, y, width, height, originX, originY) {
  this.image = image;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.originX = defaultTo(originX, 0);
  this.originY = defaultTo(originY, 0);
}
SubImage.prototype.draw = function(context, x, y) {
  context.drawImage(this.image, this.x, this.y, this.width, this.height, x - this.originX, y - this.originY, this.width, this.height);
};

function SpriteSet(object) {
  var sprites = "sprites" in object ? object.tiles : null;
  this.sprites = [];
  for (var i = 0; i < sprites.length; i++) {
    this.sprites[i] = new SubImage();
  }
}
SpriteSet.prototype.subImage = function(index) {
  return this.sprites[index];
};

function TileSet(object, images) {
  this.image = "image" in object ? images[object.image] : null;
  this.tileWidth = "tilesize" in object && "width" in object.tilesize ? object.tilesize.width : 0;
  this.tileHeight = "tilesize" in object && "height" in object.tilesize ? object.tilesize.height : 0;
  this.tilesWide = "size" in object && "width" in object.size ? object.size.width : Math.floor(image.weight / tileWidth);
  this.tilesHigh = "size" in object && "height" in object.size ? object.size.height : Math.floor(image.height / tileHeight);
  this.originX = "tileorigin" in object && "x" in object.tileorigin ? object.tileorigin.x : 0;
  this.originY = "tileorigin" in object && "y" in object.tileorigin ? object.tileorigin.y : 0;
}
TileSet.prototype.subImage = function(index) {
  return new SubImage(this.image, (index % this.tilesWide) * this.tileWidth, Math.floor(index / this.tilesWide) * this.tileHeight, this.tileWidth, this.tileHeight, this.originX, this.originY);
};

function TileMap(object) {
  this.width = "size" in object && "width" in object.size ? object.size.width : 0;
  this.height = "size" in object && "height" in object.size ? object.size.height : 0;
  var tiles = "tiles" in object ? object.tiles : null;
  var size = this.width * this.height;
  this.tiles = new Array(size);
  if (tiles !== null) {
    for (var i = 0; i < size; i++) {
      this.tiles[i] = tiles[i];
    }
  }
}
TileMap.prototype.address = function(x, y) {
  if (x < 0 || x > this.width || y < 0 || y > this.height) {
    throw RangeError;
  }
  return this.tiles[y * this.width + x];
};

function Frame(index, start, end) {
  this.index = index;
  this.start = start;
  this.end = end;
}

function Sequence(array) {
  this.frames = [];
  this.duration = 0;

  var lastEnd = 0;
  for (var i = 0; i < array.length; i++) {
    var start = this.duration;
    this.duration += array[i][1];
    var end = this.duration;
    this.frames.push(new Frame(array[i][0], start, end));
  }
}
Sequence.comparator = function(tick, frame) {
  return (tick < frame.start) ? -1 : (tick >= frame.end) ? 1 : 0;
}
Sequence.prototype.search = function(tick) {
  return binarySearch(this.frames, tick, Sequence.comparator);
}

function Layer(object) {
  this.x = "position" in object && "x" in object.position ? object.position.x : 0;
  this.y = "position" in object && "y" in object.position ? object.position.y : 0;
  this.originX = "origin" in object && "x" in object.origin ? object.origin.x : 0;
  this.originY = "origin" in object && "y" in object.origin ? object.origin.y : 0;
  this.stepX = "step" in object && "x" in object.step ? object.step.x : 0;
  this.stepY = "step" in object && "y" in object.step ? object.step.y : 0;
  this.wrapX = "wrap" in object && "horizontal" in object.wrap ? object.wrap.horizontal : false;
  this.wrapY = "wrap" in object && "vertical" in object.wrap ? object.wrap.vertical : false;
}
Layer.prototype.draw = function(canvas, context, tick) {
  var bounds = this.bounds();
  var offsetX = Math.round(tick * this.stepX);
  var offsetY = Math.round(tick * this.stepY);
  var xSpans = {start:0, end:1};
  var ySpans = {start:0, end:1};
  if (this.wrapX) {
    xSpans.start = Math.floor((bounds.x - offsetX) / bounds.width);
    xSpans.end = Math.ceil((bounds.x + canvas.width - offsetX) / bounds.width);
  }
  if (this.wrapY) {
    ySpans.start = Math.floor((bounds.y - offsetY) / bounds.height);
    ySpans.end = Math.ceil((bounds.y + canvas.height - offsetY) / bounds.height);
  }
  //if (this instanceof TileMapLayer) {
    //console.log(bounds, xSpans, ySpans);//////////////////////
  //}
  for (var ySpan = ySpans.start; ySpan < ySpans.end; ySpan++) {
    for (var xSpan = xSpans.start; xSpan < xSpans.end; xSpan++) {
      this.drawSpan(canvas, context, tick, offsetX + xSpan * bounds.width, offsetY + ySpan * bounds.height);
    }
  }
};
Layer.prototype.bounds = function() {
  return {x: this.x - this.originX, y:this.y - this.originY, width:0, height:0};
};

function ImageLayer(object, images) {
  Layer.call(this, object);
  this.image = "image" in object ? images[object.image] : null;
}
ImageLayer.prototype = Object.create(Layer.prototype);
ImageLayer.prototype.bounds = function() {
  var bounds = Layer.prototype.bounds.call(this);
  bounds.width = this.image.width;
  bounds.height = this.image.height;
  return bounds;
};
ImageLayer.prototype.drawSpan = function(canvas, context, tick, x, y) {
  var subImage = new SubImage(this.image, 0, 0, this.image.width, this.image.height, this.originX, this.originY);
  subImage.draw(context, this.x + x, this.y + y);
};

function TileLayer(object, tileSets) {
  Layer.call(this, object);
  this.tileSet = "tileset" in object ? tileSets[object.tileset] : null;
  this.index = "index" in object ? new sceneLayer.index : 0;
  this.sequence = "sequence" in object ? new Sequence(object.sequence) : null;
}
TileLayer.prototype = Object.create(Layer.prototype);
TileLayer.prototype.bounds = function() {
  var bounds = Layer.prototype.bounds.call(this);
  bounds.x -= this.tileSet.originX;
  bounds.y -= this.tileSet.originY;
  bounds.width = this.tileSet.tileWidth;
  bounds.height = this.tileSet.tileHeight;
  return bounds;
};
TileLayer.prototype.drawSpan = function(canvas, context, tick, x, y) {
  var subImage = null;
  if (this.sequence !== null) {
    var frameNumber = this.sequence.frames[this.sequence.search(tick % this.sequence.duration)].index;
    if (frameNumber !== null && this.tileSet !== null) {
      subImage = this.tileSet.subImage(frameNumber);
    }
  }
  else {
    subImage = this.tileSet.subImage(this.index);
  }
  if (subImage !== null) {
    subImage.draw(context, this.x + x, this.y + y);
  }
};

function TileMapLayer(object, tileSets, tileMaps) {
  Layer.call(this, object);
  this.tileSet = "tileset" in object ? tileSets[object.tileset] : null;
  this.tileMap = "tilemap" in object ? tileMaps[object.tilemap] : null;
}
TileMapLayer.prototype = Object.create(Layer.prototype);
TileMapLayer.prototype.bounds = function() {
  var bounds = Layer.prototype.bounds.call(this);
  bounds.width = this.tileMap.width * this.tileSet.tileWidth;
  bounds.height = this.tileMap.height * this.tileSet.tileHeight;
  return bounds;
};
TileMapLayer.prototype.drawSpan = function(canvas, context, tick, x, y) {
  var offsetX = Math.round(this.x + x + -this.tileSet.originX);
  var offsetY = Math.round(this.y + y + -this.tileSet.originY);

  var xTiles = {
    start:Math.max(0, Math.floor(-offsetX / this.tileSet.tileWidth)),
    end:Math.min(Math.ceil((-offsetX + canvas.width) / this.tileSet.tileWidth), this.tileMap.width)
  };
  var yTiles = {
    start:Math.max(0, Math.floor(-offsetY / this.tileSet.tileHeight)),
    end:Math.min(Math.ceil((-offsetY + canvas.height) / this.tileSet.tileHeight), this.tileMap.height)
  };

  //console.log(xTiles, yTiles);
  for (var tileY = yTiles.start; tileY < yTiles.end; tileY++) {
    for (var tileX = xTiles.start; tileX < xTiles.end; tileX++) {
      var subImage = this.tileSet.subImage(this.tileMap.address(tileX, tileY));
      subImage.draw(context, offsetX + tileX * this.tileSet.tileWidth + this.tileSet.originX, offsetY + tileY * this.tileSet.tileHeight + this.tileSet.originY);
    }
  }
};

function Parallax() {
  this.images = {};
  this.tileSets = {};
  this.tileMaps = {};
  this.layers = [];
}
Parallax.prototype.load = function(stage, scene, callback) {
  switch (stage) {
    case 0: { // preload images
      var toLoad = {};
      // image list images
      if ("images" in scene) {
        for (var i = 0; i < scene.images.length; i++) {
          var image = scene.images[i];
          // allocate image
          if (!(image.image in this.images)) {
            this.images[image.image] = new Image();
            toLoad[image.image] = this.images[image.image];
          }
          // assign aliases
          // image id
          if ("id" in image && !(image.id in this.images)) {
            this.images[image.id] = this.images[image.image];
          }
          // image list index
          this.images[i] = this.images[image.image];
        }
      }
      // tileset images
      if ("tilesets" in scene) {
        for (var i = 0; i < scene.tilesets.length; i++) {
          var sceneTileset = scene.tilesets[i];
          if (!(sceneTileset.image in this.images)) {
            this.images[sceneTileset.image] = new Image();
            toLoad[sceneTileset.image] = this.images[sceneTileset.image];
          }
        }
      }
      // layer images
      if ("layers" in scene) {
        for (var i = 0; i < scene.layers.length; i++) {
          var sceneLayer = scene.layers[i];
          if ("image" in sceneLayer && !(sceneLayer.image in this.images)) {
            this.images[sceneLayer.image] = new Image();
            toLoad[sceneLayer.image] = this.images[sceneLayer.image];
          }
        }
      }
      preloadImages(toLoad, this.load.bind(this, 1, scene, callback));
    } break;

    case 1: { // process scene
      // process tilesets
      if ("tilesets" in scene) {
        for (var i = 0; i < scene.tilesets.length; i++) {
          var sceneTileSet = scene.tilesets[i];
          var tileSet = new TileSet(sceneTileSet, this.images);
          // assign aliases
          // image id
          if ("id" in sceneTileSet && !(sceneTileSet.id in this.tileSets)) {
            this.tileSets[sceneTileSet.id] = tileSet;
          }
          // tileset list index
          this.tileSets[i] = tileSet;
        }
      }
      // process tilemaps
      if ("tilemaps" in scene) {
        for (var i = 0; i < scene.tilemaps.length; i++) {
          var sceneTileMap = scene.tilemaps[i];
          var tileMap = new TileMap(sceneTileMap);
          // assign aliases
          // image id
          if ("id" in sceneTileMap && !(sceneTileMap.id in this.tileMaps)) {
            this.tileMaps[sceneTileMap.id] = tileMap;
          }
          // tilemap list index
          this.tileMaps[i] = tileMap;
        }
      }
      // process layers
      if ("layers" in scene) {
        for (var i = 0; i < scene.layers.length; i++) {
          var sceneLayer = scene.layers[i];
          var layer;
          switch (sceneLayer.type) {
            case "image": {
              layer = new ImageLayer(sceneLayer, this.images);
            } break;
            case "tile": {
              layer = new TileLayer(sceneLayer, this.tileSets);
            } break;
            case "tilemap": {
              layer = new TileMapLayer(sceneLayer, this.tileSets, this.tileMaps);
            } break;
          }
          this.layers.push(layer);
        }
      }
      callback();
    } break;
  }
};
Parallax.prototype.draw = function(canvas, context, tick, lastTimestamp, timestamp) {
  if (lastTimestamp[0] === null || timestamp != lastTimestamp[0]) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      layer.draw(canvas, context, tick);
    }
    lastTimestamp[0] = timestamp;
  }
};
Parallax.prototype.loop = function(canvas, context, tick, lastTimestep) {
  window.requestAnimationFrame(this.draw.bind(this, canvas, context, tick[0], lastTimestep));
  tick[0]++;
};
Parallax.prototype.show = function(scene, canvas) {
  if ("viewport" in scene) {
    canvas.width = "width" in scene.viewport ? scene.viewport.width : canvas.width;
    canvas.height = "height" in scene.viewport ? scene.viewport.height : canvas.height;
    if ("zoom" in scene.viewport) {
      canvas.style.width = scene.viewport.width * scene.viewport.zoom;
      canvas.style.height = scene.viewport.height * scene.viewport.zoom;
    }
  }
  this.load(0, scene, function() {
    window.setInterval(this.loop.bind(this, canvas, canvas.getContext("2d"), [0], [null]), 1000 / scene.framerate);
  }.bind(this));
};

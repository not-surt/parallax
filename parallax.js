/* This program is free software. It comes without any warranty, to
* the extent permitted by applicable law. You can redistribute it
* and/or modify it under the terms of the Do What The Fuck You Want
* To Public License, Version 2, as published by Sam Hocevar. See
* http://sam.zoy.org/wtfpl/COPYING for more details. */

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
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

function Sequence(array) {
  this.frames = [];
  this.duration = 0;

  var lastEnd = 0;
  for (var i = 0; i < array.length; i++) {
    var start = this.duration;
    this.duration += array[i][1];
    var end = this.duration;
    this.frames.push(new Sequence.Frame(array[i][0], start, end));
  }
}
Sequence.Frame = function(index, start, end) {
  this.index = index;
  this.start = start;
  this.end = end;
};
Sequence.comparator = function(tick, frame) {
  return (tick < frame.start) ? -1 : (tick >= frame.end) ? 1 : 0;
}
Sequence.prototype.search = function(tick) {
  return binarySearch(this.frames, tick, Sequence.comparator);
}

function Region(x, y, width, height, originX, originY) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.originX = (originX === undefined) ? 0 : originX;
  this.originY = (originY === undefined) ? 0 : originY;
}

function SubImage(image, x, y, width, height, originX, originY) {
  Region.call(this, x, y, width, height, originX, originY);
  this.image = image;
}
SubImage.prototype = Object.create(Region.prototype);
SubImage.prototype.draw = function(context, x, y) {
  context.drawImage(this.image, this.x, this.y, this.width, this.height, x - this.originX, y - this.originY, this.width, this.height);
};

function Sprite(object) {
  var x = "position" in object && "x" in object.position ? object.position.x : 0;
  var y = "position" in object && "y" in object.position ? object.position.y : 0;
  var width = "size" in object && "width" in object.position ? object.size.width : 0;
  var height = "size" in object && "height" in object.position ? object.size.height : 0;
  var originX = "origin" in object && "x" in object.origin ? object.origin.x : 0;
  var originY = "origin" in object && "y" in object.origin ? object.origin.y : 0;
  Region.call(this, x, y, width, height, originX, originY);
}
Sprite.prototype = Object.create(Region.prototype);

function SpriteSheet(object, images) {
  this.image = "image" in object ? images[object.image] : null;
  var sprites = "sprites" in object ? object.tiles : null;
  this.sprites = [];
  this.sequences = {};
  if ("sprites" in object) {
    for (var i = 0; i < object.sprites.length; i++) {
      this.sprites.push(new Sprite(object.sprites[i]));
    }
  }
  if ("sequences" in object) {
    for (key in object.sequences) {
      this.sequences[key] = new Sequence(object.sequences[key]);
    }
  }
}
SpriteSheet.prototype.subImage = function(index) {
  return this.sprites[index];
};

function SpriteObject(object) {
  this.index = "index" in object ? object.index : null;
  this.sequence = "sequence" in object ? object.sequence : null;
  this.width = "size" in object && "width" in object.size ? object.size.width : 0;
  this.height = "size" in object && "height" in object.size ? object.size.height : 0;
}

function SpriteMap(object) {
  this.width = "size" in object && "width" in object.size ? object.size.width : 0;
  this.height = "size" in object && "height" in object.size ? object.size.height : 0;
  this.sprites = [];
  var sprites = "sprites" in object ? object.sprites : null;
  if (sprites !== null) {
    for (var i = 0; i < sprites.length; i++) {
      this.sprites.push(new SpriteObject(sprites[i]));
    }
  }
  console.log(this);
}

function TileSheet(object, images) {
  this.image = "image" in object ? images[object.image] : null;
  this.tileWidth = "tilesize" in object && "width" in object.tilesize ? object.tilesize.width : 0;
  this.tileHeight = "tilesize" in object && "height" in object.tilesize ? object.tilesize.height : 0;
  this.tilesWide = "size" in object && "width" in object.size ? object.size.width : Math.floor(image.weight / tileWidth);
  this.tilesHigh = "size" in object && "height" in object.size ? object.size.height : Math.floor(image.height / tileHeight);
  this.originX = "tileorigin" in object && "x" in object.tileorigin ? object.tileorigin.x : 0;
  this.originY = "tileorigin" in object && "y" in object.tileorigin ? object.tileorigin.y : 0;
  this.sequences = {};
  if ("sequences" in object) {
    for (key in object.sequences) {
      this.sequences[key] = new Sequence(object.sequences[key]);
    }
  }
}
TileSheet.prototype.subImage = function(index, tick) {
  tick = tick !== undefined ? tick : 0;
  if (index in this.sequences) {
    var sequence = this.sequences[index];
    index = index + sequence.frames[sequence.search(tick % sequence.duration)].index;
  }
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
Layer.prototype.bounds = function() {
  return {x: this.x - this.originX, y:this.y - this.originY, width:0, height:0};
};
Layer.prototype.draw = function(canvas, context, tick) {
  var bounds = this.bounds();
  var offsetX = Math.round(tick * this.stepX);
  var offsetY = Math.round(tick * this.stepY);
  var xSpans = {start:0, end:1};
  var ySpans = {start:0, end:1};
  if (this.wrapX) {
    xSpans.start = Math.floor((-bounds.x  - offsetX) / bounds.width);
    xSpans.end = Math.ceil((-bounds.x + canvas.width - offsetX) / bounds.width);
  }
  if (this.wrapY) {
    ySpans.start = Math.floor((-bounds.y - offsetY) / bounds.height);
    ySpans.end = Math.ceil((-bounds.y + canvas.height - offsetY) / bounds.height);
  }
  for (var ySpan = ySpans.start; ySpan < ySpans.end; ySpan++) {
    for (var xSpan = xSpans.start; xSpan < xSpans.end; xSpan++) {
      this.drawSpan(canvas, context, tick, offsetX + xSpan * bounds.width, offsetY + ySpan * bounds.height);
      //context.fillStyle="#0000FF";
      //context.strokeRect(bounds.x + xSpan * bounds.width + offsetX, bounds.y + ySpan * bounds.height + offsetY, bounds.width, bounds.height);
    }
  }
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

function TileLayer(object, tileSheets) {
  Layer.call(this, object);
  this.tileSheet = "tileset" in object ? tileSheets[object.tileset] : null;
  this.index = "index" in object ? new sceneLayer.index : 0;
  this.sequence = "sequence" in object ? new Sequence(object.sequence) : null;
}
TileLayer.prototype = Object.create(Layer.prototype);
TileLayer.prototype.bounds = function() {
  var bounds = Layer.prototype.bounds.call(this);
  bounds.x -= this.tileSheet.originX;
  bounds.y -= this.tileSheet.originY;
  bounds.width = this.tileSheet.tileWidth;
  bounds.height = this.tileSheet.tileHeight;
  return bounds;
};
TileLayer.prototype.drawSpan = function(canvas, context, tick, x, y) {
  var subImage = null;
  if (this.sequence !== null) {
    var frameNumber = this.sequence.frames[this.sequence.search(tick % this.sequence.duration)].index;
    if (frameNumber !== null && this.tileSheet !== null) {
      subImage = this.tileSheet.subImage(frameNumber);
    }
  }
  else {
    subImage = this.tileSheet.subImage(this.index);
  }
  if (subImage !== null) {
    subImage.draw(context, this.x + -this.originX + x, this.y + -this.originY + y);
  }
};

function TileMapLayer(object, tileSheets, tileMaps) {
  Layer.call(this, object);
  this.tileSheet = "tileset" in object ? tileSheets[object.tileset] : null;
  this.tileMap = "tilemap" in object ? tileMaps[object.tilemap] : null;
}
TileMapLayer.prototype = Object.create(Layer.prototype);
TileMapLayer.prototype.bounds = function() {
  var bounds = Layer.prototype.bounds.call(this);
  bounds.x -= this.tileSheet.originX;
  bounds.y -= this.tileSheet.originY;
  bounds.width = this.tileMap.width * this.tileSheet.tileWidth;
  bounds.height = this.tileMap.height * this.tileSheet.tileHeight;
  return bounds;
};
TileMapLayer.prototype.drawSpan = function(canvas, context, tick, x, y) {
  var offsetX = Math.round(this.x + x + -this.originX);
  var offsetY = Math.round(this.y + y + -this.originY);

  var xTiles = {
    start:Math.max(0, Math.floor((-offsetX) / this.tileSheet.tileWidth)),
    end:Math.min(Math.ceil((-offsetX + canvas.width) / this.tileSheet.tileWidth), this.tileMap.width)
  };
  var yTiles = {
    start:Math.max(0, Math.floor((-offsetY) / this.tileSheet.tileHeight)),
    end:Math.min(Math.ceil((-offsetY + canvas.height) / this.tileSheet.tileHeight), this.tileMap.height)
  };
  for (var tileY = yTiles.start; tileY < yTiles.end; tileY++) {
    for (var tileX = xTiles.start; tileX < xTiles.end; tileX++) {
      var subImage = this.tileSheet.subImage(this.tileMap.address(tileX, tileY), tick);
      subImage.draw(context,
        offsetX + tileX * this.tileSheet.tileWidth,
        offsetY + tileY * this.tileSheet.tileHeight);
    }
  }
};

function Parallax() {
  this.images = {};
  this.spriteSheets = {};
  this.spriteMaps = {};
  this.tileSheets = {};
  this.tileMaps = {};
  this.layers = [];
}
Parallax.prototype.load = function(stage, scene, callback) {
  switch (stage) {
    case 0: { // preload images
      var toLoad = {};
      // image list images
      if ("images" in scene) {
        for (var key in scene.images) {
          var image = scene.images[key];
          // allocate image
          if (!(image in this.images)) {
            toLoad[image] = this.images[image] = new Image();
          }
          this.images[key] = this.images[image];
        }
      }
      // tileset images
      if ("tilesheets" in scene) {
        for (var key in scene.tilesheets) {
          if (!(key in this.images)) {
            toLoad[key] = this.images[key] = new Image();
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
      // process spritesheet
      if ("spritesheets" in scene) {
        for (var key in scene.spritesheets) {
          this.spriteSheets[i] = new SpriteSheet(scene.spritesheets[key], this.images);
        }
      }
      // process spritemaps
      if ("spritemaps" in scene) {
        for (var key in scene.spritemaps) {
          this.spriteMaps[key] = new SpriteMap(scene.spritemaps[key]);
        }
      }
      // process tilesheets
      if ("tilesheets" in scene) {
        for (var key in scene.tilesheets) {
          this.tileSheets[key] = new TileSheet(scene.tilesheets[key], this.images);
        }
      }
      // process tilemaps
      if ("tilemaps" in scene) {
        for (var key in scene.tilemaps) {
          this.tileMaps[key] = new TileMap(scene.tilemaps[key]);
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
              layer = new TileLayer(sceneLayer, this.tileSheets);
            } break;
            case "tilemap": {
              layer = new TileMapLayer(sceneLayer, this.tileSheets, this.tileMaps);
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

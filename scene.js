/* This program is free software. It comes without any warranty, to
* the extent permitted by applicable law. You can redistribute it
* and/or modify it under the terms of the Do What The Fuck You Want
* To Public License, Version 2, as published by Sam Hocevar. See
* http://sam.zoy.org/wtfpl/COPYING for more details. */

var scene = {
  framerate:60,
  viewport: {
    width:320,
    height:240,
    zoom:2,
  },
  images: [
    {id:"Back", image:"back.png"},
    {id:"Snow", image:"snow.png"},
    {id:"Char", image:"char.png"},
    {id:"Terrain", image:"terrain.png"},
  ],
  tilesets: [
    {id:"Char", image:2, size:{width:3, height:1}, tilesize:{width:64, height:64}, tileorigin:{x:32, y:64},
      sequences:[
        [[0, 10], [1, 5], [2, 5], [1, 5], [0, 10], [null, 20]],
      ],
    },
    {id:"Terrain", image:"Terrain", size:{width:4, height:1}, tilesize:{width:32, height:32},
      sequences:{
        8:[[0, 10], [1, 10], [2, 10], [3, 10]],
      },
    },
  ],
  spritesets: [
    {id:"Char", image:2,
      sprites:[
        {position:{x:0, y:0}, size:{width:32, height:32}, origin:{x:16, y:32}},
      ],
      sequences:[
      ],
    },
  ],
  tilemaps: [
    {id:"Terrain", size:{width:32, height:4},
      tiles:[
        0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0,
        0, 0, 4, 0, 0, 0, 0, 2, 3, 0, 1, 1, 1, 0, 0, 4, 4, 0, 0, 3, 2, 5, 0, 1, 1, 1, 1, 1, 0, 0, 4, 0,
        1, 0, 1, 1, 0, 4, 5, 6, 6, 0, 2, 3, 5, 0, 1, 1, 1, 0, 1, 2, 2, 1, 0, 6, 6, 3, 6, 4, 0, 0, 1, 1,
        2, 1, 3, 2, 8, 1, 1, 1, 1, 1, 3, 2, 1, 1, 2, 3, 2, 1, 2, 2, 3, 3, 1, 1, 1, 2, 1, 1, 8, 8, 3, 2,
      ]
    },
    {id:"Hills", size:{width:8, height:1}, tiles:[1, 2, 3, 4, 2, 3, 1, 4,]},
  ],
  layers: [
    {type:"image", image:0, step:{x:0, y:0}, position:{x:160, y:240}, origin:{x:160, y:240}},
    {type:"image", image:"far.png", step:{x:-1/8, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", id:"Mid", image:"mid.png", step:{x:-1/2, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", image:"Snow", step:{x:-1, y:1}, wrap:{horizontal:true, vertical:true}},
    {type:"tilemap", tileset:"Terrain", tilemap:"Terrain", step:{x:-1, y:0}, position:{x:0, y:112}, wrap:{horizontal:true, vertical:false}},
    {type:"tile", tileset:"Char", step:{x:0, y:0}, position:{x:160, y:220}, sequence:[[0, 10], [1, 5], [2, 5], [1, 5], [0, 10], [null, 20]]},
  ],
};

/* This program is free software. It comes without any warranty, to
* the extent permitted by applicable law. You can redistribute it
* and/or modify it under the terms of the Do What The Fuck You Want
* To Public License, Version 2, as published by Sam Hocevar. See
* http://sam.zoy.org/wtfpl/COPYING for more details. */

var scene = {
  framerate:60,
  viewport:{
    width:320,
    height:256,
    zoom:2,
  },
  images:{
    "Rain":"rain.png",
    "Char":"char.png",
    "Ground":"ground.png",
  },
  tilesheets:{
    "Char":{image:"Char", size:{width:3, height:1}, tilesize:{width:32, height:48}, tileorigin:{x:16, y:48},
      sequences:{
        0:[[0, 10], [1, 10], [0, 10], [2, 10]],
      },
    },
    "Ground":{image:"Ground", size:{width:4, height:1}, tilesize:{width:32, height:32},
      sequences:{
        8:[[0, 10], [1, 10], [2, 10], [3, 10]],
      },
    },
  },
  autotilers:{
  },
  tilemaps:{
    "Ground":{size:{width:32, height:4},
      tiles:[
        0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 7, 5, 0, 4, 0, 0, 0, 0, 0,
        0, 0, 4, 7, 0, 0, 0, 2, 3, 0, 1, 1, 1, 0, 7, 4, 4, 0, 0, 3, 2, 5, 0, 1, 1, 1, 1, 1, 0, 0, 4, 0,
        1, 0, 1, 1, 0, 4, 5, 6, 6, 0, 2, 3, 5, 0, 1, 1, 1, 0, 1, 2, 2, 1, 0, 6, 6, 3, 6, 4, 0, 0, 1, 1,
        2, 1, 3, 2, 8, 1, 1, 1, 1, 1, 3, 2, 1, 1, 2, 3, 2, 1, 2, 2, 3, 3, 1, 1, 1, 2, 1, 1, 8, 8, 3, 2,
      ]
    },
    "Hills":{size:{width:8, height:1}, tiles:[1, 2, 3, 4, 2, 3, 1, 4,]},
  },
  spritesheets:{
    "Char":{image:"Char",
      sprites:[
        {position:{x:0, y:0}, size:{width:64, height:64}, origin:{x:64, y:64}},
        {position:{x:32, y:0}, size:{width:64, height:64}, origin:{x:64, y:64}},
        {position:{x:64, y:0}, size:{width:64, height:64}, origin:{x:64, y:64}},
      ],
      sequences:{
        "Walk":[[0, 10], [1, 5], [2, 5], [1, 5], [0, 10]],
      },
    },
  },
  spritemaps:{
    "Sprites":{size:{width:640, height:240},
      sprites: [
        {index:0, position:{x:40, y:40}},
        {sequence:"Walk", position:{x:160, y:220}},
      ],
    },
  },
  layers:[
    {type:"image", image:"clouds0.png", step:{x:-1/16, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", image:"clouds1.png", step:{x:-1/8, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", image:"hills.png", step:{x:-1/4, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", image:"trees.png", step:{x:-1/2, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"image", image:"Rain", step:{x:-2, y:2}, wrap:{horizontal:true, vertical:true}},
    {type:"image", image:"clouds2.png", step:{x:-1/4, y:0}, wrap:{horizontal:true, vertical:false}},
    {type:"tilemap", tileset:"Ground", tilemap:"Ground", step:{x:-1, y:0}, position:{x:0, y:128}, wrap:{horizontal:true, vertical:false}},
    {type:"tile", tileset:"Char", step:{x:0, y:0}, position:{x:160, y:224}, sequence:[[0, 5], [1, 5], [0, 5], [2, 5]]},
    {type:"spritemap", spriteset:"Char", spritemap:"Char", step:{x:0, y:0}, position:{x:160, y:220}},
  ],
};

//Get node systems to use
const electron = require('electron');
const {ipcRenderer} = electron;

//Make ul element
const ul = document.createElement('ul');

//On load, send request for file
ipcRenderer.send('getLeaderBoard:add', true);

//Catch file data
ipcRenderer.on('file:add', function(e, scores){
  //For each element in leaderboard file
  for(let i = 0; i < scores.length; i++){
    //Create text node and list item
    const itemText = document.createTextNode(scores[i]);
    const li = document.createElement('li');
    //Append all to ul
    li.appendChild(itemText);
    ul.appendChild(li);
  }
});

//Append list to body
$('.leaderboards').append(ul);

//Add credits
let cred = document.createElement('p');
cred.setAttribute('id', 'waterMark');
cred.innerHTML = 'Larqqa @ 2018';
$('.overlay').append(cred);

//Make background asteroids, functions the same as menu loop
let asteroids = [];
let explosion = [];
//Get size
let width = $(window).width();
let height = $(window).height();

//Make canvas
canvas = document.createElement('canvas');
canvas.setAttribute('id', 'canvas');
canvas.setAttribute('style', 'position: absolute; top: 0; z-index: -1;');
$('body').append(canvas);

$(window).resize(function () {
  //Canvas changes dynamically to window size
  canvas = document.getElementById('canvas');
  canvas.setAttribute('height', height);
  canvas.setAttribute('width', width);
});

setInterval(function(){
  if (asteroids.length < 10) {
    asteroids.push(new Asteroid());
  }

  //Get canvas and reset to make asteroids work as intended
  canvas = document.getElementById('canvas');
  canvas.setAttribute('height', height);
  canvas.setAttribute('width', width);
  let ctx = canvas.getContext('2d');
  //Clear the canvas every frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Asteroid actions
  for (let i = asteroids.length - 1; i >= 0; i--) {
    if (asteroids[i]) {
      asteroids[i].draw();
      asteroids[i].boundaries();
      asteroids[i].collision(i);
    }
  }

  //EXPLOOOSIOONS!!!!
  for (let i = explosion.length - 1; i >= 0; i--) {
    explosion[i].explode(i);
  }
}, 16.6666);

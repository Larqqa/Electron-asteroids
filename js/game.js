$(window).resize(function () {
  /* Set canvas to new size on resize */
  width = $(window).width();
  height = $(window).height();

  //Canvas changes dynamically to window size
  canvas = document.getElementById('canvas');
  canvas.setAttribute('height', height);
  canvas.setAttribute('width', width);
});

/* CANVAS VARIABLES */

//Get size
width = $(window).width();
height = $(window).height();

// Make canvas
let canvas = document.createElement('canvas');
canvas.setAttribute('id', 'canvas');
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);
$('body').append(canvas);

/*GAME CONTAINERS*/
//Game info
let gameInfo = document.createElement('div');
gameInfo.setAttribute('id', 'gameInfo');

//Make timer
let time = document.createElement('p');
time.setAttribute('id', 'time');

//Make score
let score = document.createElement('p');
score.setAttribute('id', 'score');

//Make level
let levelTag = document.createElement('p');
levelTag.setAttribute('id', 'level');

//Add all to body
gameInfo.append(time, score, levelTag);
$('body').append(gameInfo);

//Make menu container
let menu = document.createElement('div');
menu.setAttribute('id', 'menu');
menu.setAttribute('class', 'hidden');
$('body').append(menu);

//Make credits container
let creditsDiv = document.createElement('div');
creditsDiv.setAttribute('id', 'credits');
creditsDiv.setAttribute('class', 'hidden');
$('body').append(creditsDiv);

/* GAME VARIABLES */

//Set some containers for elements etc.
let asteroids = [];
let explosion = [];
let key = [];
let powerups = [];

//Check keyevent for movement etc.
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

function keyDown(e) {
  //On keydown, set keys to true
  //Game keys are arrows and num 0
  key[e.keyCode] = true;
};

function keyUp(e) {
  //On keyup, set used keys to false
  key[e.keyCode] = false;
};

/* GAME LOOPS */

//Menu loop
let loop = true;
let addText = true;

function menuLoop() {
  //Escape Menu
  if (key[32] == true) {
    loop = false;
  }

  //console.log(key);

  //Make background asteroids for menu screen, copied from gameloop
  if (asteroids.length < 10) {
    asteroids.push(new Asteroid());
  }

  //Get canvas and reset to make asteroids work as intended
  canvas = document.getElementById('canvas');
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

  menu = document.getElementById('menu');
  $(menu).removeClass('hidden');

  //Add text
  if (addText) {

    //Add title
    let title = document.createElement('h1');
    title.setAttribute('id', 'title');
    title.innerHTML = 'ASTER*IDS';
    menu.append(title);

    //Add instructions
    let inst = document.createElement('p');
    inst.innerHTML = 'Liiku: W A S D<br>Ammu: NUM 0<br>Tuhoa alus: ESC<br><br>Aloita: SPACE<br><br>Tulostaulukko: CTRL + L<br>Lopeta peli: CTRL + Q';
    menu.append(inst);

    //Add credits
    let cred = document.createElement('p');
    cred.setAttribute('id', 'waterMark');
    cred.innerHTML = 'Larqqa @ 2018';
    menu.append(cred);

    addText = false;
  }
  //If menu was closed
  if (loop == false
  ) {
    //Clear menu loop, set it to 0, and reset loop
    clearInterval(menuLooper);
    menuLooper = 0;
    loop = true;
    menu.setAttribute('class', 'hidden');
    menu.innerHTML = '';
    asteroids = [];
    explosion = [];
  }
}

//Game loop

//Set some variables
let counter = 0;
let powerUpCounter = 0;
let gameScore = 0;
let timer = 0;
let level = 0;

function gameTimer() {

  //Check if menu is running
  if (menuLooper != 0) {
    //If is running, dont execute game.
    return;
  }

  //Hide cursor when game is running
  $('body').css('cursor', 'none');

  //Get canvas, and clear it at start of every frame
  canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  //Clear the canvas every frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Make new asteroids, keep at a minimum of 10 asteroids
  if (asteroids.length < level) {
    asteroids.push(new Asteroid());
  }

  //Asteroid actions
  for (let i = asteroids.length - 1; i >= 0; i--) {
    if (asteroids[i]) {
      asteroids[i].draw();
      asteroids[i].boundaries();
      asteroids[i].collision(i);
    }
  }

  //Check bullets first, so collision detects bullet hit first.
  //Draw bullets, backwards because boundary check splice
  for (let i = ship.ammo.length - 1; i >= 0; i--) {
    ship.drawAmmo(i);
  }

  //Do actions
  ship.draw();
  ship.move(counter);
  ship.borderCheck();
  ship.crash();

  //Add powerups  every 50 ticks
  if (powerUpCounter % 200 == 0 && powerUpCounter != 0) {
    powerups.push(new Powerup());
  }

  //Run powerup functions
  for(let i = powerups.length - 1; i >= 0 ; i--) {
    powerups[i].collided();
    powerups[i].shipCollision();
    powerups[i].draw(i);
  }

  //Check for powerup
  ship.powerupsCheck();

  //EXPLOOOSIOONS!!!!
  for (let i = explosion.length - 1; i >= 0; i--) {
    explosion[i].explode(i);
  }

  //Increase level every 5 seconds
  if (timer % 10 == 0 && counter == 0) {
    level++;
  }

  //Counter for shooting
  if (counter == 60) {
    //Set total game run time in seconds, 60 ticks ~ 1 second
    timer++;
    counter = 0;
  } else {
    counter++;
  }
  powerUpCounter++;

  //If loop is exited, end loop, reset values
  if (loop == false) {
    clearInterval(gameTime);
    gameTime = 0;
    loop = true;
    addText = true;
  }

  //Set values for timer and score
  document.getElementById('time').innerHTML = 'Aika: ' + timer;
  document.getElementById('score').innerHTML = 'Osumia: ' + gameScore;
  document.getElementById('level').innerHTML = 'Taso: ' + level;
}

//Credits loop
function credits() {

  //Check if game is running
  if (gameTime != 0) {

    //If is running, dont show credits.
    return;
  }
  //display cursor when game stops
  $('body').css('cursor', 'initial');

  //Show credits window
  creditsDiv = document.getElementById('credits');
  $(creditsDiv).removeClass('hidden');

  //Add text
  if (addText) {

    //Add ending
    let title = document.createElement('h4');
    title.innerHTML = 'Räjähdit!';
    creditsDiv.append(title);

    //Add score
    let endScore = document.createElement('p');
    endScore.innerHTML = 'Pisteesi oli: ' + (gameScore * 2 + timer * 2);
    creditsDiv.append(endScore);

    //Set score in to leaderboards
    //Create input form for leaderboards
    let form = document.createElement('form');
    let formWrapper = document.createElement('div');

    let formLabel = document.createElement('label');
    formLabel.innerHTML = 'Lisää nimesi tulostaulukkoon:<br>';

    let formInput = document.createElement('input');
    formInput.setAttribute('type', 'text');
    formInput.setAttribute('id', 'name');

    let formButton = document.createElement('button');
    formButton.setAttribute('type', 'submit');
    formButton.innerHTML = 'Lähetä';

    //Add form to credits screen
    formWrapper.append(formLabel, formInput);
    form.append(formWrapper, formButton);
    creditsDiv.append(form);

    //Set input attributes after input is added to DOM
    formInput = document.getElementById('name');
    formInput.required = true;
    formInput.focus();

    //Get form and catch submit event
    const formCatch = document.querySelector('form');
    formCatch.addEventListener('submit', submitForm);

    //For field validation as main event has preventDefault
    formButton = document.querySelector('button');
    $(formButton).click(function(){
      if (!formCatch[0].checkValidity()) {
        console.log('kenttä ei voi olla tyhjä!');
      }
    });

    //Submit form
    function submitForm(e) {
      e.preventDefault();

      //Get node systems to use
      const electron = require('electron');
      const {ipcRenderer} = electron;

      //Set constants, game score and input name
      const score = gameScore * 2 + timer * 2;
      const name = document.querySelector('#name').value;

      //make content and name into a form that can be saved to file
      let content = name + ', ' + score + '\n';

      //On form send, send to electron
      ipcRenderer.send('score:add', content);
    }


    //Add game info
    let info = document.createElement('p');
    info.innerHTML = 'Osuit '+gameScore+' asteroidiin ja kestit '+timer+' sekuntia.';
    creditsDiv.append(info);

    //Add instructions
    let inst = document.createElement('p');
    inst.innerHTML = 'Jos haluat pelata uudestaan, paina R.';
    creditsDiv.append(inst);

    //Add credits
    let cred = document.createElement('p');
    cred.setAttribute('id', 'waterMark');
    cred.innerHTML = 'Larqqa @ 2018';
    creditsDiv.append(cred);

    addText = false;
  }

  //Reset game if R is pressed
  if (key[82] == true) {
    clearInterval(creditsLoop);
    //Reset containers
    $(document.getElementById('menu')).removeClass('hidden');
    creditsDiv.innerHTML = '';
    creditsDiv.setAttribute('class', 'hidden');

    //Reset game values
    addText = true;
    counter = 0;
    gameScore = 0;
    timer = 0;
    asteroids = [];
    explosion = [];
    ship.posBack = [width / 2 - 24.5, height / 2 - 24.5];
    ship.velocity = 0;
    ship.thrust = 0;
    ship.angle = -90;
    ship.tan = 0;
    ship.ammo = [];
    level = 0;

    //Run game;
    runGame();
  }
}

//Run game
//Menu time is 60 fps for background asteroids
let menuLooper = setInterval(menuLoop, 16.6666);

//Gametime is set to 60 fps. 1000 / 60 == 16.6666
let gameTime = setInterval(gameTimer, 16.6666);

//Credits time is 30 fps for conservation of resources
let creditsLoop = setInterval(credits, 33.3333);

//Reset game
function runGame() {
  //Menu time is 60 fps for background asteroids
  menuLooper = setInterval(menuLoop, 16.6666);

  //Gametime is set to 60 fps. 1000 / 60 == 16.6666
  gameTime = setInterval(gameTimer, 16.6666);

  //Credits time is 30 fps for conservation of resources
  creditsLoop = setInterval(credits, 33.3333);
}

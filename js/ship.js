//Construct the ship
let ship = {
  //.5 offset needed for 1px lines lines, otherwise blurry
  //Two Vectors to get front and back points
  posBack: [width / 2 - 24.5, height / 2 - 24.5],
  posFront: [width / 2 - 24.5, height / 2 - 24.5 - 25],
  leftWing: [width / 2 - 24.5, height / 2 - 24.5],
  rightWing: [width / 2 - 24.5, height / 2 - 24.5],
  shipLength: 25,

  //Set initial ship turning values. -90 is for up, instead of right
  tan: 0,
  angle: -90,

  //Thrust is forward & backward
  thrust: 0,

  //Velocity is sideways
  velocity: 0,

  //Save used keys as objects
  key: {},

  powerup: {
    shoot: false,
    indestruct: false,
    speed: false,
    turn: false,
    timewarp: false,
  },

  powerupTime: {
    shoot: 0,
    indestruct: 0,
    speed: 0,
    turn: 0,
    timewarp: 0,
  },

  draw: function () {
    //Tan is the direction where the ship points
    //atan2 gets the angle of the two points (ships back and front) in radians
    this.tan = Math.atan2(this.posFront[1] - this.posBack[1], this.posFront[0] - this.posBack[0]);

    //change the backs coordinates according to the found tangent
    //X value: cosine(tangent) * thrust
    //Y value: sine(tangent) * thrust
    this.posBack[0] += Math.cos(this.tan) * this.thrust;
    this.posBack[1] += Math.sin(this.tan) * this.thrust;

    //Set ships wing places
    //Set them before ship.tan is changed so positioning is correct
    //90 degrees gives a solid triangle, 110 gives more complexity
    let degrees = 110;

    //Convert tan to angle from radian
    let tanAngle =  this.tan * (180 / Math.PI);

    //Set offset of wings
    //Ships length / offset
    //Lower is wider ship, higher is narrower ship
    let offset = 2;

    //Left wing X position is: Back of ship + (cosine(((the angle - degrees) * (PI / 180)))) / (ship length / offset)
    //left wing Y position is the same but sine instead of cosine
    // Right wing is the same, except the angle and degrees get summed together
    this.leftWing[0] = this.posBack[0] + (Math.cos(((tanAngle - degrees) * (Math.PI / 180)))) * (this.shipLength / offset);
    this.leftWing[1] = this.posBack[1] + (Math.sin(((tanAngle - degrees) * (Math.PI / 180)))) * (this.shipLength / offset);
    this.rightWing[0] = this.posBack[0] + (Math.cos(((tanAngle + degrees) * (Math.PI / 180)))) * (this.shipLength / offset);
    this.rightWing[1] = this.posBack[1] + (Math.sin(((tanAngle + degrees) * (Math.PI / 180)))) * (this.shipLength / offset);

    //Limit Velocity and Thrust
    let maxVel = 3;
    if(ship.powerup.turn){
      maxVel = 4;
    }
    if (this.velocity > maxVel) {
      this.velocity = maxVel;
    } else if (this.velocity < -maxVel) {
      this.velocity = -maxVel;
    }

    let maxThrust = 6;
    if(ship.powerup.speed){
      maxThrust = 8;
    }

    if (this.thrust > maxThrust) {
      this.thrust = maxThrust;
    } else if (this.thrust < -maxThrust) {
      this.thrust = -maxThrust;
    }

    //Convert ship angle to radians
    let rad = this.angle * (Math.PI / 180);

    //Set front of ship last to not interfere with the rest of the calculations
    //X of front of ship: back of ship + cosine(ships angle) * ships length
    //Y is same but with sine instead of cosine
    this.posFront[0] = this.posBack[0] + (Math.cos(rad) * this.shipLength);
    this.posFront[1] = this.posBack[1] + (Math.sin(rad) * this.shipLength);

    //Ships angle is the angle + velocity
    this.angle = this.angle + this.velocity;

    //Draw ship
    //Initiate canvas
    canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    //Begin drawing
    ctx.beginPath();

    //Front point
    ctx.moveTo(this.posFront[0], this.posFront[1]);

    //left point
    ctx.lineTo(this.leftWing[0], this.leftWing[1]);

    //Back point
    ctx.lineTo(this.posBack[0], this.posBack[1]);

    //Right point
    ctx.lineTo(this.rightWing[0], this.rightWing[1]);

    //End drawing
    ctx.closePath();

    //Set rest of canvas parameters
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';

    //Draw ship on canvas
    ctx.stroke();
  },

  move: function (counter) {
    let amount = 0.1;
    let inertia = 0.02;

    //If WASD, num 0 & esc are true, do action
    //WASD keys add or decrease values of thrust and velocity according to direction
    //if WASD keys are not pressed, gradually decrease thrust or velocity
    ship.key = key;

    //Left
    if (ship.key[65] == true) {
      ship.velocity -= amount * 3;
    } else {
      if (this.velocity < 0.01) {
        this.velocity += inertia * 6;
      }
    }

    //Up
    if (ship.key[87] == true) {
      ship.thrust += amount;
    } else {
      if (this.thrust > 0.01) {
        this.thrust -= inertia;
      }
    }

    //Right
    if (ship.key[68] == true) {
      ship.velocity += amount * 3;
    } else {
      if (this.velocity > 0.01) {
        this.velocity -= inertia * 6;
      }
    }

    //Down
    if (ship.key[83] == true) {
      ship.thrust -= amount;
    } else {
      if (this.thrust < -0.01) {
        this.thrust += inertia;
      }
    }

    //Shoot
    //If num pad 0 key is pressed with or without numlock
    if (ship.key[45] && counter % 10 == 0 && counter != 0 || ship.key[96] == true && counter % 10 == 0 && counter != 0) {
      ship.shoot();
    } else if(ship.key[45] == true && ship.powerup.shoot == true || ship.key[96] == true && ship.powerup.shoot == true) {
      ship.shoot();
    }

    //Escape GAMELOOP
    if (ship.key[27] == true) {
      loop = false;
    }

    //Set thrust & velocity to 0 if they are too small decimals
    if (this.velocity < 0.001 && this.velocity > -0.001) {
      this.velocity = 0;
    }

    if (this.thrust < 0.001 && this.thrust > -0.001) {
      this.thrust = 0;
    }

    //console.log(ship.key);
  },

  borderCheck: function () {
    //Left edge check
    if (ship.posFront[0] < -10 - ship.shipLength) {
      ship.posBack[0] = width + ship.shipLength;
    }

    if (ship.posBack[0] < -10 - ship.shipLength) {
      ship.posBack[0] = width;
    }

    //Right edge check
    if (ship.posFront[0] > 10 + width + ship.shipLength) {
      ship.posBack[0] = 0 - ship.shipLength;
    }

    if (ship.posBack[0] > 10 + width + ship.shipLength) {
      ship.posBack[0] = 0;
    }

    //Top edge check
    if (ship.posFront[1] < -10 - ship.shipLength) {
      ship.posBack[1] = height + ship.shipLength;
    }

    if (ship.posBack[1] < -10 - ship.shipLength) {
      ship.posBack[1] = height;
    }

    //Bottom edge check
    if (ship.posFront[1] > 10 + height + ship.shipLength) {
      ship.posBack[1] = 0 - ship.shipLength;
    }

    if (ship.posBack[1] > 10 + height + ship.shipLength) {
      ship.posBack[1] = 0;
    }
  },

  crash: function () {
    //Check if asteroid collides with ship
    for (j = asteroids.length - 1; j >= 0; j--) {

      //If there is asteroid
      if(asteroids[j] && !ship.powerup.indestruct) {

        //Calculate the distance of the centers
        //Backpoint is recessed, so wing points should be enough
        //Front point
        let a = ship.posFront[0] - asteroids[j].x;
        let b = ship.posFront[1] - asteroids[j].y;

        //Left point
        let e = ship.leftWing[0] - asteroids[j].x;
        let f = ship.leftWing[1] - asteroids[j].y;

        //Right point
        let g = ship.rightWing[0] - asteroids[j].x;
        let h = ship.rightWing[1] - asteroids[j].y;

        //Calculate the distance between the point and the asteroids center
        let distance = Math.sqrt(a * a + b * b);
        let distance3 = Math.sqrt(e * e + f * f);
        let distance4 = Math.sqrt(g * g + h * h);

        //console.log(distance);

        //If distance is larger than combined radius
        if (distance < asteroids[j].size || distance3 < asteroids[j].size || distance4 < asteroids[j].size) {

          //Explode ship
          explosion.push(new Exploding(ship.posFront[0], ship.posFront[1], true));

          //Splice
          asteroids.splice(j, 1);

          loop = false;

          return;
        }
      }
    }
  },

  ammo: [],
  shoot: function () {
    ship.ammo.push(new Bullet(ship.posFront[0], ship. posFront[1], ship.tan));
  },

  drawAmmo: function (i) {
    if (ship.ammo[i].x < 0) {
      ship.ammo.splice(i, 1);
      return;
    } else if (ship.ammo[i].x > width) {
      ship.ammo.splice(i, 1);
      return;
    } else if (ship.ammo[i].y < 0) {
      ship.ammo.splice(i, 1);
      return;
    } else if (ship.ammo[i].y > height) {
      ship.ammo.splice(i, 1);
      return;
    }

    //Check if asteroid collides with bullet
    for (j = asteroids.length - 1; j >= 0; j--) {

      //If the asteroid exists
      if(asteroids[j]) {
        //Calculate the distance of the asteroids centers
        let a = ship.ammo[i].x - asteroids[j].x;
        let b = ship.ammo[i].y - asteroids[j].y;

        let distance = Math.sqrt(a * a + b * b);

        //console.log(distance);

        //If distance is larger than asteroids combined radius
        if (distance < asteroids[j].size + 5) {

          //Split if large asteroid
          if(asteroids[j].size > 25) {
            asteroids[j].split();
          }

          explosion.push(new Exploding(asteroids[j].x, asteroids[j].y));

          //Splice
          asteroids.splice(j, 1);
          ship.ammo.splice(i, 1);

          gameScore++;
          return;
        }
      }
    }

    ship.ammo[i].x += Math.cos(ship.ammo[i].tan) * ship.ammo[i].vel;
    ship.ammo[i].y += Math.sin(ship.ammo[i].tan) * ship.ammo[i].vel;

    //Draw bullets
    //Initiate canvas
    canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();

    //Front point
    //ctx.moveTo(ship.ammo[i].x, ship.ammo[i].y);
    ctx.arc(ship.ammo[i].x, ship.ammo[i].y, 1, 0, Math.PI * 2, true);

    //End drawing
    ctx.closePath();

    //Draw bullet on canvas
    ctx.stroke();
  },

  powerupsCheck: function (){
    //Chcek and reduce how long powerups should be active
    if(ship.powerupTime.shoot > 0) {
      ship.powerupTime.shoot -= 1;
    } else {
      ship.powerup.shoot = false;
    }

    if(ship.powerupTime.indestruct > 0) {
      ship.powerupTime.indestruct -= 1;
    } else {
      ship.powerup.indestruct = false;
    }

    if(ship.powerupTime.speed > 0) {
      ship.powerupTime.speed -= 1;
    } else {
      ship.powerup.speed = false;
    }

    if(ship.powerupTime.turn > 0) {
      ship.powerupTime.turn -= 1;
    } else {
      ship.powerup.turn = false;
    }

    if(ship.powerupTime.timewarp > 0) {
      ship.powerupTime.timewarp -= 1;
    } else {
      ship.powerup.timewarp = false;
    }
  }

};

//Constructor for bullets
function Bullet(x, y, tan) {
  this.x = x;
  this.y = y;
  this.tan = tan;
  this.vel = 10;
}

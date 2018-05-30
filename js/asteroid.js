//Constructor for asteroids
function Asteroid(x, y, headingX, headingY) {
  this.size = Math.ceil((Math.random() * 30) + 20);

  //Selector sets the side of screen on which the asteroid spawns
  let selector = Math.floor(Math.random() * 4);
  //console.log(selector)
  switch (selector) {
    case 0:
      this.x = 0 - this.size;
      this.y = Math.random() * height;
      break;
    case 1:
      this.x = Math.random() * width;
      this.y = 0 - this.size;
      break;
    case 2:
      this.x = width + this.size;
      this.y = Math.random() * height;
      break;
    case 3:
      this.x = Math.random() * width;
      this.y = height + this.size;
      break;
  }

  this.boundaries = function () {
    //If out of screen, set to other side of screen
    if (this.x < 0 - this.size) {
      this.x = width + this.size;
    } else if (this.x > width + this.size) {
      this.x = 0 - this.size;
    }
    if (this.y < 0 - this.size) {
      this.y = height + this.size;
    } else if (this.y > height + this.size) {
      this.y = 0 - this.size;
    }
  }

  //Set some values for asteroids
  //Copies from the ships variables with random angle
  this.headX = this.x + (Math.cos((Math.random() * 360) * (Math.PI / 180)) * this.size);
  this.headY = this.y + (Math.sin((Math.random() * 360) * (Math.PI / 180)) * this.size);
  this.tan = Math.atan2(this.y - this.headY, this.x - this.headX);
  this.vel = Math.floor(Math.random() * 2) + 2;
  this.origVel = this.vel;

  //If was split
  //Size is minimum for no further splitting
  if (headingX) {
    this.x = x;
    this.y = y;
    this.headX = headingX;
    this.headY = headingY;
    this.size = 20;
  }

  this.collision = function (i) {

    //Check collision of asteroids[i - 1]
    //this will check all asteroids except self and previously checked

    //Check this against all other asteroids
    for (j = i - 1; j >= 0; j--) {

      //If not self and not destroyed already
      if (asteroids[j]) {

        //Calculate the distance of the asteroids centers
        let a = this.x - asteroids[j].x;
        let b = this.y - asteroids[j].y;

        let distance = Math.sqrt(a * a + b * b);

        //If distance is larger than asteroids combined radius
        if (distance < this.size + asteroids[j].size) {

          //Split asteroids on impact
          asteroids[i].split();
          asteroids[j].split();

          //Make explosion on asteroids center
          explosion.push(new Exploding(this.x, this.y));
          explosion.push(new Exploding(asteroids[j].x, asteroids[j].y));

          //Splice, starting from the farthest.
          if (i > j) {
            asteroids.splice(i, 1);
            asteroids.splice(j, 1);
          } else {
            asteroids.splice(j, 1);
            asteroids.splice(i, 1);
          }
          return;
        }
      }
    }
  }

  this.split = function () {

    //If asteroids size is large enough
    if (this.size > 26) {

      //Set split in to random direction
      let degrees = Math.floor(Math.random() * 360);

      //Convert tan to angle from radian
      let tanAngle =  (this.tan - degrees) * (180 / Math.PI);

      //Calculate new heading for split asteroids
      let x = this.x + (Math.cos((tanAngle * (Math.PI / 180)))) * (this.size);
      let y = this.y + (Math.sin((tanAngle * (Math.PI / 180)))) * (this.size);

      //Make new asteroid, at current asteroids position, and random heading
      asteroids.push(new Asteroid(this.x, this.y, x, y));
    }
  }

  //Set asteroids diameter
  if (headingX) {
    //Set a smaller width if split asteroid
    this.outerRadius = (Math.random() * 10) + 15;
    this.size = this.outerRadius;
  } else {
    //Set a random width for asteroids
    this.outerRadius = (Math.random() * 30) + 20;
    this.size = this.outerRadius;
  }

  //Set how many points the asteroid has
  if (this.size < 25) {
    //If small asteroid, set less points
    this.points = (Math.random() * 7) + 5;
  } else {
    this.points = (Math.random() * 5) + 10;
  }

  //Set offset for randomized points
  this.offset = [];
  for (let i = 0; i < this.points; i++) {
    if (this.size < 25) {
      //If small asteroid, less points
      this.offset[i] = Math.random() * 11 - 5;
    } else {
      //If larger, more points
      this.offset[i] = Math.random() * 21 - 10;
    }
  }
  this.offset[this.offset.length-1] = this.offset[0];

  this.draw = function () {
    if(ship.powerup.timewarp){
      this.vel = 0.5;
    } else {
      this.vel = this.origVel;
    }
    //Copy from ship, to move asteroid in vector direction
    this.x += Math.cos(this.tan) * this.vel;
    this.y += Math.sin(this.tan) * this.vel;

    //Draw asteroids
    //Initiate canvas
    canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();

    //Draw asteroid

    //Set rotation
    let rot = Math.PI / 2 * 3;

    //Set initial positions of points
    let cx = this.x;
    let cy = this.y;
    let x = cx;
    let y = cy;

    //Steps increase the rotation of the point
    let step = Math.PI / this.points;

    //Draw each point
    for (let i = 0; i < this.points; i++) {

      //Move to outer points
      x = cx + this.offset[i] + Math.cos(rot) * this.outerRadius;
      y = cy + this.offset[i] + Math.sin(rot) * this.outerRadius;
      ctx.lineTo(x,y);

      //Increase rotation by one step
      rot += step * 2;
    }

    //End drawing
    ctx.closePath();

    //Draw bullet on canvas
    ctx.stroke();
  }
}

//Constructor for asteroid explosions
function Exploding(x, y, ship) {
  this.x = x;
  this.y = y;
  this.fading = 100;

  //Set random radii to get variation in exlposions
  this.outerRadius = Math.ceil((Math.random() * 10) + 20);
  this.innerRadius = Math.ceil((Math.random() * 2) + 10);

  this.oRad = 10;
  this.iRad = 7;
  this.oRad2 = this.outerRadius;
  this.iRad2 = this.innerRadius;

  //console.log(this.outerRadius, this.innerRadius);

  this.explode = function (i) {
    //Draw Explosion
    //Initiate canvas
    canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;

    ctx.beginPath();

    //Draw explosion star pattern

    //Set rotation to make stars
    let rot = Math.PI / 2 * 3;

    //Set initial positions of points
    let cx = this.x;
    let cy = this.y;
    let x = cx;
    let y = cy;

    //Set how many spikes the explosion has
    let spikes = 8;

    //Make large explosion if ship explodes
    if (ship) {
      this.outerRadius = 60;
      this.innerRadius = 40;
      spikes = 15;
    }

    //Steps increase the rotation of the point to make the stars
    let step = Math.PI / spikes;

    if (!ship) {
      if (this.oRad < this.oRad2) {
        this.outerRadius = this.oRad;
        this.oRad += 2;
      }
      if (this.iRad < this.iRad2) {
        this.innerRadius = this.iRad;
        this.iRad += 2;
      }
    }

    //Move to starting point
    ctx.moveTo(this.x, this.y - this.outerRadius);

    //Draw each spike
    for (let i = 0; i < spikes; i++) {

      //Move to outer points
      x = cx + Math.cos(rot) * this.outerRadius;
      y = cy + Math.sin(rot) * this.outerRadius;
      ctx.lineTo(x,y);
      //Increase rotation by one step
      rot += step;

      //Move to inner points
      x = cx + Math.cos(rot) * this.innerRadius;
      y = cy + Math.sin(rot) * this.innerRadius;
      ctx.lineTo(x,y);
      //Increase rotation by one step
      rot += step;
    }

    //End point
    ctx.lineTo(cx, cy - this.outerRadius);

    //End drawing
    ctx.closePath();

    //Draw explosion on canvas
    //console.log(1 - this.fading / 100);
    ctx.strokeStyle = 'rgba(255, 255, 155,'+ this.fading / 100 +')';

    if (ship) {
      ctx.fillStyle = 'rgb(0,0,0)';
      ctx.fill();
    }

    ctx.stroke();
    ctx.strokeStyle = 'white';

    //console.log(this.fading);
    if (this.fading == 0) {
      explosion.splice(i, 1);
    }
    this.fading -= 2;
  }
}

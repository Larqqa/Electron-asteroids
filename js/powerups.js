function Powerup(){
  //Set variables
  this.power = Math.floor(Math.random() * 5);
  this.x = Math.floor(Math.random() * canvas.width);
  this.y = Math.floor(Math.random() * canvas.height);
  this.collidedCheck = false;
  this.fading = 500;
  this.size = 20;
  this.letter = '';
  switch (this.power) {
    case 0:
      this.letter = "F";
      break;
    case 1:
      this.letter = "I";
      break;
    case 2:
      this.letter = "S";
      break;
    case 3:
      this.letter = "T";
      break;
    case 4:
      this.letter = "W";
      break;
  }

  //If the ship took powerup, set correct powerup to ship
  this.collided = function() {
    if (this.collidedCheck == true) {
      switch (this.power) {
        case 0:
          ship.powerup.shoot = true;
          break;
        case 1:
          ship.powerup.indestruct = true;
          break;
        case 2:
          ship.powerup.speed = true;
          break;
        case 3:
          ship.powerup.turn = true;
          break;
        case 4:
          ship.powerup.timewarp = true;
          break;
      }
      if (this.fading <= 0) {
        //After fading goes, powerup goes too
        this.collidedCheck = false;
      } else {
        this.fading--;
      }
    }
  }

  this.draw = function(i){
    if(this.collidedCheck == false) {
      //Draw powerup
      canvas = document.getElementById('canvas');
      let ctx = canvas.getContext('2d');

      //Set letter to identify the powerup
      ctx.fillStyle = 'white';
      ctx.font ='20px Arial';
      ctx.textAlign = 'center';
      //ctx.textBaseLine = 'middle';
      ctx.fillText(this.letter, this.x, this.y + 8);

      //Begin drawing
      ctx.beginPath();
      //Draw circle
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      //End drawing

      ctx.closePath();

      //Set rest of canvas parameters
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';

      //Draw powerup on canvas
      ctx.stroke();
    }

    //If ship has not taken powerup, destroy powerup
    if(this.fading <= 0 && this.collidedCheck == false){
      powerups.splice(i, 1);
    } else {
      this.fading--;
    }
  }

  this.shipCollision = function(){
    if(this.collidedCheck == false){
      //Calculate the distance of the centers
      //Backpoint is recessed, so wing points should be enough
      //Front point
      let a = ship.posFront[0] - this.x;
      let b = ship.posFront[1] - this.y;

      //Left point
      let e = ship.leftWing[0] - this.x;
      let f = ship.leftWing[1] - this.y;

      //Right point
      let g = ship.rightWing[0] - this.x;
      let h = ship.rightWing[1] - this.y;

      //Calculate the distance between the point and the asteroids center
      let distance = Math.sqrt(a * a + b * b);
      let distance3 = Math.sqrt(e * e + f * f);
      let distance4 = Math.sqrt(g * g + h * h);

      //console.log(distance);

      //If distance is larger than combined radius
      if (distance < this.size || distance3 < this.size || distance4 < this.size) {
        switch (this.power) {
          case 0:
            ship.powerupTime.shoot += 300;
            break;
          case 1:
            ship.powerupTime.indestruct += 300;
            break;
          case 2:
            ship.powerupTime.speed += 300;
            break;
          case 3:
            ship.powerupTime.turn += 300;
            break;
          case 4:
            ship.powerupTime.timewarp += 300;
            break;
        }

        //If collision, activate powerup
        this.collidedCheck = true;
        this.fading = 300;

        return;
      }
    }
  }
}

//CARS
var car = document.getElementById('car');
car.init = function () {  
  car.speed = 0.2;
  car.turn = 0;
  car.x = car.offsetLeft;
  car.y = 0;
  car.width = car.offsetWidth;
  car.height = car.offsetHeight;
  car.maxSpeed = 8;
  car.km = 0;
  car.motor = 1;  
  car.crashed = false;
  car.acc = 0.02,
  car.break = 0.01;
};
car.frame = function () {
  car.motor *= -1;
  car.style.left = parseInt(car.x) + 'px';
  car.style.transform = 'scaleX('+car.motor+')';
  car.steer();
};
car.steer = function () {
  car.x += car.sx;
  road.P0.x -= car.sx;
  road.P1.x -= car.sx;
  road.P2.x -= car.sx;
  road.x    -= car.sx;
  cars.x    -= car.sx;
};
car.crash = function (d) {
  if (!car.crashed) {
    car.crashed = true;
    car.speed = 0.2;
    car.sx = d ? d : 0;
    game.audio.oscillator.frequency.value = 15;
    setTimeout(function () {
      game.audio.oscillator.frequency.value = 60;
      car.crashed = false;
      car.sx = 0;
    }, 800);
  }
}
var cars = document.getElementById('cars');
cars.init = function () {
  cars.n = 32;
  cars.x = 0;
  cars.speed = 1;  
  cars.interval = 500;
  cars.oponents = [];
  cars.easy = 0.2;
  for (var j=0; j<cars.n; j++) {
    cars.oponents[j] = [];
    for (var i=0; i<3; i++) {
      cars.oponents[j][i] = cars.create(i,j); 
    }
  }
  car.st = document.createElement('style');
  car.st.innerHTML = '#cars .car {transform: scaleX(1) rotateX(-57deg) }';
  document.body.appendChild(car.st);

};
cars.frame = function () {
  var relative = cars.speed - car.speed;
  for (var j=0; j<cars.n; j++) {
    for (var i=0; i<3; i++) { 
      var c = cars.oponents[j][i];   
      var d = road.width * 0.42, 
        w = road.width - d - car.width; 
      c.x = (road.P0.x - road.height - 40) * (c.y * c.y * 0.000006) + 
            (d/2) + (i * (w/2));
      c.y += relative;    
      var h = cars.n * car.height * 3;
      if (!c.classList.contains('hidden') && 
          c.y < car.height + 5 && c.y > 5) {
        //collision
        if (car.x < 130 && i == 0) car.crash(0.1);
        if (car.x > 115 && car.x < 162 && i == 1) car.crash();
        if (car.x > 148 && i == 2) car.crash(-0.1);
      }
      if (c.y > h) {
        // back to bottom
        cars.color(c);  
        c.classList.remove('hidden');
        if (car.x < 120 && i == 0) c.classList.add('hidden');
        if (car.x > 115 && car.x < 160 && i == 1) c.classList.add('hidden');
        if (car.x > 155 && i == 2) c.classList.add('hidden');
        if (Math.random() > cars.easy) c.classList.add('hidden');
        if (!c.classList.contains('hidden')) car.position++;
        c.y = 0;
      } else if (c.y < 0)  {
        //passing
        if (!c.classList.contains('hidden')) {
          car.position--;
        } 
        cars.color(c);
        c.classList.remove('hidden');
        if (Math.random() > cars.easy) c.classList.add('hidden');
        c.y = h;
        cars.color(c);
      }
      c.style.left = parseInt(c.x) + 'px';
      c.style.bottom = parseInt(c.y) + 'px';
      var o = 1 / (c.y * fog.value);
      c.style.opacity = o > 1 ? 1 : o;
    }
    if (!cars.oponents[j][0].classList.contains('hidden') &&
        !cars.oponents[j][1].classList.contains('hidden') &&
        !cars.oponents[j][2].classList.contains('hidden')) {
      cars.oponents[j][parseInt(Math.random() * 3)].classList.add('hidden');
    }
  }
  car.st.innerHTML = '#cars .car {transform: scaleX('+car.motor+') rotateX(-57deg) }';
  cars.style.left = parseInt(cars.x) + 'px';
};
cars.create = function (i,j) {  
  var c = document.createElement('div');
  c.className = 'car';
  cars.color(c);
  var d = road.width * 0.42, 
      w = road.width - d - car.width; 
  c.x = (d/2) + (i * (w/2)); 
  c.y = -car.height + (j * car.height*3); 
  cars.appendChild(c);   
  if (Math.random() > 0.1) c.classList.add('hidden');
  if (i == 1 && j == 0 || i == 1 && j == 1) c.classList.add('hidden');
  return c;
};
cars.color = function (c) {
  var randomColor = (0.6+Math.random()*0.4).toString(16).substring(2, 8);
  c.style['background-color'] = '#'+randomColor;
};
//ROAD
var road = document.getElementById('road');
road.init = function() {
  road.ctx = road.getContext('2d');
  road.width = road.offsetWidth; 
  road.height = road.offsetHeight;
  road.state = 0;
  road.x = 0;
  road.offset = 50;
  road.lineWidth = 3;
  road.lineColor = 'rgba(255,255,255,0.7)';
  road.lineDashOffset = 0;
  road.P0 =  {x: parseInt(road.width/2), y: 0, xs: 0};
  road.P1 =  {x: road.offset, y: road.height};
  road.P2 =  {x: road.width - road.offset, y: road.height};
  road.Pc =  {x1: road.P1.x + 110, x2: road.P2.x - 110};
  road.frame();
};
road.frame = function () {
  road.P0.x  += road.P0.xs;
  road.Pc.x1 -= road.P0.xs * 0.4;
  road.Pc.x2 -= road.P0.xs * 0.4; 
  road.lineDashOffset -= car.speed;
  
  road.ctx.clearRect(0, 0, road.width, road.height);
  road.ctx.beginPath();

  road.ctx.moveTo(       road.P1.x,  road.P1.y);
  road.ctx.bezierCurveTo(road.Pc.x1, road.P1.y - road.height,
                         road.P0.x - 5,  road.P0.y - 2,
                         road.P0.x,  road.P0.y);

  road.ctx.moveTo(       road.P2.x,  road.P2.y);
  road.ctx.bezierCurveTo(road.Pc.x2, road.P2.y - road.height,
                         road.P0.x + 5,  road.P0.y - 2,
                         road.P0.x,  road.P0.y);

  road.ctx.strokeStyle = road.lineColor;
  road.ctx.lineWidth = road.lineWidth;
  road.ctx.setLineDash([road.lineWidth, road.lineWidth]);
  road.ctx.lineDashOffset = road.lineDashOffset * -0.5;
  road.ctx.stroke();
};
road.curve = function (side) {
  if (side == 'left' || side == 'right') {
    road.randomCurve();
    if (!(road.state == -1 && side == 'left') &&
        !(road.state == 1 && side == 'right')) {

      if (road.state == 1 && side == 'left') road.state = 0;
      else if (road.state == -1 && side == 'right') road.state = 0;  
      else if (road.state == 0 && side == 'left') road.state = -1;
      else if (road.state == 0 && side == 'right') road.state = 1;
      road.P0.xs = 2 * ((side == 'left') ? -1 : 1);
      return setTimeout(function () {
        road.P0.xs = 0;
      }, 900);
    }
  }
};
road.randomCurve = function () {
  setTimeout(function () {
    road.curve(Math.random()>0.5 ? 'left' : 'right');
  }, 1400); 
};
//MOUNTAINS
var mountains = document.getElementById('mountains');
mountains.frame = function () {
  var curve = (road.P0.x - road.width/2)/40; 
  var left = mountains.offsetLeft;
  if (left < -4.5 * road.width) left =  1.5 * road.width;
  if (left >  1.5 * road.width) left = -4.5 * road.width;
  var d = curve + ((car.speed)*curve*0.5);
  mountains.style.left = parseInt(left - d) + 'px';
};
//UI
var km = document.getElementById('km');
km.frame = function () {
  car.km += (car.speed/1000);
  var value = parseInt(car.km * 10).toString();
  while (value.length < km.childNodes.length) value = '0' + value;
  for (var i=1; i < km.childNodes.length; i++) {
    var a = km.childNodes[i];
    a.innerText = value[i-1];
  }
};
var position = document.getElementById('position');
position.init = function () {
  cars.total = 200;
  car.position = cars.total;
}
position.frame = function () {   
  var value = parseInt(car.position).toString();
  for (var i=0; i < position.childNodes.length-1; i++) {
    var a = position.childNodes[i+1];
    a.innerText = value[i];
  }
}
//LAP 
var lap = document.getElementById('lap');
lap.init = function () {
  lap.value = 1;
}
lap.frame = function () {  
  if (car.position <= 0) {
    lap.value++;
    car.easy += 0.5;
    car.position = 200;
  }
  if (lap.value > 9) alert("GAME OVER\n YOU WIN!!!");
  lap.innerText = lap.value;
}
//FRAME
var frame = function () {
  if (!frame.stop) {
    key.frame();
    car.frame();
    cars.frame();
    mountains.frame();
    road.frame();
    km.frame();
    position.frame();
  }
  requestAnimationFrame(frame);
};
//KEYBOARD
var key = {
  pressed: [],
  frame: function () { 
    if (!car.crashed) {
      car.sx = 0;
      if (car.x > road.width * 0.3){
        if (key.pressed[37] || // Key: Left arrow
            key.pressed[65]) { // Key: 'A'
          car.sx = -2;
        }
      } else car.crash(0.2);
      if (car.x < (road.width * 0.7) - car.width){
        if (key.pressed[39] || // Key: Right arrow
            key.pressed[68]) { // Key: 'D'
          car.sx = 2;
        }
      } else car.crash(-0.2);
      if (key.pressed[32] || // Key: Space
          key.pressed[38] || // Key: Up arrow
          key.pressed[87]) { // Key: 'W'
        if (car.speed < car.maxSpeed) { 
          car.speed += car.acc;
          game.audio.oscillator.frequency.value += car.acc * 10;
        }
      } else {
        if (car.speed > 0) {
          car.speed -= car.break;
          game.audio.oscillator.frequency.value -= car.break * 10;
        }
      }
    }
  }
};
window.addEventListener('keydown', function (event) { 
  key.pressed[event.keyCode] = true;
});
window.addEventListener('keyup', function (event) {
  key.pressed[event.keyCode] = false;
});
//GAME
var game = document.getElementById('game');
game.init = function () {
  game.time = 0;
  car.init();
  road.init();
  position.init();
  lap.init();
  fog.init();
};
//COLORS
game.colors = [
  //sky //terrain //mountains
  ['#228', '#040', 1], //day
  ['#93c', '#440', 0.5], //afternoon 
  ['#546', '#111', 0.2], //night
  ['#888', '#aaa', 0.2], //fog
  ['#545', '#111', 0.2], //night
  ['#529', '#230', 0.3], //morning
  ['#aaf', '#eee', 0.2], //snow
];
var sky = document.getElementById('sky');
var terrain = document.getElementById('terrain');
game.changeTime = function () {
  if (!frame.stop) {
    game.time++;
    if (game.time >= game.colors.length) game.time = 0;
    sky.style.background = game.colors[game.time][0];
    terrain.style.background = game.colors[game.time][1];
    mountains.style.opacity = game.colors[game.time][2];
    if (game.time == 3 || game.time == 4) fog.toggle();
    if (game.time == 2 || game.time == 4) {
      cars.classList.add('night');
    } else {
      cars.classList.remove('night');
    }
    setTimeout(game.changeTime, 30000);
  }
};
//FOG
var fog = document.getElementById('fog');
fog.init = function () {
  fog.value = 0.004;
  fog.status = false;  
};
fog.toggle = function () {
  fog.classList.toggle('hidden');  
  fog.status = !fog.status;
  fog.value = fog.status ? 0.1 : 0.004;  
};
//MOUSE
game.click = function () { 
  if (!game.started) {
    game.started = true;    
    cars.init();
    game.audio();
    setTimeout(road.randomCurve, 5000);
    setTimeout(game.changeTime, 30000);
    frame()   
  }
};
game.addEventListener('click', game.click);
document.getElementById('click').addEventListener('click', game.click);
//AUDIO
game.audio = function () {
  game.audio.context = new AudioContext();
  game.audio.volume = game.audio.context.createGain();  
  game.audio.volume.gain.value = 0.1;
  game.audio.volume.connect(game.audio.context.destination);  
  var o = game.audio.context.createOscillator();
  o.frequency.value = 0;
  o.detune.value = 0;
  o.type = 'sawtooth';
  o.connect(game.audio.volume);
  o.start(0);
  o.frequency.value = 60;
  game.audio.oscillator = o;
};
//INIT
game.init();

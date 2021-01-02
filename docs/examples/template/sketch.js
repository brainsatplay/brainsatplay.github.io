function setup() {

  // P5 Setup
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  resizeCanvas(windowWidth, windowHeight);
  connectToggle = createButton('Connect to Server');
  disconnectToggle = createButton('Disconnect');
  connectToggle.position(25, document.getElementById('info-card').clientHeight);
  disconnectToggle.position(25, document.getElementById('info-card').clientHeight);
  disconnectToggle.hide()


  // Brains@Play Setup
  game = new BrainsAtPlay('untitled')
  game.simulate(2);
  game.subscribe('synchrony',true)
  
  connectToggle.mousePressed(() => {
    game.login({
          'guestaccess': true
        }),
      game.connect(),
      disconnectToggle.show(),
      connectToggle.hide()
  });

  disconnectToggle.mousePressed(() => {
    game.disconnect(),
      disconnectToggle.hide(),
      connectToggle.show()
  });

}

function draw() {
  background(0);

  // Update Voltage Buffers and Derived Variables
  game.update()

  // Draw Raw Voltage 
  let c;

  for (let ind = 0; ind < game.info.brains; ind++) {
    if (ind == 1) {
       c = color('#1cc5cd')
    } else {
       c = color('gray')
    }
    c.setAlpha(100)
    strokeWeight(1)
    stroke(c)

    let brainData = game.metrics.voltage.buffer[ind]
    // Grab only the first channel of data
    let data = brainData[0]
    let dx = windowWidth / data.length;
    for (var point = 0; point < data.length - 1; point++) {
      line(point * dx,
        ((data[point] * windowHeight / 2) + windowHeight / 2),
        (point + 1) * dx,
        ((data[point + 1] * windowHeight / 2) + windowHeight / 2)
      )
    }
  }
  
  // Draw Synchrony 
  noFill()
  if (game.metrics.synchrony.value < 0) {
    stroke('blue')
  } else {
    stroke('red')
  }
  strokeWeight(2)
  ellipse((windowWidth / 2), windowHeight/2, 10 * game.metrics.synchrony.value * Math.min(windowHeight / 2, windowWidth / 2));

  noStroke()
  // Include Text for Raw Synchrony Value
  fill('white')
  textStyle(BOLD)
  textSize(15)
  text('Synchrony', windowWidth / 2, windowHeight-100)
  textStyle(ITALIC)
  textSize(10)

  if (game.connection) {
    text('Live Data Stream', windowWidth / 2, windowHeight-80)
  } else {
    text('Synthetic Data Stream', windowWidth / 2, windowHeight-80)
  }
  
  textStyle(NORMAL)
  if (game.info.brains == 0 && game.me.index != undefined) {
    text('No brains on the network...', windowWidth / 2, windowHeight/2)
  } else if (game.info.brains < 2) {
    text('One brain on the network...', windowWidth / 2, windowHeight/2)
  } else {
    text(game.metrics.synchrony.value.toFixed(4), windowWidth / 2, windowHeight/2)
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  connectToggle.position(25, document.getElementById('info-card').clientHeight);
  disconnectToggle.position(25, document.getElementById('info-card').clientHeight);
}
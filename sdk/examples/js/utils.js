/* -------------------------- Utility Functions -------------------------- */

// function filterSignal(data){
//     let firCalculator = new fili.FirCoeffs();
//     let coeffs = firCalculator.bandpass({order: filterOrder, Fs: samplerate, F1: this.minFilter, F2: this.maxFilter});
//     let filter = new fili.FirFilter(coeffs);
//     let features = bci.windowApply(data, trial => {
//         // Bandpass filter the trial
//         let channels = bci.transpose(trial);
//         console.log(channels)
//         channels = channels.map(sig => filter.simulate(sig).slice(filterOrder));
//         console.log(channels)
//         trial = bci.transpose(channels);
//         console.log(trial)
//         return trial
//     }, data.length, data.length);
//     console.log([].concat(...features))
//     console.log('filtering')
//     return data
// }

function sum(acc,cur){
    return acc + cur
}

function normalize(min, max,scaling) {
    var delta = max - min;
    return function (val) {
        return scaling * ((val - min) / delta);
    };
}


function innerLengths(nestedArrays){
    return nestedArrays.map((innerArray) => {
        return innerArray.length;
    }
    )
}

function max(arr){
    return arr.reduce((acc,cur) => {
        return Math.max(acc,cur);
    })
}

function min(arr){
    return arr.reduce((acc,cur) => {
        return Math.min(acc,cur);
    })
}



function squareDiffs(data){
    let avg = average(data)
    let sqD = data.map(val => {
        var diff = val - avg;
        return diff * diff;
  })
  return(sqD)
}

function power(acc,cur){
    return acc + ((cur*cur)/2)
}

function average(data){
    return data.reduce(sum, 0) / data.length;
  }

  function averagePower(data){
    return (data.reduce(power, 0))/data.length;
  }

  function standardDeviation(values){
    let sqD = squareDiffs(values)
    var aSqD = average(sqD);
    var stdDev = Math.sqrt(aSqD);
    return stdDev;
  }
  

function makeArr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
  }

    // Plot Bands
    // let power;
    // let label;
    // let band_names = ['delta', 'theta', 'alpha', 'beta', 'gamma']
    // let band_meaning = ['(1-3 Hz)','(4-7 Hz)','(8-12 Hz)','(13-30 Hz)','(31-50 Hz)']
    //
    // for (let band = 0; band < band_names.length; band++) {
    //     try {
    //         power = bci.bandpower(y_filtered[0], samplerate, band_names[band], {relative: true});
    //         label = band_names[band] + ' ' + band_meaning[band]
    //     } catch {
    //         label = 'sample rate too low'
    //         this_band_color = p5.color('#FF76E9');
    //         power = 1
    //     }
    //     power = (p5.height / 2) - (p5.height / 4) * (power)
    //     squareColor.setAlpha(255 * (power));
    //     p5.fill(squareColor)
    //     p5.text(label, (band + .5) * (p5.width / band_names.length), power - 20);
    //     this_band_color.setAlpha(200 * (power));
    //     p5.fill(this_band_color)
    //     p5.rectMode(p5.CORNERS);
    //     p5.rect(band * (p5.width / (band_names.length)), p5.height / 2, (band + 1) * (p5.width / (band_names.length)), power)
    // }

function generateSignal(generate, channels){
    generate = !generate;
    sendSignal(channels);
    return generate
}

function sendSignal(channels) {


    brains.users.forEach((user) => {
        let signal = new Array(channels);
        // let amp = Math.random()
        for (let channel =0; channel < channels; channel++) {
            signal[channel] = bci.generateSignal([Math.random()], [base_freq+Math.random()*40], samplerate, (1/base_freq));
        }

        let startTime = Date.now()
        let time = makeArr(startTime,startTime+(1/base_freq),(1/base_freq)*samplerate)

        let data = {
            type: 'ts_filtered',
            signal: signal,
            time: time
        }

            user.streamIntoBuffer(data)
        })
}

function switchToChannels(pointCount){
    // Reset View Matrix
    viewMatrix = mat4.create();
    cameraHome = visualizations[state].zoom;
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
    mat4.invert(viewMatrix, viewMatrix);

    let vertexHome;
    // Create signal dashboard
    vertexHome = getChannels([],pointCount,brains.users.size);
    let ease = true;
    let rotation = false;
    let zoom = false;

    return [vertexHome, viewMatrix, ease, rotation, zoom]
}

function distortToggle(){
    distort = !distort;

    if (distort) {
        distortFlag = true;
        if (distortIter == -1) {
            distortion = 0;
        }
        distortIter = 1;
    }

    if (!distort) {
        distortIter =+ visualizations[state].ease * (-distortion);
    }

    if ( distort ){
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
            "<p>Undistort Shape</p>"
    } else {
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Distort Shape</p>"
    }
}


function stateManager(){
    // reset displacement if leaving channels visualization

    if (visualizations[prevState].shapes.includes('channels')) {
        brains.initializeUserBuffers();
        gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, brains.WebGLChannelDisplacementBuffer(), gl.DYNAMIC_DRAW);
    }

    // set up variables for new state
    if (visualizations[state].shapes.includes('brain')){
        vertexHome = [...brainVertices];
        ease = true;
        rotation = true;
        zoom = true;
    } 

    if (visualizations[state].shapes.includes('channels')){
        cameraHome = visualizations[state].zoom;
        [vertexHome, viewMatrix, ease, rotation, zoom] = switchToChannels(pointCount)

        brains.initializeUserBuffers();
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 0);
        }
    }
    else {
        viewMatrix = mat4.create();
        cameraHome = visualizations[state].zoom;
        mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 1);
        }
    }

    if (!visualizations[state].shapes.includes('brain') && !visualizations[state].shapes.includes('channels')){
        vertexHome = createPointCloud(visualizations[state].shapes, pointCount);
        ease = true;
        rotation = false;
        zoom = false;
    }

    if (!rotation){
        diff_x = 0;
        diff_y = 0;
    }

    // Show Message
    document.getElementById('state').innerHTML = `${visualizations[state].name}`
    document.getElementById('signal-type').innerHTML = `${visualizations[state].signaltype}`

    if (visualizations[state].message != '') {
        document.getElementById('canvas-message').innerHTML = visualizations[state].message;
        document.getElementById('canvas-message').style.opacity = 1;
    } else if (document.getElementById('canvas-message').style.opacity != 0) {
        document.getElementById('canvas-message').style.opacity = 0;
    }
}


function announceUsers(diff){
    let message ;
    if (diff > 0){
        if (diff == 1){
            message = diff + ' brain joined the brainstorm';
        } else{
            message = diff + ' brains joined the brainstorm';
        }
    } else if (diff < 0){
        if (brains.users.size == 0){
            message = 'all brains left the brainstorm';
        }
        else if (diff == -1){
            message = -diff + ' brain left the brainstorm';
        } else {
            message = -diff + ' brains left the brainstorm';
        }
    }
    console.log(message)
    announcement(message)
}

function announcement(message){
    document.getElementById('canvas-message').innerHTML = message;
    document.getElementById('canvas-message').style.opacity = 1;
    messageStartTime = Date.now();
}

function updateChannels(newChannels) {
        
        if (channels != newChannels) {
            channels = newChannels;
        SIGNAL_SUSTAIN = Math.round(SIGNAL_SUSTAIN_ORIGINAL/channels)

        if (SIGNAL_SUSTAIN%2 == 0){
            SIGNAL_SUSTAIN += 1;
        }

        if (visualizations[state].shapes.includes('channels')) {
            [vertexHome, , ease, rotation, zoom] = switchToChannels(pointCount)
        }

        passedEEGCoords = eegCoords.map((arr,ind) => {
            if (ind >= channels){
                return [NaN,NaN,NaN]
            } else {
                return arr
            } 
        })

        gl.uniform3fv(uniformLocations.eeg_coords, new Float32Array(passedEEGCoords.flat()));


        brains.initializeUserBuffers();
    } else {
        channels = newChannels;
    }
}


function bindChatSubmissionEvent(){
    document.getElementById('chat-form').addEventListener('submit',function(e) {
        e.preventDefault();
        if (!ws) {
            showMessage('No WebSocket connection');
            return;
        }
        ws.send(JSON.stringify({'destination':'chat',
            'msg': document.getElementById('message').value
        })
            );
            document.getElementById('message').value = '';
        return false;
    })

}



function toggleDevTools(){
    devTools = !devTools; 
    
    if (devTools){
        document.getElementById('developer-tools').style.left = '0'
        canvas.width = window.innerWidth - 200
        document.getElementById('bottom-bar').style.width = `calc(100vw - 200px)`;
    } else {
        document.getElementById('developer-tools').style.left = '-200px'
        canvas.width = window.innerWidth
        document.getElementById('bottom-bar').style.width = `100vw`;
    }
    document.getElementById('canvas-message').style.width = `${canvas.width}px`;
}

function toggleChat(){
    chat = !chat; 
    
    if (chat){
        document.getElementById('chat').style.right = '0'
    } else {
        document.getElementById('chat').style.right = '-300px'
    }
}


// Resizing
window.onresize = function() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    if (devTools){
        canvas.width -= 200;
    }
    document.getElementById('canvas-message').style.width = `${canvas.width}px`;
}

function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
   
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
  }
  
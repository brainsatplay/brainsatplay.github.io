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
        return scaling * (2*((val - min) / delta) - 1);
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

function generateVoltageStream(channels) {

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

function switchToChannels(pointCount,users){

    // Reset View Matrix
    viewMatrix = mat4.create();
    cameraHome = scenes[state].zoom;
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
    mat4.invert(viewMatrix, viewMatrix);

    let vertexHome;
    // Create signal dashboard
    vertexHome = getChannels([],pointCount,users);
    let ease = true;
    let rotation = false;
    let zoom = false;

    return [vertexHome, viewMatrix, ease, rotation, zoom]
}

function distortToggle(){
    mouseDistort = !mouseDistort;

    if (mouseDistort){
        document.getElementById("effect-status").innerHTML = 'on';
    } else {
        document.getElementById("effect-status").innerHTML = 'off';

    }
}


function stateManager(forceUpdate=false){
    // Do We Have Vertices Defined OR Did State Change OR Is This Animation Over?
    if (forceUpdate || vertexHome == undefined || state != prevState || newSignalType || (scenes[state].timer && ((Date.now() - animStart)/1000 > scenes[state].timer))){

    if (scenes[state].timer && ((Date.now() - animStart)/1000 > scenes[state].timer)){
        state++;
    }

    let shapes = scenes[state].shapes

    // reset displacement if leaving channels visualization
    if (scenes[prevState].shapes.includes('channels')) {
        brains.initializeBuffer(buffer='userOtherBuffers')
        brains.initializeBuffer(buffer='userVoltageBuffers')
        updateBufferData(attribs,'z_displacement',brains.BufferToWebGL())
    }

    // set up variables for new state
    if (shapes.includes('brain')){
        vertexHome = [...brainVertices];
        ease = true;
        rotation = true;
        zoom = true;
    } 

    if (shapes.includes('channels')){
        cameraHome = scenes[state].zoom;
        if (scenes[state].signaltype != 'voltage'){
            [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),1)
            brains.initializeBuffer(buffer='userOtherBuffers');
        } else {
            [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),brains.users.size)
            brains.initializeBuffer(buffer='userOtherBuffers')
            brains.initializeBuffer(buffer='userVoltageBuffers')
        }
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 0);
        }

        // toggle color
        if (scenes[state].signaltype.includes('voltage')){
            gl.uniform1i(uniformLocations.colorToggle, 0);
        } else {
            gl.uniform1i(uniformLocations.colorToggle, 1);
        }
    }
    else {
        if (!newSignalType){
            viewMatrix = mat4.create();
            cameraHome = scenes[state].zoom;
            mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
            mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
            mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
            mat4.invert(viewMatrix, viewMatrix);
        }
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 1);
            gl.uniform1i(uniformLocations.colorToggle, 1);
        }
        
    }

    if (!shapes.includes('brain') && !shapes.includes('channels')){
        vertexHome = createPointCloud(scenes[state].shapes, Math.round(pointCount/shapes.length));
        ease = true;
        rotation = false;
        zoom = false;
    }

    if (!rotation){
        diff_x = 0;
        diff_y = 0;
    }

    // Show Message
    document.getElementById('state').innerHTML = `${scenes[state].name}`
    document.getElementById('signal-type').innerHTML = `${scenes[state].signaltype}`

    // Change UI
    if (scenes[state].message != '') {
        announcement(scenes[state].message)
    }
    
    if (showUI && scenes[state].type != 'intro'){
        document.getElementById('ui-elements').style.opacity = '1.0'
    }

    // Remove signal options if effect is not compatible
    if (['projection','z_displacement'].includes(scenes[state].effect) && document.getElementById('signaltypes').style.opacity != '100%'){
        document.getElementById('signaltypes').style.opacity = '100%'
    } else {
        document.getElementById('signaltypes').style.opacity = '0%'
    }

    if (ws != undefined){
        if (public){
            document.getElementById('brain').style.opacity = '25%'
            document.getElementById('channels').style.opacity = '25%'
            document.getElementById('brain').style.pointerEvents = 'none'
            document.getElementById('channels').style.pointerEvents = 'none'
            document.getElementById('userinfo').style.opacity = '100%'
            document.getElementById('groupdynamics').style.opacity = '100%'
            document.getElementById('userinfo').style.pointerEvents = 'auto'
            document.getElementById('groupdynamics').style.pointerEvents = 'auto'
        } else {
            document.getElementById('brain').style.opacity = '100%'
            document.getElementById('channels').style.opacity = '100%'
            document.getElementById('brain').style.pointerEvents = 'auto'
            document.getElementById('channels').style.pointerEvents = 'auto'
            document.getElementById('userinfo').style.opacity = '25%'
            document.getElementById('groupdynamics').style.opacity = '25%'
            document.getElementById('userinfo').style.pointerEvents = 'none'
            document.getElementById('groupdynamics').style.pointerEvents = 'none'
        }
    } else {
            document.getElementById('brain').style.opacity = '100%'
            document.getElementById('channels').style.opacity = '100%'
            document.getElementById('userinfo').style.opacity = '100%'
            document.getElementById('groupdynamics').style.opacity = '100%'
            document.getElementById('brain').style.pointerEvents = 'auto'
            document.getElementById('channels').style.pointerEvents = 'auto'
            document.getElementById('userinfo').style.pointerEvents = 'auto'
            document.getElementById('groupdynamics').style.pointerEvents = 'auto'
    }

    // reset z_displacement to zero when not being actively updated
    if (!['z_displacement'].includes(scenes[state].effect) && dispBuffer != undefined){
        brains.initializeBuffer(buffer='userOtherBuffers')
        brains.initializeBuffer(buffer='userVoltageBuffers')
        updateBufferData(attribs,'z_displacement',brains.BufferToWebGL(buffer='userOtherBuffers'))
    }


    // Update Effect
    if (uniformLocations != undefined){
        gl.uniform1i(uniformLocations.effect, effects.indexOf(scenes[state].effect));
    }

    // Start Animation Timer
    animStart = Date.now()

    newSignalType = false;
}
}

function announcement(message){
    document.getElementById('canvas-message').innerHTML = message;
    document.getElementById('canvas-message').style.opacity = 1.0;
    messageStartTime = Date.now();
}

function updateChannels(newChannels) {

        let shapes = scenes[state].shapes
        
        if (channels != newChannels) {
            channels = newChannels;
        SIGNAL_SUSTAIN = Math.round(SIGNAL_SUSTAIN_ORIGINAL/channels)

        if (SIGNAL_SUSTAIN%2 == 0){
            SIGNAL_SUSTAIN += 1;
        }

        if (shapes.includes('channels')) {
            if (scenes[state].signaltype != 'voltage'){
                [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),1)
                brains.initializeBuffer(buffer='userOtherBuffers');
            } else {
                [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),brains.users.size)
                brains.initializeBuffer(buffer='userOtherBuffers')
                brains.initializeBuffer(buffer='userVoltageBuffers')
            }
        }

        passedEEGCoords = eegCoords.map((arr,ind) => {
            if (ind >= channels){
                return [NaN,NaN,NaN]
            } else {
                return arr
            } 
        })

        gl.uniform3fv(uniformLocations.eeg_coords, new Float32Array(passedEEGCoords.flat()));


        // brains.initializeBuffer(separateUsers=true);
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
        document.getElementById('bottom-info').style.width = `calc(100vw - 200px)`;
    } else {
        document.getElementById('developer-tools').style.left = '-200px'
        canvas.width = window.innerWidth
        document.getElementById('bottom-info').style.width = `100vw`;
    }
    document.getElementById('canvas-message').style.width = `${canvas.width}px`;
}

function toggleLoginScreen(){
    showLogin = !showLogin; 
    
    if (showLogin){
        document.getElementById('login-container').style.zIndex = '2'
        document.getElementById('login-container').style.opacity = '1'
    } else {
        document.getElementById('login-container').style.opacity = '0'
        document.getElementById('login-container').style.zIndex = '-1'
    }
}

function toggleSignUpScreen(){
    showSignUp = !showSignUp; 
    
    if (showSignUp){
        document.getElementById('signup-container').style.zIndex = '2'
        document.getElementById('signup-container').style.opacity = '1'
    } else {
        document.getElementById('signup-container').style.opacity = '0'
        document.getElementById('signup-container').style.zIndex = '0'
    }
}


function toggleChat(){
    chat = !chat; 
    
    if (chat){
        document.getElementById('chat').style.right = '0'
    } else {
        document.getElementById('chat').style.right = '-300px'
    }
}

function toggleAccess(){
    public = !public;
    if (public){
        document.getElementById('access-mode').innerHTML = 'Public Mode'
        state = 3;
        initializeBrains()
    } else {
        state = 1;
        document.getElementById('access-mode').innerHTML = 'Isolation Mode'
        initializeBrains()
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
  


  // Pare Down Verbosity

  function programShaders(gl){
      // Create Shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)
      gl.shaderSource(vertexShader, BRAINSTORM_VERTEX_SHADER_SOURCE);
      gl.compileShader(vertexShader);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, BRAINSTORM_FRAGMENT_SHADER_SOURCE);
      gl.compileShader(fragmentShader);
  
      // Attach Shaders to Program
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      return gl, program
  }

  function initializeAttributes(gl, program, arrays){
      let attribs = {}
      for (key in arrays) {
        attribs[key] = {}
        attribs[key]['buffer'] = gl.createBuffer()
        attribs[key]['location'] =  gl.getAttribLocation(program, key);
        gl.enableVertexAttribArray(attribs[key]['location']);
        gl.bindBuffer(gl.ARRAY_BUFFER, attribs[key]['buffer'])
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays[key].data), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(attribs[key]['location'], arrays[key].numComponents, gl.FLOAT, false, 0, 0);
      }

      return gl, program, attribs
  }

  function updateBufferData(attribs, name, data){
    gl.bindBuffer(gl.ARRAY_BUFFER, attribs[name].buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
  }

  // Rotation
  function rotate(scene, dx,dy){

    if (!scene.shapes.includes('channels')){
        dx += AUTO_ROTATION_X;
    }
    mat4.invert(viewMatrix, viewMatrix);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -cameraCurr]);
    mat4.rotateY(viewMatrix, viewMatrix, -dx*2*Math.PI/canvas.height);
    mat4.rotateX(viewMatrix, viewMatrix, -dy*2*Math.PI/canvas.width);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
    mat4.invert(viewMatrix, viewMatrix);

  }

// Easing
function easeCamera(){
    if (cameraHome != cameraCurr) {

        // Reset camera in context
        mat4.invert(viewMatrix, viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -cameraCurr]);

        // Update camera position
        diff = cameraHome - cameraCurr
        if (Math.abs(diff) <= epsilon) {
            cameraCurr = cameraHome;
        } else {
            cameraCurr += scenes[state].ease * diff;
        }

        // Move to new position
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);
    }
}

function easeVertices() {
    // Ease points around
    if (ease){
        let count = 0;
        for (let point =0; point < vertexHome.length/3; point++){
            for (let ind=0;ind < 3; ind++) {
                    diff = vertexHome[3 * point + ind] - vertexCurr[3 * point + ind]
                    if (Math.abs(diff) <= epsilon) {
                        vertexCurr[3 * point + ind] = vertexHome[3 * point + ind];
                        count++
                    } else {
                        vertexCurr[3 * point + ind] += scenes[state].ease * diff;
                    }
                }}

        updateBufferData(attribs,'position',vertexCurr)
                
        // Change rendering mode with some delay if switching to lines
        lagDrawMode()
        
        if (count == vertexHome.length){
            ease = false
        }
    }
}

function lagDrawMode() {
    if (scenes[state].render == gl.LINES){
        if (renderLagStart == undefined){
            renderLagStart = Date.now();
        }
        if (Date.now() - renderLagStart >= 500){
            renderState = state
            renderLagStart = undefined;
        }
    } else if (renderState != state){
        renderState = state
        renderLagStart = undefined;
    }
}

function updateColorsByChannel(new_sync) {
    let projectionData = new Array(passedEEGCoords.length).fill(NaN);
        let dataOfInterest = []

        if (['projection','z_displacement'].includes(scenes[state].effect)){
            brains.eegChannelsOfInterest.forEach((channel,ind) => {
            if (scenes[state].signaltype == 'synchrony') {
                projectionData[channel] = new_sync[ind];
            } else {
                    if (brains.me != undefined && brains.userVoltageBuffers[brains.me].length > ind){
                        if (scenes[state].signaltype == 'voltage'){
                            projectionData[channel] = averagePower(brains.userVoltageBuffers[brains.me][ind]);
                        } else if (['delta','theta','alpha','beta','gamma'].includes(scenes[state].signaltype)){
                            try {
                                // NOTE: Not going to be correct with real-time sample rate
                                projectionData[channel] = bci.bandpower(brains.userVoltageBuffers[brains.me][ind], samplerate, scenes[state].signaltype, {relative: false});
                            } catch {
                                console.log('sample rate too low')
                            }
                    } else {
                        projectionData[channel] = 0;
                    }
                    }
            }
            dataOfInterest.push(projectionData[channel])
        })

        let totalAvg = average(dataOfInterest);
        let std = standardDeviation(dataOfInterest);

        let relSignal = new Array(passedEEGCoords.length).fill(0)
        let sig;
        
        brains.eegChannelsOfInterest.forEach((channel) => {
            sig = (projectionData[channel] - totalAvg)/std;
            if (isNaN(sig) && ['voltage','delta','theta','alpha','beta','gamma'].includes(scenes[state].signaltype)){
                relSignal[channel] = 0;
            } else if (isNaN(sig) && ['synchrony'].includes(scenes[state].signaltype)) {
                relSignal[channel] = projectionData[channel];
            }
            else {
                relSignal[channel] = sig;
            }
        })

        if (['projection'].includes(scenes[state].effect) && brains.me != undefined){
            gl.uniform1fv(uniformLocations.eeg_signal, new Float32Array(relSignal));
        } 
        
        if (['z_displacement'].includes(scenes[state].effect)) {
                if (scenes[state].signaltype == 'voltage'){
                    updateBufferData(attribs,'z_displacement',brains.BufferToWebGL_Normalized())
                } else {
                    let relSignalOfInterest = [];
                    relSignal.forEach((data,channel)=> {
                        if (brains.eegChannelsOfInterest.includes(channel)){
                            relSignalOfInterest.push(data)
                        }
                    })
                    if (brains.me != undefined){
                        brains.updateBuffer(source=relSignalOfInterest,buffer='userOtherBuffers')
                    } else {
                        brains.updateBuffer(source=new Array(relSignalOfInterest.length).fill(NaN),buffer='userOtherBuffers')
                    }
                    updateBufferData(attribs,'z_displacement',brains.BufferToWebGL(buffer='userOtherBuffers'))
                }
        }
    }
}


// Update Signal Type

function updateSignalType(el){
    scenes[state].signaltype = el.innerHTML.toLowerCase(); 
    document.getElementById('signal-type').innerHTML = el.innerHTML.toLowerCase(); 
    newSignalType = true;
}
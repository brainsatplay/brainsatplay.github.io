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
    let rotation = true;
    let zoom = true;

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
        game.initializeBuffer('focusBuffer')
        game.initializeBuffer('userVoltageBuffers')
        updateBufferData(attribs,'z_displacement',convertToWebGL(game.flatten('userVoltageBuffers', true), 0))
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
            game.initializeBuffer('focusBuffer');
        } else {
            [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),game.info.brains)
            game.initializeBuffer('focusBuffer')
            game.initializeBuffer('userVoltageBuffers')
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
    updateUI();

    // reset z_displacement to zero when not being actively updated
    if (!['z_displacement'].includes(scenes[state].effect) && dispBuffer != undefined){
        game.initializeBuffer('focusBuffer')
        game.initializeBuffer('userVoltageBuffers')
        updateBufferData(attribs,'z_displacement',convertToWebGL(game.flatten('focusBuffer', false),0))
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
        SIGNAL_SUSTAIN = Math.round(SIGNAL_SUSTAIN_ORIGINAL/game.usedChannels.length)

        if (SIGNAL_SUSTAIN%2 == 0){
            SIGNAL_SUSTAIN += 1;
        }

        if (shapes.includes('channels')) {
            if (scenes[state].signaltype != 'voltage'){
                [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),1)
                game.initializeBuffer('focusBuffer');
            } else {
                [vertexHome, , ease, rotation, zoom] = switchToChannels(Math.round(pointCount/shapes.length),game.info.brains)
                game.initializeBuffer('focusBuffer')
                game.initializeBuffer('userVoltageBuffers')
            }
        }

        let passedEEGCoords = [];
        Object.keys(game.eegChannelCoordinates).forEach((name) => {
            if (game.usedChannelNames.indexOf(name) != -1){
                passedEEGCoords.push(game.eegChannelCoordinates[name])
            } else {
                passedEEGCoords.push([NaN,NaN,NaN])

            }
        })

        gl.uniform3fv(uniformLocations.eeg_coords, new Float32Array(passedEEGCoords.flat()));


        // game.initializeBuffer(separateUsers=true);
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
    game.info.public = !game.info.public;
    if (game.info.public){
        document.getElementById('access-mode').innerHTML = 'Public Mode'
        game.connection.send(JSON.stringify({'destination':'initializeBrains','public': BrainsAtPlay.public}));
    } else {
        document.getElementById('access-mode').innerHTML = 'Isolation Mode'
        game.connection.send(JSON.stringify({'destination':'initializeBrains','public': BrainsAtPlay.public}));
    }
}


function toggleUI(){
    showUI = !showUI;

    if (showUI){
        document.getElementById('ui-elements').style.display = 'block'
        } else {
            document.getElementById('ui-elements').style.display = 'none'
        }
}


function updateUI(){
    let dynamicSignalArray = ['delta', 'theta', 'alpha', 'beta', 'gamma']
    let opacity;
    let pointer;

    if (game.connection != undefined){
        if (game.info.public){
            document.getElementById('brain').style.opacity = '100%'
            document.getElementById('channels').style.opacity = '100%'
            document.getElementById('brain').style.pointerEvents = 'auto'
            document.getElementById('channels').style.pointerEvents = 'auto'
            document.getElementById('userinfo').style.opacity = '100%'
            document.getElementById('groupdynamics').style.opacity = '100%'
            document.getElementById('userinfo').style.pointerEvents = 'auto'
            if (game.info.brains < 2){
                document.getElementById('groupdynamics').style.opacity = '25%'
                document.getElementById('groupdynamics').style.pointerEvents = 'none'
                document.getElementById('userinfo').style.opacity = '25%'
                document.getElementById('userinfo').style.pointerEvents = 'none'
            } else {
                document.getElementById('groupdynamics').style.opacity = '100%'
                document.getElementById('groupdynamics').style.pointerEvents = 'auto'
                document.getElementById('userinfo').style.opacity = '100'
                document.getElementById('userinfo').style.pointerEvents = 'auto'
            }

            if (['projection','z_displacement'].includes(scenes[state].effect)){
                opacity = '0%'
                pointer = 'none'
                
                if (scenes[state].effect == 'projection'){

                    dynamicSignalArray.push('voltage')
                    let prevSig = document.getElementById('signal-type').innerHTML
                    if (prevSig != 'synchrony'){
                        scenes[state].signaltype = 'synchrony'; 
                        document.getElementById('signal-type').innerHTML = 'synchrony'; 
                        newSignalType = true;
                    }
                } else if (scenes[state].effect == 'z_displacement'){
                    document.getElementById('voltage').style.opacity = '100%'
                    document.getElementById('voltage').style.pointerEvents = 'auto'
                }

                if (game.info.brains < 2){
                    dynamicSignalArray.push('synchrony')
                } else {
                    document.getElementById('synchrony').style.opacity = '100%'
                    document.getElementById('synchrony').style.pointerEvents = 'auto'
                }

            } else {
                dynamicSignalArray.push(...['voltage','synchrony'])
                opacity = '0%'
                pointer = 'none'
            }

            dynamicSignalArray.forEach((id) => {
                    document.getElementById(id).style.opacity = opacity
                    document.getElementById(id).style.pointerEvents = pointer
            })
        } else {
            document.getElementById('brain').style.opacity = '100%'
            document.getElementById('channels').style.opacity = '100%'
            document.getElementById('brain').style.pointerEvents = 'auto'
            document.getElementById('channels').style.pointerEvents = 'auto'
            document.getElementById('userinfo').style.opacity = '25%'
            document.getElementById('groupdynamics').style.opacity = '25%'
            document.getElementById('userinfo').style.pointerEvents = 'none'
            document.getElementById('groupdynamics').style.pointerEvents = 'none'

            if (['projection','z_displacement'].includes(scenes[state].effect)){
                dynamicSignalArray.push(...['voltage'])
                opacity = '100%'
                pointer = 'auto'
                document.getElementById('synchrony').style.opacity = '0%'
                document.getElementById('synchrony').style.pointerEvents = 'none'
            } else {
                opacity = '0%'
                pointer = 'none'
            }

            dynamicSignalArray.forEach((id) => {
                    document.getElementById(id).style.opacity = opacity
                    document.getElementById(id).style.pointerEvents = pointer
            })
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

            dynamicSignalArray.push(...['voltage','synchrony'])
            if (['projection','z_displacement'].includes(scenes[state].effect)){
                opacity = '100%'
                pointer = 'auto'
            } else {
                opacity = '0%'
                pointer = 'none'
            }

            dynamicSignalArray.forEach((id) => {
                    document.getElementById(id).style.opacity = opacity
                    document.getElementById(id).style.pointerEvents = pointer
            })
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
        let home;
        let curr;
        for (let point =0; point < vertexHome.length/3; point++){
            for (let ind=0;ind < 3; ind++) {
                    home = vertexHome[3 * point + ind];
                    curr = vertexCurr[3 * point + ind]
                    if (!isNaN(home) && !isNaN(curr)){
                    if (Math.abs(home - curr) <= epsilon) {
                        vertexCurr[3 * point + ind] = vertexHome[3 * point + ind];
                        count++
                    }
                    else {
                        vertexCurr[3 * point + ind] += scenes[state].ease * (home - curr);
                    }
                } else{
                    if (isNaN(home)){
                        vertexCurr[3 * point + ind] = NaN;
                        count++;
                    } else {
                        vertexCurr[3 * point + ind] = (Math.random()-0.5)*GENERIC_ZOOM;
                    }
                }
            }
        }

        updateBufferData(attribs,'position',vertexCurr)

        if (count == vertexHome.length){
            ease = false
        }
    }
}

function lagDrawMode() {
    if (scenes[state].render != gl.POINTS){
        if (renderLagStart == undefined || (renderLagStart == false && newSignalType)){
            renderLagStart = Date.now();
        }
        if (Date.now() - renderLagStart >= 500){
            renderState = state
            renderLagStart = false;
        }
    } else if (renderState != state){
        renderState = state
        renderLagStart = undefined;
    }
}

function updateColorsByChannel(new_sync) {
        let relSignal = new Array(Object.keys(game.eegChannelCoordinates).length).fill(NaN);
        if (['projection','z_displacement'].includes(scenes[state].effect)){
            if (scenes[state].signaltype == 'synchrony') {
                game.usedChannels.forEach((channelInfo,ind) => {
                    relSignal[channelInfo.index] = new_sync[ind]; // absolute
                })
            } else if (scenes[state].signaltype == 'voltage'){
                relSignal = game.getPower(relative=true) // relative
            } else if (['delta','theta','alpha','beta','gamma'].includes(scenes[state].signaltype)){
                relSignal = game.getBandPower(scenes[state].signaltype, relative=true) // relative
            }

        if (['projection'].includes(scenes[state].effect)){
            gl.uniform1fv(uniformLocations.eeg_signal, new Float32Array(relSignal));
        }
        
        
        if (['z_displacement'].includes(scenes[state].effect)) {
                if (scenes[state].signaltype == 'voltage'){
                    updateBufferData(attribs,'z_displacement',convertToWebGL(game.flatten('userVoltageBuffers', true),0))
                } else {
                    let relSignalOfInterest = [];
                    game.usedChannels.forEach((channelInfo)=> {
                        relSignalOfInterest.push(relSignal[channelInfo.index])
                    })
                    game.updateBuffer(source=relSignalOfInterest,'focusBuffer')
                    updateBufferData(attribs,'z_displacement',convertToWebGL(game.flatten('focusBuffer', false),0))
                }
        }

    } else {
        gl.uniform1fv(uniformLocations.eeg_signal, new Float32Array(relSignal));
    }
}


// Update Signal Type

function updateSignalType(el){
    let prevSig = document.getElementById('signal-type').innerHTML
    if (prevSig != el.firstElementChild.innerHTML.toLowerCase()){
        scenes[state].signaltype = el.firstElementChild.innerHTML.toLowerCase();
        document.getElementById('signal-type').innerHTML = el.firstElementChild.innerHTML.toLowerCase();
        newSignalType = true;
    }
}

function brainDependencies(updateArray){

    updateArray.forEach((updateObj) => {
    if (updateObj.destination !== undefined && updateObj.destination.length != 0) {
    if (updateObj.destination == 'opened'){
        game.initializeBuffer('userVoltageBuffers')
        game.initializeBuffer('focusBuffer')
        state = 1;
        stateManager(true)
    } else if (updateObj.destination == 'error'){
        console.log('error')
        announcement('WebSocket error.\n Please refresh your browser and try again.');
    } else if (updateObj.destination == 'init'){
        stateManager(true)

        // Announce number of brains currently online
        if (game.info.public === true && (updateObj.nBrains > 0) && game.brains.get('me') == undefined){
            announcement(`<div>Welcome to the Brainstorm
                            <p class="small">${game.info.brains} brains online</p></div>`)
            document.getElementById('nBrains').innerHTML = `${game.info.brains}`
        } else if (game.info.public === false) {
            if (updateObj.privateBrains){
                document.getElementById('nBrains').innerHTML = `1`
            } else {
                if (game.brains.has("me")){
                    document.getElementById('nBrains').innerHTML = `0`
                } else {
                    document.getElementById('nBrains').innerHTML = `${game.info.brains}`
                }
            }
        } else {
            announcement(`<div>Welcome to the Brainstorm
                            <p class="small">No brains online</p></div>`)
            document.getElementById('nBrains').innerHTML = `0`
        }
        if (game.info.public === false) {
            document.getElementById('nInterfaces').innerHTML = `1`
        } else {
            document.getElementById('nInterfaces').innerHTML = `${game.info.interfaces}`
        }

    } else if (updateObj.destination == 'brains'){
        update = updateObj.n;

        if (state != 0){
            stateManager(true)
        }

        if ((game.info.public) || (!game.info.public && updateObj.access === 'private')){
            if (update == 1){
                    if (game.info.public){
                        document.getElementById('nBrains').innerHTML = `${game.info.brains}`
                    } else if (!game.info.public && updateObj.access === 'private') {
                        document.getElementById('nBrains').innerHTML = `1`
                    }
            } else if (update == -1){
                let brainReadout = document.getElementById('nBrains')
                if (game.info.public){
                    if ((game.info.brains == 0) || (brainReadout.innerHTML == '1')){
                        announcement('all users left the brainstorm')
                        brainReadout.innerHTML = `0`
                    } else {
                        brainReadout.innerHTML = `${game.info.brains}`
                    }
                } else if (!game.info.public && updateObj.access === 'private'){
                    brainReadout.innerHTML = `0`
                }
            }
        }
    } else if (updateObj.destination == 'interface'){
        document.getElementById('nInterfaces').innerHTML = `${game.info.interfaces}`
    } else if (updateObj.destination =='closed'){
        announcement(`<div>Exiting the Brainstorm
            <p class="small">Thank you for playing!</p></div>`)
            if (window.innerWidth >= 768) {
                document.getElementById('id-params').style.display = `none`;
                document.getElementById('nBrains-params').style.display = `none`;
                document.getElementById('nInterfaces-params').style.display = `none`;
            }
            document.getElementById('access-mode-div').innerHTML = ` 
            <p id="access-mode" class="small">Not Connected</p>
            `
            document.getElementById("connection-button").innerHTML = `
                                Connect
                                <span class="tooltiptext"><p>Connect to Network</p><hr/><p class="small">View live brain data from Brains@Play server</p></span>
            `;
            state = 1;
            game.initializeBuffer('userVoltageBuffers')
            game.initializeBuffer('focusBuffer')
            stateManager(true)
    }
}
})
}


 // WebGL Conversion

 function convertToWebGL(flattenedArray, filler){
     let currDataPoints = flattenedArray.length
     let upsamplingFactor = Math.floor(pointCount/currDataPoints)

    // factor must be odd
     if (upsamplingFactor%2 == 0){
         upsamplingFactor += 1;
     }

     let newArray = new Array(pointCount).fill(filler)

     for (i = 0; i < currDataPoints; i++){
         for (j = 0; j < upsamplingFactor; j++){
            newArray[(i*upsamplingFactor) + j] = flattenedArray[i]
         }
     }
      
     return newArray
 }

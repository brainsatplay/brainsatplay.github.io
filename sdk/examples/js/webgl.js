function particleCloud() {

    if (!gl) {
        throw new Error('WebGL not supported')
    }

    stateManager(animState)

    animStart = Date.now();
    vertexCurr = vertexHome;

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
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Initialize Vertex Attributes
    positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(passedEEGCoords.flat(2)), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    dispBuffer = gl.createBuffer();
    const dispLocation = gl.getAttribLocation(program, `z_displacement`);
    gl.enableVertexAttribArray(dispLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, brains.BufferToWebGL(), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(dispLocation, 1, gl.FLOAT, false, 0, 0);

// Set Uniform Locations
    uniformLocations = {
        effect: gl.getUniformLocation(program,`effect`),
        matrix: gl.getUniformLocation(program, `matrix`),
        u_time: gl.getUniformLocation(program, `u_time`),
        synchrony: gl.getUniformLocation(program, `synchrony`),
        eeg_coords: gl.getUniformLocation(program,`eeg_coords`),
        eeg_signal: gl.getUniformLocation(program,`eeg_signal`),
        ambientNoiseToggle: gl.getUniformLocation(program,'u_ambientNoiseToggle'),
        aspectChange: gl.getUniformLocation(program,'aspectChange'),
        mousePos: gl.getUniformLocation(program,'mousePos'),
        colorToggle: gl.getUniformLocation(program,'colorToggle'),
    };

    // initialize uniforms that don't change on every draw loop
    gl.uniform3fv(uniformLocations.eeg_coords, new Float32Array(passedEEGCoords.flat()));
    gl.uniform1i(uniformLocations.effect, effects.indexOf(visualizations[state].effect));
    gl.uniform1i(uniformLocations.ambientNoiseToggle, 1);
    gl.uniform1i(uniformLocations.colorToggle, 1);

// Create Model, View, and ProjectionMatrices
    const modelMatrix = mat4.create();

    viewMatrix = mat4.create();
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
    mat4.invert(viewMatrix, viewMatrix);
    originalAspectX = canvas.width
    originalAspectY = canvas.height

    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        75 * Math.PI / 180, // vertical field-of-view (angle, radians)
        originalAspectX/originalAspectY, // aspect W/H
        1e-4, // near cull distance
        1e4, // far cull distance
    );

    const mvMatrix = mat4.create();
    const mvpMatrix = mat4.create();


    

    function animate() {
        requestAnimationFrame(animate)
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        mouseState()
        brains.getMe()

        // Allow auto-rotation
        if (!visualizations[state].shapes.includes('channels')){
            diff_x += AUTO_ROTATION_X;
        }


        // Update State
        if (state != prevState){
            animState = 0;
            stateManager(animState);
            gl.uniform1i(uniformLocations.effect, effects.indexOf(visualizations[state].effect));
            animStart = Date.now()
        }

        // Update Animation
        if (visualizations[state].timer && ((Date.now() - animStart)/1000 > visualizations[state].timer)){
            state += 1;
            stateManager(animState);
            gl.uniform1i(uniformLocations.effect, effects.indexOf(visualizations[state].effect));
            animStart = Date.now()
        }


        // Generate signal if specified
        if (generate) {
            if (count == generate_interval-1){
                sendSignal(channels)
                count = 0;
            } else {
                count += 1
            }}

        // Update rotation speeds
        moveStatus = false;
        diff_x *= (1-visualizations[state].ease);
        diff_y *= (1-visualizations[state].ease);

        // Get synchrony
        if (visualizations[state].signaltype == 'synchrony') {
            
            
            // NOTE: Synchrony of first two users only
            synchrony.shift()
            if (brains.users.size > 1){
            // Generate edge array
            keys = brains.users.keys()
            let edgeArray = [];
            let currentEdge = []
            currentEdge.push(keys.next().value) // Brain 1
            currentEdge.push(keys.next().value) // Brain 2
            edgeArray.push(currentEdge)
            new_sync = brains.synchrony('pcc',edgeArray)
        } else {
            new_sync = new Array(channels).fill(0)
        }

        if (!isNaN(average(new_sync))) {
            synchrony.push(average(new_sync))
        } else {
            synchrony.push(0)
        }
    } else {
        synchrony.shift()
        synchrony.push(0)
    }

        // Modify View Matrix
        mat4.invert(viewMatrix, viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -cameraCurr]);
        mat4.rotateY(viewMatrix, viewMatrix, -diff_x*2*Math.PI/canvas.height);
        mat4.rotateX(viewMatrix, viewMatrix, -diff_y*2*Math.PI/canvas.width);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);

        // Create container matrix for WebGL
        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)

        // Update Uniforms
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.uniform1f(uniformLocations.u_time, t/200);
        gl.uniform1f(uniformLocations.synchrony, average(synchrony));
        gl.uniform2fv(uniformLocations.aspectChange, [(canvas.width)/(originalAspectX),(canvas.height)/(originalAspectY)]);

        if (mouseDistort){
        gl.uniform2fv(uniformLocations.mousePos, [(x - (canvas.width/2))/2,((canvas.height/2) - y)/2]);
        } else {
            gl.uniform2fv(uniformLocations.mousePos, [NaN,NaN]);
        }

        // Update Voltages Unless No Brains
        if (brains.users.size > 0){
            brains.updateBuffer(source='brains')
        }

        // Update 3D brain color with your data
        let projectionData = new Array(passedEEGCoords.length).fill(NaN);
        let dataOfInterest = []

        if (['projection','z_displacement'].includes(visualizations[state].effect)){
            eegChannelsOfInterest.forEach((channel,ind) => {
            if (visualizations[state].signaltype == 'synchrony') {
                projectionData[channel] = new_sync[ind];
            } else {
                    if (brains.me != undefined && brains.userVoltageBuffers[brains.me].length > ind){
                        if (visualizations[state].signaltype == 'voltage'){
                            projectionData[channel] = averagePower(brains.userVoltageBuffers[brains.me][ind]);
                        } else if (['delta','theta','alpha','beta','gamma'].includes(visualizations[state].signaltype)){
                            try {
                                // NOTE: Not going to be correct with real-time sample rate
                                projectionData[channel] = bci.bandpower(brains.userVoltageBuffers[brains.me][ind], samplerate, visualizations[state].signaltype, {relative: false});
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
        
        eegChannelsOfInterest.forEach((channel) => {
            sig = (projectionData[channel] - totalAvg)/std;
            if (isNaN(sig) && ['voltage','delta','theta','alpha','beta','gamma'].includes(visualizations[state].signaltype)){
                relSignal[channel] = 0;
            } else if (isNaN(sig) && ['synchrony'].includes(visualizations[state].signaltype)) {
                relSignal[channel] = projectionData[channel];
            }
            else {
                relSignal[channel] = sig;
            }
        })

        if (['projection'].includes(visualizations[state].effect) && brains.me != undefined){
            gl.uniform1fv(uniformLocations.eeg_signal, new Float32Array(relSignal));
        } 
        
        if (['z_displacement'].includes(visualizations[state].effect)) {
                gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
                if (visualizations[state].signaltype == 'voltage'){
                    gl.bufferData(gl.ARRAY_BUFFER, brains.BufferToWebGL_Normalized(), gl.DYNAMIC_DRAW);
                } else {
                    if (brains.me != undefined){
                        brains.updateBuffer(source=relSignal,buffer='userOtherBuffers')
                    } else {
                        brains.updateBuffer(source=new Array(relSignal.length).fill(NaN),buffer='userOtherBuffers')
                    }
                    gl.bufferData(gl.ARRAY_BUFFER, brains.BufferToWebGL(buffer='userOtherBuffers'), gl.DYNAMIC_DRAW);
                }
        }
    } 


        // Ease camera
        if (cameraHome != cameraCurr) {

            // Reset camera in context
            mat4.invert(viewMatrix, viewMatrix);
            mat4.translate(viewMatrix, viewMatrix, [0, 0, -cameraCurr]);

            // Update camera position
            diff = cameraHome - cameraCurr
            if (Math.abs(diff) <= epsilon) {
                cameraCurr = cameraHome;
            } else {
                cameraCurr += visualizations[state].ease * diff;
            }

            // Move to new position
            mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
            mat4.invert(viewMatrix, viewMatrix);
        }


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
                            vertexCurr[3 * point + ind] += visualizations[state].ease * diff;
                        }
                    }}

            // let constructedBrain = vertexCurr.map((val,ind) => {
            //     // if (ind < t*10000){
            //         return val/100
            //     // } else {
            //     //     return 0
            //     // }
            // })

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);
                    
            // Change rendering method with some delay if switching to lines
            if (visualizations[state].render == gl.LINES){
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
            
            if (count == vertexHome.length){
                ease = false
            }

        }

        // Draw
        gl.drawArrays(visualizations[renderState].render, 0, vertexCurr.length / 3);
        // gl.drawArrays(visualizations[renderState].render, 0, passedEEGCoords.length);


        // Update states for next animation loop
        prevState = state;
        t++;

        // Remove message if not for the state itself
        if ((messageStartTime != undefined) && (visualizations[state].message == '') && (Date.now() - messageStartTime >= 2000)){
            messageStartTime = undefined;
            document.getElementById('canvas-message').style.opacity = 0;
        }

        // Remove projection options if effect is not projection
        if (['projection','z_displacement'].includes(visualizations[state].effect) && document.getElementById('signaltypes').style.opacity != '100%'){
            document.getElementById('signaltypes').style.opacity = '100%'
        } else {
            document.getElementById('signaltypes').style.opacity = '0%'
        }
    };
    animate()
}

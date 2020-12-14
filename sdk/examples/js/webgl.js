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
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    dispBuffer = gl.createBuffer();
    const dispLocation = gl.getAttribLocation(program, `z_displacement`);
    gl.enableVertexAttribArray(dispLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, brains.WebGLBuffer(), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(dispLocation, 1, gl.FLOAT, false, 0, 0);

// Set Uniform Locations
    uniformLocations = {
        effect: gl.getUniformLocation(program,`effect`),
        matrix: gl.getUniformLocation(program, `matrix`),
        u_time: gl.getUniformLocation(program, `u_time`),
        distortion: gl.getUniformLocation(program, `u_distortion`),
        noiseCoeff: gl.getUniformLocation(program, `u_noiseCoeff`),
        synchrony: gl.getUniformLocation(program, `synchrony`),
        eeg_coords: gl.getUniformLocation(program,`eeg_coords`),
        eeg_power: gl.getUniformLocation(program,`eeg_power`),
        ambientNoiseToggle: gl.getUniformLocation(program,'u_ambientNoiseToggle'),
        aspectChange: gl.getUniformLocation(program,'aspectChange'),
    };

    // only pass EEG coordinates for existing channels
    passedEEGCoords = eegCoords.map((arr,ind) => {
        if (ind >= channels){
            return [NaN,NaN,NaN]
        } else {
            return arr
        } 
    })

    // initialize uniforms that don't change on every draw loop
    gl.uniform3fv(uniformLocations.eeg_coords, new Float32Array(passedEEGCoords.flat()));
    gl.uniform1i(uniformLocations.effect, effects.indexOf(effect_array[state][animState]));
    gl.uniform1i(uniformLocations.ambientNoiseToggle, 1);


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


        // Allow auto-rotation
        if (shape_array[state][animState] != 'voltage'){
            diff_x += AUTO_ROTATION_X;
        }


        // Update State
        if (state != prevState){
            animState = 0;
            stateManager(animState);
            gl.uniform1i(uniformLocations.effect, effects.indexOf(effect_array[state][animState]));
            animStart = Date.now()
        }

        // Update Animation
        if (anim_array[state][animState] && ((Date.now() - animStart)/1000 > anim_array[state][animState])){


            // If there is a shape within the current state to animate to
            if ((anim_array[state].length-1) > animState){
                animState += 1;
            }
            // Else animate into next state
            else {
                animState = 0;
                state += 1;
            }

            stateManager(animState);
            gl.uniform1i(uniformLocations.effect, effects.indexOf(effect_array[state][animState]));
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


        // Append voltage stream to array
        brains.updateUserBuffers()

        // Push voltage stream to displacement buffer
        if (shape_array[state][animState] == 'voltage') {
            gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, brains.WebGLVoltageDisplacementBuffer(), gl.DYNAMIC_DRAW);
        } 
        // Update rotation speeds
        moveStatus = false;
        diff_x *= (1-ease_array[state][animState]);
        diff_y *= (1-ease_array[state][animState]);

        // Modify Distortion
        if (distortFlag) {
            if (Math.sign(distortIter) == -1){
                distortIter =+ ease_array[state][animState]*(-distortion)
            }
            if (distortion >= 0){
                distortion += distortIter;
            }
        }

        // Get synchrony
        if (effect_array[state][animState] == 'synchrony') {
            // Synchrony of you and other users

            if (brains.users.size > 1){
            // Generate edge array
            keys = brains.users.keys()
            let edgeArray = [];
            let currentEdge = []
            currentEdge.push(keys.next().value)
            currentEdge.push(keys.next().value)
            edgeArray.push(currentEdge)
            new_sync = brains.synchrony('pcc',edgeArray)
            // Slowly ease to the newest synchrony value
            synchrony.shift()
            if (!isNaN(new_sync)) {
                synchrony.push(new_sync)
            } else {
                synchrony.push(0)
            }
        } else {
            synchrony.shift()
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
        gl.uniform1f(uniformLocations.noiseCoeff,distortion/5);
        gl.uniform1f(uniformLocations.distortion, distortion/100);
        gl.uniform1f(uniformLocations.u_time, t/200);
        gl.uniform1f(uniformLocations.synchrony, average(synchrony));
        gl.uniform2fv(uniformLocations.aspectChange, [(canvas.width)/(originalAspectX),(canvas.height)/(originalAspectY)]);
        
        let avg = [];

        // Update 3D brain color with your data
        let user = 0;
        for (let [key] of brains.users) {
            if (key == userId || key == 'me'){
                for (let channel = 0; channel < eegCoords.length; channel++){
                    if (brains.userBuffers[user].length > channel){
                        avg.push(averagePower(brains.userBuffers[user][channel]));
                        } else {
                            avg.push(0);
                        }
                    }
                }
                user++
            }

        let totalAvg = average(avg);
        let std = standardDeviation(avg);

        let relPowers = new Array(eegCoords.length).fill(0)
        let pow;
        for (let channel = 0; channel < avg.length; channel++){
            pow = (avg[channel] - totalAvg)/std;
            if (isNaN(pow)){
                relPowers[channel] = 0;
            } else {
                relPowers[channel] = pow;
            }
        }
        gl.uniform1fv(uniformLocations.eeg_power, new Float32Array(relPowers));


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
                cameraCurr += ease_array[state][animState] * diff;
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
                            vertexCurr[3 * point + ind] += ease_array[state][animState] * diff;
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
            if (render_array[state][animState] == gl.LINES){
                if (count >= vertexHome.length/3 && (renderState != state || animState != renderAnimState)){
                    renderState = state
                    renderAnimState = animState
                }
            } else if (renderState != state || animState != renderAnimState){
                renderState = state
                renderAnimState = animState
            }
            
            if (count == vertexHome.length){
                ease = false
            }

        }

        // Draw
        gl.drawArrays(render_array[renderState][renderAnimState], 0, vertexCurr.length / 3);

        // Update states for next animation loop
        prevState = state;
        t++;
    };
    animate()
}

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


function closeTutorial() {
    setTimeout(() => {
        document.getElementById("tutorial").style.opacity = '0';
        document.getElementById("tutorial").style.pointerEvents = 'none';
    }, this.animationDelay + 10);
}

function openTutorial(){
    setTimeout(() => {
        document.getElementById("tutorial").style.opacity = '.9';
        document.getElementById("tutorial").style.pointerEvents = 'auto';
    }, this.animationDelay + 10);
}

//
// Synchrony Calculation
// Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
//

function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;

    if (x.length == y.length) {
        shortestArrayLength = x.length;
    } else if (x.length > y.length) {
        shortestArrayLength = y.length;
        // console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        // console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (var i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;

    return answer;
}


//
// Two Way Data Binding
//

var elements = document.querySelectorAll('[data-tw-bind]'),
    scope = {};
elements.forEach(function(element) {
    //execute scope setter
    if(element.type === 'text'|| element.type === 'textarea' || element.type === 'range'){
        var propToBind = element.getAttribute('data-tw-bind');
        addScopeProp(propToBind);
        element.oninput = function(){
            scope[propToBind] = element.value;
        }

        //bind prop to elements
        function addScopeProp(prop){
            //add property if needed
            if(!scope.hasOwnProperty(prop)){
                //value to populate with newvalue
                var value;
                Object.defineProperty(scope, prop, {
                    set: function (newValue) {
                        value = newValue;
                        elements.forEach(function(element){
                            //change value to binded elements
                            if(element.getAttribute('data-tw-bind') === prop){
                                if(element.type && (element.type === 'text' ||
                                    element.type === 'textarea'||
                                    element.type === 'range')){
                                    element.value = newValue;
                                }
                                else if(!element.type){
                                    element.innerHTML = newValue;
                                }
                            }
                        });
                    },
                    get: function(){
                        return value;
                    },
                    enumerable: true
                });
            }
        }
    }});

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


function resetDisplacement(){
    let displacement = [];
    let user;
    let perUser = Math.floor(pointCount/(brains.users.size*channels))
    for(user=0; user < brains.users.size; user++){
        displacement.push(new Array())
        for(let chan=0; chan < channels; chan++){
            displacement[user].push(new Array(perUser).fill(0.0));
        }
    }

    let remainder = pointCount - channels*brains.users.size*perUser
        for (let chan = 0; chan < channels; chan++) {
            for (user = 0; user < brains.users.size; user++)
                if (remainder > 0) {
                    remainder--;
                    displacement[user][chan].push(0.0)
                }
        }

    return displacement
}

function generateSignal(generate, channels){
    generate = !generate;
    sendSignal(channels);

    if ( generate ){
        document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
            "<p>Stop Autoplay</p>"
    } else {
        document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Autoplay Signal</p>"
    }

    return generate
}

function sendSignal(channels) {

    for (let user = 0; user < 2; user++){
        let signal = new Array(channels);
        for (let channel =0; channel < channels; channel++) {
            signal[channel] = bci.generateSignal([Math.random()], [base_freq+(channel)], samplerate, (1/base_freq));
        }
        let startTime = Date.now()
        let time = makeArr(startTime,startTime+(1/base_freq),(1/base_freq)*samplerate)

        let data = {
            type: 'ts_filtered',
            signal: signal,
            time: time
        }
        if (user == 0) {
        brains.users.get("me").streamIntoBuffer(data)
        } else {        
            brains.users.get("other").streamIntoBuffer(data)
        }

}
}

function switchToVoltage(pointCount){
    // Reset View Matrix
    viewMatrix = mat4.create();
    cameraHome = zoom_array[state][animState];
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
    mat4.invert(viewMatrix, viewMatrix);

    let vertexHome;
    // Create signal dashboard
    vertexHome = getVoltages([],pointCount,brains.users.size);
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
        distortIter =+ ease_array[state][animState] * (-distortion);
    }

    if ( distort ){
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
            "<p>Undistort Shape</p>"
    } else {
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Distort Shape</p>"
    }
}


function stateManager(animState){
    // reset displacement if leaving voltage visualization

    if (shape_array[prevState][animState] == 'voltage') {
        brains.initializeUserBuffers();
        gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, brains.WebGLBuffer(), gl.DYNAMIC_DRAW);
    }

    // set up variables for new state
    if (shape_array[state][animState] == 'brain'){
        vertexHome = [...brainVertices];
        ease = true;
        rotation = true;
        zoom = true;
    } 

    if (shape_array[state][animState] == 'voltage'){
        cameraHome = zoom_array[state][animState];
        [vertexHome, viewMatrix, ease, rotation, zoom] = switchToVoltage(pointCount)

        brains.initializeUserBuffers();
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 0);
        }
    }
    else {
        viewMatrix = mat4.create();
        cameraHome = zoom_array[state][animState];
        mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);
        if (uniformLocations != undefined){
            gl.uniform1i(uniformLocations.ambientNoiseToggle, 1);
        }
    }

    if (shape_array[state][animState] != 'brain' && shape_array[state][animState] != 'voltage'){
        vertexHome = createPointCloud(shape_array[state][animState], pointCount);
        ease = true;
        rotation = false;
        zoom = false;
    }

    if (!rotation){
        diff_x = 0;
        diff_y = 0;
    }

    // Show Message
    
if (message_array[state][animState] != '') {
    $('#canvas-message').animate({'opacity': 0}, 400, function(){
        $(this).html(message_array[state][animState]).animate({'opacity': 1}, 400);
    });
} else {
    $('#canvas-message').animate({'opacity': 0}, 400)
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
    announcement(message)
}

function announcement(message){
    $('#canvas-message').animate({'opacity': 0}, 2000, function(){
        $(this).html(message).animate({'opacity': 1}, 2000, function() {
            $(this).html(message).animate({'opacity': 0}, 2000, function() {
            });
        });
    });
}

function updateChannels(newChannels) {
        
        if (channels != newChannels) {
            channels = newChannels;
        SIGNAL_SUSTAIN = Math.round(SIGNAL_SUSTAIN_ORIGINAL/channels)

        if (SIGNAL_SUSTAIN%2 == 0){
            SIGNAL_SUSTAIN += 1;
        }

        if (shape_array[state][animState] == 'voltage') {
            [vertexHome, , ease, rotation, zoom] = switchToVoltage(pointCount)
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
    } else {
        document.getElementById('developer-tools').style.left = '-200px'
        canvas.width = window.innerWidth
    }
    document.getElementById('canvas-message').style.width = `${canvas.width}px`;
}

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
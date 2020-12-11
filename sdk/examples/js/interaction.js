
// Mouse Click

function mouseDown(ev){
        holdStatus = true;
        x = ev.clientX
        y = ev.clientY
        prev_x = x;
        prev_y = y;
}

function mouseUp(ev){
        holdStatus = false;
        vertexVel = new Array(pointCount*3).fill(0);
}

function mouseState() {
    if (holdStatus && moveStatus) {
        if (rotation){
            diff_x = (x - prev_x);
            diff_y = (y - prev_y)
        }
        prev_x = x;
        prev_y = y;
    }
}

// Mouse Move 
function mouseMove(ev){
    moveStatus = true;
    x = ev.clientX
    y = ev.clientY
}

// Scroll
function wheelMove(ev) {
    if (zoom) {
        scroll = ev.deltaY;
        mat4.invert(viewMatrix, viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -cameraCurr]);
        cameraHome += scroll / 100;
        cameraCurr += scroll / 100;
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);
    }
}


// Keyboard Shortcuts
function keyboardShortcuts(ev){
    let key_events = [37, 38, 39, 40];
    if (key_events.includes(ev.keyCode)){
        if (ev.keyCode == '38') {
            distortFlag = true;
            if (distortIter == -1) {
                distortion = 0;
            }
            distortIter = 1;
        } else if (ev.keyCode == '40') {
            distortIter =+ ease_array[state][animState]*(-distortion);
        } else if (ev.keyCode == '39' || ev.keyCode == '37') {

                if (ev.keyCode == '39' && state < (shape_array.length-1))
                {
                    state += 1
                }
                else if (ev.keyCode == '37' && state > 1) {
                    state -= 1
                }
        }
    }
}
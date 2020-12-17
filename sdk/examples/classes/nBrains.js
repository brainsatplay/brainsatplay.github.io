
class BrainsAtPlay {
    constructor(input) {
        this.users = new Map();
        if (input == undefined){
            this.userVoltageBuffers = []
            this.userOtherBuffers = []
        } else{
            this.add(input)
         }
    }

    getMe(){
        let user = 0;
        let gotMe = false;

        this.users.forEach((_,key) => {
            if (key == userId || key == 'me'){
                this.me = user;
                gotMe = true;
            }
            user++
        })

        if (!gotMe){
            this.me = undefined;
        }
    }

    add(id,channelNames) {
        let brain; 
        if (channelNames == undefined){
            brain = new Brain(id)
        } else {
            brain = new Brain(id,channelNames)
        }
        this.users.set(id, brain)
        this.initializeBuffer('userOtherBuffers')
        this.initializeBuffer('userVoltageBuffers')
    }

    remove(id){
        this.users.delete(id)
        this.initializeBuffer('userOtherBuffers')
        this.initializeBuffer('userVoltageBuffers')
    }

    getMaxChannelNumber(){
        let chansPerUser = []
        this.users.forEach((brain) => {
            chansPerUser.push(brain.numChannels)
        })
        return chansPerUser.reduce((acc,curr) => {return (Math.max(acc,curr))})
    }


    synchrony(method, edgesArray) {

        let synchrony = [];

        if (method == 'pcc') {

            //
            // Synchrony Calculation
            // Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
            //

            edgesArray.forEach((edge) => {

                let xC = this.users.get(edge[0]).buffer
                let yC = this.users.get(edge[1]).buffer
                let numChannels = Math.min(xC.length,yC.length)

                for (let channel = 0; channel < numChannels; channel++){

                let x = xC[channel]
                let y = yC[channel]

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

                if (channel >= synchrony.length){
                    synchrony.push([answer])
                } else {
                    synchrony[channel].push(answer)
                }
            }
            })
        }

        return synchrony.map((channelData) => {return channelData.reduce(sum, 0) / channelData.length})
    }

    initializeBuffer(buffer=undefined) {

        let b = [];
        let user;
        let users;
        if (buffer == 'userOtherBuffers'){
            users = 1;
        } else {
            users = this.users.size;
        }

        let perUser = Math.floor(pointCount/(users*channels))

        for(user=0; user < users; user++){
            b.push([])
            for(let chan=0; chan < channels; chan++){
                b[user].push(new Array(perUser).fill(0.0));
            }
        }

        let remainder = pointCount - channels*users*perUser
            for (let chan = 0; chan < channels; chan++) {
                for (user = 0; user < users; user++)
                    if (remainder > 0) {
                        remainder--;
                        b[user][chan].push(0.0)
                    }
            }
        
        if (buffer != undefined){
            this[buffer] = b;
        }
    }

    // reallocateUserBuffers(ind) {

    //     console.log('reallocating')
    //     let currUsers = this.userVoltageBuffers.length
    //     let targetUsers = this.users.size     
    //     let perUser = Math.floor(pointCount/(targetUsers*channels))

    //     if (targetUsers - currUsers > 0){

    //         this.userVoltageBuffers.forEach((userData, user) => {
    //             this.userVoltageBuffers[user].splice(0,this.userVoltageBuffers[user].length - perUser)
    //         })
            
    //         this.userVoltageBuffers.push(new Array(perUser).fill(0))

    //     } else {
    //         this.userVoltageBuffers.splice(ind,1)
    //         this.userVoltageBuffers.forEach((userData, user) => {
    //             this.userVoltageBuffers[user].push(new Array(perUser - this.userVoltageBuffers[user].length).fill(0))
    //         })
    //     }
    // }

    updateBuffer(source='brains',buffer='userVoltageBuffers'){
        let userInd;

        if (source == 'brains'){
            userInd = 0;
            this.users.forEach((brain) => {
                brain.buffer.forEach((channelData, channel) => {
                    let sustain;
                    if(this[buffer][userInd][channel] != undefined){
                        if (this[buffer][userInd][channel].every(item => item === 0)){
                            sustain = this[buffer][userInd][channel].length;
                        } else {
                            sustain = SIGNAL_SUSTAIN
                        }
                    if (channelData.length != 0){
                        channelData = new Array(sustain).fill(brain.buffer[channel].shift())
                    } else {
                        channelData = new Array(sustain).fill(0)
                    }
                    this[buffer][userInd][channel].splice(0,sustain)
                    this[buffer][userInd][channel].push(...channelData)
                }
                }
                )
                userInd++;
            })
        } else {
                userInd = this.me         
                let userData = this[buffer][userInd]
                userData.forEach((channelData,channel) => {
                    if (channelData.length != 0){
                        channelData = new Array(SIGNAL_SUSTAIN).fill(source[channel])
                    } else {
                        channelData = new Array(SIGNAL_SUSTAIN).fill(0)
                    }
                    this[buffer][userInd][channel].splice(0,SIGNAL_SUSTAIN)
                    this[buffer][userInd][channel].push(...channelData)
                })
        }
    }

    BufferToWebGL(buffer='userVoltageBuffers'){
            return new Float32Array([...this[buffer].flat(2)])
    }

    BufferToWebGL_Normalized(buffer='userVoltageBuffers'){
        let _temp = this.normalizeUserBuffers(this[buffer]);
        return new Float32Array([..._temp.flat(2)])
    }

    normalizeUserBuffers(buffer) {
        let _temp = buffer.map((userData) => {
            return userData.map((channelData) => {
                let chanMax = max(channelData)
                let chanMin = min(channelData)
                let scaling = (window.innerHeight/6)/channels;
                if (chanMin != chanMax){
                    return channelData.map(normalize(chanMin,chanMax,scaling))
                } else{
                    return channelData.map((val) => {return val*scaling})
                }
                
            })
        })
        return _temp
    }
}


function newBrains(data){
    let newObj = new BrainsAtPlay(data)
    return newObj
}

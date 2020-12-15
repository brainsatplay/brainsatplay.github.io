
class BrainsAtPlay {
    constructor(input) {
        this.users = new Map();
        if (input == undefined){
            this.userBuffers = []
        } else{
            this.addBrain(input)
         }
    }

    addBrain(id) {
            // Create Brain
            let brain = new Brain(id)
            this.users.set(id, brain)
            this.initializeUserBuffers();
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

    initializeUserBuffers() {

        let buffer = [];
        let user;

        let perUser = Math.floor(pointCount/(this.users.size*channels))

        for(user=0; user < this.users.size; user++){
            buffer.push([])
            for(let chan=0; chan < channels; chan++){
                buffer[user].push(new Array(perUser).fill(0.0));
            }
        }

        let remainder = pointCount - channels*this.users.size*perUser
            for (let chan = 0; chan < channels; chan++) {
                for (user = 0; user < this.users.size; user++)
                    if (remainder > 0) {
                        remainder--;
                        buffer[user][chan].push(0.0)
                    }
            }

        this.userBuffers = buffer;
    }

    reallocateUserBuffers(ind) {

        console.log('reallocating')
        let currUsers = this.userBuffers.length
        let targetUsers = this.users.size     
        let perUser = Math.floor(pointCount/(targetUsers*channels))

        if (targetUsers - currUsers > 0){

            this.userBuffers.forEach((userData, user) => {
                this.userBuffers[user].splice(0,this.userBuffers[user].length - perUser)
            })
            
            this.userBuffers.push(new Array(perUser).fill(0))

        } else {
            this.userBuffers.splice(ind,1)
            this.userBuffers.forEach((userData, user) => {
                this.userBuffers[user].push(new Array(perUser - this.userBuffers[user].length).fill(0))
            })
        }
    }

    updateUserBuffers(){
        let userInd = 0
        this.users.forEach((brain) => {
            brain.buffer.forEach((channelData, channel) => {
                if(this.userBuffers[userInd][channel] != undefined){
                if (channelData.length != 0){
                    this.userBuffers[userInd][channel].splice(0,SIGNAL_SUSTAIN)
                    channelData = new Array(SIGNAL_SUSTAIN).fill(brain.buffer[channel].shift())
                    this.userBuffers[userInd][channel].push(...channelData)
                } else {
                    channelData = new Array(SIGNAL_SUSTAIN).fill(0)
                    this.userBuffers[userInd][channel].splice(0,SIGNAL_SUSTAIN)
                    this.userBuffers[userInd][channel].push(...channelData)
                }
            }
            }
            )
            userInd++;
        })
    }

    WebGLChannelDisplacementBuffer(){
        return new Float32Array([...this.userBuffers.flat(2)])
    }

    WebGLChannelDisplacementBuffer_Normalized(){
        let _temp = this.normalizeUserBuffers();
        return new Float32Array([..._temp.flat(2)])
    }

    normalizeUserBuffers() {
        let _temp = this.userBuffers.map((userData) => {
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

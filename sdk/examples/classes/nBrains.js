
class BrainsAtPlay {
    constructor(input) {
        this.users = new Map();
        if (input == undefined){
            this.userVoltageBuffers = []
            this.focusBuffer = []
        } else{
            this.add(input)
        }
        this.synchrony = 0;
        this.eegChannelCoordinates = this.getEEGCoordinates()
        this.eegChannelsOfInterest = []
        this.network;
        this.me;
        this.username;
        this.nInterfaces = 0;
        this.public = true;

        this.synchronyBuffer = new Array(100).fill(0)
        this.synchronyChannels = new Array(channels).fill(0);

        this.generate = false;
        this.base_freq = 1;
        this.samplerate = 125;
        this.generatedSamples = 0;

        this.updateArray = [];
        this.setUpdateMessage()
    }

    setUpdateMessage(obj){
        if (obj == undefined){
            this.updateArray = [{destination:[]}];
        } else {
            if (this.updateArray[0].destination === undefined || this.updateArray[0].destination.length == 0) {
                this.updateArray = [obj]
            } else {
                this.updateArray.push(obj)

            }
        }
    }


    getMyIndex(){
        let user = 0;
        let gotMe = false;

        this.users.forEach((_,key) => {
            if (key == this.username || key == 'me'){
                this.me = user;
                gotMe = true;
            }
            user++
        })

        if (!gotMe){
            this.me = undefined;
        }
    }

    simulate(count){
        this.users.clear()
        this.add('me')
        for (let i = 1; i < count; i++){
            this.add('other'+i);
        }
        this.getMyIndex()
        this.updateEEGChannelsOfInterest()
        this.username = "me"
        this.generate = true;
    }

    add(id,channelNames) {
        let brain; 
        if (channelNames == undefined){
            brain = new Brain(id)
        } else {
            brain = new Brain(id,channelNames)
        }
        this.users.set(id, brain)
        this.initializeBuffer('focusBuffer')
        this.initializeBuffer('userVoltageBuffers')
    }

    remove(id){
        this.users.delete(id)
        this.initializeBuffer('focusBuffer')
        this.initializeBuffer('userVoltageBuffers')
    }

    getMaxChannelNumber(){
        let chansPerUser = []
        this.users.forEach((brain) => {
            chansPerUser.push(brain.numChannels)
        })
        return chansPerUser.reduce((acc,curr) => {return (Math.max(acc,curr))})
    }


    stdDev(dataOfInterest){
        // Average Data
        let avg = dataOfInterest.reduce((a, b) => a + b, 0) / dataOfInterest.length;

        // Standard Deviation of Data
        let sqD = dataOfInterest.map(val => {
            var diff = val - avg;
            return diff * diff;
        })
        var aSqD = sqD.reduce((a, b) => a + b, 0) / sqD.length;
        var stdDev = Math.sqrt(aSqD);
        let relData = new Array(this.eegChannelsOfInterest.length).fill(0)
        let dev;

        this.eegChannelsOfInterest.forEach((channel,ind) => {
            dev = (dataOfInterest[ind] - avg)/stdDev;
            if (isNaN(dev)){
                relData[channel] = 0;
            } else {
                relData[channel] = dev;
            }
        })
        return relData
    }

    getPower(relative=false){
        let dataOfInterest = [];
        let power = new Array(this.eegChannelsOfInterest.length).fill(NaN);

        if (this.me){
        this.eegChannelsOfInterest.forEach((channel,ind) => {
            if (this.userVoltageBuffers[this.me].length > ind){
                // Calculate Average Power of Voltage Signal
                let data = this.userVoltageBuffers[this.me][ind]
                power[channel] = data.reduce((acc,cur) => acc + ((cur*cur)/2), 0)/data.length
                dataOfInterest.push(power[channel])
            }
        })

        if (relative){
            power = this.stdDev(dataOfInterest)
        }
    }

        return power
    }

    getBandPower(band, relative=false){
        let dataOfInterest = [];
        let bandpower = new Array(this.eegChannelsOfInterest.length).fill(NaN);
        this.eegChannelsOfInterest.forEach((channel,ind) => {
            if (this.userVoltageBuffers[this.me].length > ind){
                bandpower[channel] = bci.bandpower(this.userVoltageBuffers[this.me][ind], this.samplerate, band, {relative: false});
                dataOfInterest.push(bandpower[channel])
            }
        })

        if (relative){
            bandpower = this.stdDev(dataOfInterest)
        }

        return bandpower
    }


    getSynchrony(method="pcc") {

        let channelSynchrony = [];

        this.synchronyBuffer.shift()
        if (this.users.size > 1){
            // Generate edge array
            let keys = Array.from(brains.users.keys())

            let pairwise = (list) => {
                if (list.length < 2) { return []; }
                var first = list[0],
                    rest  = list.slice(1),
                    pairs = rest.map(function (x) { return [first, x]; });
                return pairs.concat(pairwise(rest));
              }

            let edgesArray = pairwise(keys)
            if (method == 'pcc') {
                // Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/

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

                    if (channel >= channelSynchrony.length){
                        channelSynchrony.push([answer])
                    } else {
                        channelSynchrony[channel].push(answer)
                    }
                }
                })

                this.synchronyChannels = channelSynchrony.map((channelData) => {return channelData.reduce((a, b) => a + b, 0) / channelData.length})
            } else {
                this.synchronyChannels = new Array(this.eegChannelsOfInterest.length).fill(0)
            }

            // Average Within Channels
            let avg = this.synchronyChannels.reduce((a, b) => a + b, 0) / this.synchronyChannels.length;
            if (!isNaN(avg)) {
                this.synchronyBuffer.push(avg)
            } else {
                this.synchronyBuffer.push(0)
            }        
        } else {
            this.synchronyChannels = new Array(channels).fill(0);
            this.synchronyBuffer.push(this.synchronyChannels)
        }
        
        // Average Across Channels
        this.synchrony = this.synchronyBuffer.reduce((a, b) => a + b, 0) / this.synchronyBuffer.length;
    }

    initializeBuffer(buffer=undefined) {

        let b = [];
        let user;
        let users;
        if (buffer == 'focusBuffer'){
            users = 1;
        } else {
            users = this.users.size;
        }

        let perUser = Math.floor(pointCount/(users*channels));

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

    generateVoltageStream(){
            let channels = this.eegChannelsOfInterest.length

            this.users.forEach((user) => {
                let signal = new Array(channels);
                // let amp = Math.random()
                for (let channel =0; channel < channels; channel++) {
                    signal[channel] = bci.generateSignal([Math.random()], [this.base_freq+Math.random()*40], this.samplerate, (1/this.base_freq));
                }
        
                let startTime = Date.now()
                let time = [];
                let cardinality = (1/this.base_freq)*this.samplerate
                let step = (1/this.base_freq) / (cardinality - 1);
                for (let i = 0; i < cardinality; i++) {
                    time.push(startTime + (step * i));
                }
        
                let data = {
                    signal: signal,
                    time: time
                }
                user.streamIntoBuffer(data)
            })
        }
    

    update() {
        // Generate signal if specified
        if (this.generate) {
            if (this.generatedSamples == Math.round(this.samplerate*(1/this.base_freq))-1){
                this.generateVoltageStream()
                this.generatedSamples = 0;
            } else {
                this.generatedSamples += 1
        }}

        this.getSynchrony('pcc')
        this.updateBuffer('brains','userVoltageBuffers')
        this.setUpdateMessage()
    }

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
            let userData;
            if (userInd != undefined){      
                userData = this[buffer][userInd]
            } else {
                userData = this[buffer][0];
            } 

            userData.forEach((channelData,channel) => {
                if (channelData.length != 0){
                    channelData = new Array(SIGNAL_SUSTAIN).fill(source[channel])
                } else {
                    channelData = new Array(SIGNAL_SUSTAIN).fill(0)
                }


                if (userInd != undefined){      
                    this[buffer][userInd][channel].splice(0,SIGNAL_SUSTAIN)
                    this[buffer][userInd][channel].push(...channelData)
                } else {
                    this[buffer][0][channel].splice(0,SIGNAL_SUSTAIN)
                    this[buffer][0][channel].push(...channelData)
                }
            })
        }
    }

    BufferToWebGL(buffer='userVoltageBuffers'){
            // Upsample Buffer
            return new Float32Array([...this[buffer].flat(2)])
    }

    BufferToWebGL_Normalized(buffer='userVoltageBuffers'){
        let _temp = this.normalizeUserBuffers(this[buffer]);
            // Upsample Buffer
        return new Float32Array([..._temp.flat(2)])
    }

    normalizeUserBuffers(buffer) {
        let _temp = buffer.map((userData) => {
            return userData.map((channelData) => {
                let max = Math.max(...channelData)
                let min = Math.min(...channelData)
                let scaling = (window.innerHeight/6)/channels;
                if (min != max){
                    return channelData.map((val) => {
                        var delta = max - min;
                        return scaling * (2*((val - min) / delta) - 1)
                    })
                } else{
                    return channelData.map((val) => {return val*scaling})
                }
                
            })
        })
        return _temp
    }

    updateEEGChannelsOfInterest() {
        this.eegChannelsOfInterest = []
        let myBrain;        
        Object.keys(this.eegChannelCoordinates).forEach((name,ind) => {
            myBrain = this.users.get(this.username)
            if (myBrain == undefined){
                myBrain = this.users.get('me')
            }
            
            // Extract My EEG Channels Of Interest
            if (myBrain != undefined){
                if (myBrain.channelNames.includes(name)){
                    this.eegChannelsOfInterest.push(ind)
                }
            } 

            // Extract All Used EEG Channels
            else {
                this.users.forEach((user) => {
                    if (user.channelNames.includes(name)){
                        this.eegChannelsOfInterest.push(ind)
                    }
                })
                this.eegChannelsOfInterest = this.eegChannelsOfInterest.filter((v, i, a) => a.indexOf(v) === i)
            }
        })
    }

    // Networking Suite
    connect(url, game){

    if (this.network) {
        this.network.onerror = connection.onopen = connection.onclose = null;
        this.network.close();
    }

    if (url.protocol == 'http:'){
        this.network = new WebSocket(`ws://` + url.hostname,[this.username, 'interfaces', game]);
    } else if (url.protocol == 'https:'){
        this.network = new WebSocket(`wss://` + url.hostname,[this.username, 'interfaces', game]);
    } else{
        console.log('invalid protocol')
        return
    }

    this.network.onerror =  () => {
        this.setUpdateMessage({destination:'error'})
    };

    this.network.onopen =  () => {
        this.network.send(JSON.stringify({'destination':'initializeBrains','public': BrainsAtPlay.public}));
        this.setUpdateMessage({destination:'opened'})
    };

    this.network.onmessage =  (msg) => {

        let obj = JSON.parse(msg.data);
        if (obj.destination == 'bci'){
            if (this.users.get(obj.id) != undefined){
                this.users.get(obj.id).streamIntoBuffer(obj.data)
            } 
            updateChannels(this.getMaxChannelNumber())

        } else if (obj.destination == 'init'){

            this.users.clear()

            if (obj.privateBrains && this.public === false){
                this.add(obj.privateInfo.id, obj.privateInfo.channelNames)
            } else {
                for (let newUser = 0; newUser < obj.nBrains; newUser++){
                    if (this.users.get(obj.ids[newUser]) == undefined && obj.ids[newUser] != undefined){
                        if (this.public){
                            this.add(obj.ids[newUser], obj.channelNames[newUser])
                        } else {
                            if (obj.ids[newUser] == this.username){
                                this.add(obj.ids[newUser], obj.channelNames[newUser])
                            }
                        }
                    }
                }
            }

            if (this.users.size == 0){
                this.add('me');
            }

            this.generate = false;
            this.updateEEGChannelsOfInterest()
            this.initializeBuffer('userVoltageBuffers')
            this.nInterfaces = obj.nInterfaces;
            this.getMyIndex()
            this.setUpdateMessage(obj)
        }

        else if (obj.destination == 'brains'){
            let update = obj.n;

            // Only update if access matches
            if ((this.public) || (!this.public && obj.access === 'private')){
                if (update == 1){
                        if (this.public){
                            this.add(obj.id, obj.channelNames)
                            this.remove('me')
                        } else if (!this.public && obj.access === 'private') {
                            this.add(obj.id, obj.channelNames)
                            this.remove('me')
                        }
                } else if (update == -1){
                    this.remove(obj.id)
                    if (this.public){
                        if (this.users.size == 0){
                            this.add('me')
                        }
                    } else if (!this.public && obj.access === 'private'){
                        this.add('me')
                    }
                }
                this.initializeBuffer('userVoltageBuffers')
                this.updateEEGChannelsOfInterest()
            }

            this.getMyIndex()
            this.setUpdateMessage(obj)

            } 
            else if (obj.destination == 'interfaces'){
                this.nInterfaces += obj.n;
                this.setUpdateMessage(obj)
            } 
            else {
            console.log(obj)
            }
    };

    this.network.onclose =  () => {
        this.network = undefined;
        this.nInterfaces = undefined;
        this.simulate(2)
        this.generate = true;
        this.getMyIndex()
        this.setUpdateMessage({destination: 'closed'})
    };
}


    // Requests
    login(formDict) {
        const handleLoginRequest = async (dict) => {
            let resDict = await clientAction('login','POST', dict);
                if (resDict.result == 'OK'){
                    brains.username = resDict.msg;
                }
            return resDict
          }
          return handleLoginRequest(formDict)
    }

    signup(formDict) {
        const handleSignupRequest = async (dict) => {
            let resDict = await clientAction('signup','POST', dict);
            return resDict
          }
          return handleSignupRequest(formDict)
    }


    // Included Data
    getEEGCoordinates(){
        return {
            Fp1: [-21.2, 66.9, 12.1],
            Fpz: [1.4, 65.1, 11.3],
            Fp2: [24.3, 66.3, 12.5],
            Af7: [-41.7, 52.8, 11.3],
            Af3: [-32.7, 48.4, 32.8],
            Afz: [1.8, 54.8, 37.9],
            Af4: [35.1, 50.1, 31.1],
            Af8: [43.9, 52.7, 9.3],
            F7: [-52.1, 28.6, 3.8],
            F5: [-51.4, 26.7, 24.7],
            F3: [-39.7, 25.3, 44.7],
            F1: [-22.1, 26.8, 54.9],
            Fz: [0.0, 26.8, 60.6],
            F2: [23.6, 28.2, 55.6],
            F4: [41.9, 27.5, 43.9],
            F6: [52.9, 28.7, 25.2],
            F8: [53.2, 28.4, 3.1],
            Ft9: [-53.8, -2.1, -29.1],
            Ft7: [-59.2, 3.4, -2.1],
            Fc5: [-59.1, 3.0, 26.1],
            Fc3: [-45.5, 2.4, 51.3],
            Fc1: [-24.7, 0.3, 66.4],
            Fcz: [1.0, 1.0, 72.8],
            Fc2: [26.1, 3.2, 66.0],
            Fc4: [47.5, 4.6, 49.7,],
            Fc6: [60.5, 4.9, 25.5],
            Ft8: [60.2, 4.7, -2.8],
            Ft10: [55.0, -3.6, -31.0],
            T7: [-65.8, -17.8, -2.9],
            C5: [-63.6, -18.9, 25.8],
            C3: [-49.1, -20.7, 53.2],
            C1: [-25.1, -22.5, 70.1],
            Cz: [0.8, -21.9, 77.4],
            C2: [26.7, -20.9, 69.5],
            C4: [50.3, -18.8, 53.0],
            C6: [65.2, -18.0, 26.4],
            T8: [67.4, -18.5, -3.4],
            Tp7: [-63.6, -44.7, -4.0],
            Cp5: [-61.8, -46.2, 22.5],
            Cp3: [-46.9, -47.7, 49.7],
            Cp1: [-24.0, -49.1, 66.1],
            Cpz: [0.7, -47.9, 72.6],
            Cp2: [25.8 ,-47.1, 66.0],
            Cp4: [49.5, -45.5, 50.7],
            Cp6: [62.9, -44.6, 24.4],
            Tp8: [64.6, -45.4, -3.7],
            P9: [-50.8, -51.3, -37.7],
            P7: [-55.9, -64.8, 0.0],
            P5: [-52.7, -67.1, 19.9],
            P3: [-41.4, -67.8, 42.4],
            P1: [-21.6, -71.3, 52.6],
            Pz: [0.7, -69.3, 56.9],
            P2: [24.4, -69.9, 53.5],
            P4: [44.2, -65.8, 42.7],
            P6: [54.4, -65.3, 20.2],
            P8: [56.4, -64.4, 0.1],
            P10: [51.0, -53.9, -36.5],
            PO7: [-44.0, -81.7, 1.6],
            PO3: [-33.3, -84.3, 26.5],
            POz: [0.0, -87.9, 33.5],
            PO4: [35.2, -82.6, 26.1],
            PO8: [43.3, -82.0, 0.7],
            O1: [-25.8, -93.3, 7.7],
            Oz: [0.3, -97.1, 8.7],
            O2: [25.0,-95.2,6.2],
            }
    }
}

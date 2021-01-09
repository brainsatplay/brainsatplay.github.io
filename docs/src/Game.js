class Game {
    constructor(gameName = 'untitled') {
        this.initialize()
        this.gameName = gameName;
    }

    initialize() {
        this.brains = {
            public: new Map(),
            private: new Map()
        }
        this.bufferSize = 1000;
        this.eegChannelCoordinates = this.getEEGCoordinates()
        this.usedChannels = []
        this.usedChannelNames = []
        this.connectionMessageBuffer = [];

        if (!this.connection) {
            this.connection = undefined;
            this.me = {
                username: undefined,
                index: undefined,
            };
        }

        this.info = {
            interfaces: 0,
            brains: 0,
            access: 'public',
            simulated: false
        }

        this.simulation = {
            generate: false,
            baseFrequency: 1,
            sampleRate: 250,
            duration: 1.0,
        }

        this.simulation.generatedSamples = Math.round(this.simulation.sampleRate * this.simulation.duration)

        if (!this.metrics) {
            this.metrics = {}
        }
        if (!this.subscriptions) {
            this.subscriptions = {};
            this.subscribe('voltage', true);
        } else {
            Object.keys(this.subscriptions).forEach((metricName) => {
                this.unsubscribe(metricName)
            })
        }

        this.setUpdateMessage()
    }


    subscribe(metricName, lock = false) {
        let alreadyExists = Object.keys(this.subscriptions).includes(metricName)
        if (alreadyExists) {
            lock = this.subscriptions[metricName].lock
        }
        this.subscriptions[metricName] = {
            active: true,
            lock: lock
        }

        // if (!this.subscriptions[metricName].lock || !alreadyExists) {
            this.addMetric(metricName)
        // }
        this.initializeBuffer(metricName)
    }

    unsubscribe(metricName) {
        if (Object.keys(this.subscriptions).includes(metricName) && this.subscriptions[metricName].lock !== true) {
            this.subscriptions[metricName].active = false;
            this.initializeBuffer(metricName)
        }
    }

    initializeLockedBuffers() {
        let locked = [];
        Object.keys(this.subscriptions).forEach((metricName) => {
            if (this.subscriptions[metricName].lock = true) {
                locked.push(metricName)
            }
        })

        locked.forEach((metricName) => {
            this.initializeBuffer(metricName)
        })
    }

    addMetric(metricName) {
        this.metrics[metricName] = {
            value: 0,
            channels: [],
            buffer: []
        }
    }

    getMetric(metricName) {
        if (metricName !== undefined) {
            if (this.subscriptions[metricName].active) {
                return this.metrics[metricName].value
            } else {
                return 0
            }
        } else {
            return 0
        }
    }

    getChannelReadout(metricName) {
        if (metricName !== undefined) {
            if (Object.keys(this.subscriptions).includes(metricName) && this.subscriptions[metricName].active) {
                return this.metrics[metricName].channels
            } else {
                return Array.from({length: Object.keys(this.eegChannelCoordinates).length}, e => Array().fill(0));
            }
        } else {
            return Array.from({length: Object.keys(this.eegChannelCoordinates).length}, e => Array().fill(0));
        }
    }

    getBuffer(metricName) {
        if (metricName !== undefined) {
            if (this.subscriptions[metricName].active) {
                return this.metrics[metricName].buffer
            }
        }
    }

    reset() {
        this.initialize()
    }

    setUpdateMessage(obj) {
        if (obj == undefined) {
            this.connectionMessageBuffer = [{destination: []}];
        } else {
            if (this.connectionMessageBuffer[0].destination === undefined || this.connectionMessageBuffer[0].destination.length == 0) {
                this.connectionMessageBuffer = [obj]
            } else {
                this.connectionMessageBuffer.push(obj)

            }
        }
    }


    getMyIndex() {
        let user = 0;
        let gotMe = false;

        this.brains[this.info.access].forEach((_, key) => {
            if (key == this.me.username || key == 'me') {
                this.me.index = user;
                gotMe = true;
            }
            user++
        })

        if (!gotMe) {
            this.me.index = undefined;
        }
    }

    simulate(count) {
        this.brains.private.clear()
        this.brains.public.clear()
        this.add('me')
        for (let i = 1; i < count; i++) {
            this.add('other' + i);
        }
        this.info.brains = count;
        this.getMyIndex()
        this.updateUsedChannels()
        this.simulation.generate = true;
        this.info.simulated = true;
    }


    add(id, channelNames, access = 'public') {
        let brain;
        if (channelNames == undefined) {
            brain = new Brain(id)
        } else {
            brain = new Brain(id, channelNames)
        }

        this.brains[access].set(id, brain)
        if (id == "me" && this.info.simulated == false) {
            this.info.brains = this.brains[access].size - 1
        } else {
            this.info.brains = this.brains[access].size
        }

        if (access == this.info.access) {
            this.getMyIndex()
            this.updateUsedChannels()
            this.initializeBuffer('voltage')
        }
    }

    remove(id, access = 'public') {
        this.brains[access].delete(id)
        this.info.brains = this.brains[access].size
        this.getMyIndex()
        this.updateUsedChannels()
        this.initializeBuffer('voltage')
    }


    stdDev(data, ignoreNaN = true) {

        let dataOfInterest = [];
        if (ignoreNaN) {
            data.forEach((val) => {
                if (!isNaN(val)) {
                    dataOfInterest.push(val)
                }
            })
        }

        // Average Data
        let avg = dataOfInterest.reduce((a, b) => a + b, 0) / dataOfInterest.length;

        // Standard Deviation of Data
        let sqD = dataOfInterest.map(val => {
            let diff = val - avg;
            return diff * diff;
        })
        let aSqD = sqD.reduce((a, b) => a + b, 0) / sqD.length;
        let stdDev = Math.sqrt(aSqD);
        let dev;

        this.usedChannels.forEach((channelInfo, ind) => {
            dev = (dataOfInterest[ind] - avg) / stdDev;
            if (isNaN(dev)) {
                data[channelInfo.index] = 0;
            } else {
                data[channelInfo.index] = dev;
            }
        })

        return data
    }

    getPower(user = this.me.index, relative = false) {

        if (user !== undefined) {
            let dataOfInterest = [];
            let power = new Array(Object.keys(this.eegChannelCoordinates).length);
            let channelInd;
            if (this.me.index != undefined) {
                this.usedChannels.forEach((channelInfo) => {
                    channelInd = this.usedChannelNames.indexOf(channelInfo.name)
                    // Calculate Average Power of Voltage Signal
                    let data = this.metrics.voltage.buffer[this.me.index][channelInd]
                    power[channelInfo.index] = data.reduce((acc, cur) => acc + ((cur * cur) / 2), 0) / data.length
                })

                if (relative) {
                    power = this.stdDev(power, true)
                }

            }
            return power
        } else {
            return this.getChannelReadout(user)
        }
    }

    getBandPower(band, user = this.me.index, relative = false) {
        if (user !== undefined) {
            let dataOfInterest = [];
            let bandpower = new Array(Object.keys(this.eegChannelCoordinates).length);
            let channelInd;
            // this.metrics.voltage.buffer.forEach((userData) => {
            this.usedChannels.forEach((channelInfo) => {
                channelInd = this.usedChannelNames.indexOf(channelInfo.name)
                // NOTE: Not actually the correct samplerate
                bandpower[channelInfo.index] = bci.bandpower(this.metrics.voltage.buffer[this.me.index][channelInd], this.simulation.sampleRate, band, {relative: true});
            })


            if (relative) {
                bandpower = this.stdDev(bandpower)
            }
            return bandpower

        } else {
            return this.getChannelReadout(user)
        }
    }


    getSynchrony(method = "pcc") {
        let channelSynchrony = Array.from({length: Object.keys(this.eegChannelCoordinates).length}, e => Array());
        if (this.brains[this.info.access].size > 1) {
            // Generate edge array
            let edgesArray = [];

            if (this.me.index) {
                for (let i = 0; i < this.brains[this.info.access].size; i++) {
                    if (i != this.me.index) {
                        edgesArray.push([this.me.index, i])
                    }
                }
            } else {
                let pairwise = (list) => {
                    if (list.length < 2) {
                        return [];
                    }
                    var first = list[0],
                        rest = list.slice(1),
                        pairs = rest.map(function (x) {
                            return [first, x];
                        });
                    return pairs.concat(pairwise(rest));
                }
                edgesArray = pairwise([...Array(this.info.brains).keys()])
            }

            if (method == 'pcc') {
                // Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/

                edgesArray.forEach((edge) => {
                    let xC = this.metrics.voltage.buffer[edge[0]]
                    let yC = this.metrics.voltage.buffer[edge[1]]
                    let numChannels = Math.min(xC.length, yC.length)

                    for (let channel = 0; channel < numChannels; channel++) {

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

                        if (!channelSynchrony[this.usedChannels[channel].index]) {
                            channelSynchrony[this.usedChannels[channel].index] = [];
                        }
                        channelSynchrony[this.usedChannels[channel].index].push(answer)
                    }
                })
                return channelSynchrony.map((channelData) => {
                    return channelData.reduce((a, b) => a + b, 0) / channelData.length
                })
            } else {
                return new Array(Object.keys(this.eegChannelCoordinates).length).fill(0)
            }
        } else {
            return new Array(Object.keys(this.eegChannelCoordinates).length).fill(0);
        }
    }

    initializeBuffer(metricName) {

        let b = [];
        let user;
        for (user = 0; user < this.brains[this.info.access].size; user++) {
            b.push([])
            for (let chan = 0; chan < this.usedChannels.length; chan++) {
                b[user].push(new Array(this.bufferSize).fill(0));
            }
        }
        this.metrics[metricName].buffer = b;
    }

    generateSignal(amplitudes = [], frequencies = [], samplerate = 256, duration = 1, phaseshifts = new Array(amplitudes.length).fill(0)) {
        let al = amplitudes.length;
        let fl = frequencies.length;
        let pl = phaseshifts.length;

        if (al !== fl || fl != pl) {
            console.error('Amplitude array, frequency array, and phaseshift array must be of the same length.')
        }

        let signal = new Array(Math.round(samplerate * duration)).fill(0)

        frequencies.forEach((frequency, index) => {
            for (let point = 0; point < samplerate * duration; point++) {
                signal[point] += amplitudes[index] * Math.sin(2 * Math.PI * frequency * (point + phaseshifts[index]) / samplerate)
            }
        })
        return signal
    }

    generateVoltageStream() {

        let userInd = 0;
        let n = 5;

        this.brains[this.info.access].forEach((user) => {
            let signal = new Array(this.usedChannels.length)
            for (let channel = 0; channel < signal.length; channel++) {
                signal[channel] = this.generateSignal(new Array(n).fill(1), Array.from({length: n}, e => Math.random() * 50), this.simulation.sampleRate, this.simulation.duration, Array.from({length: n}, e => Math.random() * 2*Math.PI));
            }

            let startTime = Date.now()
            let time = [];
            let cardinality = (1 / this.simulation.baseFrequency) * this.simulation.sampleRate;
            let step = (1 / this.simulation.baseFrequency) / (cardinality - 1);
            for (let i = 0; i < cardinality; i++) {
                time.push(startTime + (step * i));
            }

            let data = {
                signal: signal,
                time: time
            }
            user.streamIntoBuffer(data)
            userInd++;
        })
    }


    update() {
        // Generate signal if specified
        if (this.simulation.generate) {
            if (this.simulation.generatedSamples == Math.round(this.simulation.sampleRate * this.simulation.duration)) {
                this.generateVoltageStream()
                this.simulation.generatedSamples = 0;
            } else {
                this.simulation.generatedSamples += 1
            }
        }
        this.setUpdateMessage()
        this.updateSubscriptions()
    }

    async updateSubscriptions() {
        Object.keys(this.subscriptions).forEach((metricName) => {
            if (this.subscriptions[metricName].active) {

                // Derive Channel Readouts
                if (metricName == 'voltage') {
                    this.metrics[metricName].channels = this.getPower(this.me.index, true)
                } else if (['delta', 'theta', 'alpha', 'beta', 'gamma'].includes(metricName)) {
                    this.metrics[metricName].channels = this.getBandPower(metricName, this.me.index, false)
                } else if (metricName == 'synchrony') {
                    this.metrics[metricName].channels = this.getSynchrony('pcc')
                }

                // Get Values of Interest
                let valuesOfInterest = [];
                this.usedChannels.forEach((channelInfo) => {
                    valuesOfInterest.push(this.metrics[metricName].channels[channelInfo.index])
                })

                // Derive Values
                let avg = valuesOfInterest.reduce((a, b) => a + b, 0) / valuesOfInterest.length;
                if (!isNaN(avg)) {
                    this.metrics[metricName].value = avg;
                } else {
                    this.metrics[metricName].value = 0;
                }

                // Derive Buffer
                if (metricName == 'voltage') {
                    this.updateBuffer('brains', metricName)
                } else {
                    this.updateBuffer(valuesOfInterest, metricName)
                }
            }
        })
    }

    updateBuffer(source = 'brains', metricName = 'voltage') {
        let channelInd;
        let userInd = 0;

        this.brains[this.info.access].forEach((brain) => {
            brain.buffer.forEach((channelData, channel) => {
                channelInd = this.usedChannelNames.indexOf(brain.channelNames[channel])
                if (source == 'brains') {
                    if (channelData.length != 0) {
                        channelData = brain.buffer[channel].shift()
                    } else {
                        channelData = 0
                    }
                    this.metrics[metricName].buffer[userInd][channelInd].splice(0, 1)
                    this.metrics[metricName].buffer[userInd][channelInd].push(channelData)
                } else {
                    channelData = source[channel]
                    if (userInd == 0) {
                        if (this.me.index != undefined) {
                            if (this.metrics[metricName].buffer.length != 0 && this.metrics[metricName].buffer[this.me.index].length == brain.channelNames.length) {
                                this.metrics[metricName].buffer[this.me.index][channelInd].splice(0, 1)
                                this.metrics[metricName].buffer[this.me.index][channelInd].push(channelData)
                            }
                        } else {
                            if (this.metrics[metricName].buffer.length != 0) {
                                this.metrics[metricName].buffer[userInd][channelInd].splice(0, 1)
                                this.metrics[metricName].buffer[userInd][channelInd].push(channelData)
                            }
                        }
                    }
                }
            })
            userInd++
        })
    }

    flatten(metricName = 'voltage', normalize = false) {
        let _temp = this.metrics[metricName].buffer;
        if (normalize) {
            _temp = this.normalizeUserBuffers(this.metrics[metricName].buffer);
        }
        // Upsample Buffer
        return new Float32Array([..._temp.flat(2)])
    }

    normalizeUserBuffers(buffer) {
        let _temp = buffer.map((userData) => {
            return userData.map((channelData) => {
                let max = Math.max(...channelData)
                let min = Math.min(...channelData)
                let scaling = (window.innerHeight / 6) / this.usedChannels.length;
                if (min != max) {
                    return channelData.map((val) => {
                        var delta = max - min;
                        return scaling * (2 * ((val - min) / delta) - 1)
                    })
                } else {
                    return channelData.map((val) => {
                        return val * scaling
                    })
                }

            })
        })
        return _temp
    }

    updateUsedChannels() {
        this.usedChannels = [];
        this.usedChannelNames = [];

        // Define all used channel indices
        Object.keys(this.eegChannelCoordinates).forEach((name, ind) => {
            // Extract All Used EEG Channels
            this.brains[this.info.access].forEach((user) => {
                if (user.channelNames.includes(name) && this.usedChannelNames.indexOf(name) == -1) {
                    this.usedChannels.push({name: name, index: ind})
                    this.usedChannelNames.push(name)
                }
            })
        })
    }

    // Access
    access(type) {
        if (type == undefined) {
            type = this.info.access
        } else {
            this.info.access = type;
        }
        this.info.brains = this.brains[this.info.access].size
        this.getMyIndex()
        this.updateUsedChannels()
        this.initializeBuffer('voltage')
        this.setUpdateMessage({destination: 'update'})
        return type
    }

    // Networking Suite
    disconnect() {
        this.connection.close();
        this.setUpdateMessage({destination: 'closed'})
    }

    async connect(dict = {'guestaccess': true}, url = 'https://brainsatplay.azurewebsites.net/') {

        let resDict;
        resDict = await this.login(dict, url)

        if (this.url.protocol == 'http:') {
            this.connection = new WebSocket(`ws://` + this.url.hostname, [this.me.username, 'interfaces', this.gameName]);
        } else if (this.url.protocol == 'https:') {
            this.connection = new WebSocket(`wss://` + this.url.hostname, [this.me.username, 'interfaces', this.gameName]);
        } else {
            console.log('invalid protocol')
            return
        }

        this.connection.onerror = () => {
            this.setUpdateMessage({destination: 'error'})
            this.info.simulated = true
        };

        this.connection.onopen = () => {
            this.initialize()
            this.initializeLockedBuffers()
            this.send('initializeBrains')
            this.info.brains = undefined
            this.info.interfaces = undefined
        };

        this.connection.onmessage = (msg) => {

            let obj = JSON.parse(msg.data);
            if (obj.destination == 'bci') {
                if (this.brains[this.info.access].get(obj.id) != undefined) {
                    this.brains[this.info.access].get(obj.id).streamIntoBuffer(obj.data)
                }
            } else if (obj.destination == 'init') {

                this.brains.public.clear()
                this.brains.private.clear()

                if (obj.privateBrains) {
                    this.add(obj.privateInfo.id, obj.privateInfo.channelNames, 'private')
                } else {
                    for (let newUser = 0; newUser < obj.nBrains; newUser++) {
                        if (this.brains.public.get(obj.ids[newUser]) == undefined && obj.ids[newUser] != undefined) {
                            this.add(obj.ids[newUser], obj.channelNames[newUser])
                        }
                    }
                }

                this.simulation.generate = false;
                this.updateUsedChannels()
                this.info.interfaces = obj.nInterfaces;
                this.getMyIndex()
                this.setUpdateMessage(obj)
            } else if (obj.destination == 'brains') {
                let update = obj.n;
                // Only update if access matches
                if (update == 1) {
                    this.add(obj.id, obj.channelNames, obj.access)
                } else if (update == -1) {
                    this.remove(obj.id, obj.access)
                }
                this.updateUsedChannels()
                this.getMyIndex()
                obj.destination = 'update'
                this.initializeLockedBuffers()
                this.setUpdateMessage(obj)
            } else if (obj.destination == 'interfaces') {
                this.info.interfaces += obj.n;
                obj.destination = 'update'
                this.setUpdateMessage(obj)
            } else {
                console.log(obj)
            }
        };

        this.connection.onclose = () => {
            this.connection = undefined;
            this.info.interfaces = undefined;
            this.simulate(2)
            this.getMyIndex()
            this.me.username = undefined;
        };

        return resDict
    }


    // Requests

    send(command) {
        if (command === 'initializeBrains') {
            this.connection.send(JSON.stringify({'destination': 'initializeBrains', 'public': false}));
            this.setUpdateMessage({destination: 'opened'})
        }
    }

    checkURL(url) {
        if (url.slice(-1) != '/') {
            url += '/'
        }
        return url
    }

    async login(dict, url = 'https://brainsatplay.azurewebsites.net/') {
        url = this.checkURL(url)
        this.url = new URL(url);

        let json = JSON.stringify(dict)

        let resDict = await fetch(url + 'login',
            {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: json
            }).then((res) => {
            return res.json().then((message) => message)
        })
            .then((message) => {
                return message
            })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });

        if (resDict.result == 'OK') {
            this.me.username = resDict.msg;
        }
        return resDict
    }

    async signup(dict, url = 'https://brainsatplay.azurewebsites.net/') {
        url = this.checkURL(url)
        this.url = new URL(url);
        let json = JSON.stringify(dict)
        let resDict = await fetch(url + 'signup',
            {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: json
            }).then((res) => {
            return res.json().then((message) => message)
        })
            .then((message) => {
                console.log(`\n${message}`);
                return message
            })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });

        return resDict
    }


    // Included Data
    getEEGCoordinates() {
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
            Cp2: [25.8, -47.1, 66.0],
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
            O2: [25.0, -95.2, 6.2],
        }
    }
}


class Brain {
    constructor(userId, channelNames = 'Fz,C3,Cz,C4,Pz,PO7,Oz,PO8,F5,F7,F3,F1,F2,F4,F6,F8') {
        this.id = userId;
        this.channelNames = channelNames.split(',')
        this.numChannels = this.channelNames.length;
        this.buffer = [[]];
        this.times = [];
        this.bufferTime = 10000; // 10 seconds
        this.bufferSize = 1000

    }

    streamIntoBuffer(data) {

        let signal = data.signal
        let time = data.time

        signal.forEach((channelData, channel) => {

            if (channel >= this.buffer.length) {
                this.buffer.push([])
            }

            if (Array.isArray(channelData) && channelData.length) {
                if (channelData.length > 0) {
                    this.buffer[channel].push(...channelData);
                    this.times.push(...time);
                }
            }
        })

        this.trimBufferBySize()
    }


    trimBufferByTime() {
        let indexes = this.times.map((elm, idx) => (Date.now() - elm) >= this.bufferTime ? idx : '').filter(String);
        indexes.sort(function (a, b) {
            return b - a;
        });
        this.buffer.forEach((_, channel) => {
            for (var i = indexes.length - 1; i >= 0; i--) {
                this.buffer[channel].splice(indexes[i], 1);
                this.times.splice(indexes[i], 1);
            }
        })
    }

    trimBufferBySize() {
        this.buffer.forEach((_, channel) => {
            let length = this.buffer[channel].length
            if (length - this.bufferSize > 0) {
                this.buffer[channel].splice(this.bufferSize, length);
                this.times.splice(this.bufferSize, length);
            }
        })
    }
}

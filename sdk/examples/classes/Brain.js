let maxTime = 10000; // 10 seconds
let maxSize = 1000

class Brain {
    constructor(userId, channelNames = 'Fz,C3,Cz,C4,Pz,PO7,Oz,PO8,F5,F7,F3,F1,F2,F4,F6,F8') {
    this.id = userId;
    this.channelNames = channelNames.split(',')
    this.numChannels = this.channelNames.length;
    this.buffer = [[]];
    this.times = [];
    }

    streamIntoBuffer(data) {
    
        let signal = data.signal
        let time = data.time
            
        signal.forEach((channelData,channel) =>{
    
            if (channel >= this.buffer.length){
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
    
    
    trimBufferByTime(){
        let indexes = this.times.map((elm, idx) => (Date.now()-elm) >= maxTime ? idx : '').filter(String);
        indexes.sort(function(a,b){ return b - a; });
        this.buffer.forEach((_,channel) =>{
        for (var i = indexes.length -1; i >= 0; i--){
            this.buffer[channel].splice(indexes[i],1);
            this.times.splice(indexes[i],1);
        }
    })
    }

    trimBufferBySize() {
        this.buffer.forEach((_,channel) =>{
            let length = this.buffer[channel].length
            if (length-maxSize > 0){
                this.buffer[channel].splice(maxSize,length);
                this.times.splice(maxSize,length);
            }
        })
    }
}

let maxTime = 10000; // 10 seconds
let maxSize = 1000

class Brain {
    constructor(userId) {
    this.id = userId;
    this.numChannels = 0;
    this.buffer = [[]]
    this.times = []
    }

    streamIntoBuffer(data) {
    
        let signal = data.signal
        let time = data.time
            
        signal.forEach((channelData,channel) =>{
    
            if (channel >= this.buffer.length){
                this.buffer.push([])
            }
    
            if (channelData != undefined) {
                if (channelData.length > 0) {
                    this.buffer[channel].push(...channelData);
                    this.times.push(...time);
                }
            }
        })

        // this.trimBufferByTime()
        this.numChannels = signal.length
        this.trimBufferBySize()
    }
    
    
    trimBufferByTime(){
        let indexes = this.times.map((elm, idx) => (Date.now()-elm) >= maxTime ? idx : '').filter(String);
        indexes.sort(function(a,b){ return b - a; });
        this.buffer.forEach((channelData,channel) =>{
        for (var i = indexes.length -1; i >= 0; i--){
            this.buffer[channel].splice(indexes[i],1);
            this.times.splice(indexes[i],1);
        }
    })
    }

    trimBufferBySize() {
        this.buffer.forEach((channelData,channel) =>{
            let length = this.buffer[channel].length
            if (length-maxSize > 0){
                this.buffer[channel].splice(maxSize,length);
                this.times.splice(maxSize,length);
            }
        })
    }
}

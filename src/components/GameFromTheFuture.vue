<template>
  <div>
    <div id="selections">
      <div id="selector">
        <label for="modes">Choose a card deck</label>
    <div class="break"></div>
      <select name="modes"  id="modes" v-model="selected">
      <option disabled value="">Please select one</option>
      <option >Classic</option>
    </select>
      </div>
    <button id="generate" v-on:click="allQueries({ selected })">Generate Random Game</button>
    </div>
    <div class="card-holder">
      <button class="card" style="background: hsla(86, 53%, 47%, 1); border-color: hsla(95, 43%, 35%, 1);" v-on:click="queryCSV('Future-Time',{ selected })">
        <h2 class ='card-type' style="color: hsla(95, 43%, 35%, 1);" >Future</h2>
        <div class="card-text">
        <p>In a </p>
        <div class="blank" style="background: hsla(86, 48%, 75%, 1);"><h1 id='Future'>&nbsp;</h1></div>
        <p>future</p>
        </div>
        <div class="blank" style="background: hsla(86, 48%, 75%, 1);"><p id='Time'>&nbsp;</p></div>
      </button>
      <button class="card" style="background: hsla(353, 85%, 66%, 1); border-color: hsla(353, 79%, 37%, 1);" v-on:click="queryCSV('Conflict',{ selected })">
        <h2 class ='card-type' style="color: hsla(353, 79%, 37%, 1);" >Conflict</h2>
        <div class="card-text">
        <p>There is a</p>
        <div class="blank" style="background: hsla(352, 83%, 84%, 1);"><h1 id='Conflict'>&nbsp;</h1></div>
        <p>brain game</p>
        </div>
        <p >&nbsp;</p>
      </button>
      <button class="card" style="background: hsla(299, 27%, 57%, 1); border-color: hsla(299, 27%, 37%, 1);" v-on:click="queryCSV('Players',{ selected })">
        <h2 class ='card-type' style="color: hsla(299, 27%, 37%, 1);" >Players</h2>
        <div class="card-text">
        <p >for</p>
        <div class="blank" style="background: hsla(294, 29%, 80%, 1);"><h1 id='Players'>&nbsp;</h1></div>
        <p id="player_text">players</p>
        </div>
        <p >&nbsp;</p>
      </button>
      <button class="card" style="background: hsla(193, 100%, 43%, 1); border-color: hsla(194, 99%, 31%, 1);" v-on:click="queryCSV('Motivation',{ selected })">
        <h2 class ='card-type' style="color: hsla(194, 99%, 31%, 1);" >Motivation</h2>
        <div class="card-text">
        <p >which is played for</p>
        <div class="blank" style="background: hsla(193, 75%, 73%, 1);"><h1 id='Motivation'>&nbsp;</h1></div>
          <p >&nbsp;</p>
        </div>
        <p >&nbsp;</p>
      </button>
      <button class="card" style="background: hsla(36, 100%, 50%, 1); border-color: hsla(36, 100%, 36%, 1);" v-on:click="queryCSV('Location',{ selected })">
        <h2 class ='card-type' style="color: hsla(36, 100%, 36%, 1);" >Location</h2>
        <div class="card-text">
        <p >&nbsp;</p>
        <div class="blank" style="background: hsla(36, 100%, 76%, 1);"><h1 id='Location'>&nbsp;</h1></div>
        <p>What is it?</p>
        </div>
        <p >&nbsp;</p>
      </button>
    </div>
    <div>
      <p><strong>Note:</strong> The Game from the Future is a derivative of <a href="http://situationlab.org/project/the-thing-from-the-future/">The Thing From The Future</a> by Jeff Watson and <a href="http://situationlab.org/">The Situation Lab</a></p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  el: '...',
  data () {
    return {
      selected: 'Original Version',
    }},
  props: {
    msg: String,
  },
  methods: {
    allQueries(option){
      let all = ['Future-Time','Conflict','Players','Motivation','Location']
      for (const ind in all) {
        this.queryCSV(all[ind],option)
      }
    },
    queryCSV(text_id,option) {
      const d3 = require("d3");
      let file_id = ''
      switch(option.selected) {
        case 'Classic':
          switch(text_id){
            case 'Future-Time':
              file_id = 'tgftf';
              break;
            case 'Conflict':
              file_id = 'tgftf';
              break;
            case 'Players':
              file_id = 'tgftf';
              break;
            case 'Motivation':
              file_id = 'tgftf';
              break;
            case 'Location':
              file_id = 'tgftf';
              break;
          }
          break;
        default:
          file_id = 'tgftf';
      }
      let file = 'https://raw.githubusercontent.com/GarrettMFlynn/BCIGameJam/master/src/assets/' + file_id + '.csv'
      d3.csv(file).then(function (data) {
        let flag = true;
        let inner_flag;
        let row;
        let str = text_id.split('-');
        let output;
          if (str.length > 1) {
            for (const col in str) {
              inner_flag = true;
              while (inner_flag) {
                row = Math.floor(Math.random() * data.length);
                output = data[row][str[col]];
                if (output != '') {
                  inner_flag = false;
                  if (str[col] == 'Time'){
                    output += ' from now'
                  }
                  document.getElementById(str[col]).innerHTML = output;
                }
              }
            }
          } else {
            while (flag) {
            row = Math.floor(Math.random() * data.length);
            output = data[row][str[0]]
              if (output != '') {
                flag = false;
                document.getElementById(text_id).innerHTML = output;
                if (text_id == 'Players' && output == 'one'){
                  document.getElementById('player_text').innerHTML = 'player';
                } else{
                  document.getElementById('player_text').innerHTML = 'players';
                }
              }
          }
        }
      })},
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h2{
    width: 100%;
    height: 5px;
  }
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}

p{
  width: 100%;
  font-size: 17px;
}

button {
  font-family: Montserrat, sans-serif;
  text-align: center;
  font-weight: 500;
}

#selections{
  display: flex;
  align-items: center;
  justify-content: center;
}

#selector{
  width: 250px;
}

#generate{
  padding: 20px;
  width: 250px;
  border-radius: 10px;
}

#Time{
  font-weight: bold;
  color: #222222;
  font-size: 13px;
}

.card-type{
  text-transform: uppercase;
  color: #222222;
}

.card-text{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.card-holder{
  display:flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.card{
  display: flex;
  flex-wrap: wrap;
  margin: 25px;
  height: 250px;
  width: 200px;
  padding: 0px 0px;
  border: 2px solid;
  border-radius: 15px;
  color: white;
  font-weight: 500;
  overflow: hidden;
}

.break{
  flex-basis: 100%;
  height: 0;
}

  .blank{
    background: white;
    flex-grow: 1;
    color: black;
    display: inline-block;
    height: 100%;
  }

</style>

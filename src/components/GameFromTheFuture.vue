<template>
  <div>
    <label for="modes">Choose a card deck: </label>
    <select name="modes"  id="modes" v-model="selected">
      <option disabled value="">Please select one</option>
      <option >Classic</option>
    </select>
    <div class="card-holder">
      <button class="card" style="background: hsla(86, 53%, 47%, 1); border-color: hsla(95, 43%, 35%, 1);" v-on:click="queryCSV('future-time',{ selected })">
        <p>In a </p>
        <div class="break"/>
        <div class="blank" style="background: hsla(86, 48%, 75%, 1);"><p id='future-time'>&nbsp;</p></div>
        <div class="break"/>
        <p>future</p>
      </button>
      <button class="card" style="background: hsla(353, 85%, 66%, 1); border-color: hsla(353, 79%, 37%, 1);" v-on:click="queryCSV('conflict',{ selected })">
        <p>There is a</p>
        <div class="break"/>
        <div class="blank" style="background: hsla(352, 83%, 84%, 1);"><p id='conflict'>&nbsp;</p></div>
        <div class="break"/>
        <p>brain game</p>
      </button>
      <button class="card" style="background: hsla(299, 27%, 57%, 1); border-color: hsla(299, 27%, 37%, 1);" v-on:click="queryCSV('players',{ selected })">
        <p >for</p>
        <div class="break"/>
        <div class="blank" style="background: hsla(294, 29%, 80%, 1);"><p id='players'>&nbsp;</p></div>
        <div class="break"/>
        <p>player[s]</p>
      </button>
    </div>
    <div class="card-holder">
      <button class="card" style="background: hsla(193, 100%, 43%, 1); border-color: hsla(194, 99%, 31%, 1);" v-on:click="queryCSV('motivation',{ selected })">
        <p >which is played for</p>
        <div class="break"/>
        <div class="blank" style="background: hsla(193, 75%, 73%, 1);"><p id='motivation'>&nbsp;</p></div>
        <div class="break"/>
        <p>&nbsp;</p>
      </button>
      <button class="card" style="background: hsla(36, 100%, 50%, 1); border-color: hsla(36, 100%, 36%, 1);" v-on:click="queryCSV('location',{ selected })">
        <p >&nbsp;</p>
        <div class="break"/>
        <div class="blank" style="background: hsla(36, 100%, 76%, 1);"><p id='location'>&nbsp;</p></div>
        <div class="break"/>
        <p>What is it?</p>
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
    queryCSV(text_id,option) {
      const d3 = require("d3");
      console.log(option.selected)
      let file_id = ''
      switch(option.selected) {
        case 'Classic':
          switch(text_id){
            case 'future':
              file_id = 'tgftf'
              break
            case 'conflict':
              file_id = 'tgftf'
              break
            case 'players':
              file_id = 'tgftf'
              break
            case 'motivation':
              file_id = 'tgftf'
              break
            case 'location':
              file_id = 'tgftf'
              break
          }
          break;
        default:
          file_id = 'tgftf'
      }
      let file = 'https://raw.githubusercontent.com/GarrettMFlynn/BCIGameJam/master/src/assets/' + file_id + '.csv'
      console.log(file)
      d3.csv(file).then(function (data) {
        let row = Math.floor(Math.random() * data.length);
        let str = text_id.split('-');
        console.log(str)
        let choice = []
        for (const col in str)
          choice.push(data[row][col])
        let output = choice.join(', ')
        document.getElementById(text_id).innerHTML = output;
      })},
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
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
}

button{
  font-family: Montserrat, sans-serif;
  text-align: center;
  color: #222222;
  font-weight: 500;
}

.card-holder{
  display:flex;
  align-items: center;
  justify-content: center;
}

.card{
  display: flex;
  flex-wrap: wrap;
  margin: 25px;
  height: 250px;
  width: 200px;
  padding: 25px 0px;
  border: 2px solid;
  border-radius: 15px;
  color: white;
  font-weight: 500;
}

.break{
  flex-basis: 100%;
  height: 0;
}

  .blank{
    height: 50px;
    background: white;
    flex-grow: 1;
    display: table-cell;
    vertical-align: middle;
    color: black;
  }

</style>

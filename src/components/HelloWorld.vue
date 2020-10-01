<template>
  <div>
    <div id="head">
      <h1>Brain Play in the Future</h1>
      <p>#BCIGameJam 2021</p>
    </div>
    <p class="padded">
      Click the cards below to generate your prompt.
    </p>
    <select name="modes"  id="modes" v-model="selected">
      <option disabled value="">Please select one</option>
      <option >The Thing from the Future</option>
      <option >Futures Cone + Brain-Controlled Game</option> <!--value="cone-cone-cards"-->
      <option>Brain-Controlled Future</option> <!--value="control-cards-cards"-->
      <option>Futures Cone + Related to Brain-Controlled Games</option> <!--value="cone-cards-cone"-->
      <option>Related to Brain-Controlled Games</option> <!--value="cards-cards-cone"-->
    </select>
    <div id="card-holder">
      <button class="card" style="background: lightskyblue" v-on:click="queryCSV('future',{ selected })">
        <p>In a </p>
        <div class="break"/>
        <div class="blank"><p id='future'>&nbsp;</p></div>
        <div class="break"/>
        <p>future</p>
      </button>
      <button class="card" style="background: lightcoral" v-on:click="queryCSV('thing',{ selected })">
        <p>There is a</p>
        <div class="break"/>
        <div class="blank"><p id='thing'>&nbsp;</p></div>
        <div class="break"/>
        <p>&nbsp;</p>
      </button>
      <button class="card" style="background: mediumpurple" v-on:click="queryCSV('theme',{ selected })">
        <p >Related to</p>
        <div class="break"/>
        <div class="blank"><p id='theme'>&nbsp;</p></div>
        <div class="break"/>
        <p>What is it?</p>
      </button>
    </div>
    <div>
      <p class="padded"><strong>Note:</strong> Brain Play in the Future is a derivative of <a href="http://situationlab.org/project/the-thing-from-the-future/">The Thing From The Future</a> by Jeff Watson and <a href="http://situationlab.org/">The Situation Lab</a></p>
    </div>
    <hr/>
    <div id="examples">
      <h1>Examples</h1>
      <div class="example">
        <h2>BRAINPONG</h2>
        <img alt="Brain Pong" src="@/assets/BrainPong.jpg">
        <p>A single player meditation game, where players
          experience being the ball in a ping pong game
          against themselves taking place inside their head.
          The game exercises mindfulness, focus and getting into
          a flow state.</p>
      </div>
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
      html: 'Original Version'
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
        case 'Futures Cone + Brain-Controlled Game':
          switch(text_id){
            case 'future':
              file_id = 'cone'
              break
            case 'thing':
              file_id = 'cone'
              break
            case 'theme':
              file_id = 'cards'
              break
          }
          break;
        case 'Brain-Controlled Future':
          switch(text_id){
            case 'future':
              file_id = 'control'
              break
            case 'thing':
              file_id = 'cards'
              break
            case 'theme':
              file_id = 'cards'
              break
          }
          break;
        case 'Futures Cone + Related to Brain-Controlled Games':
          switch(text_id){
            case 'future':
              file_id = 'cone'
              break
            case 'thing':
              file_id = 'cards'
              break
            case 'theme':
              file_id = 'cone'
              break
          }
          break;
        case 'Related to Brain-Controlled Games':
          switch(text_id){
            case 'future':
              file_id = 'cards'
              break
            case 'thing':
              file_id = 'cards'
              break
            case 'theme':
              file_id = 'cone'
              break
          }
          break;
        default:
          file_id = 'cards'
      }
      let file = 'https://raw.githubusercontent.com/GarrettMFlynn/BCIGameJam/master/src/assets/' + file_id + '.csv'
      console.log(file)
      d3.csv(file).then(function (data) {
        let row = Math.floor(Math.random() * data.length);
        let choice = data[row][text_id]
        document.getElementById(text_id).innerHTML = choice;
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
a {
  color: #42b983;
}

p{
  width: 100%;
}

.padded {
  padding: 25px;
}

button{
  font-family: Montserrat, sans-serif;
  text-align: center;
  color: #222222;
  font-weight: 500;
}

#head{
  background:black;
  color: white;
  padding: 25px;
}

#card-holder{
  display:flex;
  align-items: center;
  justify-content: center;
}

.card{
  background: antiquewhite;
  display: flex;
  flex-wrap: wrap;
  margin: 25px;
  height: 250px;
  width: 200px;
  padding: 25px 0px;
  border: 2px solid black;
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
    border-top: 2px solid black;
    border-bottom: 2px solid black;
  }

  .example{
    width: 500px;
    margin: 50px;
  }

</style>

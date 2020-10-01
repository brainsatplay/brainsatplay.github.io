<template>
  <div class="hello">
    <p>Welcome to </p>
    <h1>The (Brain) Game from the Future</h1>
    <hr/>
    <p>
      Click the cards below to generate your prompt:
    </p>
    <div id="card-holder">
      <button class="card" style="background: lightskyblue" v-on:click="query('future')">
        <p>In a </p>
        <div class="break"/>
        <div class="blank"><p id='future'>&nbsp;</p></div>
        <div class="break"/>
        <p>future</p>
      </button>
      <button class="card" style="background: lightcoral" v-on:click="query('thing')">
        <p>There is a</p>
        <div class="break"/>
        <div class="blank"><p id='thing'>&nbsp;</p></div>
        <div class="break"/>
        <p>&nbsp;</p>
      </button>
      <button class="card" style="background: mediumpurple" v-on:click="query('theme')">
        <p >Related to</p>
        <div class="break"/>
        <div class="blank"><p id='theme'>&nbsp;</p></div>
        <div class="break"/>
        <p>What is it?</p>
      </button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    query: function queryCSV(text_id) {
      const d3 = require("d3");
      d3.csv('https://raw.githubusercontent.com/GarrettMFlynn/brainjam/master/src/assets/cards.csv').then(function (data) {
        let row = Math.floor(Math.random() * data.length);
        let choice = data[row][text_id]
        console.log(data[row]);
        console.log(choice)
        document.getElementById(text_id).innerHTML = choice;
      });
    }
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

button{
  font-family: Montserrat, sans-serif;
  text-align: center;
  color: #222222;
  font-weight: 500;
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
  border: 1px solid black;
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

</style>

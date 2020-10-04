<template>
  <div id="game">
      <div>
      <h2 id="Name0"></h2>
      </div>
    <p id="Description0"></p>
      <div id="selections">
      <div id="language_select">
        <label for="languages">Choose a language</label>
        <div class="break"></div>
        <select name="languages"  id="languages" v-model="selected" @change="chooseLanguage({ selected })">
          <option disabled value="">Please select one</option>
          <option >English</option>
          <option >Ελληνικά</option>
        </select>
      </div>
<!--      <div class="break"></div>-->
<!--      <div id="selector">-->
<!--        <label for="modes">Choose a card deck</label>-->
<!--    <div class="break"></div>-->
<!--      <select name="modes"  id="modes" v-model="selected">-->
<!--      <option disabled value="">Please select one</option>-->
<!--      <option >Classic</option>-->
<!--    </select>-->
<!--      </div>-->
    </div>
    <button id="generate" v-on:click="allQueries({ selected })">Generate Random Game</button>
    <div class="card-holder">
      <button class="card" style="background: hsla(80, 100%, 30%, 1); border-color: hsla(99, 39%, 20%, 1);" v-on:click="queryCSV('Future-Time',{ selected })">
        <h3 id="Future0" class ='card-type' style="color: hsla(99, 39%, 20%, 1);" ></h3>
        <div class="card-text">
        <p id="Future1"></p>
        <div class="blank" style="background: hsla(86, 48%, 75%, 1);"><p id='Future'>&nbsp;</p></div>
        <p id="Future2"></p>
          <div class="blank" style="background: hsla(86, 48%, 75%, 1);"><p id='Time'>&nbsp;</p></div>
        </div>
      </button>
      <button class="card" style="background: hsla(338, 85%, 43%, 1); border-color: hsla(355, 87%, 20%, 1);" v-on:click="queryCSV('Conflict',{ selected })">
        <h3 id="Conflict0" class ='card-type' style="color: hsla(355, 87%, 20%, 1);" ></h3>
        <div class="card-text">
        <p id="Conflict1"></p>
        <div class="blank" style="background: hsla(352, 83%, 84%, 1);"><p id='Conflict'>&nbsp;</p></div>
        <p id="Conflict2"></p>
          <p >&nbsp;</p>
        </div>
      </button>
      <button class="card" style="background: hsla(297, 27%, 46%, 1); border-color: hsla(296, 29%, 20%, 1);" v-on:click="queryCSV('Players',{ selected })">
        <h3 id="Players0" class ='card-type' style="color: hsla(296, 29%, 20%, 1);" ></h3>
        <div class="card-text">
        <p id="Players1"></p>
        <div class="blank" style="background: hsla(294, 29%, 80%, 1);"><p id='Players'>&nbsp;</p></div>
        <p id="Players2"></p>
          <p >&nbsp;</p>
        </div>
      </button>
      <button class="card" style="background: hsla(193, 100%, 38%, 1); border-color: hsla(194, 100%, 20%, 1);" v-on:click="queryCSV('Motivation',{ selected })">
        <h3 id="Motivation0" class ='card-type' style="color: hsla(194, 100%, 20%, 1);" ></h3>
        <div class="card-text">
        <p id="Motivation1"></p>
        <div class="blank" style="background: hsla(193, 75%, 73%, 1);"><p id='Motivation'>&nbsp;</p></div>
          <p id="Motivation2"></p>
          <p >&nbsp;</p>
        </div>
      </button>
      <button class="card" style="background: hsla(35, 100%, 45%, 1); border-color: hsla(35, 98%, 20%, 1);" v-on:click="queryCSV('Location',{ selected })">
        <h3 id="Location0" class ='card-type' style="color: hsla(35, 98%, 20%, 1);" ></h3>
        <div class="card-text">
        <p id="Location1"></p>
        <div class="blank" style="background: hsla(36, 100%, 76%, 1);"><p id='Location'>&nbsp;</p></div>
        <p id="Location2"></p>
          <p >&nbsp;</p>
        </div>
      </button>
    </div>
    <p class="'left">Created by Dimitris Grammenos, Marientina Gotsis, and Garrett Flynn</p>
    <p class="'left">Based on <a href="http://situationlab.org/project/the-thing-from-the-future/">The Thing From The Future</a> by Jeff Watson and <a href="http://situationlab.org/">The Situation Lab</a></p>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  el: '...',
  data () {
    return {
      selected: 'English',
    }},
  props: {
    msg: String,
  },
  mounted() {
    let language = {};
    language.selected = 'English';
    this.chooseLanguage(language)
  },
  methods: {
    allQueries(option){
      let all = ['Future-Time','Conflict','Players','Motivation','Location']
      for (const ind in all) {
        this.queryCSV(all[ind],option)
      }
    },
    chooseLanguage(language) {
      if (language.selected == 'Ελληνικά'){
      language.selected = 'Greek'
      }

      const d3 = require("d3");
      let file = 'https://raw.githubusercontent.com/GarrettMFlynn/multibrain-games/master/src/assets/interface' + language.selected + '.csv'
      d3.csv(file).then(function (data) {
        let headers = Object.keys( data[0] ) // then taking the first row object and getting an array of the keys
        for (const header in headers) {
              document.getElementById(headers[header]+0).innerHTML = data[0][headers[header]];
              for (let row=0; row < data.length; row++) {
                if ((headers[header] != "Name" && headers[header] != "Description")){
                  document.getElementById(headers[header] + (row)).innerHTML = data[row][headers[header]];
                }
              }
        }})
      this.allQueries(language)
    },
    queryCSV(text_id,option) {
      const d3 = require("d3");
      let file_id = ''
      if (option.selected == 'Ελληνικά'){
        option.selected = 'Greek'
      }

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
      let file = 'https://raw.githubusercontent.com/GarrettMFlynn/multibrain-games/master/src/assets/' + file_id + option.selected + '.csv'
      d3.csv(file).then(function (data) {
        let flag = true;
        let inner_flag;
        let row;
        let str = text_id.split('-');
        let output;
        let freq;


          if (str.length > 1) {
            for (const col in str) {
              inner_flag = true;
              while (inner_flag) {
                row = Math.floor(Math.random() * data.length);
                output = data[row][str[col]];
                if (output != '') {
                  inner_flag = false;
                  if (str[col] == 'Time' && option.selected == 'English'){
                    output += ' from now'
                  }
                  document.getElementById(str[col]).innerHTML = output;
                }
              }
            }
          } else {

            // Create bag of words (to account for frequency)
            let bag = [];
            let data_;
            let word;
            let components;
            for (const r in data) {
              data_ = data[r][str[0]]
              if (data_ != undefined && data_ != []) {
                if (data_.split(' (').length == 2) {
                  components = data_.split(' (')
                  word = components[0];
                  freq = components[1].split(')')[0]
                  for (let i = 0; i < freq; i++) {
                    bag.push(word)
                  }
                } else{
                  bag.push(data_)
                }
              }
            }

            while (flag) {
            row = Math.floor(Math.random() * bag.length);
            output = bag[row]
              if (output != '') {
                flag = false;
                document.getElementById(text_id).innerHTML = output;
                if (text_id == 'Players') {
                  switch (option.selected) {
                    case 'Ελληνικά':
                      // switch (output) {
                      //   case 'one': // 'έναν':
                      //     document.getElementById('Players2').innerHTML = 'παίκτης';
                      //     break;
                      //   default:
                          document.getElementById('Players2').innerHTML = 'παίκτες';
                          // break;
                      break
                    case 'English':
                      // switch (output) {
                      //   case 'one':
                      //     document.getElementById('Players2').innerHTML = 'player';
                      //     break;
                      //   default:
                          document.getElementById('Players2').innerHTML = 'players';
                          // break;
                      }
                      break;
                  }
                }
              }
          }
      })
    },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  border: none;
}


  #game-header{
    display:flex;
    flex-wrap: wrap;
    text-align: left;
    align-items: center;
    justify-content: center;
  }
#selections{
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

}

#generate{
  padding: 10px;
  margin: 25px 0px;
  width: 200px;
  border-radius: 10px;
}

#Time{
  color: #222222;
  font-size: 15px;
 }

.card-type{
  text-transform: uppercase;
  color: #222222;

}

.card-text{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  height: 200px;
}

.card-holder{
  display:flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.card{
  margin: 25px;
  height: 300px;
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
    min-height: 50px;
  }

</style>

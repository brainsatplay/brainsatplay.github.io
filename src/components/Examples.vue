<template>
  <div id="examples">
    <div class="example">
      <div class="example_text">
        <h2>BRAINPONG</h2>
        <h3>Dimitris Grammenos</h3>
        <p class="prompt">In a <strong>peaceful</strong> future <strong>a generation from now</strong>, there is a <strong>cooperative</strong> BBI game for <strong>two</strong> players which is played for <strong>mindfulness</strong> <strong>at home</strong>.</p>
        <p>Two connected players play a ping pong game inside their brains.
          After a hit, the hitting player becomes the ball and tries to
          land on the other player’s paddle. The goal of the game is for
          players to experience being part of a “well-played game”.  B
          rainpong is inspired by an experience described by <a href="https://www.deepfun.com/remembering-bill/">Bernie DeKoven</a> that led him to writing “The Well-Played Game” book.</p>
      </div>
      <img alt="Brain Pong" src="@/assets/BrainPong.jpg">
    </div>
    <div class="example">
      <div class="example_text">
        <h2>BRAINBALL</h2>
        <h3>Dimitris Grammenos</h3>
        <p class="prompt">In a <strong>selfish</strong> future <strong>a century from now</strong>, there is a
          <strong>competitive</strong> BBI game for <strong>two players</strong> which is
          played for <strong>money in a stadium</strong>.</p>
        <p>The future of American football. Played by two brain coaches.
          Each coach manages in real time the brains of a team of bionically
          enhanced athletes. Due to the repeated banging of the players’ heads,
          brain implants often malfunction with unpredictable consequences.</p>
      </div>
      <img alt="Brainball" src="@/assets/BRAINBALL.jpg">
    </div>
    <div class="example">
      <div class="example_text">
        <h2>ROACHATHON</h2>
        <h3>Dimitris Grammenos</h3>
        <p class="prompt">In a <strong>hilarious</strong> future <strong>a decade from now</strong>,
          there is a <strong>competitive</strong> BBI game for <strong>an unlimited number
            of players</strong> which is played for <strong>fun in a city</strong>.</p>
        <p>A game played in various big cities all over the world
          where contestants mind-control cyborg cockroaches.
          Starting from a designated location, the roaches have
          to complete a challenging course including busy streets,
          bug- hostile buildings and predator- filled areas,
          without being exterminated.</p>
      </div>
      <img alt="Roachathon" src="@/assets/ROACHATHON.jpg">
    </div>
    <div class="example">
      <div class="example_text">
        <h2>DARKROOM</h2>
        <h3>Dimitris Grammenos</h3>
        <p class="prompt">In a <strong>bright</strong> future <strong>two generations from now</strong>,
          there is a <strong>conflict-free</strong> BBI game for <strong>up to eight players</strong>
            which is played for <strong>mental stimulation in a special room</strong></p>
        <p>A game for imagining together. During the game a
          mental experience develops, like a darkroom picture.
          The first player starts with something like a blurry,
          out of focus, image. This “image” may also include sounds,
          smells, sensations, feelings, etc. Someone else (when so
          moved) adds a detail, zooms in or out, adjusts focus, etc.
          Darkroom is an adaptation of a game included in Bernie
          DeKoven’s <a href="https://www.deepfun.com/darkroom/">Deep Fun</a>.</p>
      </div>
      <img alt="Darkroom" src="@/assets/DARKROOM.jpg">
    </div>
    <div class="example">
      <div class="example_text">
        <h2>THOUGHT FOR FOOD</h2>
        <h3>Dimitris Grammenos</h3>
        <p class="prompt">In a <strong>post-apocalyptic</strong> future <strong>a millennium from now</strong>,
          there is a <strong>semi-cooperative</strong> BBI game for <strong>a small group of</strong> players
          which is played for <strong>food in a cave</strong>.</p>
        <p>In a future where the world is ruled by a technological Singularity,
          the few remaining humans live in remote caves under the surface of the
          earth. To get their food while avoiding the risk of being spotted by the
          Global Surveillance System, humans rely on predator animals that they
          control through brain implants. The game has two phases. On the coop phase,
          predators work together to catch prey and evade capture by the Singularity.
          When back to the safety of the cave, they try to outpower and outwit each
          other, to get the lion's share of the collected goods.</p>
      </div>
      <!--      <img alt="Thought for Food" src="@/assets/THOUGHTFORFOOD.jpg">-->
    </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  #examples{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }

  .example{
    width: 100%;
    display: flex;
    flex-wrap:wrap-reverse;
    align-items: center;
    justify-content: center;
  }

  .example_text{
    margin: 50px;
    width: 400px;
    text-align: left
  }

  .prompt{
    border-left: 2px solid #222222;
    margin: 20px;
    padding: 20px;
  }

</style>

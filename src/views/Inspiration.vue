<template>
    <div class="head">
        <h1>The Game from the Future</h1>
        <p>A Brainstorming Game for the #BCIGameJam</p>
    </div>
    <section id="tgftf">
        <GameFromTheFuture/>
    </section>
    <div class="head">
        <h1>Example Games</h1>
        <p>Designed by the #BCIGameJam Team</p>
    </div>
    <section>
    <div id="examples">
        <h1>Examples</h1>
        <div class="example">
            <img alt="Brain Pong" src="@/assets/BrainPong.jpg">
            <p><strong>BRAINPONG</strong> | Dimitris Grammenos</p>
            <p>A single player meditation game, where players
                experience being the ball in a ping pong game
                against themselves taking place inside their head.
                The game exercises mindfulness, focus and getting into
                a flow state.</p>
        </div>
    </div>
    </section>
</template>

<script>
    // @ is an alias to /src
    import GameFromTheFuture from '@/components/GameFromTheFuture.vue'

    export default {
        name: 'Home',
        components: {
            GameFromTheFuture
        }
    }
</script>

<style scoped>

    #tgftf{
        color: white;
        background: black;
    }

    .example{
        width: 100%;
    }
</style>

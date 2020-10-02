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
        <div class="example">
            <div class="example_text">
                <h2>BRAINPONG</h2>
                <h3>Dimitris Grammenos</h3>
                <p>A single player meditation game, where players
                    experience being the ball in a ping pong game
                    against themselves taking place inside their head.
                    The game exercises mindfulness, focus and getting into
                    a flow state.</p>
            </div>
            <img alt="Brain Pong" src="@/assets/BrainPong.jpg">
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

    section{
        color: white;
        background: black;
    }

    #examples{
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .example{
        width: 75%;
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
</style>

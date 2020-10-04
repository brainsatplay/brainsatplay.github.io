<template>
    <div class="head">
        <h1>Inspiration</h1>
        <p>Brainstorming Exercises for the Multi-Brain Game Jam</p>
    </div>
    <section id="tgftf">
        <GameFromTheFuture/>
    </section>
    <div class="head">
        <h1>Example Games</h1>
        <p>Designed by the Multi-Brain Game Jam Team</p>
    </div>
    <section>
        <Examples/>
    </section>
</template>

<script>
    // @ is an alias to /src
    import GameFromTheFuture from '@/components/GameFromTheFuture.vue'
    import Examples from '@/components/Examples.vue'


    export default {
        name: 'Inspiration',
        components: {
            GameFromTheFuture,
            Examples
        },
    }
</script>

<style scoped>

    section{
        color: white;
        background: black;
    }
</style>

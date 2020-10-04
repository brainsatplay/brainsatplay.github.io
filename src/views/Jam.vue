<template>
  <div class="head">
    <h1>The Jam</h1>
    <p>Everything you wanted to know (and more!)</p>
  </div>
  <section>
    <router-link to="/rules">Rules</router-link>
    <router-link to="/inspiration">Inspiration</router-link>
    <router-link to="/submit">Submit</router-link>
  </section>
</template>

<style scoped>

  a {
    color: hsla(193, 100%, 43%, 1);
    font-weight: bold;
    margin: 20px;
  }
</style>

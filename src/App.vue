<template>
  <div id="nav">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-link to="/jam">Jam</router-link>
    <router-link to="/curriculum">Curriculum</router-link>
  </div>
  <router-view/>
</template>

<script>

  export default {
    name: 'App',
    components: {
    }
  }
</script>

<style>
  body,html {margin: 0px;}
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
  }
  img{
    height: 200px;
  }

  h1{
    font-size: 50px;
    margin-bottom: 0px;
  }

  h2{
    font-size: 35px;
    margin-bottom: 0px;
  }

  h3{
    font-size: 20px;
    width: 100%;
    margin: 0px;
  }

  .head{
    background:#111111;
    color: white;
    padding: 25px;
  }
  section{
    padding: 50px;
  }
  a {
    color: hsla(193, 100%, 43%, 1);
  }
  #nav {
    padding-right: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: black;
    color: white;
    position: sticky;
    top:0;
    left:0;
  }
  #nav a {
    font-weight: bold;
    color: white;
    text-decoration: none;
    padding: 20px;
  }
  #nav a.router-link-exact-active {
    color: hsla(193, 100%, 43%, 1);
  }
</style>

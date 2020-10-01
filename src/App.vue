<template>
  <div id="nav">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-link to="/inspiration">Inspiration</router-link>
  </div>
  <router-view/>
</template>

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

  .head{
    background:black;
    color: white;
    padding: 25px;
  }
  section{
    margin: 50px;
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
    color: #42b983;
  }
</style>

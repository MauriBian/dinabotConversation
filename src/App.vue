<template>
  <div class="app">
      <BaseModal ref="baseModal" />
      <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import BaseModal from '@/components/ui/BaseModal'
export default {
  components: {
    BaseModal
  },
  mounted () {
    Vue.prototype.$modal = this.$refs.baseModal
  },
  computed: {
  }
}
</script>

<style lang="scss">
@import '~@sweetalert2/theme-bulma/bulma.scss';
body, html {
  padding: 0;
  margin: 0;
  width: 100%;
  min-height: 100vh;
}
body {
  background-color: $color-background;
}
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  min-height: 100vh;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

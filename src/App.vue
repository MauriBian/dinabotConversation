<template>
  <div class="app">
    <div class="lang-page__header px-md py-md">
      <div class="lang-page__header-left">
        <BaseFormSelect
          class="leng-select"
          v-model="$i18n.locale"
          :options="languageOptions"
          :label="$t('message.language')"/>
      </div>
      <div class="lang-page__header-right">
    </div>
    </div>
      <BaseModal ref="baseModal" />
      <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import BaseModal from '@/components/ui/BaseModal'
import BaseFormSelect from '@/components/ui/BaseFormSelect'
export default {
  components: {
    BaseModal,
    BaseFormSelect
  },
  mounted () {
    Vue.prototype.$modal = this.$refs.baseModal
  },
  computed: {
    languageOptions () {
      return [
      { label: 'English', code:'en' },
      { label: 'Japanese', code: 'ja'},
      { label: 'Spanish', code:'es' }
      ]
    }
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

.lang-page__header {
  display: flex;
  align-items: right;
  font-family: $font-family-primary;

  .leng-select{
    width: 100%;
  }

  & > div {
    flex: 1;

    &.lang-page__header-left {
      text-align: left;
      max-width: 15%;
    }

    &.lang-page__header-right {
      text-align: right;

      span {
        font-size: 0.85rem;
        font-weight: 400;
      }

      .btn-sign-up {
        -webkit-box-shadow: 0 5px 15px rgba($color-shadow, 0.25);
        -moz-box-shadow: 0 5px 15px rgba($color-shadow, 0.25);
        box-shadow: 0 5px 15px rgba($color-shadow, 0.25);

        &:hover {
          transform: scale(1.1);
          -webkit-box-shadow: 0 5px 18px rgba($color-shadow, 0.15);
          -moz-box-shadow: 0 5px 18px rgba($color-shadow, 0.15);
          box-shadow: 0 5px 18px rgba($color-shadow, 0.15);
        }
      }
    }
  }
}
</style>

import Vue from 'vue'
import Vuex from 'vuex'
import question from './question'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    question: question
  }
})
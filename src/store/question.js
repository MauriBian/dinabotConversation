const axios = require('axios')
const config = require('../config/config')
export default {
  state: {
    dinabot: {
      _id: '',
      name: '',
      questionList: []
    }
  },
  mutations: {
    setDinabot (state, payload) {
      state.dinabot = payload
    },
  },
  actions: {
    async createDinabot ({ state }, dinabot) {
      try {
        const result = await axios.post(config.dinabotUrl + '/dinabot', dinabot)
        const newDinabot = result.data
        state.dinabot = newDinabot
        return state.dinabot
      } catch (error) {
        return 'Error'
      }
    },
    async addQuestion ({ state }, question) {
      try {
        // const dbQuestion = state.dinabot.questionList.find(db => db.internalName == question.internalName)
        const result = await axios.post(config.dinabotUrl + `/question?id=${state.dinabot._id}`, question)
        const newQuestion = result.data.questionList[result.data.questionList.length - 1]
        state.dinabot.questionList.push(newQuestion)
        return newQuestion
      } catch (error) {
        return 'Error'
      }
    }
  },
  getters: {
    getDinabot: state => {
      return state.dinabot
    },
  }
}

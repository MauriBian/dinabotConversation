<template>
  <BaseSidePanel
    class="card-panel"
    ref="sidePanel"
    :closeOnOutsideClick="true"
    :title="title">
    <template v-slot:header>
    </template>
    <template v-slot:main>
      <div class="mt-sm">
        <div class="mt-sm" v-if="!card">
          <BaseFormInput v-model="form.name" :label="$t('message.botName')"></BaseFormInput>
        </div>
        <div class="mt-md mb-rg">
          <p class="subtitle-salute"> {{ !card ? $t('message.salute'): $t('message.newQuestion') }}</p>
        </div>
        <div class="mt-sm">
          <BaseFormInput v-model="form.label" :label="$t('message.label')"></BaseFormInput>
        </div>
        <div class="mt-sm">
          <BaseFormInput v-model="form.text" :label="$t('message.text')"></BaseFormInput>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="pb-md form-row mt-md mb-rg">
        <button
          type="button"
          class="btn btn-abort btn-rg btn-fit px-lg mr-sm"
          @click.prevent="close"
          >
          <span>{{$t("message.cancel")}}</span>
        </button>
        <button
          type="submit"
          class="btn btn-success btn-rg btn-fit px-lg"
          @click.prevent="submit"
            >
          <span >{{$t("message.save")}}</span>
        </button>
      </div>
    </template>
  </BaseSidePanel>
</template>

<script>
import BaseFormInput from '@/components/ui/BaseFormInput'
import BaseSidePanel from '@/components/ui/BaseSidePanel.vue'
export default {
  data () {
    return {
      card: null,
      form: {
          name: '',
          label: '',
          text: '',
          questionType: 'text',
          responseType: 'text',
          path: '',
          internalName:'salute',
          position: {
            left: 0,
            top: 0
          }
      }
    }
  },

  computed: {
    options () {
      return [{ code: 3, label: 'Aladdin and the Wonderful Lamp',  },
      { code: 2, label: 'The Ball Game'},
      { code: 1, label: 'Le saut à la couverture'} ]
    },
    title () {
        return this.$t("message.cardPanelTitle")
    }
  },

  components: {
    BaseSidePanel,
    BaseFormInput
  },

  methods: {
  
    open (card, position) {
      this.card = card
      this.form.position.left = position.left
      this.form.position.top = position.top
      this.$refs.sidePanel.open()
    },

    close () {
      this.$refs.sidePanel.close()
    },

    cancel () {
      this.close()
    },

    async submit () {
      if(!this.card) {
        const dinabot = {
          name: this.form.name,
          questionList: [{
            label: this.form.label,
            text: this.form.text,
            questionType: this.form.questionType,
            responseType: this.form.responseType,
            path: this.form.path,
            internalName: this.form.internalName,
            position: this.form.position
          }]
      }
      const newBot = await this.$store.dispatch('createDinabot', dinabot)
      this.$emit('new-bot', newBot)
      } else {
        const question = {
          label: this.form.label,
          text: this.form.text,
          questionType: this.form.questionType,
          responseType: this.form.responseType,
          path: this.card.path ? this.card.path + `,${this.card.internalName}`: this.card.internalName,
          internalName: this.form.label.toLowerCase() + '@' + (Math.random() + 1).toString(36).substring(7),
          position: this.form.position
        }
        const newQuestion = await this.$store.dispatch('addQuestion', question)
        this.$emit('new-question', newQuestion)
      }

      this.form = {
          name: '',
          label: '',
          text: '',
          questionType: 'text',
          responseType: 'text',
          path: '',
          internalName:'salute',
          position: {
            left: 0,
            top: 0
          }
      }
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>

.subtitle-salute {
  font-size: 1.2rem;
  text-align: left;
  color: $color-success
}
</style>

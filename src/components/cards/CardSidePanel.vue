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

      </div>
      <div class="form-row mt-md mb-rg">
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
import BaseSidePanel from '@/components/ui/BaseSidePanel.vue'
export default {
  data () {
    return {
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
    BaseSidePanel
  },

  methods: {
   

    open () {
      this.$refs.sidePanel.open()
    },

    close () {
      this.$refs.sidePanel.close()
    },

    cancel () {
      this.close()
    },

    async submit () {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

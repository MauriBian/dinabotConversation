<template>
  <div class="home">
    <div class="lang-page__header px-md py-sm">
      <div class="lang-page__header-left">
        <BaseFormSelect
          class="leng-select"
          v-model="$i18n.locale"
          :options="languageOptions"
          :label="$t('message.language')"/>
      </div>
      <div class="lang-page__header-right pt-rg">
        <button
          v-if="!emptyQuestionList"
          class="btn btn-success btn-rg btn-fit"
          @click.prevent="() => openCardPanel(null, { left: center.x, top: 100})"
          >
          <span >{{$t("message.newChatbot")}}</span>
        </button>
     </div>
    </div>
    <canvas class="canvas" ref="conversationCanvas" width="1900" height="1000"></canvas>    
    <CardSidePanel @new-question="drawNewQuestion" @new-bot="drawNewBot" ref="cardSidePanel"></CardSidePanel>
  </div>
</template>

<script>
// @ is an alias to /src
import { fabric } from 'fabric'
import CardSidePanel from '@/components/cards/CardSidePanel'
import BaseFormSelect from '@/components/ui/BaseFormSelect'

fabric.Canvas.prototype.getItemByName = function(internalName) {
  return this.getObjects().find((object) =>  object?.internalName == internalName)
}
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

export default {
  name: 'Home',
  components: {
    CardSidePanel,
    BaseFormSelect
  },
  data () {
    return {
      card: {
        width: 300,
        height: 50,
        color: '#f5f5f5',
        border: '#616161',
        paddingX: 200,
        paddingY: 100
      },
      line: {
        color: '#616161',
        border: '#616161',
        borderHeight: 4
      },
      canvas: null,
      canvasCardList: []
    }
  },

  computed: {
    center () {
      const zoom = this.canvas.getZoom()
      return {
        x:fabric.util.invertTransform(this.canvas.viewportTransform)[4]+(this.canvas.width/zoom)/2,
        y:fabric.util.invertTransform(this.canvas.viewportTransform)[5]+(this.canvas.height/zoom)/2
      }
    },
    languageOptions () {
      return [
      { label: 'English', code:'en' },
      { label: 'Japanese', code: 'ja'},
      { label: 'Spanish', code:'es' }
      ]
    },

    emptyQuestionList () {
      return this.$store.getters.getDinabot.questionList.length
    }
  },

  methods: {
    getCardChildrens (cardToSearch) {
      const childrens = this.cardList.filter(card => {
        const pathList = card.path.split(',')
        const isChildren = pathList[pathList.length - 1] == cardToSearch.internalName
        return isChildren
      })
      return childrens
    },

    getParent (cardToSearch) {
      const cardPath = cardToSearch.path.split(',')
      const cardParent = cardPath[cardPath.length - 1]
      const parent = this.cardList.find(card => {
        return card.internalName == cardParent
      })
      return parent
    },

    getCardBrothers (cardToSearch) {
      const cardPath = cardToSearch.path.split(',')
      const cardParent = cardPath[cardPath.length - 1]
      const brothers = this.cardList.filter(card => {
        const pathList = card.path.split(',')
        const isBrother = pathList[pathList.length - 1] == cardParent && cardToSearch.internalName != card.internalName
        return isBrother
      })
      return brothers
    },

    drawNewBot(dinabot) {
      const question = dinabot.questionList.find(question => question.internalName === 'salute')
      const card = this.drawCard(question.position.top, question.position.left, question)
      this.canvasCardList.push(card)
      this.canvas.add(card)
    },

    drawNewQuestion(newQuestion) {
      const parents = newQuestion.path.split(',')
      const parentInternalName = parents[parents.length - 1]
      const parentQuestion = this.canvasCardList.find(question => question.internalName == parentInternalName)
      const card = this.drawCard(newQuestion.position.top, newQuestion.position.left, newQuestion)
      const line = this.drawLine(parentQuestion, card)
      this.canvasCardList.push(card)
      card.targetLine = line
      parentQuestion.spawnerLine ? parentQuestion.spawnerLine.push(line) : parentQuestion.spawnerLine = [line]
      this.canvas.add(card)
      this.canvas.add(line)
      this.canvas.moveTo(line, 0);
      this.canvas.renderAll()
    },

    drawCard (top, left, cardToDraw) {
      const card = new fabric.Rect({
        width: this.card.width,
        height: this.card.height,
        fill: this.card.color,
        stroke: this.card.border,
        internalName: cardToDraw.internalName
      })

      const text = new fabric.Text(cardToDraw.label , {
        fontFamily: 'arial',
        fontSize: 25
      })

      const group = new fabric.Group([card, text], {
        top: top,
        left: left,
        internalName: cardToDraw.internalName
      })

      this.onCardDobleClick(group)
      group.hasControls = group.hasBorders = false
      return group
    },

    drawTree () {
      const canvasToSet = this.canvas
      const drawLines = this.drawLine
      const getParent = this.getParent
      let startX = this.center.x
      let lastYPathSize = 0
      let cards = []
      this.cardList.forEach((card) => {
        const pathSize = card.path ? (card.path.split(',').length + 1) : 1
        if (lastYPathSize == pathSize) {
          startX += this.card.width + this.card.paddingX
        } else {
          if (getParent(card)) {
            startX = cards.find(elem => elem.internalName == getParent(card).internalName).left - ((this.getCardBrothers(card).length / 2) * (this.card.width + this.card.paddingX))
          } else {
            startX = this.center.x - ((this.getCardBrothers(card).length / 2) * (this.card.width + this.card.paddingX))
          }
        }
        const cardY = card.path ? this.card.paddingY * pathSize : 100
        const cardDrawed = this.drawCard(cardY, startX, card)
        lastYPathSize = pathSize
        cards.push(cardDrawed)
      })

      const lines = cards.map(card => {
        const childrens = this.getCardChildrens(card)
        const linesToDraw = childrens.map(children => {
          const childrenCard = cards.find(elem => elem.internalName == children.internalName)
          const lineWillDraw = drawLines(card, childrenCard)
          childrenCard.targetLine = lineWillDraw
          return lineWillDraw
        })
        card.spawnerLine = linesToDraw
        return linesToDraw
      })

      lines.forEach(lineToSet => lineToSet.forEach(line => canvasToSet.add(line)))
      cards.forEach(card => canvasToSet.add(card))
      
    },

    drawLine (start, end) {
      const line = new fabric.Line([
        start.left,
        start.top,
        end.left,
        end.top
      ], {
        fill: this.line.color,
        stroke: this.line.color,
        strokeWidth: this.line.borderHeight,
        selectable: false,
        evented: false
      })
      return line
    },

    wheelZoom (canvas) {
      canvas.on('mouse:wheel', (opt) => {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 20) zoom = 20
        if (zoom < 0.01) zoom = 0.01
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
      })
    },

    onMoving (canvas) {
      canvas.on('object:moving', (object) => {
        const card = object.target
        card.spawnerLine && card.spawnerLine.forEach(elem => elem.set({ 'x1': card.left, 'y1': card.top }))
        card.targetLine && card.targetLine.set({ 'x2': card.left, 'y2': card.top })
        canvas.renderAll()
      })
    },

    onCardDobleClick (card) {
      const openPanel = this.openCardPanel
      card.on('mousedblclick', function(card) { 
        const cardSelected = card.target._objects[0]
        openPanel(cardSelected, { left: card.target.left, top: card.target.top + 200 })
      })
    },

    openCardPanel (card, position) {
      const question = this.$store.getters.getDinabot.questionList.find(question => question.internalName == card.internalName)
      this.$refs.cardSidePanel.open(question, position)
    }
  },
  
  async mounted () {
      const ref = this.$refs.conversationCanvas
      const canvas = new fabric.Canvas(ref)
      this.canvas = canvas
      this.canvas.selection = false
      canvas.setWidth(window.innerWidth)
      canvas.setHeight(window.innerHeight)

      // const card1 = this.drawCard(100,this.center.x, 'salute')
      // const card2 = this.drawCard(300,this.center.x, 'pedido')
      // const line = this.drawLine(card1 , card2)
      // card1.spawnerLine = line
      // card2.targetLine = line
          
      // this.canvas.add(line)    
      // this.canvas.add(card1)
      // this.canvas.add(card2)
      
      this.onMoving(this.canvas)
      this.wheelZoom(this.canvas)
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  min-height: 100vh;
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

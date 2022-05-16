<template>
  <div class="home">
    <canvas class="canvas" ref="conversationCanvas" width="1900" height="1000"></canvas>    
    <CardSidePanel ref="cardSidePanel"></CardSidePanel>
  </div>
</template>

<script>
// @ is an alias to /src
import { fabric } from 'fabric'
import CardSidePanel from '@/components/cards/CardSidePanel'

fabric.Canvas.prototype.getItemByName = function(internal_name) {
  return this.getObjects().find((object) =>  object?.internal_name == internal_name)
}
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

export default {
  name: 'Home',
  components: {
    CardSidePanel
  },
  data () {
    return {
      card: {
        width: 100,
        height: 20,
        color: '#f5f5f5',
        border: '#616161',
        paddingX: 200,
        brotherPadding: 20,
        paddingY: 100
      },
      line: {
        color: '#616161',
        border: '#616161',
        borderHeight: 4
      },
      canvas: null,
      cardList: [
        { internal_name: 'salute', path: '', label: 'Saludo inicial' },
        { internal_name: 'seguimiento', path: 'salute', label: 'Seguimiento de pedidos' },
        { internal_name: 'medios_pago', path: 'salute', label: 'Medios de pago' },
        { internal_name: 'sucursales', path: 'salute', label: 'Sucursales' },
        { internal_name: 'otra_consulta', path: 'salute', label: 'Otra consulta' },
        { internal_name: 'buscar_operador', path: 'salute,otra_consulta', label: 'Buscar un operador' },
        { internal_name: 'consulta_resuelta', path: 'salute,otra_consulta', label: 'Gracias por comunicarse con nosotros' }
      ]
    }
  },

  computed: {
    center () {
      const zoom = this.canvas.getZoom()
      return {
        x:fabric.util.invertTransform(this.canvas.viewportTransform)[4]+(this.canvas.width/zoom)/2,
        y:fabric.util.invertTransform(this.canvas.viewportTransform)[5]+(this.canvas.height/zoom)/2
      }
    }
  },

  methods: {
    getCardChildrens (cardToSearch) {
      const childrens = this.cardList.filter(card => {
        const pathList = card.path.split(',')
        const isChildren = pathList[pathList.length - 1] == cardToSearch.internal_name
        return isChildren
      })
      return childrens
    },

    getParent (cardToSearch) {
      const cardPath = cardToSearch.path.split(',')
      const cardParent = cardPath[cardPath.length - 1]
      const parent = this.cardList.find(card => {
        return card.internal_name == cardParent
      })
      return parent
    },

    getCardBrothers (cardToSearch) {
      const cardPath = cardToSearch.path.split(',')
      const cardParent = cardPath[cardPath.length - 1]
      const brothers = this.cardList.filter(card => {
        const pathList = card.path.split(',')
        const isBrother = pathList[pathList.length - 1] == cardParent && cardToSearch.internal_name != card.internal_name
        return isBrother
      })
      return brothers
    },

    drawCard (top, left, internal_name) {
      const card = new fabric.Rect({
        top: top,
        left: left,
        width: this.card.width,
        height: this.card.height,
        fill: this.card.color,
        stroke: this.card.border,
        internal_name: internal_name
      })

      this.onCardDobleClick(card)
      card.hasControls = card.hasBorders = false
      return card
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
            startX = cards.find(elem => elem.internal_name == getParent(card).internal_name).left - ((this.getCardBrothers(card).length / 2) * (this.card.width + this.card.paddingX))
          } else {
            startX = this.center.x - ((this.getCardBrothers(card).length / 2) * (this.card.width + this.card.paddingX))
          }
        }
        const cardY = card.path ? this.card.paddingY * pathSize : 100
        const cardDrawed = this.drawCard(cardY, startX, card.internal_name)
        lastYPathSize = pathSize
        cards.push(cardDrawed)
      })

      const lines = cards.map(card => {
        const childrens = this.getCardChildrens(card)
        const linesToDraw = childrens.map(children => {
          const childrenCard = cards.find(elem => elem.internal_name == children.internal_name)
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
        openPanel(card.target)
      })
    },

    openCardPanel (card) {
      this.$refs.cardSidePanel.open(card)
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
      
      this.drawTree()

      this.onMoving(this.canvas)
      this.wheelZoom(this.canvas)
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  min-height: 100vh;
    display: flex;
  align-items: center;
  justify-content: center;
}
</style>

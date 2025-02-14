import { Text } from '@svgdotjs/svg.js'
import { getStrWithBrFromHtml } from '../../utils/index'

// 创建文字节点
function createText(data) {
  let g = this.draw.group()
  const setActive = () => {
    if (
      !this.activeLine ||
      this.activeLine[3] !== data.node ||
      this.activeLine[4] !== data.toNode
    ) {
      this.setActiveLine({
        ...data,
        text: g
      })
    }
  }
  g.click(e => {
    e.stopPropagation()
    setActive()
  })
  g.on('dblclick', e => {
    e.stopPropagation()
    setActive()
    if (!this.activeLine) return
    this.showEditTextBox(g)
  })
  return g
}

//  显示文本编辑框
function showEditTextBox(g) {
  this.mindMap.emit('before_show_text_edit')
  // 注册回车快捷键
  this.mindMap.keyCommand.addShortcut('Enter', () => {
    this.hideEditTextBox()
  })
  
  if (!this.textEditNode) {
    this.textEditNode = document.createElement('div')
    this.textEditNode.style.cssText = `position:fixed;box-sizing: border-box;background-color:#fff;box-shadow: 0 0 20px rgba(0,0,0,.5);padding: 3px 5px;margin-left: -5px;margin-top: -3px;outline: none; word-break: break-all;`
    this.textEditNode.setAttribute('contenteditable', true)
    this.textEditNode.addEventListener('keyup', e => {
      e.stopPropagation()
    })
    this.textEditNode.addEventListener('click', e => {
      e.stopPropagation()
    })
    const targetNode = this.mindMap.opt.customInnerElsAppendTo || document.body
    targetNode.appendChild(this.textEditNode)
  }
  let {
    associativeLineTextFontSize,
    associativeLineTextFontFamily,
    associativeLineTextLineHeight
  } = this.mindMap.themeConfig
  let scale = this.mindMap.view.scale
  let [, , , node, toNode] = this.activeLine
  let textLines = (
    this.getText(node, toNode) || this.mindMap.opt.defaultAssociativeLineText
  ).split(/\n/gim)
  this.textEditNode.style.fontFamily = associativeLineTextFontFamily
  this.textEditNode.style.fontSize = associativeLineTextFontSize * scale + 'px'
  this.textEditNode.style.lineHeight = textLines.length > 1 ? associativeLineTextLineHeight : 'normal'
  this.textEditNode.style.zIndex = this.mindMap.opt.nodeTextEditZIndex
  this.textEditNode.innerHTML = textLines.join('<br>')
  this.textEditNode.style.display = 'block'
  this.updateTextEditBoxPos(g)
  this.showTextEdit = true
}

// 处理画布缩放
function onScale() {
  this.hideEditTextBox()
}

// 更新文本编辑框位置
function updateTextEditBoxPos(g) {
  let rect = g.node.getBoundingClientRect()
  this.textEditNode.style.minWidth = rect.width + 10 + 'px'
  this.textEditNode.style.minHeight = rect.height + 6 + 'px'
  this.textEditNode.style.left = rect.left + 'px'
  this.textEditNode.style.top = rect.top + 'px'
}

//  隐藏文本编辑框
function hideEditTextBox() {
  if (!this.showTextEdit) {
    return
  }
  let [path, , text, node, toNode] = this.activeLine
  let str = getStrWithBrFromHtml(this.textEditNode.innerHTML)
  this.mindMap.execCommand('SET_NODE_DATA', node, {
    associativeLineText: {
      ...(node.nodeData.data.associativeLineText || {}),
      [toNode.nodeData.data.id]: str
    }
  })
  this.textEditNode.style.display = 'none'
  this.textEditNode.innerHTML = ''
  this.showTextEdit = false
  this.renderText(str, path, text)
  this.mindMap.emit('hide_text_edit')
}

// 获取某根关联线的文字
function getText(node, toNode) {
  let obj = node.nodeData.data.associativeLineText
  if (!obj) {
    return ''
  }
  return obj[toNode.nodeData.data.id] || ''
}

// 渲染关联线文字
function renderText(str, path, text) {
  if (!str) return
  let { associativeLineTextFontSize, associativeLineTextLineHeight } =
    this.mindMap.themeConfig
  text.clear()
  let textArr = str.split(/\n/gim)
  textArr.forEach((item, index) => {
    let node = new Text().text(item)
    node.y(associativeLineTextFontSize * associativeLineTextLineHeight * index)
    this.styleText(node)
    text.add(node)
  })
  updateTextPos(path, text)
}

// 给文本设置样式
function styleText(node) {
  let {
    associativeLineTextColor,
    associativeLineTextFontSize,
    associativeLineTextFontFamily
  } = this.mindMap.themeConfig
  node
    .fill({
      color: associativeLineTextColor
    })
    .css({
      'font-family': associativeLineTextFontFamily,
      'font-size': associativeLineTextFontSize
    })
}

// 更新关联线文字位置
function updateTextPos(path, text) {
  let pathLength = path.length()
  let centerPoint = path.pointAt(pathLength / 2)
  let { width: textWidth, height: textHeight } = text.bbox()
  text.x(centerPoint.x - textWidth / 2)
  text.y(centerPoint.y - textHeight / 2)
}

export default {
  getText,
  createText,
  styleText,
  onScale,
  showEditTextBox,
  hideEditTextBox,
  updateTextEditBoxPos,
  renderText,
  updateTextPos
}

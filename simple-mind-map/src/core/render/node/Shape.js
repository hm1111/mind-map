import { Rect, Polygon, Path } from '@svgdotjs/svg.js'
import { CONSTANTS } from '../../../constants/constant'

//  节点形状类
export default class Shape {
  constructor(node) {
    this.node = node
  }

  //  形状需要的padding
  getShapePadding(width, height, paddingX, paddingY) {
    const shape = this.node.getShape()
    const defaultPaddingX = 15
    const defaultPaddingY = 5
    const actWidth = width + paddingX * 2
    const actHeight = height + paddingY * 2
    const actOffset = Math.abs(actWidth - actHeight)
    switch (shape) {
      case CONSTANTS.SHAPE.ROUNDED_RECTANGLE:
        return {
          paddingX: height > width ? (height - width) / 2 : 0,
          paddingY: 0
        }
      case CONSTANTS.SHAPE.DIAMOND:
        return {
          paddingX: width / 2,
          paddingY: height / 2
        }
      case CONSTANTS.SHAPE.PARALLELOGRAM:
        return {
          paddingX: paddingX <= 0 ? defaultPaddingX : 0,
          paddingY: 0
        }
      case CONSTANTS.SHAPE.OUTER_TRIANGULAR_RECTANGLE:
        return {
          paddingX: paddingX <= 0 ? defaultPaddingX : 0,
          paddingY: 0
        }
      case CONSTANTS.SHAPE.INNER_TRIANGULAR_RECTANGLE:
        return {
          paddingX: paddingX <= 0 ? defaultPaddingX : 0,
          paddingY: 0
        }
      case CONSTANTS.SHAPE.ELLIPSE:
        return {
          paddingX: paddingX <= 0 ? defaultPaddingX : 0,
          paddingY: paddingY <= 0 ? defaultPaddingY : 0
        }
      case CONSTANTS.SHAPE.CIRCLE:
        return {
          paddingX: actHeight > actWidth ? actOffset / 2 : 0,
          paddingY: actHeight < actWidth ? actOffset / 2 : 0
        }
      default:
        return {
          paddingX: 0,
          paddingY: 0
        }
    }
  }

  //  创建形状节点
  createShape() {
    const shape = this.node.getShape()
    const borderWidth = this.node.getBorderWidth()
    let { width, height } = this.node
    width -= borderWidth
    height -= borderWidth
    let node = null
    // 矩形
    if (shape === CONSTANTS.SHAPE.RECTANGLE) {
      node = new Rect().size(width, height)
    } else if (shape === CONSTANTS.SHAPE.DIAMOND) {
      // 菱形
      node = this.createDiamond()
    } else if (shape === CONSTANTS.SHAPE.PARALLELOGRAM) {
      // 平行四边形
      node = this.createParallelogram()
    } else if (shape === CONSTANTS.SHAPE.ROUNDED_RECTANGLE) {
      // 圆角矩形
      node = this.createRoundedRectangle()
    } else if (shape === CONSTANTS.SHAPE.OCTAGONAL_RECTANGLE) {
      // 八角矩形
      node = this.createOctagonalRectangle()
    } else if (shape === CONSTANTS.SHAPE.OUTER_TRIANGULAR_RECTANGLE) {
      // 外三角矩形
      node = this.createOuterTriangularRectangle()
    } else if (shape === CONSTANTS.SHAPE.INNER_TRIANGULAR_RECTANGLE) {
      // 内三角矩形
      node = this.createInnerTriangularRectangle()
    } else if (shape === CONSTANTS.SHAPE.ELLIPSE) {
      // 椭圆
      node = this.createEllipse()
    } else if (shape === CONSTANTS.SHAPE.CIRCLE) {
      // 圆
      node = this.createCircle()
    }
    return node
  }

  //  创建菱形
  createDiamond() {
    let { width, height } = this.node
    let halfWidth = width / 2
    let halfHeight = height / 2
    let topX = halfWidth
    let topY = 0
    let rightX = width
    let rightY = halfHeight
    let bottomX = halfWidth
    let bottomY = height
    let leftX = 0
    let leftY = halfHeight
    return new Polygon().plot([
      [topX, topY],
      [rightX, rightY],
      [bottomX, bottomY],
      [leftX, leftY]
    ])
  }

  //  创建平行四边形
  createParallelogram() {
    let { paddingX } = this.node.getPaddingVale()
    paddingX = paddingX || this.node.shapePadding.paddingX
    let { width, height } = this.node
    return new Polygon().plot([
      [paddingX, 0],
      [width, 0],
      [width - paddingX, height],
      [0, height]
    ])
  }

  //  创建圆角矩形
  createRoundedRectangle() {
    let { width, height } = this.node
    let halfHeight = height / 2
    return new Path().plot(`
      M${halfHeight},0
      L${width - halfHeight},0
      A${height / 2},${height / 2} 0 0,1 ${width - halfHeight},${height} 
      L${halfHeight},${height}
      A${height / 2},${height / 2} 0 0,1 ${halfHeight},${0}
    `)
  }

  //  创建八角矩形
  createOctagonalRectangle() {
    let w = 5
    let { width, height } = this.node
    return new Polygon().plot([
      [0, w],
      [w, 0],
      [width - w, 0],
      [width, w],
      [width, height - w],
      [width - w, height],
      [w, height],
      [0, height - w]
    ])
  }

  //  创建外三角矩形
  createOuterTriangularRectangle() {
    let { paddingX } = this.node.getPaddingVale()
    paddingX = paddingX || this.node.shapePadding.paddingX
    let { width, height } = this.node
    return new Polygon().plot([
      [paddingX, 0],
      [width - paddingX, 0],
      [width, height / 2],
      [width - paddingX, height],
      [paddingX, height],
      [0, height / 2]
    ])
  }

  //  创建内三角矩形
  createInnerTriangularRectangle() {
    let { paddingX } = this.node.getPaddingVale()
    paddingX = paddingX || this.node.shapePadding.paddingX
    let { width, height } = this.node
    return new Polygon().plot([
      [0, 0],
      [width, 0],
      [width - paddingX / 2, height / 2],
      [width, height],
      [0, height],
      [paddingX / 2, height / 2]
    ])
  }

  //  创建椭圆
  createEllipse() {
    let { width, height } = this.node
    let halfWidth = width / 2
    let halfHeight = height / 2
    return new Path().plot(`
      M${halfWidth},0
      A${halfWidth},${halfHeight} 0 0,1 ${halfWidth},${height} 
      M${halfWidth},${height} 
      A${halfWidth},${halfHeight} 0 0,1 ${halfWidth},${0} 
    `)
  }

  //  创建圆
  createCircle() {
    let { width, height } = this.node
    let halfWidth = width / 2
    let halfHeight = height / 2
    return new Path().plot(`
      M${halfWidth},0
      A${halfWidth},${halfHeight} 0 0,1 ${halfWidth},${height} 
      M${halfWidth},${height} 
      A${halfWidth},${halfHeight} 0 0,1 ${halfWidth},${0} 
    `)
  }
}

// 形状列表
export const shapeList = [
  CONSTANTS.SHAPE.RECTANGLE,
  CONSTANTS.SHAPE.DIAMOND,
  CONSTANTS.SHAPE.PARALLELOGRAM,
  CONSTANTS.SHAPE.ROUNDED_RECTANGLE,
  CONSTANTS.SHAPE.OCTAGONAL_RECTANGLE,
  CONSTANTS.SHAPE.OUTER_TRIANGULAR_RECTANGLE,
  CONSTANTS.SHAPE.INNER_TRIANGULAR_RECTANGLE,
  CONSTANTS.SHAPE.ELLIPSE,
  CONSTANTS.SHAPE.CIRCLE
]

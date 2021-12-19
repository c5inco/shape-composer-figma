import { shapeTemplate } from '../template'

export function generateShapeClass(
  width: number,
  height: number,
  pathCommands: any[]
): String {
  // Setup template
  let classString = shapeTemplate

  classString += `
  val baseWidth = ${width}f
  val baseHeight = ${height}f

  `

  // Append path commands
  for (let i = 0; i < pathCommands.length; i++) {
    const cmd = pathCommands[i]
    if (cmd.command === 'moveto') {
      classString += moveToCmd(cmd.x, cmd.y)
    }
    if (cmd.command === 'lineto') {
      classString += lineToCmd(cmd.x, cmd.y)
    }
    if (cmd.command === 'curveto') {
      classString += cubicToCmd(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
    }
    if (cmd.command === 'closepath') {
      classString += closeCmd()
    }
  }

  // Add transform code
  classString += generateTransformCode()

  // Add last brackets
  classString += '}\n}'

  return classString
}

function moveToCmd(x, y): string {
  return `path.moveTo(${x}f, ${y}f)\n`
}

function lineToCmd(x, y): string {
  return `path.lineTo(${x}f, ${y}f)\n`
}

function cubicToCmd(x1, y1, x2, y2, x3, y3): string {
  return `path.cubicTo(${x1}f, ${y1}f, ${x2}f, ${y2}f, ${x3}f, ${y3}f)\n`
}

function closeCmd(): string {
  return `path.close()\n`
}

function generateTransformCode(): string {
  return `
  val bounds = RectF()
  val aPath = path.asAndroidPath()
  aPath.computeBounds(bounds, true)
  val scaleMatrix = Matrix()
  scaleMatrix.setScale(
      size.width / baseWidth,
      size.height / baseHeight,
      0f,
      0f
  )
  aPath.transform(scaleMatrix)

  return Outline.Generic(
    path = aPath.asComposePath()
  )
  `
}
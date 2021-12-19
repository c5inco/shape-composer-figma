interface ShapeResponse {
  response: string,
  unsupported: any[]
}

export function generateShapeClass(
  name: string = 'Custom',
  width: number,
  height: number,
  pathCommands: any[],
): ShapeResponse {
  let pathCommandsString = ""
  let unsupported = []

  // Append path commands
  for (let i = 0; i < pathCommands.length; i++) {
    const cmd = pathCommands[i]
    if (cmd.command === 'moveto') {
      pathCommandsString += moveToCmd(cmd.x, cmd.y, cmd.relative)
    } else if (cmd.command === 'lineto') {
      pathCommandsString += lineToCmd(cmd.x, cmd.y, cmd.relative)
    } else if (cmd.command === 'curveto') {
      pathCommandsString += cubicToCmd(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y, cmd.relative)
    } else if (cmd.command === 'quadratic curveto') {
      pathCommandsString += quadraticBezierToCmd(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.relative)
    } else if (cmd.command === 'closepath') {
      pathCommandsString += closeCmd()
    } else {
      unsupported.push(cmd)
    }
  }

  const response = `
    class ${name}Shape: Shape {
      override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
      ): Outline {
        val baseWidth = ${width}f
        val baseHeight = ${height}f

        val path = Path()
        path.fillType = PathFillType.EvenOdd
        
        ${pathCommandsString}
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

        return Outline.Generic(path = aPath.asComposePath())
      }
    }`
  
  return {
    response,
    unsupported
  }
}

function moveToCmd(x, y, relative): string {
  return `${relative ? 'path.relativeMoveTo' : 'path.moveTo'}(${x}f, ${y}f)\n`
}

function lineToCmd(x, y, relative): string {
  return `${relative ? 'path.relativeLineTo' : 'path.lineTo'}(${x}f, ${y}f)\n`
}

function cubicToCmd(x1, y1, x2, y2, x3, y3, relative): string {
  return `${relative ? 'path.relativeCubicTo' : 'path.cubicTo'}(${x1}f, ${y1}f, ${x2}f, ${y2}f, ${x3}f, ${y3}f)\n`
}

function quadraticBezierToCmd(x1, y1, x2, y2, relative): string {
  return `${relative ? 'path.relativeQuadraticBezierTo' : 'path.quadraticBezierTo'}(${x1}f, ${y1}f, ${x2}f, ${y2}f)\n`
}

function closeCmd(): string {
  return `path.close()\n`
}
interface ShapeResponse {
  value: string,
  unsupported: any[]
}

declare global {
  interface Number {
    round: (places: number) => string;
  }
}

Number.prototype.round = function (places: number = 4): string {
  return Number.parseFloat(this.toFixed(places)).toPrecision()
}

export function generateShapeClass(
  name: string = 'Custom',
  width: number,
  height: number,
  windingRule: string,
  pathCommands: any[],
): ShapeResponse {
  let pathCommandsString = ""
  let unsupported = []

  // Append path commands
  for (let i = 0; i < pathCommands.length; i++) {
    const cmd = pathCommands[i]
    if (cmd.command === 'moveto') {
      pathCommandsString += moveToCmd(cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (cmd.command === 'lineto') {
      pathCommandsString += lineToCmd(cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (cmd.command === 'curveto') {
      pathCommandsString += cubicToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x2.round(), cmd.y2.round(), cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (cmd.command === 'quadratic curveto') {
      pathCommandsString += quadraticBezierToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x2.round(), cmd.y2.round(), cmd.relative)
    } else if (cmd.command === 'closepath') {
      pathCommandsString += closeCmd()
    } else {
      unsupported.push(cmd)
    }
  }

  const fillType = windingRule === 'EVENODD' ? 'path.fillType = PathFillType.EvenOdd\n' : ''

  const value = `
    val ${name}Shape: Shape = object: Shape {
      override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
      ): Outline {
        val baseWidth = ${width}f
        val baseHeight = ${height}f

        val path = Path()
        ${fillType}
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
    value,
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
export function generateShapeClass(
  name: string = 'Custom',
  width: number,
  height: number,
  pathCommands: any[]
): String {
  let pathCommandsString = ""

  // Append path commands
  for (let i = 0; i < pathCommands.length; i++) {
    const cmd = pathCommands[i]
    if (cmd.command === 'moveto') {
      pathCommandsString += moveToCmd(cmd.x, cmd.y)
    }
    if (cmd.command === 'lineto') {
      pathCommandsString += lineToCmd(cmd.x, cmd.y)
    }
    if (cmd.command === 'curveto') {
      pathCommandsString += cubicToCmd(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
    }
    if (cmd.command === 'closepath') {
      pathCommandsString += closeCmd()
    }
  }

  return `
    class ${name}Shape: Shape {
      override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
      ): Outline {
        val path = Path()
        val baseWidth = ${width}f
        val baseHeight = ${height}f

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

        return Outline.Generic(
          path = aPath.asComposePath()
        )
      }
    }
  `
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
  return `path.close()`
}
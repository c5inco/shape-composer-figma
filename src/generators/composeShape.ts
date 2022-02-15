import { BaseCommand } from 'svg-path-parser'
import * as PathUtils from '../pathUtils'

interface PathResponse {
  value: string,
  unsupported: any[]
}

interface ShapeResponse {
  value: string,
  unsupported: any[]
}

declare global {
  interface Number {
    round: () => string;
  }
}

Number.prototype.round = function (): string {
  return Number.parseFloat(this.toFixed(4)).toPrecision()
}

function transformPathCommands(
  cmds: BaseCommand[]
): PathResponse {
  let value = ""
  let unsupported = []

  // Collect path commands
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i]

    if (PathUtils.isMoveTo(cmd)) {
      value += moveToCmd(cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (PathUtils.isLineTo(cmd)) {
      value += lineToCmd(cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (PathUtils.isCurveTo(cmd)) {
      value += cubicToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x2.round(), cmd.y2.round(), cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (PathUtils.isQuadCurveTo(cmd)) {
      value += quadraticBezierToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x.round(), cmd.y.round(), cmd.relative)
    } else if (cmd.command === 'closepath') {
      value += closeCmd()
    } else {
      unsupported.push(cmd)
    }
  }

  return {
    value,
    unsupported
  }
}

export function generateShapeClass(
  name: string = 'Custom',
  width: number,
  height: number,
  windingRule: string,
  pathCommands: BaseCommand[],
): ShapeResponse {
  const pathResponse = generateComposePath(windingRule, pathCommands) 

  const value = `
    val ${name}Shape: Shape = object: Shape {
      override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
      ): Outline {
        val baseWidth = ${width.round()}f
        val baseHeight = ${height.round()}f

        ${pathResponse.value}
        return Outline.Generic(
          path
            .asAndroidPath()
            .apply {
              transform(Matrix().apply {
                setScale(size.width / baseWidth, size.height / baseHeight)
              })
            }
            .asComposePath()
        )
      }
    }`
  
  return {
    value,
    unsupported: pathResponse.unsupported
  }
}

export function generateComposePath(
  windingRule: string,
  pathCommands: BaseCommand[],
): PathResponse {
  const pathResponse = transformPathCommands(pathCommands) 
  const fillType = windingRule === 'EVENODD' ? 'path.fillType = PathFillType.EvenOdd\n' : ''

  const value = `
        val path = Path()
        ${fillType}
        ${pathResponse.value}
      }
    }`
  
  return {
    value,
    unsupported: pathResponse.unsupported
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
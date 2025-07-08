import { BaseCommand } from 'svg-path-parser'
import * as PathUtils from '../pathUtils'

export interface PathCommandResponse {
  supported: string[],
  unsupported: any[]
}

export interface PathDataResponse {
    windingRule: string,
    commands: string[]
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
): PathCommandResponse {
  let supported = []
  let unsupported = []

  // Collect path commands
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i]

    if (PathUtils.isMoveTo(cmd)) {
      supported.push(moveToCmd(cmd.x.round(), cmd.y.round(), cmd.relative))
    } else if (PathUtils.isLineTo(cmd)) {
      supported.push(lineToCmd(cmd.x.round(), cmd.y.round(), cmd.relative))
    } else if (PathUtils.isCurveTo(cmd)) {
      supported.push(cubicToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x2.round(), cmd.y2.round(), cmd.x.round(), cmd.y.round(), cmd.relative))
    } else if (PathUtils.isQuadCurveTo(cmd)) {
      supported.push(quadraticBezierToCmd(cmd.x1.round(), cmd.y1.round(), cmd.x.round(), cmd.y.round(), cmd.relative))
    } else if (cmd.command === 'closepath') {
      supported.push(closeCmd())
    } else {
      unsupported.push(cmd)
    }
  }

  return {
    supported,
    unsupported
  }
}

export function generateShapeClass(
  name: string = 'Custom',
  width: number,
  height: number,
  pathData: PathDataResponse[],
): string {
  return `\
val ${name}Shape: Shape = object: Shape {
  override fun createOutline(
    size: Size,
    layoutDirection: LayoutDirection,
    density: Density
  ): Outline {
    val baseWidth = ${width.round()}f
    val baseHeight = ${height.round()}f

    ${generateComposePath(3, pathData)}\n
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
}

export function generateComposePath(
  indents: number,
  pathData: PathDataResponse[],
): string {
  let value = `val path = Path().apply {\n`

  const tabs = indents > 0 ? `\t`.repeat(indents) : ''
  const closingTab = indents > 0 ? `\t`.repeat(indents - 1) : ''

  pathData.forEach(path => {
    console.log(path.windingRule)
    if (path.windingRule === "EVENODD") {
      value += `${tabs}fillType = PathFillType.EvenOdd`
    }

    path.commands.forEach(cmd =>
      value += `${tabs}${cmd}\n`
    )
  })

  return value + `${closingTab}}`
}

export function generatePathData(
  pathCommands: BaseCommand[],
): PathCommandResponse {
  return transformPathCommands(pathCommands)
}

function moveToCmd(x, y, relative): string {
  return `${relative ? 'relativeMoveTo' : 'moveTo'}(${x}f, ${y}f)`
}

function lineToCmd(x, y, relative): string {
  return `${relative ? 'relativeLineTo' : 'lineTo'}(${x}f, ${y}f)`
}

function cubicToCmd(x1, y1, x2, y2, x3, y3, relative): string {
  return `${relative ? 'relativeCubicTo' : 'cubicTo'}(${x1}f, ${y1}f, ${x2}f, ${y2}f, ${x3}f, ${y3}f)`
}

function quadraticBezierToCmd(x1, y1, x2, y2, relative): string {
  return `${relative ? 'relativeQuadraticBezierTo' : 'quadraticBezierTo'}(${x1}f, ${y1}f, ${x2}f, ${y2}f)`
}

function closeCmd(): string {
  return `close()`
}
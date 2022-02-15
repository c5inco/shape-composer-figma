import {
  BaseCommand,
  ClosePathCommand,
  CurveToCommand,
  LineToCommand,
  MoveToCommand,
  QuadraticCurveToCommand
} from 'svg-path-parser'

export function isMoveTo(cmd: BaseCommand): cmd is MoveToCommand {
  return (cmd as MoveToCommand).command === 'moveto'
}

export function isLineTo(cmd: BaseCommand): cmd is LineToCommand {
  return (cmd as LineToCommand).command === 'lineto'
}

export function isCurveTo(cmd: BaseCommand): cmd is CurveToCommand {
  return (cmd as CurveToCommand).command === 'curveto'
}

export function isQuadCurveTo(cmd: BaseCommand): cmd is QuadraticCurveToCommand {
  return (cmd as QuadraticCurveToCommand).command === 'quadratic curveto'
}

export function isClose(cmd: BaseCommand): cmd is ClosePathCommand {
  return (cmd as ClosePathCommand).command === 'closepath'
}
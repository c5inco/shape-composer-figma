import { parseSVG } from 'svg-path-parser'
import { generateComposePath, generatePathData, generateShapeClass } from './generators/composeShape'
import { removeNonAlphaNumeric } from './stringUtils'

// Make sure that we're in Dev Mode and running codegen
if (figma.editorType === "dev" && figma.mode === "codegen") {
  // Register a callback to the "generate" event
  figma.codegen.on("generate", ({ node }) => {
      console.log(node.type)

      switch (node.type) {
          case 'VECTOR':
              let v = node as VectorNode
              let pathData = []
              for (let i = 0; i < v.vectorPaths.length; i++) {
                  const vPath = v.vectorPaths[i]
                  const cmds = parseSVG(vPath.data)
                  const pdr = generatePathData(cmds)

                  if (pdr.unsupported.length > 0) {
                      const msg = `ERROR | Unsupported cmds found = ${pdr.unsupported.length}`
                      console.log(msg)
                      console.log(pdr.unsupported)
                      figma.notify(msg, {error: true})
                  } else {
                      pathData[i] = {
                          windingRule: vPath.windingRule,
                          commands: pdr.supported
                      }
                  }
              }

              let shapeClassCode = generateShapeClass(removeNonAlphaNumeric(v.name), v.width, v.height, pathData)
              let composePathCode = generateComposePath(1, pathData)

              console.log(shapeClassCode)
              console.log(composePathCode)

              return [
                  {
                      title: "Shape Class",
                      language: "KOTLIN",
                      code: shapeClassCode
                  },
                  {
                      title: "Compose Path",
                      language: "KOTLIN",
                      code: composePathCode
                  },
              ]
          case 'BOOLEAN_OPERATION':
          case 'ELLIPSE':
          case 'POLYGON':
          case 'RECTANGLE':
          case 'STAR':
              return [
                  {
                    title: "⚠️ Shape Composer issue",
                    language: "PLAINTEXT",
                    code: "Flatten to single Vector"
                  }
                ]
          default:
              return [
                  {
                    title: "⚠️ Shape Composer issue",
                    language: "PLAINTEXT",
                    code: "Select a Vector or Shape"
                  }
                ]
      }
  })
}

if (figma.editorType === "figma") {
    if (figma.command === 'shape' || figma.command === 'path') {
        figma.closePlugin('Shape Composer exporting is only available through DevMode now! 🙏')
    }
}

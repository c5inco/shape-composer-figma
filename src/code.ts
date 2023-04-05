import { parseSVG } from 'svg-path-parser'
import { generateComposePath, generatePathData, generateShapeClass } from './generators/composeShape'
import { removeNonAlphaNumeric } from './stringUtils'

let selection = figma.currentPage.selection

if (selection.length > 0) {
    let node = selection[0]
    console.log(node.type)

    switch (node.type) {
        case 'VECTOR':
            let v = node as VectorNode
            let pathData = []
            for (let i = 0; i < v.vectorPaths.length; i++) {
                const vPath = v.vectorPaths[i]
                const cmds = parseSVG(vPath.data)
                const pdr = generatePathData(vPath.windingRule, cmds)

                if (pdr.unsupported.length > 0) {
                    const msg = `ERROR | Unsupported cmds found = ${pdr.unsupported.length}`
                    console.log(msg)
                    console.log(pdr.unsupported)
                    figma.notify(msg, {error: true})
                    figma.closePlugin()
                } else {
                    pathData[i] = pdr.value
                }
            }

            let response
            if (figma.command === 'shape') {
                response = generateShapeClass(removeNonAlphaNumeric(v.name), v.width, v.height, pathData.join("\n"))
            }
            if (figma.command === 'path') {
                response = generateComposePath(pathData.join("\n"))
            }

            console.log(response)
            figma.showUI(__html__, {width: 0, height: 0})
            figma.ui.postMessage({
                copiedText: response,
                command: figma.command
            })
            
            break;
        case 'BOOLEAN_OPERATION':
        case 'ELLIPSE':
        case 'POLYGON':
        case 'RECTANGLE':
        case 'STAR':
            figma.closePlugin('Please flatten to single Vector 🙈')
            break;
        default:
            figma.closePlugin('Please select a Vector or Shape 🤠')
    }
} else {
    figma.closePlugin('Please make a selection 🤠')
}

figma.ui.onmessage = message => {
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    if (message.command === 'shape') {
        figma.closePlugin('Shape generated and copied to clipboard 🎉')
    } else {
        figma.closePlugin('Path generated and copied to clipboard 🎉')
    }
}

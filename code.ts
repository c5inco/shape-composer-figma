import { parseSVG } from 'svg-path-parser'
import { generateShapeClass } from './generators/composeShape'

let selection = figma.currentPage.selection

if (selection.length > 0) {
    let closePlugin = true

    let node = selection[0]
    console.log(node.type)

    if (node.type === 'VECTOR') {
        let v = node as VectorNode
        if (v.vectorPaths.length === 1) {
            const data = v.vectorPaths[0].data
            const cmds = parseSVG(data)
            console.log(cmds)

            closePlugin = false
            figma.showUI(__html__, { width: 0, height: 0 })
            figma.ui.postMessage({
                copiedText: generateShapeClass(v.name, v.width, v.height, cmds),
            })
        } else {
            figma.notify('Please select a single path')
        }
    } else if (node.type === 'BOOLEAN_OPERATION') {
        figma.notify('Please flatten to single path')
    } else {
        figma.notify('Please select a vector or shape')
    }

    if (closePlugin) figma.closePlugin()
} else {
    figma.notify('Please select a vector or shape')
}

figma.ui.onmessage = message => {
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    if (message.type === 'shapeGenerated') {
        figma.notify('Shape generated and copied to clipboard 🎉')
        figma.closePlugin()
    }
}

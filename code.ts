import { parseSVG } from 'svg-path-parser'
import { generateShapeClass } from './generators/composeShape'
import { removeNonAlphaNumeric } from './stringUtils'

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

            const response = generateShapeClass(removeNonAlphaNumeric(v.name), v.width, v.height, cmds)

            if (response.unsupported.length > 0) {
                const msg = `ERROR | Unsupported cmds found = ${response.unsupported.length}`
                console.log(msg)
                console.log(response.unsupported)
                figma.notify(msg, { error: true })
            } else {
                closePlugin = false
                figma.showUI(__html__, { width: 0, height: 0 })
                figma.ui.postMessage({
                    copiedText: response.value,
                })
            }
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

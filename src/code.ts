import { parseSVG } from 'svg-path-parser'
import { generateComposePath, generateShapeClass } from './generators/composeShape'
import { removeNonAlphaNumeric } from './stringUtils'

let selection = figma.currentPage.selection

if (selection.length > 0) {
    let node = selection[0]
    console.log(node.type)

    if (node.type === 'VECTOR') {
        let v = node as VectorNode
        if (v.vectorPaths.length === 1) {
            const vPath = v.vectorPaths[0]
            const data = vPath.data
            const cmds = parseSVG(data)
            console.log(cmds)

            let response
            if (figma.command === 'shape') {
                response = generateShapeClass(removeNonAlphaNumeric(v.name), v.width, v.height, vPath.windingRule, cmds)
            }
            if (figma.command === 'path') {
                response = generateComposePath(vPath.windingRule, cmds)
            }

            if (response.unsupported.length > 0) {
                const msg = `ERROR | Unsupported cmds found = ${response.unsupported.length}`
                console.log(msg)
                console.log(response.unsupported)
                figma.notify(msg, { error: true })
                figma.closePlugin()
            } else {
                figma.showUI(__html__, { width: 0, height: 0 })
                figma.ui.postMessage({
                    copiedText: response.value,
                    command: figma.command
                })
            }
        } else {
            figma.closePlugin('Only single path export is supported at this time 🙈')
        }
    } else if (node.type === 'BOOLEAN_OPERATION') {
        figma.closePlugin('Please flatten to single path 🙈')
    } else {
        figma.closePlugin('Please select a vector 🙈')
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

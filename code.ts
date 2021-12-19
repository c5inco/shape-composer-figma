const { parseSVG } = require('svg-path-parser')
import { generateShapeClass } from './generators/composeShape'

let selection = figma.currentPage.selection

if (selection.length > 0) {
    let node = selection[0]
    console.log(node.type)

    if (node.type === 'VECTOR') {
        let v = node as VectorNode
        if (v.vectorPaths.length === 1) {
            const data = v.vectorPaths[0].data
            const cmds = parseSVG(data)
            console.log(generateShapeClass(v.width, v.height, cmds))
        } else {
            figma.notify("Please select a single path")
        }
    } else if (node.type === "BOOLEAN_OPERATION") {
        figma.notify("Please flatten to single path")
    } else {
        figma.notify("Please select a vector or shape")
    }
}

// figma.currentPage.selection = nodes;
// figma.viewport.scrollAndZoomIntoView(nodes);

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

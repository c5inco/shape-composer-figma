const parseSvgPathData = require('parse-svg-path-data');
let selection = figma.currentPage.selection;
if (selection.length > 0) {
    let node = selection[0];
    console.log(node.type);
    let data = "";
    if (node.type === 'VECTOR') {
        let v = node;
        if (v.vectorPaths.length === 1) {
            data = v.vectorPaths[0].data;
            console.log(parseSvgPathData);
            const pathData = parseSvgPathData(data);
            console.log(pathData);
        }
        else {
            figma.notify("Please select a single path");
        }
    }
    // console.log(data)
    // figma.notify(data)
}
// figma.currentPage.selection = nodes;
// figma.viewport.scrollAndZoomIntoView(nodes);
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();

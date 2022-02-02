export const NODE_SETTINGS = {
    width: 230,
    height: 170,
};
export const PORT_SETTINGS = {
    stepHeight: 25,
    startingHeight: parseInt(NODE_SETTINGS.height / 5.0),
};
export const LAYOUT_SETTINGS = {
    defaultNodeDistance: 100,
}
export const GRID_SETTINGS = {
    gridStyle: 'LINES',
    horizontalSpacing: 100,
    verticalSpacing: 100,
    strokeColor: '#eee',
    strokeWidth: 1,
}
export const SNAPPING_SETTINGS = {
    gridSnapType: 'LINES',
    snapBendAdjacentSegments: true,
    snapBendsToSnapLines: true,
    snapNodesToSnapLines: true,
    snapOrthogonalMovement: true,
    snapSegmentsToSnapLines: true,
    snapPortAdjacentSegments: true,
}
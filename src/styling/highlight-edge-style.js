import {
    EdgeStyleBase,
    SmoothingPolicy,
    SvgVisual,
    SvgVisualGroup,
} from 'yfiles';

/**
 * An edge style to draw the selection highlight 'below' the edge.
 */
export default class HighlightEdgeStyle extends EdgeStyleBase {
    constructor(style) {
        super();
        this.style = style || {};
    }

    /**
     * @param {IRenderContext} context
     * @param {IEdge} edge
     * @returns {Visual}
     */
    createVisual(context, edge) {
        const visualGroup = new SvgVisualGroup();
        const highlight = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
        );
        const highlightPath = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        const path = this.cropPath(
            edge,
            edge.style.sourceArrow,
            edge.style.targetArrow,
            this.getPath(edge)
        ).createSmoothedPath(
            edge.style.smoothingLength || 0,
            SmoothingPolicy.ASYMMETRIC,
            true
        );

        highlightPath.setAttribute('d', path.createSvgPathData());
        highlightPath.setAttribute('stroke', this.style.stroke || '#f90');
        highlightPath.setAttribute(
            'stroke-width',
            this.style['stroke-width'] || '10px'
        );
        highlightPath.setAttribute('fill', 'none');

        highlight.appendChild(highlightPath);

        const highlightVisual = new SvgVisual(highlight);
        visualGroup.add(
            edge.style.renderer
                .getVisualCreator(edge, edge.style)
                .createVisual(context)
        );
        visualGroup.add(highlightVisual);

        return visualGroup;
    }
}

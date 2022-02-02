import {
    NodeStyleBase,
    SvgVisual,
} from 'yfiles';
import ReactDOM from 'react-dom';
import React from 'react';

function disposeCallback(context, removedVisual, dispose) {
    const gElement = removedVisual.svgElement;
    ReactDOM.unmountComponentAtNode(gElement);
    return null;
}

export class ReactComponentNodeStyle extends NodeStyleBase {
    constructor(type) {
        super();
        this.type = type;
    }

    createProps(node) {
        return {
            node,
            width: node.layout.width,
            height: node.layout.height,
            tag: node.tag,
        };
    }

    createVisual(context, node) {
        const gElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
        );
        const props = this.createProps(node);
        const element = React.createElement(this.type, props);
        ReactDOM.render(element, gElement);
        SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y);
        // create the visual and then cache the props for
        const svgVisual = new SvgVisual(gElement);
        svgVisual.cachedProps = props;

        context.setDisposeCallback(svgVisual, disposeCallback);
        return svgVisual;
    }

    updateVisual(context, oldVisual, node) {
        const gElement = oldVisual.svgElement;

        const props = this.createProps(node);

        const lastProps = oldVisual.cachedProps;
        if (
            lastProps.width !== props.width ||
            lastProps.height !== props.height ||
            lastProps.tag !== props.tag
        ) {
            const element = React.createElement(this.type, props);
            ReactDOM.render(element, gElement);
            oldVisual.cachedProps = props;
        }
        SvgVisual.setTranslate(gElement, node.layout.x, node.layout.y);
        return oldVisual;
    }
}

export default ReactComponentNodeStyle;
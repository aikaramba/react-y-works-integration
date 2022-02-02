import {
    FreeNodePortLocationModel,
    NodeCreator,
    NodeSizeConstraintProvider,
    Point,
    Rect,
    Size,
} from 'yfiles';
import {
    NODE_SETTINGS,
    PORT_SETTINGS,
} from './constants';

export const PORT_TYPE = {
    INPUT: 'INPUT',
    OUTPUT: 'OUTPUT',
};

function createPort (graph, node, type, index, tag) {
    const model = new FreeNodePortLocationModel();
    const newPortHeight = PORT_SETTINGS.startingHeight + PORT_SETTINGS.stepHeight * index;
    if (newPortHeight > NODE_SETTINGS.height) {
        setNodeSize(graph, node, NODE_SETTINGS.width, newPortHeight);
    }
    const point = new Point(
        node.layout.x + (type === PORT_TYPE.INPUT ? 0 : NODE_SETTINGS.width),
        node.layout.y + parseInt(PORT_SETTINGS.startingHeight + PORT_SETTINGS.stepHeight * index),
    );
    const locationParameter = model.createParameter(node, point);
    const newPort = graph.addPort({
        owner: node,
        // locationParameter: graph.getPortDefaults(newNode).getLocationParameterInstance(newNode),
        locationParameter,
        // style: graph.getPortDefaults(node).getStyleInstance(node),
        tag,
    });
    newPort.style.renderSize = new Size(212, 122);
}

function removePort (graph, port) {
    graph.remove(port);
}

function createPorts (graph, node, type, names) {
    /** Create new ports */
    names.forEach((name, i) => createPort(
        graph,
        node,
        type,
        i,
        { name, type }
    ));
}

function updatePorts(graph, node, inputs, outputs) {
    if(!graph || !node || !inputs || !outputs) return;
    const ports = node.ports.toArray();
    const currentInputs = ports.filter(d => d.tag.type === PORT_TYPE.INPUT);
    const currentOutputs = ports.filter(d => d.tag.type === PORT_TYPE.OUTPUT);
    /** Modify ports */
    const modifyPorts = (newArr, currentArr, type) => {
        if (newArr.length > currentArr.length) {
            /** Add new ports */
            const portsToAdd = newArr.slice(currentArr.length);
            portsToAdd.forEach((name, i) => createPort(graph, node, type, currentArr.length + i - 1, { name, type }));
        } else if (newArr.length < currentArr.length) {
            /** Remove ports */
            const portsToRemove = currentArr.slice(newArr.length);
            portsToRemove.forEach(port => removePort(graph, port));
        }
        /** Update names */
        newArr.forEach((newPortName, i) => {
            if (currentArr[i]) {
                currentArr[i].tag.name = newPortName;
            }
        });
    }
    modifyPorts(inputs, currentInputs, PORT_TYPE.INPUT);
    modifyPorts(outputs, currentOutputs, PORT_TYPE.OUTPUT);
}

function setNodeSize(graph, node, width, height) {
    /** Limit the rescaling size */
    graph.decorator.nodeDecorator.sizeConstraintProviderDecorator.setImplementation(
        node,
        new NodeSizeConstraintProvider(
            new Size(width, height), // min
            new Size(width, height), // max
            Rect.EMPTY
        ),
    );
    node.layout.width = width;
    node.layout.height = height;
}

class CustomNodeCreator extends NodeCreator {
    createNodeCore(graph, groupNode, parent, layout, style, tag) {
        const { inputs, outputs } = tag;

        /** Call super method for creating nodes */
        const newNode = super.createNodeCore(graph, groupNode, parent, layout, style, tag);
        createPorts(graph, newNode, PORT_TYPE.INPUT, inputs);
        createPorts(graph, newNode, PORT_TYPE.OUTPUT, outputs);
        setNodeSize(graph, newNode, NODE_SETTINGS.width, NODE_SETTINGS.height);
        return newNode;
        // original
        // return super.createNodeCore(graph, groupNode, parent, layout, style, tag);
    }

    onNodeUpdated(graph, node, dataItem) {
        super.updateTag(graph, node, dataItem);
        updatePorts(graph, node, dataItem.inputs, dataItem.outputs);
        return super.onNodeUpdated(graph, node, dataItem);
    }
}

export default CustomNodeCreator;
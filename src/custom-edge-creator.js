import { EdgeCreator } from 'yfiles';

import { getPortId } from './helpers';

class CustomEdgeCreator extends EdgeCreator {
    createEdgeCore(graph, source, target, style, tag) {
        const {
            from,
            to,
        } = tag;
        const sourcePortId = getPortId(from);
        const sourcePort = source.ports.firstOrDefault(p => p.tag?.name === sourcePortId) || source;
        const targetPortId = getPortId(to);
        const targetPort = target.ports.firstOrDefault(p => p.tag?.name === targetPortId) || target;

        return graph.createEdge(sourcePort, targetPort, style, tag);
        // original
        // return super.createEdgeCore(graph, source, target, style, tag);
    }
}

export default CustomEdgeCreator;
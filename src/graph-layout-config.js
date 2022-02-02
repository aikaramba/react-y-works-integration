import {
    HierarchicLayout,
    BusRouter,
    PortConstraint,
    PortSide,
    HierarchicLayoutData,
    HierarchicLayoutRoutingStyle,
    HierarchicLayoutEdgeRoutingStyle,
    BusRouterData,
} from 'yfiles';
import { NODE_SETTINGS } from './constants';

export const portConstraintsEW = {
    sourcePortConstraints: (edge) => {
        return PortConstraint.create(PortSide.EAST, false);
    },
    targetPortConstraints: (edge) => {
        return PortConstraint.create(PortSide.WEST, false);
    },
};

export const LAYOUT_NAMES = {
    HierarchicLayout: 'HierarchicLayout',
    BusRouter: 'BusRouter'
};

export const CONFIGS = {
    [LAYOUT_NAMES.HierarchicLayout]: {
        /** Layout */
        layout: HierarchicLayout,
        layoutConfig: {
            automaticEdgeGrouping: true,
            compactGroups: false,
            considerNodeLabels: true,
            edgeToEdgeDistance: NODE_SETTINGS.width,
            fromScratchLayeringStrategy: 1,
            layoutOrientation: 1,
            minimumLayerDistance: NODE_SETTINGS.width,
            nodeToEdgeDistance: NODE_SETTINGS.width,
            nodeToNodeDistance: NODE_SETTINGS.width,
            orthogonalRouting: false,
            separateLayers: true,
        },
        /** Data */
        layoutData: HierarchicLayoutData,
        layoutDataConfig: portConstraintsEW,
        /** Edge */
        edgeLayoutConfig: {
            minimumFirstSegmentLength: NODE_SETTINGS.width, //15,
            minimumLastSegmentLength: NODE_SETTINGS.width, //15,
            minimumDistance: NODE_SETTINGS.width / 2, //SINGLE_NODE_WIDTH/2,
            minimumLength: NODE_SETTINGS.width, //15,
        },
        routingStyle: HierarchicLayoutRoutingStyle,
        routingStyleConfig: {
            defaultEdgeRoutingStyle:
            HierarchicLayoutEdgeRoutingStyle.POLYLINE,
        },
    },
    [LAYOUT_NAMES.BusRouter]: {
        /** Layout */
        layout: BusRouter,
        layoutConfig: {
            nodeToNodeDistance: NODE_SETTINGS.width / 2,
            nodeToEdgeDistance: NODE_SETTINGS.width / 2,
            edgeToEdgeDistance: NODE_SETTINGS.width / 2,
            minimumLayerDistance: NODE_SETTINGS.width / 2,
            considerEdgeLabels: true,
            considerNodeLabels: true,
        },
        /** Data */
        layoutData: BusRouterData,
        // layoutData: FixPortLocationStageData,
        layoutDataConfig: portConstraintsEW,
        /** Edge */
        edgeLayoutConfig: {
            minimumDistance: NODE_SETTINGS.width / 2,
        },
    },
};

export const getLayoutConfig = (name) => {
    return name ? CONFIGS[name] : CONFIGS[LAYOUT_NAMES.HierarchicLayout];
}
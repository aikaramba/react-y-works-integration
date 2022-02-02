import React from 'react';
import {
    FoldingManager,
    GraphComponent,
    GraphEditorInputMode,
    GraphItemTypes,
    GraphOverviewComponent,
    License,
    Size,
    GridInfo,
    GridVisualCreator,
    Stroke,
    GridStyle,
    LabelSnapContext,
    GraphSnapContext,
    GridConstraintProvider,
    GraphBuilder,
    LabelLayerPolicy,
    PortLayerPolicy,
    HierarchicNestingPolicy,
    StyleDecorationZoomPolicy,
    EdgeStyleDecorationInstaller,
    MinimumNodeSizeStage,
    PolylineEdgeStyle,
    BridgeManager,
    GraphObstacleProvider,
} from 'yfiles';
import ReactComponentNodeStyle from './styling/react-component-node-style';
import NodeTemplate from './styling/node-template';

import {
    SNAPPING_SETTINGS,
    NODE_SETTINGS,
    GRID_SETTINGS,
} from './constants';

import CustomNodeCreator from './custom-node-creator';
import CustomEdgeCreator from './custom-edge-creator';

import { convertModulesDataToArray, expandLayoutConfig, getNodeId } from './helpers';
import HighlightEdgeStyle from './styling/highlight-edge-style';
import { LAYOUT_NAMES, getLayoutConfig } from './graph-layout-config';

export default (props) => {
    const {
        license,
        graphRef,
        overviewId,
        onRemoveEdge,
        onRemoveNode,
        onSelectNode,
    } = props;

    /** License */
    License.value = license;

    /** Refs and state */
    // Main GraphComponent
    const graphComponent = React.useRef(null);
    const overviewComponent = React.useRef(null);

    // GraphBuilder vars
    const graphBuilder = React.useRef(null);
    const nodesSource = React.useRef(null);
    const edgesSource = React.useRef(null);
    const layoutAlgo = React.useRef(null);
    const layoutStage = React.useRef(null);
    const layoutData = React.useRef(null);
    // State
    const isDataLoading = React.useRef(false);

    const getGraphComponent = () => {
        return graphComponent.current;
    };
    const getGraphBuilder = () => {
        return graphBuilder.current;
    }
    const getLayoutAlgo = () => {
        return layoutAlgo.current;
    }
    const getLayoutStage = () => {
        return layoutStage.current;
    }
    const getLayoutData = () => {
        return layoutData.current;
    }

    React.useEffect(() => {
        /** Create graph component and attach it to ref */
        graphComponent.current = new GraphComponent();
        graphRef.current.appendChild(graphComponent.current.div);

        /** Initialize graph interactions */
        initializeDecoration();
        initializeRenderingOrder();
        initializeInputMode();
        initializeDefaultStyles();
        initializeOverview();
        initializeEvents();
        initializeGrid();
        initializeBridges();
    }, []);

    /** Wrapper functions */
    const initializeGraphBuilder = (data) => {
        isDataLoading.current = true;
        if (!getGraphBuilder()) {
            graphBuilder.current = new GraphBuilder(getGraphComponent().graph);

            /** Convert data */
            const nodesData = data.modules;
            const edgesData = data.channels;

            /** Set mapping rules for nodes */
            nodesSource.current = getGraphBuilder().createNodesSource({
                data: nodesData,
                id: item => item.id,
                tag: item => ({ ...item })
            });

            /** Add events to the graph builder */
            getGraphBuilder().addNodeCreatedListener((snd, e) => {
                runLayout();
            });
            getGraphBuilder().addNodeRemovedListener((snd, e) => {
                runLayout();
            });
            getGraphBuilder().addEdgeCreatedListener((snd, e) => {
                runLayout();
            });
            getGraphBuilder().addEdgeRemovedListener((snd, e) => {
                runLayout();
            });

            /** Custom node creator that includes ports info */
            nodesSource.current.nodeCreator = new CustomNodeCreator({
                defaults: nodesSource.current.nodeCreator.defaults,
            });

            getGraphBuilder().setData(nodesSource.current, nodesData);

            /** Edges */
            edgesSource.current = getGraphBuilder().createEdgesSource({
                data: edgesData,
                id: item => item.id,
                tag: item => ({ ...item }),
                sourceId: ({ from }) => getNodeId(from),
                targetId: ({ to }) => getNodeId(to),
            });

            /** Custom edge creator that includes ports info */
            edgesSource.current.edgeCreator = new CustomEdgeCreator({
                defaults: edgesSource.current.edgeCreator.defaults,
            });

            /** Set new edge data */
            getGraphBuilder().setData(edgesSource.current, edgesData);

            /** Update graph data */
            getGraphBuilder().updateGraph();

            /** Arrange nodes */
            runLayout();
        }
        isDataLoading.current = false;
    };
    const updateGraphBuilder = (data) => {
        isDataLoading.current = true;
        const graphBuilder = getGraphBuilder();
        if (graphBuilder) {
            /** Convert new data */
            const nodesData = data.modules;
            const edgesData = data.channels;
            /** Set new data */
            graphBuilder.setData(nodesSource.current, nodesData);
            graphBuilder.setData(edgesSource.current, edgesData);
            /** Update graph data */
            graphBuilder.updateGraph();
        }
        isDataLoading.current = false;
    }

    /** Graph behaviour */
     const runLayout = async (layoutName) => {
        const layoutInfo = getLayoutConfig(layoutName);
        layoutAlgo.current = expandLayoutConfig(layoutInfo.layout, layoutInfo.layoutConfig);
        layoutData.current = expandLayoutConfig(layoutInfo.layoutData, layoutInfo.layoutDataConfig);
        const eld = getLayoutAlgo().edgeLayoutDescriptor;
        if (eld && layoutInfo.routingStyle) {
            eld.routingStyle = expandLayoutConfig(layoutInfo.routingStyle, layoutInfo.routingStyleConfig);
            if (layoutInfo.edgeLayoutConfig) {
                expandLayoutConfig(eld, layoutInfo.edgeLayoutConfig);
            }
        }
        layoutStage.current = new MinimumNodeSizeStage(getLayoutAlgo());

        await getGraphComponent().morphLayout({
            layout: getLayoutStage(),
            layoutData: getLayoutData(),
            morphDuration: '.7s',
            easedAnimation: true,
        });
        getGraphComponent().fitGraphBounds();
    }

    const initializeFolding = () => {
        const manager = new FoldingManager(getGraphComponent().graph);
        getGraphComponent().graph = manager.createFoldingView().graph;
    }

    const initializeInputMode = () => {
        /** General input behaviour */
        getGraphComponent().inputMode = new GraphEditorInputMode({
            allowGroupingOperations: true,
            allowCreateNode: false,
            allowCreateBend: false,
            allowCreateEdge: false,
            allowEditLabelOnDoubleClick: false,
            allowAdjustGroupNodeSize: false,
            clickHitTestOrder: [
                GraphItemTypes.EDGE_LABEL,
                GraphItemTypes.NODE_LABEL,
                GraphItemTypes.BEND,
                GraphItemTypes.EDGE,
                GraphItemTypes.NODE,
                GraphItemTypes.PORT,
                GraphItemTypes.ALL,
            ],
        });
        /** Move events */
        const inputMode = getGraphComponent().inputMode;
        inputMode.moveInputMode.addDragFinishedListener(() => runLayout(LAYOUT_NAMES.BusRouter));
    };

    const initializeDefaultStyles = () => {
        const { nodeDefaults, edgeDefaults, decorator } = getGraphComponent().graph;

        /** Default node */
        nodeDefaults.size = new Size(NODE_SETTINGS.width, NODE_SETTINGS.height);
        nodeDefaults.style = new ReactComponentNodeStyle(NodeTemplate);

        /** Default edge */
        edgeDefaults.style = new PolylineEdgeStyle({
            stroke: '3.03px #aaa', // these colors are overridden
            // in the .css, keyed off of width.
            smoothingLength: NODE_SETTINGS.width / 2,
        });
    };

    const initializeOverview = () => {
        overviewComponent.current = new GraphOverviewComponent(overviewId);
        overviewComponent.current.graphComponent = getGraphComponent();
    };

    const initializeEvents = () => {
        /** General events */
        getGraphComponent().selection.addItemSelectionChangedListener((snd, e) => {
            if (!isDataLoading.current) {
                const { item, itemSelected } = e;
                onSelectNode(itemSelected, item?.tag);
            }
        });
        getGraphComponent().graph.addNodeRemovedListener((snd, e) => {
            if (!isDataLoading.current) {
                const { item } = e;
                onRemoveNode(item?.tag);
            }
        });
        getGraphComponent().graph.addEdgeRemovedListener((snd, e) => {
            if (!isDataLoading.current) {
                const { item } = e;
                onRemoveEdge(item?.tag);
            }
        });
    }

    const initializeGrid = () => {
        // Create grid
        const gridInfo = new GridInfo();
        gridInfo.horizontalSpacing = GRID_SETTINGS.horizontalSpacing;
        gridInfo.verticalSpacing = GRID_SETTINGS.verticalSpacing;
        const grid = new GridVisualCreator(gridInfo);
        grid.stroke = new Stroke(GRID_SETTINGS.strokeColor, GRID_SETTINGS.strokeWidth);
        grid.gridStyle = GridStyle[GRID_SETTINGS.gridStyle];
        getGraphComponent().backgroundGroup.addChild(grid);

        // Init snapping
        const inputMode = getGraphComponent().inputMode;
        inputMode.labelSnapContext = new LabelSnapContext();
        inputMode.snapContext = new GraphSnapContext({
            enabled: true,
            ...SNAPPING_SETTINGS,
            nodeGridConstraintProvider: new GridConstraintProvider(gridInfo),
            bendGridConstraintProvider: new GridConstraintProvider(gridInfo),
        });
    }

    const initializeRenderingOrder = () => {
        const graphModelManager = getGraphComponent().graphModelManager;
        graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER;
        graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER;
        graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES_AND_EDGES;
        graphModelManager.edgeGroup.below(graphModelManager.nodeGroup);
    }

    const initializeDecoration = () => {
        /** Decorate edges */
        const graph = getGraphComponent().graph;
        const edgeDecorationInstaller = new EdgeStyleDecorationInstaller({
            edgeStyle: new HighlightEdgeStyle({
                stroke: '#f90',
                // '.008' widths will be automatically anim'8'ed
                // Just an example here, we could use animation
                // for edges during node execution/data flow.
                'stroke-width': '3.008px',
            }),
            zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES,
        });
        graph.decorator.edgeDecorator.selectionDecorator.setImplementation(
            (edge) => {
                return true;
            },
            edgeDecorationInstaller
        );
    }

    const initializeBridges = () => {
        const bridgeManager = new BridgeManager({ canvasComponent: getGraphComponent() });
        bridgeManager.defaultBridgeHeight = 10;
        bridgeManager.defaultBridgeWidth = 20;

        const provider = new GraphObstacleProvider();
        bridgeManager.addObstacleProvider(provider);
    }

    return {
        getGraphComponent,
        runLayout,
        initializeGraphBuilder,
        updateGraphBuilder,
    }
};
import React from 'react';
import PropTypes from 'prop-types';

import useYWorks from './use-yworks';

import defaultLicense from './yFilesLicense.json';

import './new-graph.less';

/** CONSTANTS */
const OVERVIEW_ID = 'overview-component';

const NewGraph = (props) => {
    /** Props & defaults */
    const {
        license = defaultLicense,
        pipelines = null,
        onRemoveChannel,
        onRemoveModule,
        onSelectModule,
    } = props;

    /** Parse input graph data */
    const graphData = pipelines;

    /** Mounting */
    const graphRef = React.useRef(null);

    const {
        initializeGraphBuilder,
        updateGraphBuilder,
    } = useYWorks({
        license,
        graphRef,
        overviewId: OVERVIEW_ID,
        onRemoveNode: (nodeData) => onRemoveModule(nodeData.id),
        onRemoveEdge: (edgeData) => onRemoveChannel(edgeData.id),
        onSelectNode: (isSelected, nodeData) => isSelected ? onSelectModule(nodeData?.id) : onSelectModule(null),
    });

    /** Load data on mount */
    React.useEffect(() => {
        initializeGraphBuilder(graphData);
    }, []);

    /** Update data on new prop */
    React.useEffect(() => {
        updateGraphBuilder(graphData);
    }, [graphData]);

    return (
        <div className="y-new-graph">
            {/* Overview */}
            <div
                className="y-overview-component"
                id={OVERVIEW_ID}
            />
            {/* Graph */}
            <div
                className="y-graph-container"
                ref={graphRef}
            />
        </div>
    )
};

NewGraph.propTypes = {
    onRemoveChannel: PropTypes.object.isRequired,
    onRemoveModule: PropTypes.object.isRequired,
    onSelectModule: PropTypes.object.isRequired,
    pipelines: PropTypes.object.isRequired,
    license: PropTypes.object,
}

export default NewGraph;
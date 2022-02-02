import React from 'react';

import NewGraph from './new-graph';

import data from './mock-data.json'

export default function NewConvertedGraph() {
    const [pipelines, setPipelines] = React.useState(data);
    const onRemoveModule = (id) => setPipelines(oldPipelines => ({
        ...oldPipelines,
        modules: oldPipelines.modules.filter(d => d.id !== id),
    }));
    const onRemoveChannel = (id) => setPipelines(oldPipelines => ({
        ...oldPipelines,
        channels: oldPipelines.channels.filter(d => d.id !== id),
    }));
    const onSelectModule = () => {};
    return (
        <NewGraph
            pipelines={pipelines}
            onRemoveModule={onRemoveModule}
            onRemoveChannel={onRemoveChannel}
            onSelectModule={onSelectModule}
        />
    )
}

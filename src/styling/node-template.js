import React from 'react';

import { PORT_TYPE } from '../custom-node-creator';

const Port = (props) => {
    const { location, tag } = props;
    const { name, type } = tag || {};
    const { x, y } = location || {};
    return (
        <g transform={`translate(${x},${y})`} className="y-node-port" onClick={() => alert('hello')}>
            <circle r="10" className="y-node-port-icon" />
            <text
                className="y-node-port-label"
                x={type === PORT_TYPE.INPUT ? 15 : -15}
                style={{
                    textAnchor: type === PORT_TYPE.INPUT ? 'start' : 'end',
                    dominantBaseline: 'middle',
                }}
            >
                {name || ''}
            </text>
        </g>
    )
};

export default function NodeTemplate({
     tag = {},
     node,
     width,
     height,
}) {
    const { ports, layout } = node;
    const { name, type } = tag;
    const portsData = ports.toArray().map(({ location, tag }) => ({
        location: {
            x: location.x - layout?.x,
            y: location.y - layout?.y,
        },
        tag,
    }));

    return (
        <g className="y-node-container">
            {/** Node */}
            <rect
                className="y-node"
                x={0}
                y={0}
                rx={10}
                ry={10}
                width={width}
                height={height}
            />
            <text
                className="y-node-text"
                x={width / 2}
                y={20}
                style={{
                    fill: '#ffffff',
                    textAnchor: 'middle',
                    dominantBaseline: 'middle',
                }}
            >
                {name || 'No Name'}
            </text>
            {portsData.map((props, i) => <Port key={i} {...props}/>)}
        </g>
    );
}

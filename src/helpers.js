/** Convert input data to usable format */
export const expandLayoutConfig = (source, config = {}) => {
    const src = typeof source === 'function' ? new source() : source;
    Object
        .entries(config)
        .forEach(([key, value]) => {
            src[key] = value;
        });
    return src;
}

export function getPortId(fullId) {
    return fullId.split('/')[2];
}

export function getNodeId(fullId) {
    return fullId.split('/')[0];
}
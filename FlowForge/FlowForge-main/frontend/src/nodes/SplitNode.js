// src/nodes/SplitNode.js
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const SplitNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      delimiter: data?.delimiter || ',',
      outputs: data?.outputs || 2,
      label: data?.label || 'Split'
    },
    data // Pass data object for updates
  );

  // Generate dynamic handles based on outputs count
  const outputHandles = Array.from({ length: nodeState.outputs }, (_, i) => ({
    id: `output-${i}`,
    style: { top: `${30 + i * (120 / nodeState.outputs)}px` }
  }));

  return (
    <BaseNode
      id={id}
      data={data}
      title={nodeState.label}
      accentColor="#06b6d4"
      className="split-node"
      inputHandles={[{ id: 'input', style: { top: '50%' } }]}
      outputHandles={outputHandles}
    >
      <label>
        Delimiter:
        <input
          type="text"
          value={nodeState.delimiter}
          onChange={(e) => updateNodeState('delimiter', e.target.value)}
          placeholder="Delimiter (e.g., ',')"
        />
      </label>
      <label>
        Number of Outputs:
        <input
          type="range"
          min="1"
          max="8"
          value={nodeState.outputs}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            updateNodeState('outputs', newValue);
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '4px'
        }}>
          <span>1</span>
          <span>{nodeState.outputs}</span>
          <span>8</span>
        </div>
      </label>
      <div style={{ 
        fontSize: '11px', 
        color: '#9ca3af', 
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Splits input by "{nodeState.delimiter}" into {nodeState.outputs} parts
      </div>
    </BaseNode>
  );
};
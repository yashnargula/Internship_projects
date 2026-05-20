// src/nodes/JoinNode.js
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const JoinNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      separator: data?.separator || ', ',
      inputs: data?.inputs || 2,
      label: data?.label || 'Join'
    },
    data // Pass data object for updates
  );

  // Generate dynamic handles based on inputs count
  const inputHandles = Array.from({ length: nodeState.inputs }, (_, i) => ({
    id: `input-${i}`,
    style: { top: `${30 + i * (120 / nodeState.inputs)}px` }
  }));

  return (
    <BaseNode
      id={id}
      data={data}
      title={nodeState.label}
      accentColor="#ec4899"
      className="join-node"
      inputHandles={inputHandles}
      outputHandles={[{ id: 'joined-output', style: { top: '50%' } }]}
    >
      <label>
        Separator:
        <input
          type="text"
          value={nodeState.separator}
          onChange={(e) => updateNodeState('separator', e.target.value)}
          placeholder="Separator (e.g., ', ')"
        />
      </label>
      <label>
        Number of Inputs:
        <input
          type="range"
          min="2"
          max="8"
          value={nodeState.inputs}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            updateNodeState('inputs', newValue);
          }}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '4px'
        }}>
          <span>2</span>
          <span>{nodeState.inputs}</span>
          <span>8</span>
        </div>
      </label>
      <div style={{ 
        fontSize: '11px', 
        color: '#9ca3af', 
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Joins {nodeState.inputs} inputs with "{nodeState.separator}"
      </div>
    </BaseNode>
  );
};
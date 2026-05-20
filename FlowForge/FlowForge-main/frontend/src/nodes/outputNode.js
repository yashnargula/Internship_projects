// src/nodes/outputNode.js
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const OutputNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      outputName: data?.outputName || `output_${id.slice(-4)}`,
      outputType: data?.outputType || 'Text',
      result: data?.result || null, // NEW: Result field
    },
    data
  );

  return (
    <BaseNode
      id={id}
      data={data}
      title="Output"
      accentColor="#16a34a"
      className="output-node"
      inputHandles={[{ id: 'value', style: { top: '50%' } }]}
    >
      <label>
        Name:
        <input
          type="text"
          value={nodeState.outputName}
          onChange={(e) => {
            updateNodeState('outputName', e.target.value);
            if (data) data.label = e.target.value;
          }}
          placeholder="Output name"
        />
      </label>
      <label>
        Type:
        <select 
          value={nodeState.outputType} 
          onChange={(e) => updateNodeState('outputType', e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="Image">Image</option>
          <option value="Number">Number</option>
          <option value="Boolean">Boolean</option>
        </select>
      </label>
      
      {/* NEW: Result Display Section */}
      {nodeState.result !== null && nodeState.result !== undefined && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            Result:
          </div>
          <div style={{
            fontSize: '11px',
            color: '#1f2937',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '100px',
            overflowY: 'auto'
          }}>
            {typeof nodeState.result === 'object' 
              ? JSON.stringify(nodeState.result, null, 2)
              : String(nodeState.result)
            }
          </div>
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
      
      {/* Show placeholder when no result */}
      {(!nodeState.result && nodeState.result !== false) && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(156, 163, 175, 0.1)',
          border: '1px dashed #d1d5db',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '11px',
          fontStyle: 'italic'
        }}>
          No result yet. Run pipeline to see output.
        </div>
      )}
    </BaseNode>
  );
};
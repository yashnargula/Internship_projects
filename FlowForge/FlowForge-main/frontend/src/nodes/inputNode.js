// src/nodes/inputNode.js
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const InputNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      inputName: data?.inputName || `input_${id.slice(-4)}`,
      inputType: data?.inputType || 'Text',
      value: data?.value || '', // Add value field
    },
    data
  );

  return (
    <BaseNode
      id={id}
      data={data}
      title="Input"
      accentColor="#3b82f6"
      className="input-node"
      inputHandles={[]}
      outputHandles={[{ id: 'value' }]}
    >
      <label>
        Name:
        <input
          type="text"
          value={nodeState.inputName}
          onChange={(e) => {
            updateNodeState('inputName', e.target.value);
            if (data) data.label = e.target.value;
          }}
          placeholder="Input name"
        />
      </label>
      <label>
        Type:
        <select 
          value={nodeState.inputType} 
          onChange={(e) => updateNodeState('inputType', e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
          <option value="Number">Number</option>
        </select>
      </label>
      <label>
        Test Value:
        <input
          type={nodeState.inputType === 'Number' ? 'number' : 'text'}
          value={nodeState.value}
          onChange={(e) => {
            updateNodeState('value', e.target.value);
          }}
          placeholder="Enter test value"
        />
      </label>
      <div style={{ 
        fontSize: '11px', 
        color: '#6b7280', 
        marginTop: '4px',
        fontStyle: 'italic'
      }}>
        This value will be used for testing
      </div>
    </BaseNode>
  );
};
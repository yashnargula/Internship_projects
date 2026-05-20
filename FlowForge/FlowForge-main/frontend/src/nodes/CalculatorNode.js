import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const CalculatorNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      operation: data?.operation || 'add',
      label: data?.label || 'Calculator'
    },
    data // ← THIS IS CRITICAL
  );

  return (
    <BaseNode
      id={id}
      data={data}
      title={nodeState.label}
      accentColor="#10b981"
      className="calculator-node" // ← MUST MATCH CSS
      inputHandles={[
        { id: 'a' },
        { id: 'b' }
      ]}
      outputHandles={[{ id: 'result' }]}
    >
      {/* ... rest of component ... */}
    </BaseNode>
  );
};
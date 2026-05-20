// src/nodes/ConditionNode.js
import React from 'react';
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const ConditionNode = ({ id, data }) => {
  // ✅ FIXED: Proper destructuring
  const [nodeState, updateNodeState] = useNodeState(
    {
      operator: data?.operator || '==',
      inputA: data?.inputA || null,
      inputB: data?.inputB || null,
      result: data?.result || null,
    },
    data
  );

  // ✅ FIXED: Use nodeState from the hook return value
  const { operator, inputA, inputB, result } = nodeState;

  return (
    <BaseNode
      id={id}
      data={data}
      title="Condition"
      accentColor="#8b5cf6"
      className="condition-node"
      inputHandles={[
        { id: 'input-a', style: { top: '35%' } },
        { id: 'input-b', style: { top: '65%' } }
      ]}
      outputHandles={[
        { id: 'true', style: { top: '35%' } },
        { id: 'false', style: { top: '65%' } }
      ]}
    >
      <label>
        Operator:
        <select 
          value={operator}
          onChange={(e) => updateNodeState('operator', e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            marginTop: '4px'
          }}
        >
          <option value="==">Equals (==)</option>
          <option value="!=">Not Equals (!=)</option>
          <option value=">">Greater Than (&gt;)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value=">=">Greater or Equal (&gt;=)</option>
          <option value="<=">Less or Equal (&lt;=)</option>
        </select>
      </label>
      
      {/* Display current input values */}
      <div style={{ 
        marginTop: '12px',
        padding: '8px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '11px'
      }}>
        <div style={{ color: '#4f46e5', fontWeight: '600', marginBottom: '4px' }}>
          Current Inputs:
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Input A:</div>
            <div style={{ fontWeight: '500' }}>{inputA !== null ? inputA : '∅'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Input B:</div>
            <div style={{ fontWeight: '500' }}>{inputB !== null ? inputB : '∅'}</div>
          </div>
        </div>
        {result !== null && (
          <div style={{ 
            marginTop: '8px',
            color: result ? '#16a34a' : '#ef4444',
            fontWeight: '600',
            borderTop: '1px dashed #e2e8f0',
            paddingTop: '8px',
            textAlign: 'center'
          }}>
            Result: {inputA} {operator} {inputB} = {result.toString().toUpperCase()}
          </div>
        )}
      </div>
      
      <div style={{ 
        fontSize: '11px', 
        color: '#6b7280', 
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Connects to Output via TRUE/FALSE ports
      </div>
    </BaseNode>
  );
};
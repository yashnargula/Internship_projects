// src/nodes/llmNode.js
import { BaseNode } from './baseNode';

export const LLMNode = ({ id, data }) => {
  const model = data?.model || 'gpt-4';
  const temperature = data?.temperature || 0.7;

  return (
    <BaseNode
      id={id}
      data={data}
      title="LLM"
      accentColor="#f59e0b"
      className="llm-node"
      inputHandles={[
        { id: 'system', style: { top: '35%' } },
        { id: 'prompt', style: { top: '65%' } }
      ]}
      outputHandles={[{ id: 'response', style: { top: '50%' } }]}
    >
      <label>
        Model:
        <select 
          value={model}
          onChange={(e) => data.model = e.target.value}
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3">Claude 3</option>
        </select>
      </label>
      <label>
        Temperature:
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => data.temperature = parseFloat(e.target.value)}
        />
        <span style={{ marginLeft: '8px', color: '#94a3b8' }}>{temperature}</span>
      </label>
    </BaseNode>
  );
};
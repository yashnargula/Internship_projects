// src/nodes/FileProcessorNode.js
import { useNodeState } from './baseNode';
import { BaseNode } from './baseNode';

export const FileProcessorNode = ({ id, data }) => {
  const [nodeState, updateNodeState] = useNodeState(
    {
      operation: data?.operation || 'read',
      format: data?.format || 'json',
      label: data?.label || 'File Processor'
    },
    data // Pass data object for updates
  );

  return (
    <BaseNode
      id={id}
      data={data}
      title={nodeState.label}
      accentColor="#f97316"
      className="file-processor-node"
      inputHandles={[{ id: 'file-input' }]}
      outputHandles={[{ id: 'processed-output' }]}
    >
      <label>
        Operation:
        <select 
          value={nodeState.operation}
          onChange={(e) => updateNodeState('operation', e.target.value)}
        >
          <option value="read">Read File</option>
          <option value="write">Write File</option>
          <option value="convert">Convert Format</option>
          <option value="extract">Extract Data</option>
          <option value="compress">Compress</option>
          <option value="encrypt">Encrypt</option>
        </select>
      </label>
      <label>
        Format:
        <select 
          value={nodeState.format}
          onChange={(e) => updateNodeState('format', e.target.value)}
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="txt">Text</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="xml">XML</option>
        </select>
      </label>
    </BaseNode>
  );
};
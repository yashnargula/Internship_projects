// src/nodes/BaseNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import './node.css';

export const BaseNode = ({ 
  id, 
  data,
  title = "Node",
  accentColor = "#3b82f6",
  inputHandles = [],
  outputHandles = [],
  className = "",
  children
}) => {
  // Calculate positions for multiple handles (n8n style)
  const getHandlePosition = (index, total, isInput = true) => {
    if (total <= 1) return { top: '50%' };
    
    // Space handles evenly from 30% to 70% of node height
    const start = 30;
    const end = 70;
    const spacing = (end - start) / Math.max(total - 1, 1);
    const top = start + (index * spacing);
    
    return { 
      top: `${top}%`,
      [isInput ? 'left' : 'right']: '-6px'
    };
  };

  // Check if node type should have default handles
  const shouldHaveDefaultHandles = !['Input', 'Output', 'Delete Node'].includes(title);

  return (
    <div className={`vs-node ${className}`}>
      <div className="vs-node-header">{title}</div>
      <div className="vs-node-body">
        {children}
      </div>
      
      {/* Input Handles on LEFT */}
      {inputHandles.map((handle, index) => (
        <Handle
          key={`in-${id}-${handle.id || index}`}
          type="target"
          position={Position.Left}
          id={handle.id || `input-${index}`}
          style={handle.style || getHandlePosition(index, inputHandles.length, true)}
        />
      ))}
      
      {/* Output Handles on RIGHT */}
      {outputHandles.map((handle, index) => (
        <Handle
          key={`out-${id}-${handle.id || index}`}
          type="source"
          position={Position.Right}
          id={handle.id || `output-${index}`}
          style={handle.style || getHandlePosition(index, outputHandles.length, false)}
        />
      ))}
      
      {/* Default handles ONLY for processing nodes (not Input/Output/Delete) */}
      {shouldHaveDefaultHandles && inputHandles.length === 0 && (
        <Handle
          type="target"
          position={Position.Left}
          id="default-input"
          style={{ top: '50%', left: '-6px' }}
        />
      )}
      
      {shouldHaveDefaultHandles && outputHandles.length === 0 && (
        <Handle
          type="source"
          position={Position.Right}
          id="default-output"
          style={{ top: '50%', right: '-6px' }}
        />
      )}
    </div>
  );
};

export const useNodeState = (initialData, dataObject) => {
  const [state, setState] = React.useState(initialData);
  
  const updateState = (key, value) => {
    const newState = { ...state, [key]: value };
    setState(newState);
    
    if (dataObject && key in newState) {
      dataObject[key] = value;
    }
  };
  
  return [state, updateState];
};
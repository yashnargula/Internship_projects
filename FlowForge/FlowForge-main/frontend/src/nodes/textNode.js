// src/nodes/textNode.js
import { useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import './node.css';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
    data.text = e.target.value;
  };

  const variables = useMemo(() => {
    const re = /\{\{\s*([a-zA-Z_$][\w$]*)\s*\}\}/g;
    const found = new Set();
    let m;
    while ((m = re.exec(currText)) !== null) {
      found.add(m[1]);
    }
    return Array.from(found);
  }, [currText]);

  return (
    <div className="vs-node">
      <div className="vs-node-header">Text</div>
      <div className="vs-node-body">
        <label>
          Text:
          <textarea
            value={currText}
            onChange={handleTextChange}
            placeholder="Type here..."
            rows="3"
            style={{ resize: 'vertical' }}
          />
        </label>
      </div>

      {/* Dynamic input handles for variables - Better spacing */}
      {variables.map((v, i) => (
        <Handle
          key={`var-${v}`}
          type="target"
          position={Position.Left}
          id={`var-${v}`}
          style={{ 
            top: `${35 + i * (60 / Math.max(variables.length, 1))}%`,
            left: '-4px'
          }}
        />
      ))}

      {/* Output handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id={`${id}-output`} 
        style={{ top: '50%' }}
      />
    </div>
  );
};
// frontend/src/draggableNode.js
import React from "react";

// FIXED: Added proper parameter destructuring
export const DraggableNode = ({ type, label, nodeProps = {} }) => {
  const onDragStart = (event) => {
    const appData = { 
      nodeType: type,
      className: nodeProps.className || "",
      data: { 
        label: label,
        // Type-specific defaults
        ...(type === 'fileProcessorNode' && {
          operation: 'read',
          format: 'json'
        }),
        ...(type === 'joinNode' && {
          separator: ', ',
          inputs: 2
        }),
        ...(type === 'splitNode' && {
          delimiter: ',',
          outputs: 2
        }),
        // Override with any custom props
        ...nodeProps.data
      }
    };

    event.dataTransfer.setData("application/reactflow", JSON.stringify(appData));
    event.dataTransfer.effectAllowed = "move";
    
    // Visual feedback
    event.currentTarget.style.opacity = "0.4";
  };

  const onDragEnd = (event) => {
    event.currentTarget.style.opacity = "1";
    event.currentTarget.style.transform = "none";
  };

  const onDrag = (event) => {
    event.currentTarget.style.transform = "scale(0.95)";
  };

  const getNodeColor = (nodeType) => {
    switch(nodeType) {
      case 'inputNode': return '#3b82f6';
      case 'llmNode': return '#f59e0b';
      case 'textNode': return '#0ea5e9';
      case 'outputNode': return '#16a34a';
      case 'deleteNode': return '#ef4444';
      case 'conditionNode': return '#8b5cf6';
      case 'calculatorNode': return '#10b981';
      case 'fileProcessorNode': return '#f97316';
      case 'joinNode': return '#ec4899';
      case 'splitNode': return '#06b6d4';
      default: return '#1C2536';
    }
  };

  return (
    <div
      className={`draggable-node ${type}`}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={onDrag}
      style={{
        cursor: "grab",
        width: "100px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        backgroundColor: getNodeColor(type),
        color: "#fff",
        fontWeight: "500",
        fontSize: "14px",
        border: `1px solid ${getNodeColor(type)}20`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease",
        userSelect: "none",
      }}
      draggable
    >
      {label}
    </div>
  );
};
// frontend/src/FlowCanvas.jsx
import React, { useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { InputNode } from "./nodes/inputNode";
import { LLMNode } from "./nodes/llmNode";
import { TextNode } from "./nodes/textNode";
import { OutputNode } from "./nodes/outputNode";
import { DeleteNode } from "./nodes/deleteNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { CalculatorNode } from "./nodes/CalculatorNode";
import { FileProcessorNode } from "./nodes/FileProcessorNode";
import { JoinNode } from "./nodes/JoinNode";
import { SplitNode } from "./nodes/SplitNode";
import { submitPipeline } from "./submit";

// Define nodeTypes locally instead of importing from registryNode
const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  textNode: TextNode,
  outputNode: OutputNode,
  deleteNode: DeleteNode,
  conditionNode: ConditionNode,
  calculatorNode: CalculatorNode,
  fileProcessorNode: FileProcessorNode,
  joinNode: JoinNode,
  splitNode: SplitNode,
};

// ✅ FIXED: Remove 'export default' from function definition
function FlowCanvas({  
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
}) {
  const reactFlowWrapper = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [testValues, setTestValues] = useState({}); // ✅ FIXED: Add useState hook

  const handleSubmit = () => {
    submitPipeline(nodes, edges, setNodes);
  };

  const updateTestValue = (nodeId, value) => {
    setTestValues(prev => ({
      ...prev,
      [nodeId]: value
    }));
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData("application/reactflow"));

    if (!data.nodeType) {
      console.error("No nodeType in drop data");
      return;
    }

    // Calculate position relative to the flow canvas
    const position = {
      x: event.clientX - reactFlowBounds.left - 40,
      y: event.clientY - reactFlowBounds.top - 20,
    };

    // Generate unique ID
    const nodeId = `${data.nodeType}-${Date.now()}`;
    
    // Create base node data
    let nodeData = data.data || { label: data.nodeType };
    
    // Ensure each node type has proper initial data
    switch(data.nodeType) {
      case 'inputNode':
        nodeData = {
          inputName: `input_${Date.now().toString().slice(-4)}`,
          inputType: 'Text',
          label: 'Input',
          value: '',
          ...nodeData
        };
        break;
      case 'llmNode':
        nodeData = {
          label: 'LLM',
          ...nodeData
        };
        break;
      case 'textNode':
        nodeData = {
          text: '{{input}}',
          label: 'Text',
          ...nodeData
        };
        break;
      case 'outputNode':
        nodeData = {
          outputName: `output_${Date.now().toString().slice(-4)}`,
          outputType: 'Text',
          label: 'Output',
          result: null,
          ...nodeData
        };
        break;
      case 'deleteNode':
        nodeData = {
          candidates: [],
          onDelete: () => console.log("Delete initialized"),
          canDeleteTool: false,
          label: 'Delete Node',
          ...nodeData
        };
        break;
      case 'conditionNode':
        nodeData = {
          operator: '==',
          value: '',
          label: 'Condition',
          ...nodeData
        };
        break;
      case 'calculatorNode':
        nodeData = {
          operation: 'add',
          label: 'Calculator',
          ...nodeData
        };
        break;
      case 'fileProcessorNode':
        nodeData = {
          operation: 'read',
          format: 'json',
          label: 'File Processor',
          ...nodeData
        };
        break;
      case 'joinNode':
        nodeData = {
          separator: ', ',
          inputs: 2,
          label: 'Join',
          ...nodeData
        };
        break;
      case 'splitNode':
        nodeData = {
          delimiter: ',',
          outputs: 2,
          label: 'Split',
          ...nodeData
        };
        break;
    }

    const newNode = {
      id: nodeId,
      type: data.nodeType,
      position,
      data: nodeData,
      className: data.className || "",
      draggable: true,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div 
      ref={reactFlowWrapper}
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        border: isDraggingOver ? "2px dashed #4f46e5" : "none",
        borderRadius: isDraggingOver ? "8px" : "0",
        transition: "all 0.2s ease"
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Test Values Panel */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        background: "#fff",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "200px",
        maxWidth: "300px",
        maxHeight: "400px",
        overflowY: "auto"
      }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#374151" }}>
          Input Test Values
        </h4>
        {nodes.filter(n => n.type === 'inputNode').map(inputNode => (
          <div key={inputNode.id} style={{ marginBottom: "12px" }}>
            <label style={{ 
              fontSize: "12px", 
              display: "block", 
              marginBottom: "4px",
              fontWeight: "500",
              color: "#4f46e5"
            }}>
              {inputNode.data?.inputName || inputNode.id} ({inputNode.data?.inputType || 'Text'}):
            </label>
            <input
              type={inputNode.data?.inputType === 'Number' ? 'number' : 'text'}
              value={testValues[inputNode.id] || inputNode.data?.value || ''}
              onChange={(e) => updateTestValue(inputNode.id, e.target.value)}
              placeholder={`Enter value for ${inputNode.data?.inputName}`}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                boxSizing: "border-box"
              }}
            />
          </div>
        ))}
        {nodes.filter(n => n.type === 'inputNode').length === 0 && (
          <div style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            fontStyle: "italic",
            padding: "8px",
            textAlign: "center"
          }}>
            Add Input Nodes to set test values
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          padding: "8px 16px",
          backgroundColor: "#4f46e5",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
      >
        Submit Pipeline
      </button>
    </div>
  );
}

// ✅ FIXED: Add export default at the end
export default FlowCanvas;
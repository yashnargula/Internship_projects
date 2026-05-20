// src/toolbar.js
import { DraggableNode } from "./draggableNode";

export const PipelineToolbar = () => {
  return (
    <div style={{ padding: "10px" }}>
      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {/* Original Nodes */}
        <DraggableNode 
          type="inputNode" 
          label="Input"
          nodeProps={{
            data: { 
              label: "Input",
              inputName: "input_1",
              inputType: "Text"
            }
          }}
        />
        
        <DraggableNode 
          type="llmNode" 
          label="LLM"
          nodeProps={{
            data: { 
              label: "LLM"
            }
          }}
        />
        
        <DraggableNode 
          type="textNode" 
          label="Text"
          nodeProps={{
            data: { 
              label: "Text",
              text: "{{input}}"
            }
          }}
        />
        
        <DraggableNode 
          type="outputNode" 
          label="Output"
          nodeProps={{
            data: { 
              label: "Output",
              outputName: "output_1",
              outputType: "Text"
            }
          }}
        />
        
        <DraggableNode
          type="deleteNode"
          label="Delete"
          nodeProps={{
            className: "delete-node",
            data: { 
              label: "Delete Node",
              candidates: [], 
              onDelete: () => console.log("Delete function will be set when dropped"),
              canDeleteTool: false 
            },
          }}
        />
        
        {/* New Demo Nodes */}
        <DraggableNode
          type="conditionNode"
          label="Condition"
          nodeProps={{
            data: {
              label: "Condition",
              operator: "==",
              value: ""
            }
          }}
        />
        
        <DraggableNode
          type="calculatorNode"
          label="Calculator"
          nodeProps={{
            data: {
              label: "Calculator",
              operation: "add"
            }
          }}
        />
        
        <DraggableNode
          type="fileProcessorNode"
          label="File Processor"
          nodeProps={{
            data: {
              label: "File Processor",
              operation: "read",
              format: "json"
            }
          }}
        />
        
        <DraggableNode
          type="joinNode"
          label="Join"
          nodeProps={{
            data: {
              label: "Join",
              separator: ", ",
              inputs: 2
            }
          }}
        />
        
        <DraggableNode
          type="splitNode"
          label="Split"
          nodeProps={{
            data: {
              label: "Split",
              delimiter: ",",
              outputs: 2
            }
          }}
        />
      </div>
    </div>
  );
};
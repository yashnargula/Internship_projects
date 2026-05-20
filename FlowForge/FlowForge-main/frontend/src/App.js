// src/App.js
import React, { useCallback, useEffect, useMemo } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import { PipelineToolbar } from "./toolbar";
import FlowCanvas from "./FlowCanvas";

const INITIAL_NODES = [
  { id: "1", type: "inputNode", position: { x: 50, y: 50 }, data: { label: "Input" } },
  { id: "2", type: "llmNode", position: { x: 300, y: 50 }, data: { label: "LLM" } },
  { id: "3", type: "textNode", position: { x: 50, y: 200 }, data: { label: "Text" } },
  { id: "4", type: "outputNode", position: { x: 300, y: 200 }, data: { label: "Output" } },
  {
    id: "5",
    type: "deleteNode",
    position: { x: 550, y: 125 },
    data: { candidates: [], onDelete: () => {}, canDeleteTool: false },
  },
];

const INITIAL_EDGES = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e3-2", source: "3", target: "2" },
  { id: "e2-4", source: "2", target: "4" },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const handleDeleteNode = useCallback(
    (targetId) => {
      if (!targetId) return;

      setNodes((prevNodes) => {
        const otherNodesCount = prevNodes.filter((n) => n.type !== "deleteNode").length;
        const canDeleteTool = otherNodesCount === 0;

        // Prevent deleting the last delete node when other nodes exist
        const deleteNodes = prevNodes.filter((n) => n.type === "deleteNode");
        if (deleteNodes.length <= 1 && targetId === deleteNodes[0]?.id && !canDeleteTool) {
          window.alert(
            "Cannot delete the last Delete Node while other nodes exist. Remove other nodes first."
          );
          return prevNodes;
        }

        return prevNodes.filter((n) => n.id !== targetId);
      });

      setEdges((prevEdges) => prevEdges.filter((e) => e.source !== targetId && e.target !== targetId));
    },
    [setNodes, setEdges]
  );

  const handleConnect = useCallback(
    (params) => {
      const newEdge = {
        id: params.id || `e${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        ...params,
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  // Update delete nodes with current candidates
  useEffect(() => {
    setNodes((prevNodes) => {
      const deleteNodes = prevNodes.filter((n) => n.type === "deleteNode");
      if (deleteNodes.length === 0) return prevNodes;

      const otherNodesCount = prevNodes.filter((n) => n.type !== "deleteNode").length;
      const canDeleteTool = otherNodesCount === 0;

      // Create candidates list from all nodes
      const deleteCandidates = prevNodes.map((n) => ({
        id: n.id,
        label: n.data?.label || n.id,
        type: n.type,
      }));

      return prevNodes.map((node) => {
        if (node.type === "deleteNode") {
          return {
            ...node,
            data: {
              ...node.data,
              candidates: deleteCandidates,
              onDelete: handleDeleteNode,
              canDeleteTool: node.id === "5" ? canDeleteTool : true,
            },
          };
        }
        return node;
      });
    });
  }, [nodes.length, handleDeleteNode, setNodes]);

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "#f8fafc"
    }}>
      <div style={{ flex: "0 0 auto" }}>
        <PipelineToolbar />
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlowProvider>
         <FlowCanvas
  nodes={nodes}
  edges={edges}
  setNodes={setNodes}  // Make sure this is passed
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={handleConnect}
/>
</ReactFlowProvider>
      </div>
    </div>
  );
}
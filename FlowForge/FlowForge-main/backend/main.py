from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    type: str
    data: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelineRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    num_nodes: Optional[int] = None
    num_edges: Optional[int] = None
    is_dag: Optional[bool] = None
    condition_results: Optional[List[Dict]] = None
    execution_summary: Optional[str] = None

def check_is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """Check if the graph is a Directed Acyclic Graph"""
    if not nodes:
        return True
    
    # Build adjacency list and indegree map
    adj = {node.id: [] for node in nodes}
    indeg = {node.id: 0 for node in nodes}
    
    for edge in edges:
        if edge.source in adj and edge.target in adj:
            adj[edge.source].append(edge.target)
            indeg[edge.target] += 1
    
    # Kahn's algorithm for topological sort
    queue = [node_id for node_id, degree in indeg.items() if degree == 0]
    visited = 0
    
    while queue:
        u = queue.pop(0)
        visited += 1
        
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)
    
    return visited == len(nodes)

@app.post("/pipelines/parse")
async def parse_pipeline(request: PipelineRequest):
    # Calculate counts
    num_nodes = len(request.nodes)
    num_edges = len(request.edges)
    
    # Check if DAG
    is_dag = check_is_dag(request.nodes, request.edges)
    
    # Analyze condition nodes if provided
    condition_analysis = None
    if request.condition_results:
        condition_analysis = {
            "total_conditions": len(request.condition_results),
            "results": request.condition_results,
            "summary": request.execution_summary
        }
    
    response = {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": is_dag,
        "graph_valid": is_dag,
        "pipeline_analysis": {
            "node_types": {node.type for node in request.nodes},
            "has_conditions": any(node.type == "conditionNode" for node in request.nodes),
            "input_count": sum(1 for node in request.nodes if node.type == "inputNode"),
            "output_count": sum(1 for node in request.nodes if node.type == "outputNode"),
        }
    }
    
    if condition_analysis:
        response["condition_analysis"] = condition_analysis
    
    return response
// frontend/src/submit.js

// ============================================
// CORE HELPER FUNCTIONS (DEFINED FIRST)
// ============================================

// Topological sort / cycle detection
function checkIsDAG(nodes = [], edges = []) {
  const adj = new Map();
  const indeg = new Map();

  nodes.forEach((n) => {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (!adj.has(e.source) || !adj.has(e.target)) return;
    adj.get(e.source).push(e.target);
    indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
  });

  const q = [];
  for (const [id, d] of indeg.entries()) if (d === 0) q.push(id);

  let visited = 0;
  while (q.length) {
    const u = q.shift();
    visited++;
    for (const v of adj.get(u) || []) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }

  return visited === nodes.length;
}

// Build a cleaned payload: remove helper nodes, filter edges, compute counts and DAG flag
function buildCleanGraphPayload(nodes = [], edges = [], options = {}) {
  const excludeTypes = options.excludeTypes || ["deleteNode"];

  // 1) keep only nodes backend should see
  const keptNodes = nodes.filter((n) => !excludeTypes.includes(n.type));

  // 2) build a set of kept node ids
  const keptIds = new Set(keptNodes.map((n) => n.id));

  // 3) filter edges so both ends exist in keptIds
  const keptEdges = edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));

  // 4) compute DAG boolean using topological sort
  const isDAG = checkIsDAG(keptNodes, keptEdges);

  return {
    nodes: keptNodes,
    edges: keptEdges,
    counts: { nodes: keptNodes.length, edges: keptEdges.length },
    dag: isDAG,
  };
}

// Evaluate a single condition
function evaluateCondition(operator, leftValue, rightValue) {
  console.log(`Evaluating: ${leftValue} ${operator} ${rightValue}`);
  
  // Convert values - try numbers first, then strings
  const left = isNaN(Number(leftValue)) ? String(leftValue) : Number(leftValue);
  const right = isNaN(Number(rightValue)) ? String(rightValue) : Number(rightValue);
  
  switch(operator) {
    case '==': return left == right;
    case '!=': return left != right;
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    default: return false;
  }
}

// Find all input nodes and assign test values
function assignTestValues(nodes, testValues = {}) {
  const inputValues = {};
  
  nodes.forEach(node => {
    if (node.type === 'inputNode') {
      // Priority 1: Use value from UI testValues
      if (testValues[node.id] !== undefined && testValues[node.id] !== '') {
        inputValues[node.id] = testValues[node.id];
      }
      // Priority 2: Use value from node.data.value
      else if (node.data?.value !== undefined && node.data.value !== '') {
        inputValues[node.id] = node.data.value;
      }
      // Priority 3: Use default based on type
      else {
        const type = node.data?.inputType || 'Text';
        const name = node.data?.inputName || `input_${node.id}`;
        
        if (type === 'Number') {
          inputValues[node.id] = 0; // Default to 0 instead of random
        } else if (type === 'File') {
          inputValues[node.id] = `file_${node.id}.txt`;
        } else {
          inputValues[node.id] = name;
        }
      }
    }
  });
  
  return inputValues;
}

// Process node connections
function processNodeConnections(nodes, edges) {
  // Build adjacency map
  const adjacency = {};
  nodes.forEach(n => adjacency[n.id] = { inputs: [], outputs: [] });
  
  edges.forEach(e => {
    if (adjacency[e.source]) {
      adjacency[e.source].outputs.push(e.target);
    }
    if (adjacency[e.target]) {
      adjacency[e.target].inputs.push(e.source);
    }
  });
  
  return adjacency;
}

// Enhanced value propagation function
function propagateValues(nodes, edges, inputValues) {
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = { ...n, value: null });
  
  // Set initial input values
  Object.entries(inputValues).forEach(([nodeId, value]) => {
    if (nodeMap[nodeId]) {
      // Convert to number if input type is Number
      const nodeType = nodeMap[nodeId]?.data?.inputType;
      if (nodeType === 'Number' && !isNaN(Number(value))) {
        nodeMap[nodeId].value = Number(value);
      } else {
        nodeMap[nodeId].value = value;
      }
    }
  });
  
  // Process nodes in topological order
  const visited = new Set();
  const processNode = (nodeId) => {
    if (visited.has(nodeId)) return nodeMap[nodeId]?.value;
    visited.add(nodeId);
    
    const node = nodeMap[nodeId];
    if (!node) return null;
    
    // Find input edges
    const inputEdges = edges.filter(e => e.target === nodeId);
    
    // Gather input values from connected nodes
    const inputValues = {};
    inputEdges.forEach(edge => {
      const sourceValue = processNode(edge.source);
      // Store value based on handle ID for condition nodes
      inputValues[edge.targetHandle] = sourceValue;
    });
    
    // Process based on node type
    switch(node.type) {
      case 'textNode':
        if (inputValues['var-input']) {
          node.value = inputValues['var-input'];
        }
        break;
        
      case 'conditionNode':
        const inputA = inputValues['input-a'];
        const inputB = inputValues['input-b'];
        
        if (inputA !== undefined && inputB !== undefined) {
          const result = evaluateCondition(node.data?.operator || '==', inputA, inputB);
          node.value = result;
          node.data.result = result;
          node.data.inputA = inputA;
          node.data.inputB = inputB;
        }
        break;
        
      case 'llmNode':
        // Basic LLM simulation
        if (inputValues['prompt']) {
          node.value = `Processed: ${inputValues['prompt']}`;
        }
        break;
        
      default:
        // For other nodes, pass through first input value
        const firstInput = Object.values(inputValues)[0];
        if (firstInput !== undefined) {
          node.value = firstInput;
        }
    }
    
    return node.value;
  };
  
  // Process all nodes
  nodes.forEach(n => processNode(n.id));
  
  return nodeMap;
}

// Simulate pipeline execution with condition evaluation
function simulatePipelineExecution(nodes, edges, inputValues) {
  const nodeMap = propagateValues(nodes, edges, inputValues);
  const executionResults = [];
  
  // Find condition nodes and collect results
  nodes.filter(n => n.type === 'conditionNode').forEach(conditionNode => {
    const nodeData = nodeMap[conditionNode.id];
    const inputA = nodeData?.data?.inputA;
    const inputB = nodeData?.data?.inputB;
    const result = nodeData?.value;
    
    if (inputA !== undefined && inputB !== undefined) {
      executionResults.push({
        conditionNodeId: conditionNode.id,
        operator: conditionNode.data?.operator || '==',
        inputA,
        inputB,
        result,
        resultString: `${inputA} ${conditionNode.data?.operator || '=='} ${inputB} = ${result}`,
        wouldRouteTo: edges
          .filter(e => e.source === conditionNode.id && e.sourceHandle === (result ? 'true' : 'false'))
          .map(e => e.target)
      });
    } else {
      executionResults.push({
        conditionNodeId: conditionNode.id,
        error: 'Missing input values',
        message: `Condition ${conditionNode.id}: Not enough inputs connected`
      });
    }
  });
  
  // Also collect output node results
  const outputResults = nodes
    .filter(n => n.type === 'outputNode')
    .map(outputNode => {
      const value = nodeMap[outputNode.id]?.value;
      return {
        outputNodeId: outputNode.id,
        name: outputNode.data?.outputName || outputNode.id,
        value,
        type: outputNode.data?.outputType || 'Text'
      };
    });
  
  return { executionResults, outputResults, nodeMap };
}

// Generate a readable summary
function generateExecutionSummary(executionResults) {
  if (executionResults.length === 0) {
    return "No condition nodes found in pipeline.";
  }
  
  let summary = "Condition Execution Results:\n";
  executionResults.forEach((result, index) => {
    summary += `\n${index + 1}. ${result.message}`;
    if (result.wouldRouteTo && result.wouldRouteTo.length > 0) {
      summary += ` → Would route to node(s): ${result.wouldRouteTo.join(', ')}`;
    }
    if (result.error) {
      summary += ` [ERROR: ${result.error}]`;
    }
  });
  
  return summary;
}

// ============================================
// MAIN SUBMIT FUNCTION (ENHANCED)
// ============================================

export async function submitPipeline(nodes, edges, setNodes, testValues = {}) {
  try {
    // ✅ FIXED: Now buildCleanGraphPayload is defined above
    const payload = buildCleanGraphPayload(nodes, edges, { excludeTypes: ["deleteNode"] });

    // Debug log so you can inspect what is being sent
    console.log("Submitting pipeline payload:", {
      nodeCount: payload.counts.nodes,
      edgeCount: payload.counts.edges,
      dag: payload.dag,
      nodes: payload.nodes,
      edges: payload.edges,
    });

    // ✅ FIXED: Now assignTestValues is defined above
    const inputValues = assignTestValues(payload.nodes, testValues);
    
    // ✅ FIXED: Now simulatePipelineExecution is defined above
    const { executionResults, outputResults } = simulatePipelineExecution(payload.nodes, payload.edges, inputValues);
    const executionSummary = generateExecutionSummary(executionResults);
    
    console.log("Condition Simulation:", executionResults);
    console.log(executionSummary);

    // Update output nodes with results (optional - for UI feedback)
    if (setNodes && outputResults.length > 0) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const outputResult = outputResults.find(r => r.outputNodeId === node.id);
          if (outputResult && node.type === 'outputNode') {
            return {
              ...node,
              data: {
                ...node.data,
                result: outputResult.value
              }
            };
          }
          return node;
        })
      );
    }

    const res = await fetch("http://127.0.0.1:8000/pipelines/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: payload.nodes,
        edges: payload.edges,
        // include counts and dag if backend expects them
        num_nodes: payload.counts.nodes,
        num_edges: payload.counts.edges,
        is_dag: payload.dag,
        // Include condition simulation results
        condition_results: executionResults,
        output_values: outputResults,
        execution_summary: executionSummary,
      }),
    });

    const data = await res.json();

    // Use backend response if available, otherwise show our computed values
    const numNodes = data?.num_nodes ?? payload.counts.nodes;
    const numEdges = data?.num_edges ?? payload.counts.edges;
    const isDag = data?.is_dag ?? payload.dag;

    // Enhanced alert with condition results
    let alertMessage = `Graph Analysis:\n`;
    alertMessage += `Nodes: ${numNodes}, Edges: ${numEdges}, DAG: ${isDag ? 'Yes ✓' : 'No ✗'}\n\n`;
    
    if (executionResults.length > 0) {
      alertMessage += `Condition Simulation (${executionResults.length} nodes):\n`;
      executionResults.forEach((result, index) => {
        if (result.error) {
          alertMessage += `${index + 1}. ${result.conditionNodeId}: ${result.error}\n`;
        } else {
          alertMessage += `${index + 1}. ${result.conditionNodeId}: ${result.inputA} ${result.operator} ${result.inputB} = ${result.result ? 'TRUE' : 'FALSE'}\n`;
        }
      });
    } else {
      alertMessage += `No condition nodes to simulate.\n`;
    }
    
    if (outputResults.length > 0) {
      alertMessage += `\nOutput Values:\n`;
      outputResults.forEach((output, index) => {
        alertMessage += `${index + 1}. ${output.name}: ${output.value !== undefined ? output.value : 'No value'}\n`;
      });
    }
    
    alertMessage += `\nInput Values Used:\n`;
    Object.entries(inputValues).forEach(([nodeId, value]) => {
      const node = payload.nodes.find(n => n.id === nodeId);
      const name = node?.data?.inputName || nodeId;
      alertMessage += `• ${name}: ${value}\n`;
    });

    alert(alertMessage);
  } catch (err) {
    console.error("submitPipeline error:", err);
    alert(`Error: ${err?.message || err}`);
  }
}

export const SubmitButton = ({ nodes, edges, setNodes, testValues }) => (
  <button onClick={() => submitPipeline(nodes, edges, setNodes, testValues)}>Submit Pipeline</button>
);
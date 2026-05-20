// src/nodes/deleteNode.js
import React, { useState, useCallback, useEffect } from "react";
import "./node.css";
import { BaseNode } from './baseNode';


export const DeleteNode = ({ data }) => {
  const candidates = data?.candidates || [];

  // initialize selected from candidates and keep it in sync when candidates change
  const [selected, setSelected] = useState(candidates.length ? candidates[0].id : null);
  useEffect(() => {
    if (!candidates.length) {
      setSelected(null);
      return;
    }
    if (!candidates.find((c) => c.id === selected)) {
      setSelected(candidates[0].id);
    }
  }, [candidates]); // depend only on candidates to avoid unnecessary loops

  const handleDelete = useCallback(() => {
    console.log("[DeleteNode] delete clicked", { selected, onDelete: data?.onDelete });

    if (!selected) {
      console.warn("[DeleteNode] no node selected to delete");
      return;
    }
    if (typeof data?.onDelete !== "function") {
      console.error("[DeleteNode] onDelete is not a function");
      return;
    }

    // Directly call onDelete without confirmation
    data.onDelete(selected);

    // clear selection after deletion (UI will be refreshed by App.js useEffect)
    setSelected(null);
  }, [selected, data]);

  return (
    <div className="vs-node delete-node">
      <div className="vs-node-header">Delete Node</div>

      <div style={{ margin: "8px 0" }}>
        <label style={{ display: "block", marginBottom: 6, color: "#fff" }}>Select target</label>
        <select
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
          style={{ width: "140px", padding: "6px", borderRadius: 4 }}
        >
          {candidates.length === 0 && <option value="">No candidates</option>}
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleDelete} style={{ marginTop: 8 }}>
        Delete Selected
      </button>
    </div>
  );
};
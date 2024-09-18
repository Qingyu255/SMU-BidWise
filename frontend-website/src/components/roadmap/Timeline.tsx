"use client"

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useViewport,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Position,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type NodeTypes,
  type DefaultEdgeOptions,
  type NodeProps
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import SemNode from './SemNode';

import '@/components/roadmap/roadmap.css'; 
import createClient from '@/utils/supabase/client';


// Colors:
// edge: #2b78e4
// node: #fdff00
// sub-node: #ffe59a
 
const initialNodes: Node[] = [
    {
      id: 'n1',
      type: 'SemNode',
      sourcePosition: Position.Left,
      data: { label: 'Y1S1' },
      position: { x: 0, y: 0 },
      style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's1n1',
      targetPosition: Position.Right,
      data: { label: 'IS111' },
      position: { x: -250, y: -90 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's2n1',
      targetPosition: Position.Right,
      data: { label: 'IS114' },
      position: { x: -250, y: -45 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's3n1',
      targetPosition: Position.Right,
      data: { label: 'BGS' },
      position: { x: -250, y: 0 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's4n1',
      targetPosition: Position.Right,
      data: { label: 'MC' },
      position: { x: -250, y: 45 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's5n1',
      targetPosition: Position.Right,
      data: { label: 'STATS' },
      position: { x: -250, y: 90 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },

    {
      id: 'n2',
      type: 'SemNode',
      targetPosition: Position.Left,
      sourcePosition: Position.Left,
      data: { label: 'Y1S2' },
      position: { x: 250, y: 200 },
      style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's1n2',
      targetPosition: Position.Right,
      data: { label: 'IS112' },
      position: { x: 250, y: -90 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's2n2',
      targetPosition: Position.Right,
      data: { label: 'IS113' },
      position: { x: 250, y: -45 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's3n2',
      targetPosition: Position.Right,
      data: { label: 'WR' },
      position: { x: 250, y: 0 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's4n2',
      targetPosition: Position.Right,
      data: { label: 'E&S' },
      position: { x: 250, y: 45 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 's5n2',
      targetPosition: Position.Bottom,
      data: { label: 'BQ' },
      position: { x: 250, y: 90 },
      style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },
    {
      id: 'n3',
      type: 'SemNode',
      sourcePosition: Position.Left,
      data: { label: 'Y2S1' },
      position: { x: -200, y: 200 },
      style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
    },


  ];
  
  const initialEdges: Edge[] = [
    {
      id: 'n1-s1n1',
      source: 'n1',
      type: 'default',
      target: 's1n1',
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n1-s2n1',
      source: 'n1',
      type: 'default',
      target: 's2n1',
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n1-s3n1',
      source: 'n1',
      type: 'default',
      target: 's3n1',
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n1-s4n1',
      source: 'n1',
      type: 'default',
      target: 's4n1',
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n1-s5n1',
      source: 'n1',
      type: 'default',
      target: 's5n1',
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n1-n2',
      source: 'n1',
      type: 'default',
      target: 'n2',
      sourceHandle: 'r-src',
      targetHandle: 'l-target',
      animated: false,
      style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
    },
    {
      id: 'n2-s5n2',
      source: 'n2',
      type: 'default',
      target: 's5n2',
      sourceHandle: 't-src',
      
      animated: true,
      style: { stroke: '#2b78e4', strokeWidth: 2 },
    },
    {
      id: 'n2-n3',
      source: 'n2',
      type: 'default',
      target: 'n3',
      sourceHandle: 'l-src',
      targetHandle: 'r-target',
      animated: false,
      style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
    },

   
  ];
 
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 
const nodeTypes: NodeTypes = {
  SemNode: SemNode,
};
 
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data);
};
 
export default function Timeline() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const supabase = createClient();
  
  
  // Function to fetch data from Supabase
  const fetchRoadmap = async () => {
    const { data: seniors, error } = await supabase.from('seniors').select('*');
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    console.log('seniors', seniors)
  }


  useEffect(() => {
    fetchRoadmap()
  });
  

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => {
        // If the node is the clicked one, reveal its hidden children
        if (node.id === 'y1s1') {
          if (n.id === 'y1s1-courses' || n.id === 'is111' || n.id === 'is114') {
            return { ...n, hidden: !n.hidden }; // Show the children of node 1
          }
        }
        return n;
      })
    );
    setEdges((eds) =>
      eds.map((e) => {
        // If the edge is connected to the clicked node, reveal the hidden edges
        if ((e.source === 'y1s1' && (e.target === 'y1s1-courses') 
            || (e.source === 'y1s1-courses' && e.target === 'is111')
            || (e.source === 'y1s1-courses' && e.target === 'is114')
        )) {
          return { ...e, hidden: !e.hidden }; // Show the edges
        }
        return e;
      })
    );
  }, []);
 
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }} >
        <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDrag={onNodeDrag}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            
        >
        <Controls/>
        <Background variant={BackgroundVariant.Dots}  gap={12} size={1}/>
        </ReactFlow>
    </div>
   
  );
}

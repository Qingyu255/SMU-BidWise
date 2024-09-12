"use client"

import { useState, useCallback } from 'react';
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
import NumberNode from './NumberNode';
import TextNode from './TextNode';
import '@xyflow/react/dist/style.css';
import MultipleConnectionNode from './MultipleConnectionNode';

import '@/app/globals.css'; 
 
const initialNodes = [
    {
      id: 'senior_name',
      sourcePosition: Position.Bottom,
      data: { label: 'Kylene' },
      position: { x: 0, y: 80 },
    },
    {
        id: 'y1s1',
        sourcePosition: Position.Bottom,
        data: { label: 'Y1S1' },
        position: { x: 200, y: 200 },
    },
    {
        id: 'y1s2',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y1S2' },
        position: { x: 200, y: 280 },
    },
    {
        id: 'y2s1',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y2S1' },
        position: { x: -200, y: 380 },
    },
    {
        id: 'y2s2',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y2S2' },
        position: { x: -200, y: 460 },
    },
    {
        id: 'y3s1',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y3S1' },
        position: { x: 200, y: 560 },
    },
    {
        id: 'y3s2',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y3S2' },
        position: { x: 200, y: 640 },
    },
    {
        id: 'y4s1',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y4S1' },
        position: { x: -200, y: 740 },
    },
    {
        id: 'y4s2',
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        data: { label: 'Y4S2' },
        position: { x: -200, y: 820 },
    },
    {
        id: 'degree',
        targetPosition: Position.Top,
        data: { label: 'Information Systems Major' },
        position: { x: 0, y: 940 },
      },
      // hidden nodes
    {
        id: 'y1s1-courses',
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: { label: 'Courses' },
        position: { x: 450, y: 200 },
        hidden: true,
    },
    {
        id: 'is111',
        targetPosition: Position.Left,
        data: { label: 'IS111: Intro to Prog' },
        position: { x: 650, y: 100 },
        hidden: true,
    },
    {
        id: 'is114',
        targetPosition: Position.Left,
        data: { label: 'IS114: Com Fundamentals' },
        position: { x: 650, y: 200 },
        hidden: true,
    }


  ];
  
  const initialEdges = [
    {
      id: 'senior-y1s1',
      source: 'senior_name',
      type: 'smoothstep',
      target: 'y1s1',
      animated: true,
    },
    {
        id: 'y1s1-y1s2',
        source: 'y1s1',
        type: 'smoothstep',
        target: 'y1s2',
        animated: true,
      },
      {
        id: 'y1s2-y2s1',
        source: 'y1s2',
        type: 'smoothstep',
        target: 'y2s1',
        animated: true,
      },
      {
        id: 'y2s1-y2s2',
        source: 'y2s1',
        type: 'smoothstep',
        target: 'y2s2',
        animated: true,
      },
      {
        id: 'y2s2-y3s1',
        source: 'y2s2',
        type: 'smoothstep',
        target: 'y3s1',
        animated: true,
      },
      {
        id: 'y3s1-y3s2',
        source: 'y3s1',
        type: 'smoothstep',
        target: 'y3s2',
        animated: true,
      },
      {
        id: 'y3s2-y4s1',
        source: 'y3s2',
        type: 'smoothstep',
        target: 'y4s1',
        animated: true,
      },
      {
        id: 'y4s1-y4s2',
        source: 'y4s1',
        type: 'smoothstep',
        target: 'y4s2',
        animated: true,
      },
      {
        id: 'y4s2-degree',
        source: 'y4s2',
        type: 'smoothstep',
        target: 'degree',
        animated: true,
      },

      // hidden edges 
      {
        id: 'y1s1-courses-edge',
        source: 'y1s1',
        type: 'smoothstep',
        target: 'y1s1-courses',
        animated: true,
        hidden: true,
      },
      {
        id: 'courses-is111',
        source: 'y1s1-courses',
        type: 'smoothstep',
        target: 'is111',
        animated: true,
        hidden: true,
      },
      {
        id: 'courses-is114',
        source: 'y1s1-courses',
        type: 'smoothstep',
        target: 'is114',
        animated: true,
        hidden: true,
      },

   
  ];
 
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 
const nodeTypes: NodeTypes = {
  num: NumberNode,
  txt: TextNode,
  multiCon: MultipleConnectionNode
};
 
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data);
};
 
export default function Timeline() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);


  

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
            // nodeTypes={nodeTypes}
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
        <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
        </ReactFlow>
    </div>
   
  );
}

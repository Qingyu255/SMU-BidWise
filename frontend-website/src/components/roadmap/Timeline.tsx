"use client"

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Position,
  BackgroundVariant,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  useReactFlow,
  ReactFlowProvider,
  DefaultEdgeOptions
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import SemNode from './SemNode';
import createClient from '@/utils/supabase/client';
import '@/components/roadmap/roadmap.css'; 
import { SeniorData, seniorsAttributes } from '@/types';

type FlowRendererProps = {
  nodes: Node[];               // Array of Node type
  edges: Edge[];               // Array of Edge type
  onNodesChange: OnNodesChange; // Function for handling node changes
  onEdgesChange: OnEdgesChange; // Function for handling edge changes
  onConnect: OnConnect;         // Function for handling new connections
};

const supabase = createClient();

// Colors:
// edge: #2b78e4
// node: #fdff00
// sub-node: #ffe59a

async function fetchRoadmap(name: string, sem: string) {
  // Fetch the senior_id
  const { data: seniorData, error: seniorError } = await supabase
    .from('seniors')
    .select('id')
    .eq('name', name)
    .single();

  if (seniorError) {
    console.error('Error fetching senior data:', seniorError);
    return [];
  }

  const seniorId = seniorData?.id;

  // Fetch the semester_id
  const { data: semesterData, error: semesterError } = await supabase
    .from('semesters')
    .select('id')
    .eq('semester_name', sem)
    .single();

  if (semesterError) {
    console.log('sem', sem)
    console.error('Error fetching semester data:', semesterError);
    return [];
  }

  const semesterId = semesterData?.id;

  // Fetch the course_ids from enrollments
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('senior_id', seniorId ?? '')
    .eq('semester_id', semesterId ?? '');

  if (enrollmentError) {
    console.error('Error fetching enrollment data:', enrollmentError);
    return [];
  }

  const courseIds = enrollmentData.map((enrollment) => enrollment.course_id);

  // Fetch the course_info using the course_ids
  const { data: courseInfoData, error } = await supabase
    .from('course_info')
    .select('course_code')
    .in('id', courseIds);

  if (error) {
    console.error('Error fetching course info:', error);
    return [];
  }

  return courseInfoData;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const nodeTypes = {
  SemNode: SemNode,
};

const FlowRenderer: React.FC<FlowRendererProps> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect }) => {
  const { zoomTo } = useReactFlow();

  useEffect(() => {
    // Set the zoom level to 75% (zoom out)
    zoomTo(0.5);
  }, [zoomTo]);

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export default function Timeline() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const y1s1 = await fetchRoadmap('Senior2', 'Y1S1');
      const y1s2 = await fetchRoadmap('Senior2', 'Y1S2');
      const y2s1 = await fetchRoadmap('Senior2', 'Y2S1');
      const y2s2 = await fetchRoadmap('Senior2', 'Y2S2');
      const y3s1 = await fetchRoadmap('Senior2', 'Y3S1');
      const y3s2 = await fetchRoadmap('Senior2', 'Y3S2');
      const y4s1 = await fetchRoadmap('Senior2', 'Y4S1');
      const y4s2 = await fetchRoadmap('Senior2', 'Y4S2');
      
      let semArr = [y1s1, y1s2, y2s1, y2s2, y3s1, y3s2, y4s1, y4s2];

      const fetchedNodes = [
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
          data: { label: y1s1[0].course_code },
          position: { x: -250, y: -90 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n1',
          targetPosition: Position.Right,
          data: { label: y1s1[1].course_code },
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
          position: { x: 200, y: 200 },
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
          position: { x: -40, y: 200 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n3',
          targetPosition: Position.Right,
          data: { label: 'BQ' },
          position: { x: -250, y: 203 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n3',
          targetPosition: Position.Right,
          data: { label: 'BQ' },
          position: { x: -250, y: 248 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n3',
          targetPosition: Position.Right,
          data: { label: 'BQ' },
          position: { x: -250, y: 293 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n3',
          targetPosition: Position.Right,
          data: { label: 'BQ' },
          position: { x: -250, y: 338 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n4',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { label: 'Y2S2' },
          position: { x: 80, y: 360 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n4',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 300 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n4',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 345 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n4',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 390 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n4',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 435 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n5',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { label: 'Y3S1' },
          position: { x: 80, y: 480 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n5',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -200, y: 435 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n5',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -200, y: 480 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n5',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -200, y: 525 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n5',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -200, y: 570 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n6',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { label: 'Y3S2' },
          position: { x: -120, y: 680 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n6',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -250, y: 755 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n6',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -250, y: 800 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n6',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -250, y: 845 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n6',
          targetPosition: Position.Right,
          data: { label: 'BQ11' },
          position: { x: -250, y: 890 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n7',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { label: 'Y4S1' },
          position: { x: 120, y: 960 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n7',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 755 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n7',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 800 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n7',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 845 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n7',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 250, y: 890 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n8',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { label: 'Y4S2' },
          position: { x: -120, y: 1050 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's1n8',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 200, y: 1060 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's2n8',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 200, y: 1105 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's3n8',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 200, y: 1150 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 's4n8',
          targetPosition: Position.Left,
          data: { label: 'BQ11' },
          position: { x: 200, y: 1195 },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
    
    
      ];

      
        console.log('y4s4', y4s1)
        y4s1.forEach((course) => {
          let snCounter = 1
          let subnode = {
            id: 's' + snCounter.toString() + 'n1',
            targetPosition: Position.Right,
            data: { label: course.course_code },
            position: { x: -250, y: -90 - (45 * snCounter) },
            style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
          }
          fetchedNodes.push(subnode)

          snCounter += 1
        })
      
    

      const fetchedEdges = [
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
      {
        id: 'n3-s1n3',
        source: 'n3',
        type: 'default',
        target: 's1n3',
        sourceHandle: 'l-src',
        
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n3-s2n3',
        source: 'n3',
        type: 'default',
        target: 's2n3',
        sourceHandle: 'l-src',
        
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n3-s3n3',
        source: 'n3',
        type: 'default',
        target: 's3n3',
        sourceHandle: 'l-src',
        
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n3-s4n3',
        source: 'n3',
        type: 'default',
        target: 's4n3',
        sourceHandle: 'l-src',
        
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n3-n4',
        source: 'n3',
        type: 'step',
        target: 'n4',
        sourceHandle: 'b-src',
        targetHandle: 'l-target',
        animated: false,
        style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
      },
      {
        id: 'n4-s1n4',
        source: 'n4',
        target: 's1n4',
        sourceHandle: 'r-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n4-s2n4',
        source: 'n4',
        target: 's2n4',
        sourceHandle: 'r-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n4-s3n4',
        source: 'n4',
        target: 's3n4',
        sourceHandle: 'r-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n4-s4n4',
        source: 'n4',
        target: 's4n4',
        sourceHandle: 'r-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n4-n5',
        source: 'n4',
        type: 'step',
        target: 'n5',
        sourceHandle: 'b-src',
        targetHandle: 't-target',
        animated: false,
        style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
      },
      {
        id: 'n5-s1n5',
        source: 'n5',
        target: 's1n5',
        sourceHandle: 'l-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n5-s2n5',
        source: 'n5',
        target: 's2n5',
        sourceHandle: 'l-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n5-s3n5',
        source: 'n5',
        target: 's3n5',
        sourceHandle: 'l-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n5-s4n5',
        source: 'n5',
        target: 's4n5',
        sourceHandle: 'l-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n5-n6',
        source: 'n5',
        type: 'default',
        target: 'n6',
        sourceHandle: 'b-src',
        targetHandle: 'r-target',
        animated: false,
        style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
      },
      {
        id: 'n6-s1n6',
        source: 'n6',
        target: 's1n6',
        sourceHandle: 'b-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-s2n6',
        source: 'n6',
        target: 's2n6',
        sourceHandle: 'b-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-s3n6',
        source: 'n6',
        target: 's3n6',
        sourceHandle: 'b-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-s4n6',
        source: 'n6',
        target: 's4n6',
        sourceHandle: 'b-src',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-n7',
        source: 'n6',
        type: 'smoothstep',
        target: 'n7',
        sourceHandle: 'r-src',
        targetHandle: 'l-target',
        animated: false,
        style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
      },
      {
        id: 'n7-s1n7',
        source: 'n7',
        target: 's1n7',
        sourceHandle: 't-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-s2n7',
        source: 'n7',
        target: 's2n7',
        sourceHandle: 't-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n7-s3n7',
        source: 'n7',
        target: 's3n7',
        sourceHandle: 't-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n7-s4n7',
        source: 'n7',
        target: 's4n7',
        sourceHandle: 't-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n7-n8',
        source: 'n7',
        type: 'smoothstep',
        target: 'n8',
        sourceHandle: 'l-src',
        targetHandle: 't-target',
        animated: false,
        style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
      },
      {
        id: 'n8-s1n8',
        source: 'n8',
        target: 's1n8',
        sourceHandle: 'r-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n6-s2n8',
        source: 'n8',
        target: 's2n8',
        sourceHandle: 'r-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n8-s3n8',
        source: 'n8',
        target: 's3n8',
        sourceHandle: 'r-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },
      {
        id: 'n8-s4n8',
        source: 'n8',
        target: 's4n8',
        sourceHandle: 'r-src',
        type: 'default',
        animated: true,
        style: { stroke: '#2b78e4', strokeWidth: 2 },
      },

    
    ];

      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setLoading(false);
    };

    fetchData();
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // Show a loading state while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <FlowRenderer
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </ReactFlowProvider>
    </div>
  );
}

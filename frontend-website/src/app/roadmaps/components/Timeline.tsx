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
  DefaultEdgeOptions,
  NodeTypes,
  PanOnScrollMode,
  type NodeProps,
  ReactFlowInstance,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import SemNode from '../../../components/roadmap/SemNode';
import CourseNode from './CourseNode';
import createClient from '@/utils/supabase/client';
import '@/components/roadmap/roadmap.css'; 
import { Course, edgeData,SeniorData, NodeData, seniorsAttributes, TimelineProps } from '@/types';

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

const nodeTypes: NodeTypes = {
  SemNode: SemNode,
  CourseNode: CourseNode,
};




const FlowRenderer: React.FC<FlowRendererProps> = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect }) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance|null>(null); // State to hold the initialized instance

  // When the reactFlowInstance changes, we can perform operations on it.
  useEffect(() => {
    if (reactFlowInstance) {
       // Automatically fit the view to the diagram
       reactFlowInstance.fitView();
       let vp = reactFlowInstance.getViewport()
      //  console.log(vp)
       // Then zoom in by adjusting the zoom level
       reactFlowInstance.setViewport({x:vp.x, y: vp.y + 120, zoom: 0.7 });
    }
  }, [reactFlowInstance]);


  useEffect(() => {
    const handleResize = () => {
      if(reactFlowInstance) {
        reactFlowInstance.fitView()
        let vp = reactFlowInstance.getViewport()
        if(vp.x >= 210) {
          reactFlowInstance.setViewport({x:vp.x, y: vp.y + 120, zoom: 0.7 });
        } else {
          reactFlowInstance.setViewport({x:vp.x, y: vp.y + 120, zoom: vp.zoom });
        }
        // console.log(vp)
      }
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [reactFlowInstance])

  // Callback to get the React Flow instance once it's ready
  const handleInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);  // Save the initialized instance in the state
  };

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      panOnScroll
      // panOnScrollMode={PanOnScrollMode.Vertical}
      panOnDrag={false}
      // zoomOnPinch={false}
      zoomOnDoubleClick={false}
      fitView
      // fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={handleInit}
    >
      <Controls />
      <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
    </ReactFlow>
  );
};

const Timeline: React.FC<TimelineProps> = ({ seniorName }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const y1s1: Course[] = await fetchRoadmap(seniorName, 'Y1S1') as Course[];
      const y1s2: Course[] = await fetchRoadmap(seniorName, 'Y1S2') as Course[];
      const y2s1: Course[] = await fetchRoadmap(seniorName, 'Y2S1') as Course[];
      const y2s2: Course[] = await fetchRoadmap(seniorName, 'Y2S2') as Course[];
      const y3s1: Course[] = await fetchRoadmap(seniorName, 'Y3S1') as Course[];
      const y3s2: Course[] = await fetchRoadmap(seniorName, 'Y3S2') as Course[];
      const y4s1: Course[] = await fetchRoadmap(seniorName, 'Y4S1') as Course[];
      const y4s2: Course[] = await fetchRoadmap(seniorName, 'Y4S2') as Course[];
      
      let semArr = [y1s1, y1s2, y2s1, y2s2, y3s1, y3s2, y4s1, y4s2];

      const fetchedNodes: Node[] = [
        {
          id: 'n1',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { course_code: 'Y1S1' },
          position: { x: 0, y: 0 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n2',
          type: 'SemNode',
          targetPosition: Position.Left,
          sourcePosition: Position.Left,
          data: { course_code: 'Y1S2' },
          position: { x: 200, y: 200 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },

        {
          id: 'n3',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { course_code: 'Y2S1' },
          position: { x: -40, y: 200 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n4',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { course_code: 'Y2S2' },
          position: { x: 80, y: 360 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n5',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y3S1' },
          position: { x: 80, y: 480 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n6',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y3S2' },
          position: { x: -120, y: 680 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n7',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y4S1' },
          position: { x: 120, y: 960 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
        {
          id: 'n8',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y4S2' },
          position: { x: -120, y: 1050 },
          style: { backgroundColor: '#fdff00', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        },
    
      ];

      const fetchedEdges: Edge[] = [
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
          id: 'n2-s1n2',
          source: 'n2',
          type: 'default',
          target: 's1n2',
          sourceHandle: 't-src',
          targetHandle: 'b-target',
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
          id: 'n7-n8',
          source: 'n7',
          type: 'smoothstep',
          target: 'n8',
          sourceHandle: 'l-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: 'none' },
        },
      ];
      
      // Populate y1s1 courses
      let snCounter = 1
      y1s1.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n1',
          type: 'CourseNode',
          // sourcePosition: Position.Top,
          targetPosition: Position.Right,
          data: { course_code: course.course_code },
          position: { x: -250, y: -135 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n1-s' + snCounter.toString() + 'n1',
          source: 'n1',
          type: 'default',
          sourceHandle: 'l-src',
          targetHandle: 'r-target',
          target: 's' + snCounter.toString() + 'n1',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
      
      // Populate y1s2 courses
      snCounter = 1
      y1s2.forEach((course: { course_code: string }) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n2',
          type: 'CourseNode',
          sourcePosition: Position.Top,
          targetPosition: Position.Bottom,
          data: { course_code: course.course_code },
          position: { x: 250, y: 135 - (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        snCounter += 1
      })

      // Populate y2s1 courses
      snCounter = 1
      y2s1.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n3',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: -250, y: 113 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n3-s' + snCounter.toString() + 'n3',
          source: 'n3',
          type: 'default',
          target: 's' + snCounter.toString() + 'n3',
          sourceHandle: 'l-src',
          targetHandle: 'r-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })


      // Populate y2s2 courses
      snCounter = 1
      y2s2.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n4',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: 250, y: 255 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n4-s' + snCounter.toString() + 'n4',
          source: 'n4',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n4',
          sourceHandle: 'r-src',
          targetHandle: 'l-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
    
      // Populate y3s1 courses
      snCounter = 1
      y3s1.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n5',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: -200, y: 390 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n5-s' + snCounter.toString() + 'n5',
          source: 'n5',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n5',
          sourceHandle: 'l-src',
          targetHandle: 'r-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })

      // Populate y3s2 courses
      snCounter = 1
      y3s2.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n6',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: -250, y: 710 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n6-s' + snCounter.toString() + 'n6',
          source: 'n6',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n6',
          sourceHandle: 'b-src',
          targetHandle: 'r-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })

      // Populate y4s1 courses
      snCounter = 1
      y4s1.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n7',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: 250, y: 665 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n7-s' + snCounter.toString() + 'n7',
          source: 'n7',
          type: 'default',
          target: 's' + snCounter.toString() + 'n7',
          sourceHandle: 't-src',
          targetHandle: 'l-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })

      // Populate y4s2 courses
      snCounter = 1
      y4s2.forEach((course) => {
        let subnode = {
          id: 's' + snCounter.toString() + 'n8',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.course_code },
          position: { x: 200, y: 1015 + (45 * snCounter) },
          style: { backgroundColor: '#ffe59a', border: '1px solid black', borderRadius: '8px', fontWeight: '600', },
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n8-s' + snCounter.toString() + 'n8',
          source: 'n8',
          type: 'default',
          target: 's' + snCounter.toString() + 'n8',
          sourceHandle: 'r-src',
          targetHandle: 'l-target',
          animated: true,
          style: { stroke: '#2b78e4', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })


      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setLoading(false);
    };

    fetchData();
  }, [seniorName]);

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

export default Timeline
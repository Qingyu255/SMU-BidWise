"use client";

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
  useReactFlow,
  useStoreApi,
  ReactFlowProvider,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import SemNode from '../../../components/roadmap/SemNode';
import CourseNode from '../../roadmaps/components/CourseNode';
import createClient from '@/utils/supabase/client';
import '@/components/roadmap/roadmap.css'; 
import { Course, edgeData, NodeData } from '@/types';
import { useTheme } from 'next-themes';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@clerk/clerk-react';
import { UUID } from 'crypto';

type FlowRendererProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

const supabase = createClient();

async function fetchRoadmap(sem: string, user_id: string) {
  
  const { data: prData, error: prError } = await supabase
    .from('tasks_roadmap')
    .select('courseId')
    .eq('_clerk_user_id', user_id ?? '') 
    .eq('columnId', sem);

  const courses = await Promise.all(
    prData?.map(async (enrollment) => {
      const { data: courseData, error: courseError } = await supabase
        .from('course_info')
        .select('course_code')
        .eq('id', enrollment.courseId as unknown as UUID)
        .single();

      if (courseError) {
        console.error('Error fetching course info:', courseError);
        return null;
      }

      return {
        courseCode: courseData?.course_code,
        course_code: enrollment.courseId,
      };
    }) ?? []
  );

  return courses;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions = {
  animated: true,
};

const nodeTypes: NodeTypes = {
  SemNode: SemNode,
  CourseNode: CourseNode,
};

const FlowRenderer: React.FC<FlowRendererProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setEdges,
}) => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Initialize store and react flow hooks
  const store = useStoreApi();
  const { getNode, getNodes } = useReactFlow();

  const MIN_DISTANCE = 400;

// Function to get the closest edge based on node proximity
const getClosestEdge = useCallback(
  (node: Node) => {
    const nodes = getNodes();

    // Only consider semnodes as potential targets
    const semNodes = nodes.filter((n) => n.type === 'SemNode');

    const currentNode = getNode(node.id);
    if (!currentNode) return null;

    const closestNode = semNodes.reduce(
      (res: { distance: number; node: Node | null }, n: Node) => {
        if (n.id !== currentNode.id) {
          const dx = n.position.x - currentNode.position.x;
          const dy = n.position.y - currentNode.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < res.distance && distance < MIN_DISTANCE) {
            res.distance = distance;
            res.node = n;
          }
        }
        return res;
      },
      {
        distance: Number.MAX_VALUE,
        node: null,
      }
    );

    if (!closestNode.node) {
      return null;
    }

    // Determine the side of the semnode closest to the subnode
    const dx = currentNode.position.x - closestNode.node.position.x;
    const dy = currentNode.position.y - closestNode.node.position.y;

    let sourceHandle = null;
    let targetHandle = null;

    // Map relative positions to existing handle IDs
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal alignment
      if (dx > 0) {
        // Subnode is to the right of semnode
        sourceHandle = 'l-src';
        targetHandle = 'r-target';
      } else {
        // Subnode is to the left of semnode
        sourceHandle = 'r-src';
        targetHandle = 'l-target';
      }
    } 

    // Create and return the edge connecting currentNode to closestNode.node
    const id = `e${currentNode.id}-${closestNode.node.id}`;
    const newEdge: Edge = {
      id,
      source: currentNode.id,
      target: closestNode.node.id,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#4283bb', strokeWidth: 2 }, // Match existing edge style
    };

    return newEdge;
  },
  [getNode, getNodes]
);




const onNodeDrag = useCallback(
  (_: any, node: Node) => {
    const closeEdge = getClosestEdge(node);

    setEdges((edges) => {
      // Remove any existing edges from this subnode
      const nextEdges = edges.filter(
        (e) =>
          e.source !== node.id &&
          e.target !== node.id &&
          e.className !== 'temp'
      );

      if (closeEdge) {
        closeEdge.className = 'temp';
        nextEdges.push(closeEdge);
      }

      return nextEdges;
    });
  },
  [getClosestEdge, setEdges]
);

const onNodeDragStop = useCallback(
  (_: any, node: Node) => {
    const closeEdge = getClosestEdge(node);

    setEdges((edges) => {
      // Remove any existing edges from this subnode
      const nextEdges = edges.filter(
        (e) =>
          e.source !== node.id &&
          e.target !== node.id &&
          e.className !== 'temp'
      );

      if (closeEdge) {
        nextEdges.push(closeEdge);
      }

      return nextEdges;
    });
  },
  [getClosestEdge, setEdges]
);

  

  // Initialize React Flow instance and adjust viewport
  const handleInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  };

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
      let vp = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({ x: vp.x, y: vp.y + 120, zoom: 0.7 });
    }
  }, [reactFlowInstance]);

  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView();
        let vp = reactFlowInstance.getViewport();
        reactFlowInstance.setViewport({ x: vp.x, y: vp.y + 120, zoom: vp.zoom });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [reactFlowInstance]);

  const { resolvedTheme } = useTheme();
  let controlTheme;
  let flowClass;
  if (resolvedTheme === 'dark') {
    controlTheme = {
      backgroundColor: 'black',
    };
    flowClass = 'dark';
  } else if (resolvedTheme === 'light') {
    flowClass = 'light';
  }

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      panOnScroll
      panOnDrag={false}
      zoomOnDoubleClick={false}
      fitView
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={handleInit}
      style={{ ...controlTheme }}
      nodesDraggable={true}
      className={flowClass}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

const KanbanTimeline = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const y1s1: Course[] = await fetchRoadmap('Y1S1', user?.id ?? '') as Course[];
      const y1s2: Course[] = await fetchRoadmap('Y1S2', user?.id ?? '') as Course[];
      const y2s1: Course[] = await fetchRoadmap('Y2S1', user?.id ?? '') as Course[];
      const y2s2: Course[] = await fetchRoadmap('Y2S2', user?.id ?? '') as Course[];
      const y3s1: Course[] = await fetchRoadmap('Y3S1', user?.id ?? '') as Course[];
      const y3s2: Course[] = await fetchRoadmap('Y3S2', user?.id ?? '') as Course[];
      const y4s1: Course[] = await fetchRoadmap('Y4S1', user?.id ?? '') as Course[];
      const y4s2: Course[] = await fetchRoadmap('Y4S2', user?.id ?? '') as Course[];

      let semArr = [y1s1, y1s2, y2s1, y2s2, y3s1, y3s2, y4s1, y4s2];

      const fetchedNodes: Node[] = [
        {
          id: 'n1',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y1S1' },
          position: { x: 0, y: 0 },
          draggable: false,
        },
        {
          id: 'n2',
          type: 'SemNode',
          targetPosition: Position.Top,
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y1S2' },
          position: { x: 0, y: 250 },
          draggable: false,
        },

        {
          id: 'n3',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { course_code: 'Y2S1' },
          position: { x: 0, y: 500 },
          draggable: false,
        },
        {
          id: 'n4',
          type: 'SemNode',
          sourcePosition: Position.Left,
          data: { course_code: 'Y2S2' },
          position: { x: 0, y: 750 },
          draggable: false,
        },
        {
          id: 'n5',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y3S1' },
          position: { x: 0, y: 1000 },
          draggable: false,
        },
        {
          id: 'n6',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y3S2' },
          position: { x: 0, y: 1250 },
          draggable: false,
        },
        {
          id: 'n7',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y4S1' },
          position: { x: 0, y: 1500 },
          draggable: false,
        },
        {
          id: 'n8',
          type: 'SemNode',
          sourcePosition: Position.Bottom,
          data: { course_code: 'Y4S2' },
          position: { x: 0, y: 1750 },
          draggable: false,
        },
    
      ];

      const fetchedEdges: Edge[] = [
        {
          id: 'n1-n2',
          source: 'n1',
          type: 'default',
          target: 'n2',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
        // {
        //   id: 'n2-s1n2',
        //   source: 'n2',
        //   type: 'step',
        //   target: 's1n2',
        //   sourceHandle: 'b-src',
        //   targetHandle: 't-target',
        //   animated: true,
        //   style: { stroke: '#4283bb', strokeWidth: 2 },
        // },
        {
          id: 'n2-n3',
          source: 'n2',
          type: 'default',
          target: 'n3',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
        {
          id: 'n3-n4',
          source: 'n3',
          type: 'step',
          target: 'n4',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
        {
          id: 'n4-n5',
          source: 'n4',
          type: 'step',
          target: 'n5',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
 
        {
          id: 'n5-n6',
          source: 'n5',
          type: 'default',
          target: 'n6',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
        {
          id: 'n6-n7',
          source: 'n6',
          type: 'smoothstep',
          target: 'n7',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
        {
          id: 'n7-n8',
          source: 'n7',
          type: 'smoothstep',
          target: 'n8',
          sourceHandle: 'b-src',
          targetHandle: 't-target',
          animated: false,
          style: { stroke: '#4283bb', strokeWidth: 2, strokeDasharray: 'none' },
        },
      ];
      
      // Populate y1s1 courses
      let snCounter = 1
      let leftSide = false
      if(y1s1.length > 0) {

        y1s1.forEach((course) => {
        console.log('course', course)
          let xAxis;
          let yAxis;
          let src;
          let tgt;
  
          if(leftSide == false) {
            xAxis = -345
            yAxis = -120 + (40 * snCounter)
            src = 'l-src'
            tgt = 'r-target'
            leftSide = true
          } else {
            xAxis = 245
            yAxis = -120 + (40 * (snCounter - 1))
            src = 'r-src'
            tgt = 'l-target'
            leftSide = false
            
          }
          let subnode = {
            id: 's' + snCounter.toString() + 'n1',
            type: 'CourseNode',
            // sourcePosition: Position.Top,
            targetPosition: Position.Right,
            data: { course_code: course.courseCode },
            position: { x: xAxis, y: yAxis },
            draggable: true, 
            
          }
          fetchedNodes.push(subnode)
  
  
  
          let edge = {
            id: 'n1-s' + snCounter.toString() + 'n1',
            source: 'n1',
            type: 'smoothstep',
            sourceHandle: src,
            targetHandle: tgt,
            target: 's' + snCounter.toString() + 'n1',
            animated: true,
            style: { stroke: '#4283bb', strokeWidth: 2 },
          }
  
          fetchedEdges.push(edge)
  
          snCounter += 1
        })
      }
     
      
      // Populate y1s2 courses
      snCounter = 1
      leftSide = false
      if(y1s2.length > 0) {
        y1s2.forEach((course: { courseCode: string }) => {
          console.log('course', course)
          // initialise variables
          let xAxis;
          let yAxis;
          let src;
          let tgt;

          // position subnodes
          if(leftSide == false) {
            xAxis = -345
            yAxis = 130 + (40 * snCounter)
            src = 'l-src'
            tgt = 'r-target'
            leftSide = true
          } else {
            xAxis = 245
            yAxis = 130 + (40 * (snCounter - 1))
            src = 'r-src'
            tgt = 'l-target'
            leftSide = false
            
          }

          let subnode = {
            id: 's' + snCounter.toString() + 'n2',
            type: 'CourseNode',
            sourcePosition: Position.Right,
            targetPosition: Position.Bottom,
            data: { course_code: course.courseCode },
            position: { x: xAxis, y: yAxis },
            draggable: true, 
          }
          fetchedNodes.push(subnode)

          let edge = {
            id: 'n2-s' + snCounter.toString() + 'n2',
            source: 'n2',
            type: 'smoothstep',
            sourceHandle: src,
            targetHandle: tgt,
            target: 's' + snCounter.toString() + 'n2',
            animated: true,
            style: { stroke: '#4283bb', strokeWidth: 2 },
          }

          fetchedEdges.push(edge)

          snCounter += 1
        })
      }

      // Populate y2s1 courses
      snCounter = 1
      leftSide = false
      if(y2s1.length > 0) {
      y2s1.forEach((course) => {

        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 380 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 380 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }


        let subnode = {
          id: 's' + snCounter.toString() + 'n3',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n3-s' + snCounter.toString() + 'n3',
          source: 'n3',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n3',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
    }


      // Populate y2s2 courses
      snCounter = 1
      leftSide = false
      if(y2s2.length > 0) {
      y2s2.forEach((course) => {
        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 630 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 630 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }

        let subnode = {
          id: 's' + snCounter.toString() + 'n4',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n4-s' + snCounter.toString() + 'n4',
          source: 'n4',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n4',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
    }
    
      // Populate y3s1 courses
      snCounter = 1
      leftSide = false
      if(y3s1.length > 0) {
      y3s1.forEach((course) => {
        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 880 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 880 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }
        let subnode = {
          id: 's' + snCounter.toString() + 'n5',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n5-s' + snCounter.toString() + 'n5',
          source: 'n5',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n5',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
      }

      // Populate y3s2 courses
      snCounter = 1
      leftSide = false
      if(y3s2.length > 0) {
      y3s2.forEach((course) => {

        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 1130 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 1130 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }

        let subnode = {
          id: 's' + snCounter.toString() + 'n6',
          targetPosition: Position.Right,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n6-s' + snCounter.toString() + 'n6',
          source: 'n6',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n6',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
      }

      // Populate y4s1 courses
      snCounter = 1
      leftSide = false
      if(y4s1.length > 0) {
      y4s1.forEach((course) => {
        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 1380 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 1380 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }

        let subnode = {
          id: 's' + snCounter.toString() + 'n7',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n7-s' + snCounter.toString() + 'n7',
          source: 'n7',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n7',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
    }

      // Populate y4s2 courses
      snCounter = 1
      leftSide = false
      if(y4s2.length > 0) {
      y4s2.forEach((course) => {
        // initialise variables
        let xAxis;
        let yAxis;
        let src;
        let tgt;

        // position subnodes
        if(leftSide == false) {
          xAxis = -345
          yAxis = 1630 + (40 * snCounter)
          src = 'l-src'
          tgt = 'r-target'
          leftSide = true
        } else {
          xAxis = 245
          yAxis = 1630 + (40 * (snCounter - 1))
          src = 'r-src'
          tgt = 'l-target'
          leftSide = false
          
        }
        let subnode = {
          id: 's' + snCounter.toString() + 'n8',
          targetPosition: Position.Left,
          type: 'CourseNode',
          data: { course_code: course.courseCode },
          position: { x: xAxis, y: yAxis },
          draggable: true, 
        }
        fetchedNodes.push(subnode)

        let edge = {
          id: 'n8-s' + snCounter.toString() + 'n8',
          source: 'n8',
          type: 'smoothstep',
          target: 's' + snCounter.toString() + 'n8',
          sourceHandle: src,
          targetHandle: tgt,
          animated: true,
          style: { stroke: '#4283bb', strokeWidth: 2 },
        }

        fetchedEdges.push(edge)

        snCounter += 1
      })
      }


      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const semPositions: { [key: string]: number } = {
    'Y1S1': 0,
    'Y1S2': 250,
    'Y2S1': 500,
    'Y2S2': 750,
    'Y3S1': 1000,
    'Y3S2': 1250,
    'Y4S1': 1500,
    'Y4S2': 1750,
  };

  const getSemesterFromPosition = (yPos: number): string | null => {
        // Determine which semester the y position corresponds to
        const thresholds = Object.entries(semPositions).map(([sem, pos]) => ({
          sem,
          pos,
        }));
      
        for (let i = 0; i < thresholds.length; i++) {
          const { sem, pos } = thresholds[i];
          const nextPos = thresholds[i + 1]?.pos ?? Infinity;
          if (yPos >= pos - 100 && yPos < nextPos - 100) {
            return sem;
          }
        }
        return null;
      };
    
      // const updateTaskColumnId = async (courseId: string, newColumnId: string) => {
      //   if (!user || !user.id) return;
      
      //   try {
      //     const { error } = await supabase
      //       .from('tasks_roadmap')
      //       .update({ columnId: newColumnId })
      //       .eq('_clerk_user_id', user.id)
      //       .eq('courseId', courseId);
      
      //     if (error) {
      //       console.error('Error updating task:', error);
      //       toast({
      //         title: 'Error updating task in Supabase.'
            
      //       });
            
      //     }
      //   } catch (error) {
      //     console.error('Update error:', error);
      //     toast({ title: 'An unexpected error occurred during update.' });
      //   }
      // };
    
      const getSemesterFromNodeId = (nodeId: string): string => {
        // Extract semester from node id, assuming format like 's1n2' where 'n2' indicates semester index
        const match = nodeId.match(/n(\d+)/);
        if (match) {
          const index = parseInt(match[1]) - 1;
          const semesters = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];
          return semesters[index];
        }
        return '';
      };
    
  

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Handle side effects after state has been updated
      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            const newSem = getSemesterFromPosition(node.position.y);
            if (newSem) {
              const originalSem = getSemesterFromNodeId(node.id);
              if (newSem !== originalSem) {
                // Update the task's columnId in Supabase
                (async () => {
                  try {
                    // Fetch the course_code directly
                    const { data: courseData, error: courseError } = await supabase
                        .from('course_info')
                        .select('id')
                        .eq('course_code', node.data.course_code as string);

                    if (courseError) {
                        throw courseError;
                    }

                    let courseId = '';
                    if (courseData && courseData.length > 0) {
                        courseId = courseData[0].id as string;
                    } else {
                        courseId = '';
                    }


                    const { error: updateError } = await supabase
                      .from('tasks_roadmap')
                      .update({ columnId: newSem })
                      .eq('_clerk_user_id', user?.id ?? '')
                      .eq('courseId', courseId as string);



                    if (updateError) {
                      console.error('Error updating task:', updateError);
                      toast({
                        title: 'Error updating task in Supabase.',
                        description: `Failed to update ${node.data.course_code}. Please try again.`,
                      });
                    } else {
                      console.log('node.data', node.data)
                      toast({
                        title: 'Task Moved',
                        description: `Moved ${node.data.course_code} to ${newSem}`,
                      });
                    }
                  } catch (error) {
                    console.error('Update error:', error);
                    toast({ title: 'An unexpected error occurred during update.' });
                  }
                })();

                // Update the node's data to reflect the new semester
                setNodes((prevNodes) =>
                  prevNodes.map((n) =>
                    n.id === node.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            semester: newSem,
                          },
                        }
                      : n
                  )
                );
              }
            }
          }
        }
      });
    },
    [nodes, user?.id]
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
    return (
      <div className="space-y-3 pt-2">
        <Skeleton className="h-8 w-100" />
        <Skeleton className="h-8 w-100" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
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
          setEdges={setEdges} // Pass setEdges to FlowRenderer
        />
      </ReactFlowProvider>
    </div>
  );
};

export default KanbanTimeline;

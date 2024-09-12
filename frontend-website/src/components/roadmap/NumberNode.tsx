import type { Node, NodeProps } from '@xyflow/react';
 
type NumberNode = Node<{ number: number }, 'number'>;
 
export default function NumberNode({ data }: NodeProps<NumberNode>) {
    return (
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <div className="font-bold text-xl">A special number:</div>
          <div className="text-3xl">{data.number}</div>
        </div>
      );
    
}
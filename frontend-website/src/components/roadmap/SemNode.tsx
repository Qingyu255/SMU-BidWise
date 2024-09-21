import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '@/types';



type SemNodeProps = {
  data: {
    label: string
  }
}


const SemNode = ({ data }: SemNodeProps) => {
    return (
      <div style={{
        padding: '10px 40px',
        
      }}>
        <div>{data.label}</div>
        
        {/* Define 4 different source handles */}
        <Handle
          type="source"
          position={Position.Left}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='l-src'
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='r-src'
        />
        <Handle
          type="source"
          position={Position.Top}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='t-src'
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='b-src'
        />
        
        {/*Target handle to allow incoming edges */}
        <Handle
          type="target"
          position={Position.Left}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='l-target'
        />
        <Handle
          type="target"
          position={Position.Right}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='r-target'
        />
        <Handle
          type="target"
          position={Position.Top}
          style={{width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='t-target'
        />
        <Handle
          type="target"
          position={Position.Bottom}
          style={{ width: '0',
            height: '0',
            background: 'transparent',
            border: 'none' }}
          id='b-target'
        />
      </div>
    );
  };
  
  export default SemNode;
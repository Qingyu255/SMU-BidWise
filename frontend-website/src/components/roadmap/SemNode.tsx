import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import '@/components/roadmap/roadmap.css'; 
import { useTheme } from 'next-themes';


type SemNodeProps = {
  data: {
    course_code: string
  }
}


const SemNode = ({ data }: SemNodeProps) => {

  const { resolvedTheme } = useTheme();

  let bgColor;
  // let bgColorHovered;
  let borderTheme;
  let textColorTheme;

  if (resolvedTheme == 'light') {
    // bgColorHovered = '#D9A633'
    bgColor = '#121a50'
    borderTheme = '2px solid #906f46'
    textColorTheme = '#E1D9D1'
  } else if (resolvedTheme == 'dark') {
    // bgColorHovered = '#282828'
    bgColor = '#0f172a'
    // borderTheme = '2px solid #906f46'
    textColorTheme = '#E1D9D1'
  }

  const nodeStyle: React.CSSProperties = {
    borderRadius: '8px', 
    fontWeight: '600',
    padding: '10px 10px',
    width: '150px',
    height: '70px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // border: '2px solid #906f46',
    border: borderTheme,
    color: textColorTheme,
    backgroundColor: bgColor,
    
    fontSize: '24px',


    
  }
    
    return (
      

      <div style={{
        padding: '10px 40px',
        ...nodeStyle
        
      }}>
        <div>{data.course_code}</div>
        
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
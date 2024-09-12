import { Handle, Position } from 'react-flow-renderer';

type MultipleConnectionNodeProps = {
    data: {
        label: string; // Label for the node
      };
  };

// Custom node for y1s1 with handles on bottom and right
const MultipleConnectionNode = ({ data }: MultipleConnectionNodeProps) => {
  return (
    <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
      <div>{data.label}</div>
      {/* Handle for bottom connection */}
      <Handle type="source" position={Position.Bottom} id="bottom" />
      {/* Handle for right connection */}
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

export default MultipleConnectionNode;
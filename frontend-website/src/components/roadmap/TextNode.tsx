import type { Node, NodeProps } from '@xyflow/react';

// Define the blueprint for TextNode
type TextNode = Node<{ text: string }, 'text'>;

// Create the TextNode function to display the text
export default function TextNode({ data }: NodeProps<TextNode>) {
  return <div>A special text: {data.text}</div>;
}

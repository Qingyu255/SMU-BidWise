'use client'

import CustomCodeRenderer from '../renderer/CustomCodeRenderer'
import CustomImageRenderer from '../renderer/CustomImageRenderer'
import { FC } from 'react'
import dynamic from 'next/dynamic'

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  { ssr: false }
)

interface EditorOutputProps {
  content: string; // Change to string since it will be JSON
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  let data;
  try {
    // Parse the JSON content
    data = JSON.parse(content);
  } catch (error) {
    console.error('Error parsing content:', error);
    data = {}; // Fallback to an empty object if parsing fails
  }

  return (
    <Output
      style={style}
      className='text-sm'
      renderers={renderers}
      data={data} // Use the parsed data
    />
  )
}

export default EditorOutput;

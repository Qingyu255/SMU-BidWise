import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '@/types';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type CourseNodeProps = {
  data: {
    label: string
  }
}


const CourseNode = ({ data }: CourseNodeProps) => {
    return (
      

          <Sheet>
            <SheetTrigger asChild>
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
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>IS111 Intro to programming</SheetTitle>
                <SheetDescription>
                  Intro to programming is SMU&apos;s finest Information System module available for all Year 1s.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose asChild>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

      
    );
  };
  
  export default CourseNode;
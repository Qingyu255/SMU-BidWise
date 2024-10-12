"use client"
import React, { useEffect, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { Trash2, CheckCircle, Circle, GripVertical, Info } from "lucide-react";
import { ColumnId } from "./KanbanBoard";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { courseInfo } from '@/types';
import createClient  from '@/utils/supabase/client';
import CourseSummaryCard from "@/app/courses/components/CourseSummaryCard";

export interface Task {
  id: string;
  columnId: ColumnId;
  content: string;
  completed?: boolean;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onRemove: () => void;
  onToggleCompletion: () => void;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay, onRemove, onToggleCompletion, }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });
  const supabase = createClient();
  const [courseData, setCourseData] = useState<courseInfo[]>([]);

  useEffect(() => {
    const courseCode = task.id;
    const fetchCourseData = async () => {
      const { data: courseData, error } = await supabase
        .from('course_info')
        .select('*')
        .eq('course_code', courseCode);

        if (error) {
          console.error(error);
        } else if (courseData) {
          
          setCourseData(courseData as unknown as courseInfo[]);
        }
    };
    fetchCourseData();
  }, [task]);

  return (
    <TooltipProvider>
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        
        {/* Completion Status Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCompletion}
              className="ml-auto text-[#5A7BB5]"
            >
              {task.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
              <span className="sr-only">
                {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark {task.id} as {task.completed ? "incomplete" : "complete"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Remove Button */}
        <Tooltip>
          <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="ml-2 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove task</span>
          </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove {task.id} from planner</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>

      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap flex justify-between">
        <span>
          {task.content}
        </span>
        <div className="inline-block">
        <Sheet>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                <Info className="w-5 h-5"/>
              </Button>
              </SheetTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Course Information for {task.id}</p>
            </TooltipContent>
          </Tooltip>
          <SheetContent className="flex flex-col">
            <CourseSummaryCard
                course_id = {courseData[0]?.id}
                course_code={courseData[0]?.course_code}
                title={courseData[0]?.title}
                career={courseData[0]?.career}
                description={courseData[0]?.description}
                enrolment_requirements={courseData[0]?.enrolment_requirements}
                units={courseData[0]?.units}
            />
            <SheetFooter>
              <SheetClose asChild>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

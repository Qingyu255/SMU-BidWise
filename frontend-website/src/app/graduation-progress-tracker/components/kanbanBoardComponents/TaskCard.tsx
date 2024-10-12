import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { Trash2, CheckCircle, Circle, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ColumnId } from "./KanbanBoard";

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

  return (
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
        {/* <Badge variant={"outline"} className="ml-auto font-semibold">
          Course
        </Badge> */}

        {/* Completion Status Icon */}
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
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="ml-2 text-red-500"
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Remove task</span>
        </Button>
      </CardHeader>

      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        {task.content}
      </CardContent>
    </Card>
  );
}

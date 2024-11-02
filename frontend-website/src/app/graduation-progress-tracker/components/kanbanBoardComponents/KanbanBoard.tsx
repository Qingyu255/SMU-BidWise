import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./BoardColumn";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  Announcements,
  UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Task, TaskCard } from "./TaskCard";
import type { Column } from "./BoardColumn";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { semesters } from "../../constants/semesters";
import { useToast } from "@/hooks/use-toast";

const defaultCols: Column[] = semesters.map((semester) => ({
  id: semester,
  title: semester,
}));

export type ColumnId = UniqueIdentifier;

interface KanbanBoardProps {
  kanbanKey: number;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onRemoveTask: (taskId: string) => void;
  onToggleTaskCompletion: (taskId: string) => void;
}

export function KanbanBoard({ kanbanKey, tasks, onTasksChange, onRemoveTask, onToggleTaskCompletion }: KanbanBoardProps) {
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

 


  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
    const taskPosition = tasksInColumn.findIndex((task) => task.courseId === taskId);
    const column = columns.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.columnId;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current
        );
        return `Picked up Task ${
          active.data.current.task.content
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.content
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
              onRemoveTask={onRemoveTask}
              onToggleTaskCompletion={onToggleTaskCompletion}
            />
          ))}
        </SortableContext>
      </BoardContainer>

      {("undefined" !== typeof window && "document" in window) &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                onRemoveTask={onRemoveTask}
                onToggleTaskCompletion={onToggleTaskCompletion}
              />
            )}
            {activeTask && <TaskCard task={activeTask} onRemove={onRemoveTask} onToggleCompletion={onToggleTaskCompletion} isOverlay/>}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
  
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id as string;
    const overId = over.id as string;
  
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
  
    const activeData = active.data.current;
    const overData = over.data.current;
  
    if (activeId === overId) return;
  
    const isActiveAColumn = activeData?.type === "Column";
    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";
    const isOverAColumn = overData?.type === "Column";
  
    if (isActiveAColumn) {
      // Handle reordering columns if needed
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
    
        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    } else if (isActiveATask) {
      const activeTask = tasks.find((task) => task.courseId === activeId);
      if (!activeTask) return;
    
      let updatedTasks = [...tasks];
    
      if (isOverATask) {
        const overTask = tasks.find((task) => task.courseId === overId);
        if (!overTask) return;
    
        // If moving to a different column, update the columnId
        if (activeTask.columnId !== overTask.columnId) {
          const tasksInNewColumn = updatedTasks.filter(
            (task) => task.columnId === overTask.columnId
          );
          if (tasksInNewColumn.length >= 6) {
            toast({
              title: "Warning",
              description: "You cannot add more than 6 mods to a column.",
            });
            return; // Prevent adding to a column with 6 mods
          }

          updatedTasks = updatedTasks.map((task) =>
            task.courseId === activeId ? { ...task, columnId: overTask.columnId } : task
          );
        }
    
        // Reorder tasks within the column
        const tasksInOverColumn = updatedTasks.filter(
          (task) => task.columnId === overTask.columnId
        );
    
        const activeIndex = tasksInOverColumn.findIndex(
          (task) => task.courseId === activeId
        );
        const overIndex = tasksInOverColumn.findIndex(
          (task) => task.courseId === overId
        );
    
        if (activeIndex !== -1 && overIndex !== -1) {
          // Map back to the indices in the updatedTasks array
          const globalActiveIndex = updatedTasks.findIndex(
            (task) => task.courseId === activeId
          );
          const globalOverIndex = updatedTasks.findIndex(
            (task) => task.courseId === overId
          );
    
          // Move the task in the updatedTasks array
          updatedTasks = arrayMove(
            updatedTasks,
            globalActiveIndex,
            globalOverIndex
          );
        }
    
        onTasksChange(updatedTasks);
      } else if (isOverAColumn) {
        // Moving task to a column directly
        const newColumnId = overId as ColumnId;
        const tasksInNewColumn = updatedTasks.filter(
          (task) => task.columnId === newColumnId
        );
        if (tasksInNewColumn.length >= 6) {
          toast({
            title: "Warning",
            description: "You cannot add more than 6 mods to a column.",
          });
          return; // Prevent adding to a column with 6 mods
        }

        updatedTasks = updatedTasks.map((task) =>
          task.courseId === activeId ? { ...task, columnId: newColumnId.toString() } : task
        );
        onTasksChange(updatedTasks);
      }
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

      if (!isActiveATask) return;
    }
  }

import React, { useState, useCallback } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

interface DragToReorderProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  axis?: 'x' | 'y';
}

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  className?: string;
}

export function DragToReorder<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className,
  disabled = false,
  axis = 'y'
}: DragToReorderProps<T>) {
  const [isDragging, setIsDragging] = useState(false);

  const handleReorder = useCallback((newItems: T[]) => {
    if (!isDragging) {
      triggerHapticFeedback('light');
    }
    onReorder(newItems);
  }, [onReorder, isDragging]);

  if (disabled) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)}>
            {renderItem(item, index, { onPointerDown: () => {}, className: 'hidden' })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Reorder.Group
      axis={axis}
      values={items}
      onReorder={handleReorder}
      className={cn(className)}
      layoutScroll
    >
      {items.map((item, index) => (
        <ReorderItem
          key={keyExtractor(item)}
          item={item}
          index={index}
          renderItem={renderItem}
          onDragStart={() => {
            setIsDragging(true);
            triggerHapticFeedback('medium');
          }}
          onDragEnd={() => {
            setIsDragging(false);
            triggerHapticFeedback('light');
          }}
        />
      ))}
    </Reorder.Group>
  );
}

interface ReorderItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => React.ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function ReorderItem<T>({ 
  item, 
  index, 
  renderItem, 
  onDragStart, 
  onDragEnd 
}: ReorderItemProps<T>) {
  const dragControls = useDragControls();

  const dragHandleProps: DragHandleProps = {
    onPointerDown: (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragControls.start(e);
    },
    className: "cursor-grab active:cursor-grabbing touch-none"
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="list-none"
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 50
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {renderItem(item, index, dragHandleProps)}
    </Reorder.Item>
  );
}

// Drag handle component for easy use
export const DragHandle: React.FC<DragHandleProps & { className?: string }> = ({ 
  onPointerDown, 
  className 
}) => (
  <button
    type="button"
    onPointerDown={onPointerDown}
    className={cn(
      "p-1 rounded hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing touch-none",
      className
    )}
  >
    <GripVertical className="w-5 h-5 text-muted-foreground" />
  </button>
);

// Simple list reorder without framer-motion for better grid support
interface SimpleReorderProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function SimpleReorder<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className
}: SimpleReorderProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    triggerHapticFeedback('medium');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
      triggerHapticFeedback('light');
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    
    onReorder(newItems);
    triggerHapticFeedback('success');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => {
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          className={cn(
            "transition-all duration-200",
            draggedIndex === index && "opacity-50 scale-95",
            dragOverIndex === index && draggedIndex !== index && "scale-105"
          )}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default DragToReorder;

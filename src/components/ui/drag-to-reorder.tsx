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
  disabled = false
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
      axis="y"
      values={items}
      onReorder={handleReorder}
      className={cn("space-y-2", className)}
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

export default DragToReorder;

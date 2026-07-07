"use client";

import { useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function slideId(slide: string): string {
  let h = 0;
  for (let i = 0; i < slide.length; i++) {
    h = ((h << 5) - h) + slide.charCodeAt(i);
    h |= 0;
  }
  return "s" + Math.abs(h);
}

interface SortableSlideProps {
  slide: string;
  index: number;
  onEdit: (index: number, text: string) => void;
}

function SortableSlide({ slide, index, onEdit }: SortableSlideProps) {
  const id = slideId(slide);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const textRef = useRef<HTMLDivElement>(null);
  const isLocalEdit = useRef(false);

  useEffect(() => {
    if (textRef.current && !isLocalEdit.current) {
      textRef.current.textContent = slide;
    }
    isLocalEdit.current = false;
  }, [slide]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-border"
    >
      <button
        className="mt-0.5 flex shrink-0 cursor-grab touch-none items-center text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="4" cy="2" r="1.2" />
          <circle cx="8" cy="2" r="1.2" />
          <circle cx="4" cy="6" r="1.2" />
          <circle cx="8" cy="6" r="1.2" />
          <circle cx="4" cy="10" r="1.2" />
          <circle cx="8" cy="10" r="1.2" />
        </svg>
      </button>
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={() => {
          isLocalEdit.current = true;
          onEdit(index, textRef.current?.textContent || "");
        }}
        className="min-w-0 flex-1 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground outline-none"
      />
    </div>
  );
}

interface SortableSectionsProps {
  slides: string[];
  onReorder: (slides: string[]) => void;
  onEditSlide?: (index: number, text: string) => void;
}

export default function SortableSections({
  slides,
  onReorder,
  onEditSlide,
}: SortableSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => slideId(s) === active.id);
    const newIndex = slides.findIndex((s) => slideId(s) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...slides];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    onReorder(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slides.map((s) => slideId(s))}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {slides.map((slide, i) => (
            <SortableSlide
              key={i}
              slide={slide}
              index={i}
              onEdit={onEditSlide || (() => {})}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

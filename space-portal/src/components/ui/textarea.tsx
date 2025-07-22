import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { autoResize?: boolean }
>(({ className, autoResize = false, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Expose the ref
  React.useImperativeHandle(ref, () => textareaRef.current!, []);

  // Auto-resize functionality
  const adjustHeight = React.useCallback(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [autoResize]);

  // Handle input changes and resize
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      adjustHeight();
    }
    // Call the original onChange if provided
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Adjust height on mount and when value changes
  React.useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [props.value, autoResize, adjustHeight]);

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        autoResize && "resize-none overflow-hidden",
        className
      )}
      ref={textareaRef}
      onChange={handleChange}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

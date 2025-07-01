
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { TabTransition } from "./tab-transition"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      "transform-gpu duration-200 hover:scale-105",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content> & {
    tabKey?: string;
  },
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    tabKey?: string;
  }
>(({ className, tabKey, children, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    // Check if this tab is active by looking at data attributes
    const element = ref && 'current' in ref ? ref.current : null;
    if (element) {
      const observer = new MutationObserver(() => {
        const isTabActive = element.getAttribute('data-state') === 'active';
        setIsActive(isTabActive);
      });
      
      observer.observe(element, { attributes: true, attributeFilter: ['data-state'] });
      
      // Initial check
      const isTabActive = element.getAttribute('data-state') === 'active';
      setIsActive(isTabActive);
      
      return () => observer.disconnect();
    }
  }, [ref]);

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "min-h-0", // Prevent layout shifts
        className
      )}
      {...props}
    >
      <TabTransition isActive={isActive} tabKey={tabKey || props.value || 'default'}>
        {children}
      </TabTransition>
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

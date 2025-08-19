import { useEffect } from 'react';

interface ModuleScrollHandlerProps {
  children: React.ReactNode;
  moduleId?: string;
}

export const ModuleScrollHandler: React.FC<ModuleScrollHandlerProps> = ({ children, moduleId }) => {
  useEffect(() => {
    // Scroll to top when module loads
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, [moduleId]);

  return <>{children}</>;
};

export default ModuleScrollHandler;
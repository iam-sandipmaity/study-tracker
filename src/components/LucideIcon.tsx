import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const LucideIcon = ({ name, className, size = 20 }: LucideIconProps) => {
  // Try to resolve the icon by name
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback to a default BookOpen icon if name is invalid
    const Fallback = Icons.BookOpen;
    return <Fallback className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default LucideIcon;

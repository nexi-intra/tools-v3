import * as LucidIcons from 'lucide-react'; // Replace with your actual import path

// Step 1: Define the type based on the imported icons
export type LucidIconName = keyof typeof LucidIcons;

// Step 2: Define the props for your Icon component
interface IconProps {
  iconName: LucidIconName;
  className?: string;
}

// Step 3: Create the Icon component
export const Icon: React.FC<IconProps> = ({ iconName, className }) => {
  if (!iconName) return null
  const IconComponent = LucidIcons[iconName] as React.ElementType;

  // Ensure the icon exists
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" does not exist in LucidIcons.`);
    return null;
  }

  return <IconComponent className={className} />;
};

import React from 'react';
import { CloudIcon, CubeIcon, StarIcon, FolderIcon } from '../ui/Icons'; 

// Simple hash function to get a number from a string
const simpleHash = (str: string) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const ICONS = [CloudIcon, CubeIcon, StarIcon, FolderIcon];

const ProjectIcon: React.FC<{ projectId: string }> = ({ projectId }) => {
  const hash = simpleHash(projectId);
  const IconComponent = ICONS[hash % ICONS.length];

  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-200`} title="Ícone do Projeto">
      <IconComponent className="h-4 w-4 text-slate-500" />
    </div>
  );
};

export default ProjectIcon;
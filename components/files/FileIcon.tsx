
import React from 'react';
import {
  PdfIcon,
  ImageIcon,
  DocumentTextIcon,
  FileIcon as GenericFileIcon,
} from '../ui/Icons';

interface FileIconProps {
  mimeType: string;
}

const FileIcon: React.FC<FileIconProps> = ({ mimeType }) => {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-6 w-6 text-purple-500 flex-shrink-0" />;
  }
  if (mimeType === 'application/pdf') {
    return <PdfIcon className="h-6 w-6 text-red-500 flex-shrink-0" />;
  }
  if (mimeType.includes('document') || mimeType.includes('text') || mimeType.startsWith('application/msword')) {
    return <DocumentTextIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />;
  }
  return <GenericFileIcon className="h-6 w-6 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
};

export default FileIcon;

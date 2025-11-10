import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { XIcon, UploadIcon } from '../ui/Icons';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (projectId: string, file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ isOpen, onClose, onUpload }) => {
  const { projects } = useProjectContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState(projects.length > 0 ? projects[0].id : '');
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedFile && projectId) {
      onUpload(projectId, selectedFile);
      onClose();
      setSelectedFile(null);
    } else {
      alert('Por favor, selecione um arquivo e um projeto.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">Fazer Upload de Arquivo</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
             <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="project-id" className="block text-sm font-medium text-slate-700">Selecione o Projeto</label>
              <select 
                  id="project-id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 bg-white"
                  required
              >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Selecione o Arquivo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Carregue um arquivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  {selectedFile ? (
                    <p className="text-sm text-slate-800 font-semibold pt-2">{selectedFile.name}</p>
                  ) : (
                    <p className="text-xs text-slate-500">PNG, JPG, PDF, DOCX até 10MB</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <button type="submit" className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={!selectedFile}>
              Enviar Arquivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;

import React, { useState } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import FileUpload from './FileUpload';
import FileIcon from './FileIcon';
import { PlusIcon, ChevronDownIcon, DownloadIcon, TrashIcon } from '../ui/Icons';
import { Attachment, Project } from '../../types';
import Card from '../ui/Card';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ProjectFiles: React.FC<{ project: Project; onDelete: (projectId: string, fileId: string) => void }> = ({ project, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome do Arquivo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tamanho</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Última Modificação</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Ações</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {project.files.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap"><FileIcon mimeType={file.type} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{file.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatBytes(file.size)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(file.lastModified).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href={file.url} download={file.name} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-indigo-600 transition-colors inline-block" title="Download">
                                    <DownloadIcon className="h-5 w-5" />
                                </a>
                                <button onClick={() => onDelete(project.id, file.id)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-600 transition-colors" title="Excluir">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {project.files.length === 0 && (
                <p className="text-center py-8 text-slate-500">Nenhum arquivo encontrado para este projeto.</p>
             )}
        </div>
    );
};


const FilesView: React.FC = () => {
    const { projects, addFile, deleteFile } = useProjectContext();
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [openProjectId, setOpenProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);

    const handleUpload = (projectId: string, file: File) => {
        const newFile: Omit<Attachment, 'id'> = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date().toISOString(),
            url: URL.createObjectURL(file), // Mock URL for download
        };
        addFile(projectId, newFile);
        setOpenProjectId(projectId); // Open the accordion for the project where file was uploaded
    };

    const handleDelete = (projectId: string, fileId: string) => {
        if (window.confirm(`Tem certeza de que deseja excluir este arquivo?`)) {
            deleteFile(projectId, fileId);
        }
    };
    
    const toggleAccordion = (projectId: string) => {
        setOpenProjectId(prevId => (prevId === projectId ? null : projectId));
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Arquivos</h2>
                        <p className="mt-1 text-slate-600">Repositório central para todos os documentos do projeto.</p>
                    </div>
                    <button onClick={() => setUploadModalOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon className="h-4 w-4" />
                        <span>Fazer Upload</span>
                    </button>
                </div>
                <div className="space-y-3">
                    {projects.map(project => (
                        <Card key={project.id} className="p-0 overflow-hidden">
                            <button 
                                onClick={() => toggleAccordion(project.id)}
                                className="w-full flex justify-between items-center p-4 bg-white hover:bg-slate-50"
                            >
                                <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium bg-slate-200 text-slate-600 rounded-full px-2.5 py-1 mr-4">
                                        {project.files?.length || 0} arquivos
                                    </span>
                                    <ChevronDownIcon className={`h-6 w-6 text-slate-500 transition-transform ${openProjectId === project.id ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {openProjectId === project.id && (
                                <div className="border-t border-slate-200">
                                    <ProjectFiles project={project} onDelete={handleDelete} />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
            <FileUpload 
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUpload={handleUpload}
            />
        </>
    );
};

export default FilesView;

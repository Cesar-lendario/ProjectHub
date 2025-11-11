// Fix: Implemented the FilesView component.
import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { Attachment } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, DownloadIcon } from '../ui/Icons';
import FileIcon from './FileIcon';
import FileUpload from './FileUpload';

const FilesView: React.FC = () => {
    const { projects, addFile, getProjectRole, profile } = useProjectContext();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [filterProject, setFilterProject] = useState<string>('all');
    
    const allFiles = useMemo(() => {
        return projects.flatMap(p => 
            p.files.map(f => ({ ...f, projectName: p.name, projectId: p.id }))
        );
    }, [projects]);

    const filteredFiles = useMemo(() => {
        if (filterProject === 'all') return allFiles;
        return allFiles.filter(f => f.projectId === filterProject);
    }, [allFiles, filterProject]);
    
    const selectedProjectRole = getProjectRole(filterProject);
    const canUpload = profile?.role === 'admin' || selectedProjectRole === 'admin' || selectedProjectRole === 'editor';

    const handleUpload = async (projectId: string, file: File) => {
        try {
            await addFile(projectId, file);
        } catch (error) {
            console.error("Upload failed:", error);
            alert(error instanceof Error ? error.message : "Não foi possível fazer o upload do arquivo.");
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <>
            <Card>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Gerenciador de Arquivos</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">Acesse todos os documentos e anexos do projeto.</p>
                    </div>
                    {canUpload && (
                        <button onClick={() => setIsUploadOpen(true)} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                            <PlusIcon className="h-4 w-4" />
                            <span>Fazer Upload</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="project-filter" className="text-sm font-medium text-slate-700 dark:text-slate-200">Filtrar por Projeto:</label>
                    <select
                        id="project-filter"
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="block border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-50 bg-white"
                    >
                        <option value="all">Todos os Projetos</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 dark:bg-slate-700/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome do Arquivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projeto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tamanho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data de Modificação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredFiles.map(file => (
                                <tr key={file.id} className="hover:bg-slate-50 dark:bg-slate-700/30">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FileIcon mimeType={file.type} />
                                            <span className="ml-3 font-medium text-slate-800 dark:text-slate-50">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{file.projectName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(file.lastModified).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-indigo-600" title="Download">
                                            <DownloadIcon className="h-5 w-5" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredFiles.length === 0 && <p className="text-center py-10 text-slate-500 dark:text-slate-400">Nenhum arquivo encontrado.</p>}
                </div>
            </Card>

            <FileUpload 
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
        </>
    );
};

export default FilesView;
// Fix: Implemented the FilesView component.
import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { GlobalRole } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, DownloadIcon, TrashIcon } from '../ui/Icons';
import FileIcon from './FileIcon';
import FileUpload from './FileUpload';
import SuccessToast from '../ui/SuccessToast';

const FilesView: React.FC = () => {
    const { projects, addFile, deleteFile, getProjectRole, profile } = useProjectContext();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [filterProject, setFilterProject] = useState<string>('all');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<{id: string, name: string, projectId: string} | null>(null);
    
    const allFiles = useMemo(() => {
        return projects.flatMap(p => 
            p.files.map(f => ({ ...f, projectName: p.name, projectId: p.id }))
        );
    }, [projects]);

    const filteredFiles = useMemo(() => {
        if (filterProject === 'all') return allFiles;
        return allFiles.filter(f => f.projectId === filterProject);
    }, [allFiles, filterProject]);
    
    const hasEditableProject = useMemo(() => {
        if (!profile) return false;
        return projects.some(project => {
            const teamMember = project.team.find(tm => tm.user.id === profile.id);
            return teamMember?.role === 'admin' || teamMember?.role === 'editor';
        });
    }, [projects, profile]);

    const selectedProjectRole = getProjectRole(filterProject);
    const canUpload = profile?.role === GlobalRole.Admin ||
        (filterProject === 'all'
            ? hasEditableProject
            : selectedProjectRole === 'admin' || selectedProjectRole === 'editor');
    
    // Função para verificar se o usuário pode deletar um arquivo específico
    const canDeleteFile = (projectId: string) => {
        const projectRole = getProjectRole(projectId);
        return profile?.role === GlobalRole.Admin || projectRole === 'admin' || projectRole === 'editor';
    };

    const handleUpload = async (projectId: string, file: File) => {
        try {
            await addFile(projectId, file);
            setShowSuccessMessage(true);
        } catch (error) {
            console.error("Upload failed:", error);
            alert(error instanceof Error ? error.message : "Não foi possível fazer o upload do arquivo.");
        }
    };

    const handleDeleteClick = (fileId: string, fileName: string, projectId: string) => {
        setFileToDelete({ id: fileId, name: fileName, projectId });
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;
        
        try {
            await deleteFile(fileToDelete.id, fileToDelete.projectId);
            setFileToDelete(null);
            setShowSuccessMessage(true);
        } catch (error) {
            console.error("Delete failed:", error);
            alert(error instanceof Error ? error.message : "Não foi possível excluir o arquivo.");
        }
    };

    const handleCancelDelete = () => {
        setFileToDelete(null);
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
            {/* Notificação de Sucesso */}
            <SuccessToast 
                message="Operação realizada com sucesso!"
                isVisible={showSuccessMessage}
                onClose={() => setShowSuccessMessage(false)}
                duration={3000}
            />

            {/* Modal de Confirmação de Exclusão */}
            {fileToDelete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Confirmar Exclusão</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Esta ação não pode ser desfeita.</p>
                                </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 mb-6">
                                Deseja realmente excluir o arquivo <span className="font-semibold">"{fileToDelete.name}"</span>?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Excluir Arquivo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        className="block border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 dark:border-slate-600 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors"
                    >
                        <option value="all">Todos os Projetos</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Nome do Arquivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Projeto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Tamanho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Data de Modificação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-200 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredFiles.map(file => (
                                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FileIcon mimeType={file.type} />
                                            <span className="ml-3 font-medium text-slate-800 dark:text-white">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-100">{file.projectName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-100">{formatBytes(file.size)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-100">{new Date(file.lastModified).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Download">
                                                <DownloadIcon className="h-5 w-5" />
                                            </a>
                                            {canDeleteFile(file.projectId) && (
                                                <button 
                                                    onClick={() => handleDeleteClick(file.id, file.name, file.projectId)}
                                                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                                    title="Excluir"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
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
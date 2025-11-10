import React from 'react';
import { Project, Task, TaskStatus } from '../../types';
import Card from '../ui/Card';
import CriticalPathDisplay from './CriticalPathDisplay';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
  return (
    <Card className="mb-3 p-3">
      <h4 className="font-semibold text-slate-800 text-sm">{task.name}</h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          {task.assignee && (
            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOverdue ? 'text-red-700 bg-red-100' : 'text-slate-600 bg-slate-100'}`}>
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

const ProjectDetail: React.FC<{ project: Project }> = ({ project }) => {
  const columns: TaskStatus[] = [TaskStatus.Pending, TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Pending: return 'bg-purple-200';
        case TaskStatus.ToDo: return 'bg-slate-200';
        case TaskStatus.InProgress: return 'bg-yellow-200';
        case TaskStatus.Done: return 'bg-green-200';
    }
  }

  return (
    <div className="space-y-6">
       <CriticalPathDisplay project={project} />

       {(project.clientName || project.clientEmail) && (
           <Card>
               <h3 className="text-xl font-bold text-slate-800 mb-4">Informações de Contato</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                       <p className="font-semibold text-slate-500">Nome do Contato</p>
                       <p className="text-slate-800">{project.clientName || 'Não informado'}</p>
                   </div>
                   <div>
                       <p className="font-semibold text-slate-500">Email de Contato</p>
                       {project.clientEmail ? (
                         <a href={`mailto:${project.clientEmail}`} className="text-indigo-600 hover:underline">
                           {project.clientEmail}
                         </a>
                       ) : (
                         <p className="text-slate-800">Não informado</p>
                       )}
                   </div>
               </div>
           </Card>
       )}
       
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Quadro de Tarefas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(status => (
              <div key={status} className="bg-slate-100 rounded-lg p-3">
                <div className="flex items-center mb-4">
                    <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></span>
                    <h4 className="font-semibold text-slate-700">{status}</h4>
                    <span className="ml-auto text-sm font-medium bg-white text-slate-600 rounded-full px-2 py-0.5">
                        {project.tasks.filter(t => t.status === status).length}
                    </span>
                </div>
                <div>
                  {project.tasks
                    .filter(task => task.status === status)
                    .map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default ProjectDetail;
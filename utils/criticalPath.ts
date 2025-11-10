
import { Task, CriticalPathResult } from '../types';

export const calculateCriticalPath = (tasks: Task[]): CriticalPathResult => {
  if (tasks.length === 0) {
    return { path: [], duration: 0 };
  }

  const taskMap = new Map(tasks.map(task => [task.id, task]));
  const adj: { [key: string]: string[] } = {};
  const inDegree: { [key: string]: number } = {};
  
  tasks.forEach(task => {
    adj[task.id] = [];
    inDegree[task.id] = 0;
  });

  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      if (taskMap.has(depId)) {
        adj[depId].push(task.id);
        inDegree[task.id]++;
      }
    });
  });

  const queue = tasks.filter(task => inDegree[task.id] === 0).map(task => task.id);
  const topologicalOrder: string[] = [];
  
  while (queue.length > 0) {
    const u = queue.shift()!;
    topologicalOrder.push(u);
    adj[u]?.forEach(v => {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    });
  }

  const dist: { [key: string]: number } = {};
  const parent: { [key: string]: string | null } = {};
  
  tasks.forEach(task => {
    dist[task.id] = 0;
    parent[task.id] = null;
  });

  tasks.filter(t => t.dependencies.length === 0).forEach(t => {
      dist[t.id] = t.duration;
  });

  topologicalOrder.forEach(u => {
    const uTask = taskMap.get(u)!;
    adj[u]?.forEach(v => {
      const vTask = taskMap.get(v)!;
      if (dist[v] < dist[u] + vTask.duration) {
        dist[v] = dist[u] + vTask.duration;
        parent[v] = u;
      }
    });
  });

  let maxDuration = 0;
  let endNode: string | null = null;
  
  Object.entries(dist).forEach(([taskId, duration]) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      endNode = taskId;
    }
  });

  if (!endNode) {
    const lastTask = topologicalOrder[topologicalOrder.length - 1];
    if (lastTask) {
        endNode = lastTask;
        maxDuration = dist[lastTask];
    } else {
        return { path: [], duration: 0 };
    }
  }

  const path: string[] = [];
  let currentNode: string | null = endNode;
  while (currentNode) {
    path.unshift(currentNode);
    currentNode = parent[currentNode];
  }

  return { path, duration: maxDuration };
};

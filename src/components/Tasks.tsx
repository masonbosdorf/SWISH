
import React from 'react';
import { Task } from '../types';
import { User, Calendar, Plus, CheckCircle } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Tasks: React.FC<TasksProps> = ({ tasks, setTasks }) => {
  const toggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: any = t.status === 'Open' ? 'In Progress' : t.status === 'In Progress' ? 'Complete' : 'Open';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const groupedTasks = {
    'Open': tasks.filter(t => t.status === 'Open'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Complete': tasks.filter(t => t.status === 'Complete'),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Tasks</h2>
          <p className="text-zinc-500 text-sm">Organize warehouse jobs and shift handovers.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['Open', 'In Progress', 'Complete'] as const).map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'Open' ? 'bg-zinc-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}></span>
                <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-widest">{status}</h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                {groupedTasks[status].length}
              </span>
            </div>

            <div className="space-y-4">
              {groupedTasks[status].map(task => (
                <div
                  key={task.id}
                  className={`bg-[#111112] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all group relative ${task.status === 'Complete' ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="font-bold text-sm leading-tight">{task.title}</h4>
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'Complete' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700 text-zinc-700 hover:border-blue-500'
                        }`}
                    >
                      {task.status === 'Complete' && <CheckCircle size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-6">{task.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <User size={12} />
                      </div>
                      <span className="font-medium truncate max-w-[80px]">{task.assignedTo.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 uppercase">
                      <Calendar size={12} />
                      <span>{task.due.split('-').slice(1).join('/')}</span>
                    </div>
                  </div>
                </div>
              ))}

              {groupedTasks[status].length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                  <p className="text-xs text-zinc-700 font-bold uppercase tracking-wider">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;

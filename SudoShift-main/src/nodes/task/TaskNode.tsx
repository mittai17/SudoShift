import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Task', accentColor: '#22c55e', icon: '✅',
  fields: [
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Todo', 'In Progress', 'Blocked', 'Done'] },
  ],
});

import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Project Task', accentColor: '#6366f1', icon: '✅',
  fields: [{ key: 'status', label: 'Status', type: 'select', options: ['Todo', 'In Progress', 'Review', 'Done'] }],
});

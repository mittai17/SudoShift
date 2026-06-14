import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Project', accentColor: '#050524', icon: '📦',
  fields: [
    { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
  ],
});

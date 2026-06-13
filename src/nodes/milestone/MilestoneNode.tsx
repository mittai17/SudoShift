import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Milestone', accentColor: '#ef4444', icon: '🚩',
  fields: [
    { key: 'status', label: 'Status', type: 'select', options: ['Upcoming', 'Achieved', 'Missed'] },
  ],
});

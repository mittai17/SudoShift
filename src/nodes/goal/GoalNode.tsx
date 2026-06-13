import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Goal',
  accentColor: '#f59e0b',
  icon: '🎯',
  fields: [
    { key: 'why', label: 'Why this goal?', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Achieved', 'Abandoned'] },
  ],
});

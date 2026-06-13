import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Resource', accentColor: '#8b5cf6', icon: '📚',
  fields: [
    { key: 'type', label: 'Type', type: 'select', options: ['Book', 'Course', 'Article', 'Video', 'Podcast', 'Tool', 'Other'] },
    { key: 'status', label: 'Status', type: 'select', options: ['To Read', 'In Progress', 'Completed', 'Archived'] },
  ],
});

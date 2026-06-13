import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Event', accentColor: '#0ea5e9', icon: '📅',
  fields: [
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'type', label: 'Type', type: 'select', options: ['Meeting', 'Workshop', 'Conference', 'Social', 'Other'] },
  ],
});

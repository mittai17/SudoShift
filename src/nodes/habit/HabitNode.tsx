import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({
  label: 'Habit', accentColor: '#f97316', icon: '🔥',
  fields: [
    { key: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Weekdays', 'Weekends', 'Custom'] },
    { key: 'streak', label: 'Current Streak', type: 'text' },
  ],
});

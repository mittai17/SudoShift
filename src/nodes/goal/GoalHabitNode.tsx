import { createPrimaryNode } from '../shared/BasePrimaryNode';
export default createPrimaryNode({ label: 'Goal Habit', accentColor: '#f59e0b', icon: '🔥',
  fields: [{ key: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'] }],
});

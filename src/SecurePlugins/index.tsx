import { IPlugin } from 'remote/types';

// Import and re-export all individual plugin components
export { todoPlugin } from './todoPlugin';
export { notePlugin } from './notePlugin';
export { weatherPlugin } from './weatherPlugin';
export { habitTrackerPlugin } from './habitTrackerPlugin';
export { calendarPlugin } from './calendarPlugin';
export { progressPlugin } from './progressPlugin';
export { interactivePlugin } from './interactivePlugin';

import { calendarPlugin } from './calendarPlugin';
import { habitTrackerPlugin } from './habitTrackerPlugin';
import { interactivePlugin } from './interactivePlugin';
import { notePlugin } from './notePlugin';
import { progressPlugin } from './progressPlugin';
// Import plugins for the default export array
import { todoPlugin } from './todoPlugin';
import { weatherPlugin } from './weatherPlugin';

const samplePlugins: IPlugin[] = [
  todoPlugin,
  notePlugin,
  weatherPlugin,
  habitTrackerPlugin,
  calendarPlugin,
  progressPlugin,
  interactivePlugin,
];

export default samplePlugins;

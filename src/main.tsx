import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { loadSkills } from './data/skills.ts';

const root = createRoot(document.getElementById('root')!);

// Load skills before rendering
loadSkills().then(() => {
	root.render(<App />);
});

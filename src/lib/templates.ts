export interface Template {
  key: string;
  name: string;
  description: string;
  code: string;
  files: Array<{ name: string; content: string }>;
}

export const TEMPLATES: Record<string, Template> = {
  'pushplay-live': {
    key: 'pushplay-live',
    name: 'PushPlay Live Starter',
    description: 'High-fidelity video streaming template with comments and economy.',
    code: `// Starter workspace code
export const initialVideos = [];
`,
    files: [
      { name: 'metadata.json', content: '{"name": "PushPlay Live", "theme": "dark"}' },
      { name: 'src/data.ts', content: 'export const initialVideos = [];' }
    ]
  },
  'blank': {
    key: 'blank',
    name: 'Blank App',
    description: 'Empty starter canvas with minimal code structure.',
    code: `// Blank app entry`,
    files: [
      { name: 'metadata.json', content: '{"name": "Blank App"}' }
    ]
  }
};

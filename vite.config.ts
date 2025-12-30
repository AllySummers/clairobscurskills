import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.json'],
	esbuild: {
		target: 'esnext', // Modern ES for dev transforms
	},
	build: {
		target: 'esnext', // Modern ES output (no polyfills)
		modulePreload: { polyfill: false }, // Disable modulepreload polyfill
		minify: false, // Don't minify JS
		cssMinify: false, // Don't minify CSS
		cssCodeSplit: false, // Output single CSS file
		rollupOptions: {
			external: (id) =>
				id === 'react' ||
				id === 'react-dom' ||
				id === 'react-dom/client' ||
				id === 'react/jsx-runtime' ||
				id === '@floating-ui/react' ||
				id.startsWith('react/') ||
				id.startsWith('react-dom/'),
			output: {
				format: 'es', // ESM output
				compact: false, // Don't compact output
				// Pretty formatting
				indent: '\t',
				// Don't use globals for ESM - imports will be preserved
				paths: {
					react: 'react',
					'react-dom': 'react-dom',
					'react-dom/client': 'react-dom/client',
					'react/jsx-runtime': 'react/jsx-runtime',
					'@floating-ui/react': '@floating-ui/react',
				},
				// Emit skills.json with stable name (no hash) for better caching
				assetFileNames: (assetInfo) => {
					if (assetInfo.names.some((name) => name.includes('skills.json'))) {
						return 'skills.json';
					}
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
	},
});

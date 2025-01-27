import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
	build: {
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			input: 'index.html',
		},
	},
	server: {
		port: 8000,
	},
	preview: {
		port: 8000,
	},
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});

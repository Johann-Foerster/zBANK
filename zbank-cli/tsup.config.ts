import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.tsx'],
	format: ['esm'],
	target: 'node18',
	shims: true,
	clean: true,
	// No banner needed - source file already has #!/usr/bin/env node
});

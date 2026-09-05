import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve(process.cwd(), 'dist');
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(resolve(process.cwd(), 'index.html'), resolve(outputDirectory, 'index.html'));
await cp(resolve(process.cwd(), 'js'), resolve(outputDirectory, 'js'), { recursive: true });

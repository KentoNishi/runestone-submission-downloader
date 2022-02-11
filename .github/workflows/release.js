import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const pathname = join(resolve(), '/manifest.json');
const manifest = JSON.parse(readFileSync(pathname, 'utf8'));
manifest.version = process.env.EXT_VERSION;
writeFileSync(pathname, JSON.stringify(manifest, null, 2), 'utf8');

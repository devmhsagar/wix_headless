import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import * as formsPkg from '@wix/forms';
import fs from 'fs';
import path from 'path';

console.log('Inspecting @wix/forms types and definitions...');

function search(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      search(full);
    } else if (item.endsWith('.d.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('namespace') && (line.includes('wix.') || line.includes('Namespace'))) {
          console.log(item + ':', line.trim());
        }
      }
    }
  }
}

search('node_modules/@wix/forms');

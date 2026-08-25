import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(join(root, 'public/images/logo.svg'), 'utf8');
const nested = logo
    .replace(/<\?xml[^>]*>/, '')
    .replace(/\swidth="74"/, ' width="352"')
    .replace(/\sheight="44"/, ' height="210"')
    .replace('<svg ', '<svg x="80" y="151" ');

const square = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FFFBF6"/>
  ${nested}
</svg>`;

const outDir = join(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

for (const size of [180, 192, 512]) {
    const png = new Resvg(square, { fitTo: { mode: 'width', value: size } }).render().asPng();
    writeFileSync(join(outDir, `icon-${size}.png`), png);
}

writeFileSync(join(root, 'src/app/icon.png'), readFileSync(join(outDir, 'icon-192.png')));
writeFileSync(join(root, 'src/app/apple-icon.png'), readFileSync(join(outDir, 'icon-180.png')));
console.log('wrote public/icons/icon-{180,192,512}.png, app/icon.png, app/apple-icon.png');

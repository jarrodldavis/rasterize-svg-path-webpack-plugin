const fs = require('fs');
const path = require('path');
const util = require('util');

const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const sharp = require('sharp');

const readFile = util.promisify(fs.readFile);

before('pre-warm sharp', async function() {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>');
  await sharp(svg).png().toBuffer({ resolveWithObject: false });
});

before('pre-warm pngjs (sync)', function() {
  const file = fs.readFileSync(path.join(__dirname, './reference-images/stroke-only.png'));
  PNG.sync.read(file);
});

before('pre-warm pngjs (async) + pixelmatch', async function() {
  const file = await readFile(path.join(__dirname, './reference-images/stroke-only.png'));
  const png = new PNG();
  const parse = util.promisify(png.parse.bind(png));
  await parse(file);
  pixelmatch(png.data, png.data, null, png.width, png.height);
});

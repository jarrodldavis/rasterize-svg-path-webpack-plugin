const fs = require('fs')
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const Rasterizer = require('../rasterizer');
const { mdiCheckCircle } = require('@mdi/js');

const INPUT_WIDTH = 24;
const INPUT_HEIGHT = 24;
const STROKE_COLOR = 'green';
const FILL_COLOR = 'red';
const OUTPUT_WIDTH = 96;
const OUTPUT_HEIGHT = 96;

describe('Rasterizer', function() {
  describe('png', function() {
    it('renders correctly with stroke color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/stroke-only.png'));

      const rasterizer = new Rasterizer(mdiCheckCircle, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, null);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });

    it('renders correctly with fill color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/fill-only.png'));

      const rasterizer = new Rasterizer(mdiCheckCircle, INPUT_WIDTH, INPUT_HEIGHT, null, FILL_COLOR);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });

    it('renders correctly with fill and stroke color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/stroke-and-fill.png'));

      const rasterizer = new Rasterizer(mdiCheckCircle, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });
  });
})

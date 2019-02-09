const fs = require('fs')
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const Rasterizer = require('../rasterizer');

const {
  INPUT_WIDTH,
  INPUT_HEIGHT,
  INPUT_PATH,
  STROKE_COLOR,
  FILL_COLOR,
  OUTPUT_WIDTH,
  OUTPUT_HEIGHT
} = require('./_constants');

describe('Rasterizer', function() {
  describe('png', function() {
    it('renders correctly with stroke color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/stroke-only-96.png'));

      const rasterizer = new Rasterizer(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, null);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });

    it('renders correctly with fill color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/fill-only-96.png'));

      const rasterizer = new Rasterizer(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, null, FILL_COLOR);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });

    it('renders correctly with fill and stroke color', async function() {
      const expected = await readFile(path.join(__dirname, './reference-images/stroke-and-fill-96.png'));

      const rasterizer = new Rasterizer(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR);
      const actual = await rasterizer.rasterize('png', OUTPUT_WIDTH, OUTPUT_HEIGHT);

      actual.should.pixelmatch(expected);
    });
  });
})

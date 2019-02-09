const fs = require('fs');
const path = require('path');
const util = require('util');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const { errorFromList } = require('verror')

const RasterizeSvgPathWebpackPlugin = require('../');

const {
  INPUT_WIDTH,
  INPUT_HEIGHT,
  INPUT_PATH,
  STROKE_COLOR,
  FILL_COLOR,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH
} = require('./_constants');

const readFile = util.promisify(fs.readFile);

describe('integration', function() {
  this.slow(500);

  let config;
  let inputfs;
  let outputfs;

  beforeEach(function() {
    config = {
      mode: 'development',
      context: '/app',
      entry: './app.js',
      output: {
        path: '/dist',
        filename: 'app.js'
      },
      plugins: []
    }

    inputfs = new MemoryFS({
      app: {
        '': true, // folder
        'app.js': Buffer.from(`console.log("Hello, World!");`)
      }
    });

    outputfs = new MemoryFS();
  });

  async function run() {
    const compiler = webpack(config);
    compiler.inputFileSystem = inputfs;
    compiler.outputFileSystem = outputfs;

    const run = util.promisify(compiler.run.bind(compiler));
    const stats = await run();

    if (stats.hasErrors()) {
      throw errorFromList(stats.compilation.errors);
    }

    return stats;
  }

  it('test harness works', async function() {
    await run();
  });

  it('emits single output file', async function() {
    const reference = await readFile(path.join(__dirname, './reference-images/stroke-and-fill-96.png'));

    const filePath = 'images/icon-96.png';

    config.plugins.push(
      new RasterizeSvgPathWebpackPlugin(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR, [
        { filePath, format: 'png', width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }
      ])
    );

    await run();

    outputfs.should.have.file(path.join(config.output.path, filePath))
            .which.pixelmatches(reference);
  });
});

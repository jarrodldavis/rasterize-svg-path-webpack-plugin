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
  FILL_COLOR
} = require('./_constants');

const OUTPUT_FORMAT = 'png';

const REFERENCE_PATH_48 = path.join(__dirname, './reference-images/stroke-and-fill-48.png');
const OUTPUT_PATH_48 = 'images/icon-48.png';
const OUTPUT_WIDTH_48 = 48;
const OUTPUT_HEIGHT_48 = 48;

const REFERENCE_PATH_96 = path.join(__dirname, './reference-images/stroke-and-fill-96.png');
const OUTPUT_PATH_96 = 'images/icon-96.png';
const OUTPUT_WIDTH_96 = 96;
const OUTPUT_HEIGHT_96 = 96;

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
    const reference = await readFile(REFERENCE_PATH_96);

    config.plugins.push(
      new RasterizeSvgPathWebpackPlugin(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR, [
        { filePath: OUTPUT_PATH_96, format: OUTPUT_FORMAT, width: OUTPUT_WIDTH_96, height: OUTPUT_HEIGHT_96 }
      ])
    );

    await run();

    outputfs.should.have.file(path.join(config.output.path, OUTPUT_PATH_96))
            .which.pixelmatches(reference);
  });

  it('emits multiple output files', async function() {
    const reference48 = await readFile(REFERENCE_PATH_48);
    const reference96 = await readFile(REFERENCE_PATH_96);

    config.plugins.push(
      new RasterizeSvgPathWebpackPlugin(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR, [
        { filePath: OUTPUT_PATH_48, format: OUTPUT_FORMAT, width: OUTPUT_WIDTH_48, height: OUTPUT_HEIGHT_48 },
        { filePath: OUTPUT_PATH_96, format: OUTPUT_FORMAT, width: OUTPUT_WIDTH_96, height: OUTPUT_HEIGHT_96 }
      ])
    );

    await run();

    outputfs.should.have.file(path.join(config.output.path, OUTPUT_PATH_48))
            .which.pixelmatches(reference48);

    outputfs.should.have.file(path.join(config.output.path, OUTPUT_PATH_96))
            .which.pixelmatches(reference96);
  });
});

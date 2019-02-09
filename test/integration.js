const util = require('util');

const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const { errorFromList } = require('verror')

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
});

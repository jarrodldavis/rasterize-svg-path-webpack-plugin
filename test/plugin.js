const path = require('path');

const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();
const webpack = require('webpack');

const Rasterizer = require('../rasterizer');
const RasterImageWebpackAsset = require('../asset');

const {
  INPUT_WIDTH,
  INPUT_HEIGHT,
  INPUT_PATH,
  STROKE_COLOR,
  FILL_COLOR
} = require('./_constants');

const OUTPUT = {
  filePath: 'images/icon-128.png',
  format: 'png',
  width: 128,
  height: 128
};

const WEBPACK_CONFIG = {
  context: path.join(__dirname, './app-fixture'),
  entry: './app.js',
  output: {
    path: path.join(__dirname, './app-fixture-dist')
  }
};

describe('webpack plugin', function() {
  let rasterizeBuffer;
  let RasterizeSvgPathWebpackPlugin;
  let stubRasterizer;

  beforeEach(function() {
    rasterizeBuffer = Buffer.from([]);
    stubRasterizer = sinon.createStubInstance(Rasterizer);
    stubRasterizer.rasterize.returns(rasterizeBuffer);

    RasterizeSvgPathWebpackPlugin = proxyquire('../', {
      './rasterizer': function MockRasterizer() {
        return stubRasterizer;
      }
    });
  });

  it('taps into compiler emit hook', function() {
    const compiler = {
      hooks: {
        emit: {
          tapPromise: sinon.spy()
        }
      }
    }

    const plugin = new RasterizeSvgPathWebpackPlugin(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR, [OUTPUT]);
    plugin.apply(compiler);

    compiler.hooks.emit.tapPromise
            .should.have.been.calledOnce()
            .and.calledWithMatch(plugin.constructor.name, sinon.match.func);
  });

  it('adds output buffer asset to compilation', async function() {
    const compilation = {
      assets: {}
    };

    const plugin = new RasterizeSvgPathWebpackPlugin(INPUT_PATH, INPUT_WIDTH, INPUT_HEIGHT, STROKE_COLOR, FILL_COLOR, [OUTPUT]);
    await plugin.emit(compilation);

    stubRasterizer.rasterize.should.have.been.calledOnce()
                            .and.calledWithExactly(OUTPUT.format, OUTPUT.width, OUTPUT.height);

    compilation.assets
               .should.have.a.property(OUTPUT.filePath)
               .which.is.an.instanceof(RasterImageWebpackAsset)
               .and.has.a.property('buffer')
               .which.is.exactly(rasterizeBuffer);
  });
})

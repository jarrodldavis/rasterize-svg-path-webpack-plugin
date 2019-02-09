const Rasterizer = require('./rasterizer');
const RasterImageWebpackAsset = require('./asset');

/**
 * @typedef { 'png' | 'jpeg' | 'webp' | 'tiff' } RasterizeFormat A raster graphics (bitmap) image format.
 */

/**
 * @typedef {Object} RasterizeOutput An SVG rasterization output rule.
 * @property {string} filePath The file path the image will be written to, relative to the webpack output path.
 * @property {RasterizeFormat} format The bitmap format to render to.
 * @property {number} width The width of the image to render.
 * @property {number} height The height of the image to render.
 */

/**
 * A webpack plugin that rasterizes a given SVG path to one or more bitmap output images.
 * 
 * @property {Rasterizer} rasterizer The SVG rasterizer
 * @property {RasterizeOutput[]} outputs The outputs
 */
module.exports = class RasterizeSvgPathWebpackPlugin {
  /**
   * Creates a new SVG rasterization plugin using the given input data and output rules.
   * 
   * @param {string} pathData The SVG path data that will be rasterized
   * @param {number} inputWidth The natural width of the path
   * @param {number} inputHeight The natural height of the path
   * @param {string | null} strokeColor Any valid CSS color value to be used for the path's stroke
   * @param {string | null} fillColor Any valid CSS color value to be used for the path's fill
   * @param {RasterizeOutput[]} outputs The outputs
   */
  constructor(pathData, inputWidth, inputHeight, strokeColor, fillColor, outputs) {
    this.rasterizer = new Rasterizer(pathData, inputWidth, inputHeight, strokeColor, fillColor);
    this.outputs = outputs;
  }

  /**
   * Hooks into the given compiler's `emit` hook.
   * @param {import('webpack').Compiler} compiler The webpack compiler.
   */
  apply(compiler) {
    compiler.hooks.emit.tapPromise(this.constructor.name, this.emit.bind(this));
  }

  /**
   * Emits raster image assets to the given compilation by rasterizing an SVG path using raster output rules.
   * @param {import('webpack').compilation.Compilation} compilation The in-progress compilation to emit to.
   */
  async emit(compilation) {
    for (const outputRule of this.outputs) {
      const buffer = await this.rasterizer.rasterize(outputRule.format, outputRule.width, outputRule.height);
      compilation.assets[outputRule.filePath] = new RasterImageWebpackAsset(buffer);
    }
  }
}

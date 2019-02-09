const sharp = require('sharp');

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
  * A webpack asset that contains a raster graphics (bitmap) image.
  * @extends {import('webpack').compilation.Asset}
  * @property {Buffer} buffer A buffer that contains the contents of a raster image file.
  */
class RasterImageWebpackAsset {
  /**
   * Creates a webpack asset that contains a raster graphics (bitmap) image file.
   * @param {Buffer} buffer A buffer that contains the contents of a raster image file.
   */
  constructor(buffer) {
    this.buffer = buffer;
  }

  size() {
    return this.buffer.byteLength;
  }

  source() {
    return this.buffer;
  }
}

/**
 * A webpack plugin that rasterizes a given SVG path to one or more bitmap output images.
 * 
 * @property {string} pathData The SVG path data that will be rasterized
 * @property {number} inputWidth The natural width of the path
 * @property {number} inputHeight The natural height of the path
 * @property {string | null} strokeColor Any valid CSS color value to be used for the path's stroke
 * @property {string | null} fillColor Any valid CSS color value to be used for the path's fill
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
    this.pathData = pathData;
    this.inputWidth = inputWidth;
    this.inputHeight = inputHeight;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
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
   * Generates an SVG document by scaling {@link RasterizeSvgPathWebpackPlugin#pathData} to the given output dimensions
   * and applying {@link RasterizeSvgPathWebpackPlugin#strokeColor} and {@link RasterizeSvgPathWebpackPlugin#fillColor}.
   * @private
   * @param {number} outputWidth The width to scale the path to
   * @param {number} outputHeight The height to scale the path to.
   * @return {string} The generated SVG document.
   */
  generateSvg(outputWidth, outputHeight) {
    const widthScaleFactor = outputWidth / this.inputWidth;
    const heightScaleFactor = outputHeight / this.inputHeight;

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}">
  <path d="${this.pathData}"
        stroke="${this.strokeColor}"
        fill="${this.fillColor}"
        transform="scale(${widthScaleFactor} ${heightScaleFactor})" />
</svg>`
  }

  /**
   * Rasterizes a given SVG document to the given bitmap format.
   * @private
   * @param {string} svg An SVG document (i.e. as created by {@link RasterizeSvgPathWebpackPlugin#generateSvg}).
   * @param {RasterizeFormat} format The bitmap format to render to.
   * @return {Buffer} The rasterized bitmap graphic.
   */
  async rasterize(svg, format) {
    let image = sharp(Buffer.from(svg));

    switch (format) {
      case 'jpeg':
        image = image.jpeg();
        break;
      case 'png':
        image = image.png();
        break;
      case 'tiff':
        image = image.tiff();
        break;
      case 'webp':
        image = image.webp();
      default:
        throw new Error(`Unexpected output format '${format}'.`);
    }

    return await image.toBuffer({ resolveWithObject: false });
  }

  /**
   * Emits raster image assets to the given compilation by rasterizing an SVG path using raster output rules.
   * @param {import('webpack').compilation.Compilation} compilation The in-progress compilation to emit to.
   */
  async emit(compilation) {
    for (const outputRule of this.outputs) {
      const svg = this.generateSvg(outputRule.width, outputRule.height);
      const buffer = await this.rasterize(svg, outputRule.format);
      compilation.assets[outputRule.filePath] = new RasterImageWebpackAsset(buffer);
    }
  }
}

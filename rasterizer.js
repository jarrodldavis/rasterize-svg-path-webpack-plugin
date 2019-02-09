const sharp = require('sharp');

/**
 * @typedef { 'png' | 'jpeg' | 'webp' | 'tiff' } RasterizeFormat A raster graphics (bitmap) image format.
 */

module.exports = class Rasterizer {
  /**
   * @param {string} pathData The SVG path data that will be rasterized
   * @param {number} inputWidth The natural width of the path
   * @param {number} inputHeight The natural height of the path
   * @param {string | null} strokeColor Any valid CSS color value to be used for the path's stroke
   * @param {string | null} fillColor Any valid CSS color value to be used for the path's fill
   */
  constructor(pathData, inputWidth, inputHeight, strokeColor, fillColor) {
    this.pathData = pathData;
    this.inputWidth = inputWidth;
    this.inputHeight = inputHeight;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
  }

  /**
   * Rasterizes the path to the given format scaled to the given dimensions.
   * @public
   * @param {RasterizeFormat} format The bitmap format to render to.
   * @param {number} outputWidth The width to scale the path to.
   * @param {number} outputHeight The height to scale the path to.
   * @return {Buffer} The rasterized image.
   */
  async rasterize(format, outputWidth, outputHeight) {
    const svg = this.generateSvg(outputWidth, outputHeight);
    return await this.generateBitmap(svg, format);
  }

  /**
   * Generates an SVG document by scaling {@link Rasterizer#pathData} to the given output dimensions
   * and applying {@link Rasterizer#strokeColor} and {@link Rasterizer#fillColor}.
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
  async generateBitmap(svg, format) {
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
}

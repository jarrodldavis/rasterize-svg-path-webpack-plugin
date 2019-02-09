
 /**
  * A webpack asset that contains a raster graphics (bitmap) image.
  * @extends {import('webpack').compilation.Asset}
  * @property {Buffer} buffer A buffer that contains the contents of a raster image file.
  */
module.exports = class RasterImageWebpackAsset {
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

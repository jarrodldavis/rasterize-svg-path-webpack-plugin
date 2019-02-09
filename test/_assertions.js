const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

function pngDescription(png) {
  return `<png ${png.width} x ${png.height}, ${png.gamma} gamma, ${png.data.byteLength} bytes>`;
}

should.use(function(should, Assertion) {
  Assertion.add('pixelmatch', function(reference) {
    if (!(reference instanceof Buffer)) {
      throw new TypeError(`Reference image '${reference}' is not a Buffer.`);
    }
    let expected;
    try {
      expected = PNG.sync.read(reference);
    } catch(error) {
      throw new TypeError(`Reference image is not a PNG file: ${error}`);
    }

    this.obj.should.be.an.instanceof(Buffer);
    let actual;
    try {
      actual = PNG.sync.read(this.obj);
    } catch(error) {
      this.params = { operator: 'to be a PNG file' };
      throw new should.AssertionError({ message: error.message });
    }

    this.params = {
      operator: 'to visually match',
      obj: pngDescription(actual),
      expected: pngDescription(expected)
    };

    const { width, height } = expected;
    actual.width.should.equal(width, 'Image widths should match.');
    actual.height.should.equal(height, 'Image heights should match.');

    let mismatchedPixelCount = pixelmatch(actual.data, expected.data, null, width, height, { threshold: 0.15 });
    mismatchedPixelCount.should.equal(0, 'All pixels should match.');
  });
});

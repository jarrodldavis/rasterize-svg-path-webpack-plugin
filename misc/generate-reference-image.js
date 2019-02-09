function generate(path, scale,
                  fillColor = 'red', strokeColor = 'green',
                  inputHeight = 24, inputWidth = 24,
                  outputFormat = 'image/png') {

  const canvas = document.createElement('canvas');
  canvas.width = inputHeight * scale;
  canvas.height = inputWidth * scale;

  const context = canvas.getContext('2d');
  context.setTransform(scale, 0, 0, scale, 0, 0);

  if (fillColor) {
    context.fillStyle = fillColor;
    context.fill(new Path2D(path));
  }

  if (strokeColor) {
    context.strokeStyle = strokeColor;
    context.stroke(new Path2D(path));
  }

  return canvas.toDataURL(outputFormat);
}

const csv = require('csvtojson');
const tf = require('@tensorflow/tfjs-node');

async function preprocessData(filePath) {
  const jsonArray = await csv().fromFile(filePath);

  const features = jsonArray.map(row => [Number(row.area)]);
  const labels = jsonArray.map(row => Number(row.price));

  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  // 标准化特征
  const meanAndVariance = tf.moments(xs, 0);
  const normalizedXs = xs.sub(meanAndVariance.mean).div(tf.sqrt(meanAndVariance.variance));

  return {
    xs: normalizedXs,
    ys,
    originalXs: xs,
    mean: meanAndVariance.mean,
    variance: meanAndVariance.variance
  };
}

module.exports = { preprocessData };
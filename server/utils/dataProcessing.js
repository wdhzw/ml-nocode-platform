const csv = require('csvtojson');
const tf = require('@tensorflow/tfjs-node');

async function preprocessData(filePath) {
  const jsonArray = await csv().fromFile(filePath);

  // 假设最后一列是目标变量，其他都是特征
  const features = jsonArray.map(row => Object.values(row).slice(0, -1).map(Number));
  const labels = jsonArray.map(row => Number(Object.values(row).slice(-1)[0]));

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
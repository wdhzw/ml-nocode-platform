const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const { preprocessData } = require('../utils/dataProcessing');
const path = require('path');

const router = express.Router();

router.post('/train', async (req, res) => {
  const { model: modelType, config, dataFile } = req.body;
  
  try {
    const filePath = path.join(__dirname, '..', 'uploads', dataFile);
    const { xs, ys } = await preprocessData(filePath);

    // 使用用户定义的学习率，如果未定义则使用默认值
    const learningRate = config.learningRate ? parseFloat(config.learningRate) : 0.1;
    
    // 使用用户定义的迭代次数，如果未定义则使用默认值
    const epochs = config.iterations ? parseInt(config.iterations) : 100;

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({ 
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError'
    });

    const history = await model.fit(xs, ys, {
      epochs: epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}, val_loss = ${logs.val_loss}`);
        }
      }
    });

    // 使用训练数据进行预测
    const predictions = model.predict(xs);

    // 计算 R-squared
    const ys_mean = ys.mean();
    const total_sum_squares = ys.sub(ys_mean).square().sum();
    const residual_sum_squares = ys.sub(predictions).square().sum();
    const r_squared = tf.sub(1, residual_sum_squares.div(total_sum_squares));

    res.json({
      success: true,
      loss: history.history.loss[history.history.loss.length - 1],
      val_loss: history.history.val_loss[history.history.val_loss.length - 1],
      r_squared: r_squared.dataSync()[0],
      trainingHistory: history.history
    });
  } catch (error) {
    console.error('Training failed', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
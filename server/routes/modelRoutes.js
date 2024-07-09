const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const { preprocessData } = require('../utils/dataProcessing');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

const createMlpModel = (inputShape, config) => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: config.neuronsPerLayer, activation: config.activationFunction, inputShape: [inputShape] }));
  for (let i = 1; i < config.hiddenLayers; i++) {
    model.add(tf.layers.dense({ units: config.neuronsPerLayer, activation: config.activationFunction }));
  }
  model.add(tf.layers.dense({ units: 1 }));
  return model;
};

router.post('/train', async (req, res) => {
  const { modelType, config, dataFile } = req.body;
  
  try {
    const filePath = path.join(__dirname, '..', 'uploads', dataFile);
    const { xs, ys } = await preprocessData(filePath);

    let model;
    switch (modelType) {
      case 'mlp':
        model = createMlpModel(xs.shape[1], config);
        break;
      // 可以在这里添加其他模型类型
      default:
        throw new Error(`Unsupported model type: ${modelType}`);
    }
    
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    const history = await model.fit(xs, ys, {
      epochs: config.epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}, val_loss = ${logs.val_loss}`);
        }
      }
    });

    const predictions = model.predict(xs);
    const mse = tf.metrics.meanSquaredError(ys, predictions).dataSync()[0];
    const mae = tf.metrics.meanAbsoluteError(ys, predictions).dataSync()[0];
    const r2 = 1 - tf.sum(tf.squaredDifference(ys, predictions)).div(tf.sum(tf.squaredDifference(ys, tf.mean(ys)))).dataSync()[0];

    const modelDir = path.join(__dirname, '..', 'saved_models', Date.now().toString());
    await fs.mkdir(modelDir, { recursive: true });
    await model.save(`file://${modelDir}`);

    res.json({
      success: true,
      modelType,
      loss: history.history.loss[history.history.loss.length - 1],
      val_loss: history.history.val_loss[history.history.val_loss.length - 1],
      evaluation: { mse, mae, r2 },
      trainingHistory: history.history,
      modelPath: modelDir
    });
  } catch (error) {
    console.error('Training failed', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/save', async (req, res) => {
  const { modelPath, metadata } = req.body;
  const modelId = Date.now().toString();
  const newModelDir = path.join(__dirname, '..', 'saved_models', modelId);

  try {
    await fs.rename(modelPath, newModelDir);
    await fs.writeFile(path.join(newModelDir, 'metadata.json'), JSON.stringify(metadata));

    res.json({ success: true, modelId });
  } catch (error) {
    console.error('Model saving failed', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/load/:modelId', async (req, res) => {
  const { modelId } = req.params;
  const modelDir = path.join(__dirname, '..', 'saved_models', modelId);

  try {
    const metadata = JSON.parse(await fs.readFile(path.join(modelDir, 'metadata.json'), 'utf8'));
    res.json({ success: true, metadata });
  } catch (error) {
    console.error('Model loading failed', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
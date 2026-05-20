// backend/src/ai/detectDamage.js
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

let model;

const loadModel = async () => {
  const modelPath = path.join(
    __dirname,
    'model',
    'model.json'
  );
  model = await tf.loadGraphModel(
    `file://${modelPath}`
  );
  console.log('✅ Modèle IA chargé');
};

const detectDamage = async (imageBuffer) => {
  if (!model) throw new Error('Modèle non chargé');

  const tensor = tf.node
    .decodeImage(imageBuffer, 3)
    .resizeNearestNeighbor([640, 640])
    .expandDims(0)
    .div(255.0);

  const predictions = await model.executeAsync(tensor);

  tensor.dispose();

  return predictions;
};

module.exports = { loadModel, detectDamage };
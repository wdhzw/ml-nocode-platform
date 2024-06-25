import React from 'react';
import { TextField, Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function ModelConfig({ model, config, setConfig }) {
  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setConfig({ ...config, [name]: newValue });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Model Configuration</Typography>
      
      {model === 'linearRegression' && (
        <>
          <TextField
            name="learningRate"
            label="Learning Rate"
            type="number"
            value={config.learningRate || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
          />
          <TextField
            name="iterations"
            label="Iterations"
            type="number"
            value={config.iterations || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{ inputProps: { min: 1, step: 1 } }}
          />
        </>
      )}
      
      {model === 'logisticRegression' && (
        <>
          <TextField
            name="learningRate"
            label="Learning Rate"
            type="number"
            value={config.learningRate || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
          />
          <TextField
            name="iterations"
            label="Iterations"
            type="number"
            value={config.iterations || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{ inputProps: { min: 1, step: 1 } }}
          />
          <FormControl fullWidth>
            <InputLabel>Regularization</InputLabel>
            <Select
              name="regularization"
              value={config.regularization || ''}
              onChange={handleChange}
              label="Regularization"
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="l1">L1</MenuItem>
              <MenuItem value="l2">L2</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
      
      {model === 'neuralNetwork' && (
        <>
          <Typography gutterBottom>Hidden Layers</Typography>
          <Slider
            name="hiddenLayers"
            value={config.hiddenLayers || 1}
            onChange={handleSliderChange('hiddenLayers')}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={5}
          />
          <Typography gutterBottom>Neurons per Layer</Typography>
          <Slider
            name="neuronsPerLayer"
            value={config.neuronsPerLayer || 10}
            onChange={handleSliderChange('neuronsPerLayer')}
            valueLabelDisplay="auto"
            step={5}
            marks
            min={5}
            max={100}
          />
          <FormControl fullWidth>
            <InputLabel>Activation Function</InputLabel>
            <Select
              name="activationFunction"
              value={config.activationFunction || ''}
              onChange={handleChange}
              label="Activation Function"
            >
              <MenuItem value="relu">ReLU</MenuItem>
              <MenuItem value="sigmoid">Sigmoid</MenuItem>
              <MenuItem value="tanh">Tanh</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );
}

export default ModelConfig;
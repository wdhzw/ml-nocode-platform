import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material';

const models = [
  { value: 'linearRegression', name: 'Linear Regression', description: 'Best for predicting a continuous outcome based on one or more features.' },
  { value: 'logisticRegression', name: 'Logistic Regression', description: 'Ideal for binary classification problems.' },
  { value: 'neuralNetwork', name: 'Neural Network', description: 'Versatile model capable of learning complex patterns in data.' },
];

function ModelSelector({ model, setModel }) {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="model-select-label">Select Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={model}
          label="Select Model"
          onChange={(e) => setModel(e.target.value)}
        >
          {models.map((m) => (
            <MenuItem key={m.value} value={m.value}>{m.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {model && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {models.find(m => m.value === model).description}
        </Typography>
      )}
    </Box>
  );
}

export default ModelSelector;
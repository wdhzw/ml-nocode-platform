import React from 'react';
import { TextField, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const modelConfigs = {
  mlp: [
    { name: 'learningRate', label: 'Learning Rate', type: 'number', props: { step: 0.001, min: 0 } },
    { name: 'epochs', label: 'Epochs', type: 'number', props: { step: 1, min: 1 } },
    { name: 'hiddenLayers', label: 'Hidden Layers', type: 'number', props: { step: 1, min: 1 } },
    { name: 'neuronsPerLayer', label: 'Neurons per Layer', type: 'number', props: { step: 1, min: 1 } },
    { name: 'activationFunction', label: 'Activation Function', type: 'select', options: ['relu', 'sigmoid', 'tanh'] }
  ],
  // 可以在这里添加其他模型类型的配置
};

function ModelConfig({ modelType, config, setConfig }) {
  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setConfig({ ...config, [e.target.name]: value });
  };

  const configFields = modelConfigs[modelType] || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Model Configuration: {modelType.toUpperCase()}</Typography>
      {configFields.map((field) => (
        field.type === 'select' ? (
          <FormControl key={field.name} fullWidth>
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              value={config[field.name] || ''}
              onChange={handleChange}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={config[field.name] || ''}
            onChange={handleChange}
            fullWidth
            {...field.props}
          />
        )
      ))}
    </Box>
  );
}

export default ModelConfig;
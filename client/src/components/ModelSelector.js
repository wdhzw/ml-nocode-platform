import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material';

function ModelSelector({ models, selectedModel, onSelectModel }) {
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="model-select-label">Select Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Select Model"
          onChange={(e) => onSelectModel(e.target.value)}
        >
          {models.map((model) => (
            <MenuItem key={model} value={model}>{model.toUpperCase()}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedModel && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          You selected: {selectedModel.toUpperCase()}
        </Typography>
      )}
    </Box>
  );
}

export default ModelSelector;
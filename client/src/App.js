import React, { useState } from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Container, Grid, Paper, Stepper, Step, StepLabel,
  Button, Box, CircularProgress, Alert, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField
} from '@mui/material';
import ModelSelector from './components/ModelSelector';
import ModelConfig from './components/ModelConfig';
import DataUploader from './components/DataUploader';
import TrainingResults from './components/TrainingResults';

const steps = ['Select Model', 'Upload Data', 'Configure Model', 'Train Model'];

const modelConfigs = {
  mlp: {
    name: 'Multilayer Perceptron',
    defaultConfig: {
      learningRate: 0.01,
      epochs: 100,
      hiddenLayers: 1,
      neuronsPerLayer: 10,
      activationFunction: 'relu'
    }
  },
  // 可以在这里添加其他模型类型
};

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [data, setData] = useState(null);
  const [config, setConfig] = useState({});
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const [savedModels, setSavedModels] = useState([]);

  const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const handleReset = () => {
    setActiveStep(0);
    setSelectedModel('');
    setData(null);
    setConfig({});
    setTrainResult(null);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setConfig(modelConfigs[model].defaultConfig);
    handleNext();
  };

  const handleDataUpload = (fileName) => {
    setData(fileName);
    handleNext();
  };

  const handleTraining = async () => {
    setTraining(true);
    setTrainResult(null);
    
    try {
      const response = await axios.post('http://localhost:5001/api/model/train', {
        modelType: selectedModel,
        config,
        dataFile: data
      });

      if (response.data.success) {
        setTrainResult(response.data);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Training failed', error);
      // 显示错误消息给用户
    } finally {
      setTraining(false);
    }
  };

  const handleSaveModel = async () => {
    if (!trainResult || !modelName) return;

    try {
      const response = await axios.post('http://localhost:5001/api/model/save', {
        modelPath: trainResult.modelPath,
        metadata: { name: modelName, modelType: selectedModel, config }
      });

      if (response.data.success) {
        setSavedModels(prevModels => [...prevModels, { id: response.data.modelId, name: modelName }]);
        setSaveDialogOpen(false);
      }
    } catch (error) {
      console.error('Model saving failed', error);
    }
  };

  const handleLoadModel = async (modelId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/model/load/${modelId}`);
      if (response.data.success) {
        setSelectedModel(response.data.metadata.modelType);
        setConfig(response.data.metadata.config);
        // 可能还需要更新其他状态
      }
    } catch (error) {
      console.error('Model loading failed', error);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0: return !!selectedModel;
      case 1: return !!data;
      case 2: return true; // 配置步骤总是可以进行下一步
      default: return false;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">ML No-Code Platform</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>Create Your ML Model</Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid container spacing={3}>
            {activeStep === 0 && (
              <Grid item xs={12}>
                <ModelSelector 
                  models={Object.keys(modelConfigs)} 
                  selectedModel={selectedModel} 
                  onSelectModel={handleModelSelect} 
                />
              </Grid>
            )}
            {activeStep === 1 && (
              <Grid item xs={12}>
                <DataUploader onDataUpload={handleDataUpload} />
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid item xs={12}>
                <ModelConfig 
                  modelType={selectedModel}
                  config={config} 
                  setConfig={setConfig} 
                />
              </Grid>
            )}
            {activeStep === 3 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Train Your Model</Typography>
                {!training && !trainResult && (
                  <Button variant="contained" color="primary" onClick={handleTraining}>
                    Start Training
                  </Button>
                )}
                {training && (
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Training in progress...</Typography>
                  </Box>
                )}
                {trainResult && (
                  <Box>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Training complete!<br />
                      Loss: {trainResult.loss.toFixed(4)}<br />
                      Validation Loss: {trainResult.val_loss.toFixed(4)}<br />
                      MSE: {trainResult.evaluation.mse.toFixed(4)}<br />
                      MAE: {trainResult.evaluation.mae.toFixed(4)}<br />
                      R-squared: {trainResult.evaluation.r2.toFixed(4)}
                    </Alert>
                    <Box mt={2}>
                      <TrainingResults trainingHistory={trainResult.trainingHistory} />
                    </Box>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={() => setSaveDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Save Model
                    </Button>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
              disabled={!isStepComplete(activeStep)}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Paper>

        {savedModels.length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Saved Models</Typography>
            <Grid container spacing={2}>
              {savedModels.map(savedModel => (
                <Grid item key={savedModel.id}>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleLoadModel(savedModel.id)}
                  >
                    Load {savedModel.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save Model</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Model Name"
              fullWidth
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveModel}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;
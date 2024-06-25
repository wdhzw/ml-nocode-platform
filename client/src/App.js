import React, { useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import ModelSelector from './components/ModelSelector';
import DataUploader from './components/DataUploader';
import ModelConfig from './components/ModelConfig';

const steps = ['Select Model', 'Upload Data', 'Configure Model', 'Train Model'];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [model, setModel] = useState('');
  const [data, setData] = useState(null);
  const [config, setConfig] = useState({});
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setModel('');
    setData(null);
    setConfig({});
  };

  const handleDataUpload = (fileName) => {
    setData(fileName);
    console.log(`File uploaded: ${fileName}`);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return !!model;
      case 1:
        return !!data;
      case 2:
        return Object.keys(config).length > 0;
      default:
        return true;
    }
  };

  const simulateTraining = async () => {
    setTraining(true);
    setTrainResult(null);
    
    try {
      const response = await axios.post('http://localhost:5001/api/model/train', {
        model,
        config: {
          learningRate: config.learningRate,
          iterations: config.iterations
          // 其他配置参数...
        },
        dataFile: data
      });
      
      setTrainResult(response.data);
    } catch (error) {
      console.error('训练失败', error);
      // 处理错误，可能显示一个错误消息给用户
    } finally {
      setTraining(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ML No-Code Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Create Your ML Model
          </Typography>
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
                <ModelSelector model={model} setModel={setModel} />
              </Grid>
            )}
            {activeStep === 1 && (
              <Grid item xs={12}>
                <DataUploader onDataUpload={handleDataUpload} />
                {data && <Alert severity="success" sx={{ mt: 2 }}>Data uploaded: {data}</Alert>}
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid item xs={12}>
                <ModelConfig model={model} config={config} setConfig={setConfig} />
              </Grid>
            )}
            {activeStep === 3 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Train Your Model</Typography>
                {!training && !trainResult && (
                  <Button variant="contained" color="primary" onClick={simulateTraining}>
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
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Training complete!<br />
                    Accuracy: {trainResult.accuracy}<br />
                    Loss: {trainResult.loss}
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
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
      </Container>
    </Box>
  );
}

export default App;
import React, { useContext } from 'react';
import { Button, Grid, Theme } from "@mui/material";
import { ThemeContext } from '@emotion/react';
import { wizardSelector } from 'features/experiment/wizard/slice';
import { experimentsSelector } from 'features/experiment/slice';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from "react-router-dom";
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';

export interface DownloadButtonProps {
  filename: string
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ filename }) => {
  const history = useHistory();
  const theme = useContext(ThemeContext) as Theme;
  const { t } = useTranslation();
  const { detail } = useSelector(experimentsSelector);
  const { scenario_variability } = useSelector(wizardSelector);

    function downloadFunction(jsonTMP: any, type: string, filename: string) {
        const blob = new Blob([JSON.stringify(jsonTMP)], { type: type })
        const a = document.createElement('a')
        a.download = filename + '.json'
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
      }
    
      function handleDownload(e: any) {
        let jsonTMP = scenario_variability;
        let typeTMP = "text/json"
        downloadFunction(jsonTMP, typeTMP, filename);
      }
    
      function handleDownloadAndNext(e: any) {
        if (window.confirm(t('features.experiment.assist.download_confirmation'))) {
          let jsonTMP = scenario_variability;
          let typeTMP = "text/json"
          downloadFunction(jsonTMP, typeTMP, filename);
          history.push('/experiment/'+detail?.id);
        }
      }
    
  
  return  (
    <Grid
        container
        direction="row-reverse"
        spacing={2}>
        <Grid xs={12} lg={4} item justifyContent="center" style={{ margin: theme.spacing(2) }}>
          <Button type="submit" name="download" variant="contained" color="primary" style={{ margin: theme.spacing(2)}} endIcon={<DownloadIcon />} onClick={handleDownload}>
            {t('features.experiment.assist.download')}
          </Button>
          <Button type="submit" name="generate" variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleDownloadAndNext}>
            {t('features.experiment.assist.download_next')}
          </Button>
        </Grid>
      </Grid>
  );
}

export default DownloadButton;


import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Modal, TextField, Theme, Typography, Grid, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@emotion/react';
import { Link as RouterLink } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { wizardSelector, loadDataAndInitValues, updateJsonConf, updateVariateValue, wizardSlice } from 'features/experiment/wizard/slice';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import NextButton from 'components/NextButton';


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export interface ExperimentFormProperties {
  onSubmit: any
  disabled?: boolean,
  initialValues?: any
}
export interface ColumnConf {
  initValue: any,
  variate: any,
  name: string,
  args: any
}

const LogForm: React.FC = () => {
  const { t } = useTranslation();
  const colorRef = useRef<any>("");
  const sizeRef = useRef<any>(0);
  const theme = useContext(ThemeContext) as Theme;
  const { variant } = useParams<{ variant: string }>();
  const { act } = useParams<{ act: string }>();
  const dispatch = useDispatch();
  const { seed, isLoading, functions, params, screenshot_functions, gui_components, initialValues } = useSelector(wizardSelector);

  console.log('LogForm render [functions=', functions, ',screenshot_functions=', screenshot_functions, ']')
  
  const handleVariateOnClick = (variant: string, act: string, log_column_name: string, event: any) => {
    const selectedValue = event.target.checked ? 1 : 0;
    dispatch(updateVariateValue(variant, act, log_column_name, selectedValue));
  };

  const handleChangeFunction = (variant: string, act: string, column: string, log_column_conf: any, event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    if(selectedValue !== ""){
      const log_column_conf_updated = {
        ...log_column_conf,
        name: selectedValue
      }
      const functionSelected: any = functions?.filter(f => f.id_code === selectedValue)[0];
      // initialValues[column].params = functionSelected.params;
      dispatch(wizardSlice.actions.setPossibleParamsInitialValues({column: column, params: functionSelected.params}));
      dispatch(updateJsonConf(variant, act, column, log_column_conf_updated));
    } else {
      dispatch(updateVariateValue(variant, act, column, 0));
    }
  };

  const [open, setOpen] = useState(false);
  const [param_args, setParamArgs] = useState({});
  const [param_column, setParamColumn] = useState('');
  
  const handleOpen = (column: string) => {
    setParamArgs({});
    setParamColumn(column);
    setOpen(true);
  }
  const handleClose = () => {
    dispatch(wizardSlice.actions.setVariabilityConfiguration({
      ...seed,
      [variant]: {
        ...seed[variant],
        [act]:{
          ...seed[variant][act],
          [param_column]: {
            ...seed[variant][act][param_column],
            args: {...param_args}
          }
        }
      }
    }));
    setParamColumn('');
    setParamArgs({});
    setOpen(false);
  };

  const handleChangeParam = (
    function_param: any,
    event: any
    ) => {
    const selectedValue = event.target.value;
    setParamArgs({
      ...param_args,
      [function_param.label]: [selectedValue]
    });
  };

  const ParamFormModal = (log_column_name: string, log_column: any) => {
    const defaultValue = log_column.variate===1 && initialValues[log_column_name] ? initialValues[log_column_name].params : "";
    const initial_possible_params = initialValues[log_column_name] && initialValues[log_column_name].params.possible_params;
    // initialFunctionName -> initialValues[log_column_name].function
    return (
      <div>
        <Button disabled={!log_column.variate} onClick={() => handleOpen(log_column_name)}>{t("features.wizard.columnVariability.configureParams")}</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {t("features.wizard.columnVariability.paramModalTitle")}
            </Typography>
            {initial_possible_params && params && params.filter(p => Array(initial_possible_params).indexOf(p.id)).map((function_param: any) => (
            <div>
                  <Typography component="div">{t(function_param.description)}:</Typography>
                  {function_param.data_type === "element" &&
                    function_param.data_type !== "font" && (
                      <Select
                        id="select_element"
                        defaultValue={defaultValue}
                        label={t(
                          "features.experiment.assist.function.variability_function"
                        )}
                        onChange={e => handleChangeParam(function_param, e)}
                      >
                        {gui_components && Object.keys(gui_components).map((key: any, gui_index) => (
                          <MenuItem value={key.id_code}>
                            {t(key.name)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  {function_param.data_type !== "element" &&
                    function_param.data_type !== "font" && (
                      <TextField
                        id={function_param.id + ""}
                        placeholder={t(function_param.placeholder)}
                        label={t(function_param.label)}
                        type={function_param.data_type}
                        onChange={e => handleChangeParam(function_param, e)}
                      />
                    )}
                  {function_param.data_type !== "element" &&
                    function_param.data_type === "font" && (
                      <Box component={"div"}>
                        <Select
                          id="select_font"
                          required={true}
                          defaultValue={defaultValue}
                          label={t(
                            "features.experiment.assist.function.variability_function"
                          )}
                          onChange={e => handleChangeParam(function_param, e)}
                        >
                          <MenuItem value={"resources/Roboto-Black.ttf"}>
                            Roboto_font
                          </MenuItem>
                        </Select>
                        <Box component={"div"}>
                          <TextField
                            id="outlined-basic"
                            inputRef={sizeRef}
                            label={t("features.experiment.assist.function.font_size")}
                            variant="outlined"
                            type="number"
                            onChange={e => handleChangeParam(function_param, e)}
                          />
                        </Box>
                        <Box component={"div"}>
                          <TextField
                            id="outlined-basic"
                            inputRef={colorRef}
                            label={t("features.experiment.assist.function.font_color")}
                            variant="outlined"
                            type="String"
                            onChange={e => handleChangeParam(function_param, e)}
                          />
                        </Box>
                      </Box>
                    )}
            </div>
            ))}
          </Box>
        </Modal>
      </div>
    );
  }

  const LogFormTableRow = (log_column: [string, any]) => {
    return(
        <TableRow
          key={`${variant}-${act}-${log_column[0]}`}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="center">
              {log_column[0]}
            </TableCell>
            <TableCell>
              <Checkbox
                key={`variate-${variant}-${act}-${log_column[0]}`}
                defaultChecked={ initialValues[log_column[0]]?.variate === 1 }
                onClick={(e) => handleVariateOnClick(variant, act, log_column[0], e)}
                />
            </TableCell>
            <TableCell>
                { log_column[0] === "Screenshot"?
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id={`function-${variant}-${act}-${log_column[0]}`}>
                    <Typography component="div" >
                    {t('features.wizard.columnVariability.screenshot_name_function')}
                    </Typography>
                    </InputLabel>
                    <Select
                      id={`function-${variant}-${act}-${log_column[0]}`}
                      label={t('features.wizard.columnVariability.screenshot_name_function')}
                      onChange={(e:any) => handleChangeFunction(variant, act, log_column[0], log_column[1], e)}
                      disabled={log_column[1].variate===1}
                      >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {screenshot_functions!= null && Object.values({...screenshot_functions}).map((f:any) => (
                        <MenuItem value={f.id_code}>{f.function_name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  :
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id={`function-${variant}-${act}-${log_column[0]}`}>
                    <Typography component="div" >
                    {t('features.wizard.columnVariability.variability_function_label')}
                    </Typography>
                    </InputLabel>
                    <Select
                      id={`function-${variant}-${act}-${log_column[0]}`}
                      label={t('features.wizard.columnVariability.variability_function_label')}
                      onChange={e => handleChangeFunction(variant, act, log_column[0], log_column[1], e)}
                      defaultValue={ initialValues[log_column[0]]?.variate===1 ? initialValues[log_column[0]].function : "" }
                      disabled={log_column[1].variate!==1}
                      >
                      {functions!= null && Object.values({...functions}).map((f:any) => (
                        <MenuItem value={f.id_code}>{f.function_name}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                }
            </TableCell>
            <TableCell>
                { log_column[0] === "Screenshot"?
                <Button
                  disabled={log_column[1].variate!==1}
                  variant="contained"
                  component={RouterLink}
                  to={`/get-gui-component-coordinates/${variant}/${act}/${log_column[1].initValue}`}
                  >
                  {t("features.wizard.columnVariability.screenshotVariability")}
                </Button> :
                  ParamFormModal(log_column[0], log_column[1])
                }
            </TableCell>
        </TableRow>)
  }

  return (
    <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
          <TableRow>
            <TableCell align="center">{t("features.wizard.columnVariability.columnName")}</TableCell>
            <TableCell>{t("features.wizard.columnVariability.variate")}</TableCell>
            <TableCell>{t("features.wizard.columnVariability.variabilityFunction")}</TableCell>
            <TableCell>{t("features.wizard.columnVariability.variabilityParams")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {
          Object.entries(seed[variant][act]).map( (log_column: [string, any]) => (
            LogFormTableRow(log_column)
          ))}
            </TableBody>
          </Table>
        </TableContainer>
  );
}

export default LogForm;
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, AppDispatch, RootState } from 'store/store';
import { IElements, IScreenshotColumn, wizardState, InitialValues } from './types';
import GUIComponentCategoryRepository from 'infrastructure/repositories/gui-component-category';
import GUIComponentRepository from 'infrastructure/repositories/gui-component';
import VariabilityFunctionCategoryRepository from 'infrastructure/repositories/variability-function-category';
import VariabilityFunctionRepository from 'infrastructure/repositories/variability-function';
import ParamFunctionRepository from 'infrastructure/repositories/params';
import ScreenshotRepository from 'infrastructure/repositories/image';
import { CategoryDTO, FunctionParamDTO, GUIComponentDTO, VariabilityFunctionDTO } from 'infrastructure/http/dto/wizard';

export const guiComponentCategoryRepository = new GUIComponentCategoryRepository();
export const guiComponentRepository = new GUIComponentRepository();
export const variabilityFunctionCategoryRepository = new VariabilityFunctionCategoryRepository();
export const variabilityFunctionRepository = new VariabilityFunctionRepository();
export const paramFunctionCategoryRepository = new ParamFunctionRepository();
export const screenshotRepository = new ScreenshotRepository();

// ================================== REDUCERS ==================================

const { localStorage } = window;

// ================================== REDUCERS ==================================

const initialState: wizardState = {
  elements: {},
  seed: null,
  scenario_variability: null,
  case_variability: null,
  initialValues: {},
  functions: null,
  params: null,
  screenshot_functions: null,
  category_functions: null,
  gui_components: null,
  category_gui_components: null,
  isLoading: false,
  error: null
}

export const wizardSlice = createSlice({
  name: "wizard",
  initialState,
  reducers: {
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
    setElements: (state, { payload }: PayloadAction<IElements>) => {
      state.elements = payload;
    }, // variability configuration can be as case or scenario level
    setVariabilityConfiguration: (
      state,
      { payload }: PayloadAction<{ seed: any }>
    ) => {
      state.seed = payload;
    },
    /*setColumnVariabilityConfiguration: (
      state,
      { payload }: PayloadAction<{ variant: string, act: string, column: string, columnValue: any }>
    ) => {
      const { seed } = state;
      const { variant, act, column, columnValue } = payload;
      const actObject = [variant, act].reduce((ob, key) => ob[key] || {}, seed);
      if (actObject[column] != null) {
        actObject[column] = columnValue;
      }
    },*/
    setVariateVariabilityConfiguration: (
      state,
      { payload }: PayloadAction<{ variant: string, act: string, column: string, variate: number }>
    ) => {
      const { seed } = state;
      const { variant, act, column, variate } = payload;
      const value = [variant, act, column].reduce((ob, key) => ob[key] || {}, seed);
      if (typeof value.variate === 'number') {
        value.variate = variate;
      }
    },
    setInitialValues: (
      state,
      { payload }: PayloadAction<any>
    ) => {
      state.initialValues = payload;
    },
    setPossibleParamsInitialValues: (
      state,
      { payload }: PayloadAction<{params: any, column: string}>
    ) => {
      state.initialValues = {
        ...state.initialValues,
        [payload.column]:{
          ...state.initialValues[payload.column],
          params: {
            ...state.initialValues[payload.column].params,
            possible_params: payload.params
          }
        } 
      }
    },
    setParams: (
      state,
      { payload }: PayloadAction<FunctionParamDTO[]>
    ) => {
      state.params = payload;
    },
    setFunctions: (
      state,
      { payload }: PayloadAction<VariabilityFunctionDTO[]>
    ) => {
      state.functions = payload;
    },
    setScreenshotFunctions: (
      state,
      { payload }: PayloadAction<VariabilityFunctionDTO[]>
    ) => {
      state.screenshot_functions = payload;
    },
    setFunctionCategories: (
      state,
      { payload }: PayloadAction<CategoryDTO[]>
    ) => {
      state.category_functions = payload;
    },
    setGUIComponents: (
      state,
      { payload }: PayloadAction<GUIComponentDTO[]>
    ) => {
      state.gui_components = payload;
    },
    setGUIComponentCategories: (
      state,
      { payload }: PayloadAction<CategoryDTO[]>
    ) => {
      state.category_gui_components = payload;
    },
    setError: (state, { payload }: PayloadAction<string>) => {
      state.error = payload;
    },
  },
});

  // ================================== ACTIONS ==================================
  
  const { setError, setLoading, setVariabilityConfiguration, setFunctions, setFunctionCategories, setVariateVariabilityConfiguration,
    setScreenshotFunctions, setGUIComponents, setGUIComponentCategories, setParams, setInitialValues } = wizardSlice.actions

  // ================================== ROOT STATE ==================================
  
  export const wizardSelector = (state: RootState) => state.wizard;
  
  // ================================== THUNK middleware ==================================
  
  export const updateJsonConf = (variant: string, act: string, column: string, log_column_conf: any): AppThunk => async (dispatch: AppDispatch, getState) => {
    const { wizard } = getState();
    let json_conf = wizard.seed;
    dispatch(
      setVariabilityConfiguration({
          ...json_conf,
          [variant]: {
            ...json_conf[variant],
            [act]:{
              ...json_conf[variant][act],
              [column]: log_column_conf
            }
          }
    }));
  }

  export const updateVariateValue = (variant: string, act: string, column: string, variate_value: number): AppThunk => async (dispatch: AppDispatch, getState) => {
    dispatch(
      setVariateVariabilityConfiguration({ variant, act, column, variate: variate_value })
    );
  }

  export const loadInitValues = (variant: string, act: string): AppThunk => async (dispatch: AppDispatch, getState) => {
      const { wizard } = getState();
      try {
        dispatch(setLoading(true))
        let aux_values = {};
          Object.entries({...wizard.seed[variant][act]}).forEach((entry: [string, any]) => {
            aux_values = {
              ...aux_values,
              [entry[0]]: {
                function: entry[1].name,
                params: {
                  possible_params: {},
                  args: entry[1].args
                },
                variate: entry[1].variate
              }
            };
          });
          setInitialValues(aux_values);
      } catch (error) {  
        dispatch(setError(error as string))
      } finally {
        dispatch(setLoading(false))
      }
  }
  export const loadDataAndInitValues = (variant: string, act: string, initValuesCond: boolean): AppThunk => async (dispatch: AppDispatch, getState) => {
    const { auth, wizard } = getState();
    try {
      dispatch(setLoading(true))

      if(initValuesCond){
        // Load InitValues
        let aux_values = {};
        Object.entries({...wizard.seed[variant][act]}).forEach((entry: [string, any]) => {
        aux_values = {
            ...aux_values,
            [entry[0]]: {
              function: entry[1].name,
              params: {
                possible_params: {},
                args: entry[1].args
              },
              variate: entry[1].variate
            }
          };
        });
        dispatch(setInitialValues(aux_values));
      }
      // const currentPage = experiment.pagination.page;
      if (wizard.category_functions === null) {
        const functionCategoriesResponse = await variabilityFunctionCategoryRepository.list(auth.token ?? '');
        dispatch(setFunctionCategories(functionCategoriesResponse.results));
      }
      if (wizard.functions === null) {
        const functionsResponse = await variabilityFunctionRepository.list(auth.token ?? '');
        try {
          const screenshot_functions: any = wizard.category_functions?.filter(c => c.name==="Screenshot");
          const functions_screenshot = functionsResponse.results.filter(f => f.variability_function_category===screenshot_functions.id);
          const functions_no_screenshot = functionsResponse.results.filter(f => f.variability_function_category!==screenshot_functions.id);
          dispatch(setFunctions(functions_no_screenshot));
          dispatch(setScreenshotFunctions(functions_screenshot));
        } catch (ex) {
          console.error('error setting up wizard functions', ex);
        }
      }
      if (wizard.gui_components === null) {
        const guiComponentsResponse = await guiComponentRepository.list(auth.token ?? '');
        dispatch(setGUIComponents(guiComponentsResponse.results));
      }
      // if (wizard.category_gui_components === null) {
      //   const guiComponentCategoriesResponse = await guiComponentCategoryRepository.list(auth.token ?? '');
      //   dispatch(setGUIComponentCategories(guiComponentCategoriesResponse.results));
      // }
      if (wizard.params === null) {
        const paramsResponse = await paramFunctionCategoryRepository.list(auth.token ?? '');
        dispatch(setParams(paramsResponse.results));
      }
    } catch (error) {  
      dispatch(setError(error as string))
    } finally {
      dispatch(setLoading(false))
    }
  }

  export default wizardSlice.reducer;
  
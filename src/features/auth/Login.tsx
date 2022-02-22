import React, { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { login, authSelector } from './slice';
import { useTranslation } from 'react-i18next';

const LoginBoxContainer = styled('div')`
  position: absolute;
  transform: translateX(-50%) translateY(-50%);
  top: 50%;
  left: 50%
`;

const SpacedSubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2)
}))

export default function Login(): JSX.Element {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const { reset, register, setError, clearErrors, formState, handleSubmit } = useForm();
  const { isLoading, isAuth, redirectPath, error } = useSelector( authSelector );
  // const [ displayError, setDisplayError ] = useState(false)

  const onSubmit = async (data: any) => {
    if (!isLoading) {
      const { email, password } = data;
      clearErrors();
      await dispatch(login({ email, password }));
      reset(data);
    }
  }

  const displayError = !isLoading && !formState.isDirty && error != null && error.code != null;

  useEffect(() => {
    if (isAuth) {
      history.push(redirectPath);
    }
    if (error) {
      console.error('ERROR: ', error);
    }
  }, [ isAuth, error ]);

  return (
    <LoginBoxContainer>
        <Card>
          <CardContent>
            <Typography variant="h5">{ t('features.auth.login.title') }</Typography>
            
            <Box sx={{ width: 1 }}>
              <form onSubmit={ handleSubmit(onSubmit) }>
                <TextField
                  fullWidth
                  label={ t('features.auth.login.email') }
                  defaultValue=""
                  margin="normal"
                  inputProps={
                    register('email', {
                      required: t('features.auth.login.errors.emailRequired') as string
                    })
                  }
                  error={ formState.errors.email != null }
                  helperText={ formState.errors.email?.message }
                />

                <TextField
                  fullWidth
                  label={ t('features.auth.login.password') }
                  defaultValue=""
                  margin="normal"
                  inputProps={
                    register('password', {
                      required: t('features.auth.login.errors.passwordRequired') as string
                    })
                  }
                  error={ formState.errors.password != null}
                  helperText={ formState.errors.password?.message }
                  type="password"
                />

                {  displayError && (
                  <>
                    { error?.code === 'invalid.credentials' && (<Typography color="error" variant="body2">{ t('features.auth.login.errors.invalidCredentials') }</Typography>)}
                  </>
                ) }

                <SpacedSubmitButton 
                  variant="contained"
                  color="secondary"
                  type='submit'
                  disabled={ isLoading }
                >
                  { t('features.auth.login.login') }
                </SpacedSubmitButton>
              </form>
            </Box>
          </CardContent>
        </Card>
    </LoginBoxContainer>)
}
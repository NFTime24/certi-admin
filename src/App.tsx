import { Box, Button, CircularProgress, Container, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { getConfigurationError } from './config/env';
import { LoginPage } from './pages/LoginPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { theme } from './theme';

export default function App() {
  const configurationError = getConfigurationError();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {configurationError ? (
        <ConfigurationErrorPage message={configurationError} />
      ) : (
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/organizations"
                element={
                  <ProtectedRoute>
                    <OrganizationsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

function RootRedirect() {
  const { status } = useAuth();

  if (status === 'checking') {
    return <FullPageLoader />;
  }

  return <Navigate to={status === 'authenticated' ? '/organizations' : '/login'} replace />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'checking') {
    return <FullPageLoader />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function FullPageLoader() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress aria-label="loading" />
    </Box>
  );
}

function ConfigurationErrorPage({ message }: { message: string }) {
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: { xs: 3, sm: 4 },
        }}
      >
        <SettingsSuggestRoundedIcon color="primary" sx={{ mb: 2, fontSize: 36 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          환경변수 설정 필요
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button variant="contained" href="https://docs.netlify.com/environment-variables/overview/">
          Netlify 환경변수 문서
        </Button>
      </Box>
    </Container>
  );
}

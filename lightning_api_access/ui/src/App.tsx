import { useSnackbar } from 'lightning-ui/src/design-system/components';
import { SnackbarProvider } from 'lightning-ui/src/design-system/components';
import ThemeProvider from 'lightning-ui/src/design-system/theme';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';


const queryClient = new QueryClient();


function Main() {
  const [ apiMetadata, setApiMetadata ] = React.useState({});
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const update = () => {
      axios.get(`${window.location.href}/api_metadata.json`)
        .then(({ data }) => {
          setApiMetadata(data.apis);
        })
        .catch(error => {
          enqueueSnackbar({
            title: 'Error Fetching Data',
            children: 'Try reloading the page',
            severity: 'error',
          });
        });
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>{JSON.stringify(apiMetadata)}</>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SnackbarProvider>
            <Main />
          </SnackbarProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

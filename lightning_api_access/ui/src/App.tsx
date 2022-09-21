import axios from "axios";
import { Box, Container, Divider, SnackbarProvider, Stack, Typography, useSnackbar } from "lightning-ui/src/design-system/components";
import ThemeProvider from "lightning-ui/src/design-system/theme";
import React, { useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

type APIEndpoint = Partial<{
  url: string;
  method: "GET";
  request: any;
  response: object;
  input_query: string;
}>;

function Main() {
  const [apiMetadata, setApiMetadata] = React.useState<APIEndpoint[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const update = async () => {
      try {
        const { data } = await axios.get<{ apis: APIEndpoint[] }>(`${window.location.origin}/api_metadata.json`);
        setApiMetadata(data.apis);
      } catch (error) {
        enqueueSnackbar({
          title: "Error Fetching Data",
          children: "Try reloading the page",
          severity: "error",
        });
      }
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 10000);

    return () => clearInterval(interval);
  }, [enqueueSnackbar]);

  return (
    <Box display={"flex"} justifyContent={"center"} alignItems={"center"} height={"inherit"}>
      {apiMetadata.map((e) => (
        <RenderApiEndpoint {...e} key={e.url} />
      ))}
    </Box>
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

const RenderApiEndpoint = (props: APIEndpoint) => {
  useLayoutEffect(() => {
    // @ts-ignore
    if (window.hljs) window.hljs.highlightAll();
  }, []);
  return (
    <Container maxWidth={"md"}>
      <Stack minWidth={"300px"}>
        <Typography>This is an API endpoint for ...</Typography>
        <Box height={20} />
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
            padding: 1,
          })}>
          <Typography>Request</Typography>
          <Divider />
          <pre>
            <code className="language-python">
              {`import requests

requests.get("${props.url}", params={"${props.input_query}":"required_value"})
`}
            </code>
          </pre>
        </Box>
        <Box height={16} />
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
            padding: 1,
          })}>
          <Typography>Response</Typography>
          <Divider />
          <pre>
            <code className="language-json">
              {typeof props.response === "string" ? props.response : JSON.stringify(props.response, null, 2)}
            </code>
          </pre>
        </Box>
      </Stack>
    </Container>
  );
};

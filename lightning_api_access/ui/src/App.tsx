import axios from "axios";
import {
  Box,
  Button,
  Container,
  Divider,
  SnackbarProvider,
  Stack,
  TextField,
  Typography,
  useSnackbar,
} from "lightning-ui/src/design-system/components";
import ThemeProvider from "lightning-ui/src/design-system/theme";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

type APIEndpoint = Partial<{
  url: string;
  method: "GET";
  request: any;
  response: Partial<{
    content: string;
    text: string;
    status: number;
  }>;
}>;

function Main() {
  const [apiMetadata, setApiMetadata] = React.useState<APIEndpoint>({
    response: {
      content: "https://avatars.githubusercontent.com/u/58386951?s=200&v=4",
      status: 200,
    },
  });
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const update = () => {
      axios
        .get(`${window.location.origin}/api_metadata.json`)
        .then(({ data }) => {
          setApiMetadata(data.apis);
        })
        .catch((error) => {
          enqueueSnackbar({
            title: "Error Fetching Data",
            children: "Try reloading the page",
            severity: "error",
          });
        });
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 10000);

    return () => clearInterval(interval);
  }, [enqueueSnackbar]);

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      height={"inherit"}
    >
      {/* {JSON.stringify(apiMetadata)} */}
      <RenderApiEndpoint {...apiMetadata} />
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
  const [inputText, onChangeInputText] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!(props.url && props.method && inputText)) return;

    setIsLoading(true);

    try {
      await axios.request({
        method: props.method,
        url: props.url,
        params: {
          inputText,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    switch (true) {
      case !!props.response?.text:
        return (
          <Box paddingY={1}>
            <Typography>Response</Typography>
            <Divider />
            <Typography>{props.response?.text}</Typography>
          </Box>
        );
      case !!props.response?.content:
        return (
          <Box textAlign={"center"} paddingY={1}>
            <Typography textAlign={"left"}>Response</Typography>
            <Divider />
            <img
              src={props.response?.content}
              alt={inputText || "response-image"}
            />
          </Box>
        );
      default:
        return null;
    }
  };
  return (
    <Container maxWidth={"sm"}>
      <Stack minWidth={"300px"}>
        <Typography>This is an API endpoint for ...</Typography>
        <Box height={20} />
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
            padding: 2,
          })}
        >
          <Typography>Try it here</Typography>
          <Box height={16} />
          <TextField
            placeholder="Some placeholder"
            value={inputText}
            onChange={onChangeInputText}
            fullWidth
          />
          <Box height={12} />
          <Button
            text="Submit"
            disabled={!inputText || !props.url}
            onClick={onSubmit}
            loading={isLoading}
          />
        </Box>

        {renderResponse()}
      </Stack>
    </Container>
  );
};

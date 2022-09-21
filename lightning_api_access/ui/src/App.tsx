import { CopyAllRounded } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  IconButton,
  SnackbarProvider,
  Stack,
  Typography,
  useSnackbar,
} from "lightning-ui/src/design-system/components";
import ThemeProvider from "lightning-ui/src/design-system/theme";
import React, { useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { useClipboard } from "utils";

const queryClient = new QueryClient();

type APIEndpoint = Partial<{
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT";
  request: any;
  response: object | string;
  input_query: string;
}>;

function Main() {
  const [apiMetadata, setApiMetadata] = React.useState<APIEndpoint[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const update = async () => {
      try {
        // const { data } = await axios.get<{ apis: APIEndpoint[] }>(`${window.location.origin}/api_metadata.json`);
        const data: { apis: APIEndpoint[] } = {
          apis: [
            {
              name: "get image by id",
              url: "/get_image",
              method: "GET",
              request: { id: "string" },
              response:
                '{\n  "id": "...",\n  "image": "...",\n  "status": "..."\n}',
            },
            {
              name: "list images",
              url: "/list_images",
              method: "GET",
              request: { size: "number" },
              response: [
                { image: "...", status: "..." },
                { image: "...", status: "..." },
              ],
            },
            {
              name: "resize image",
              url: "/resize",
              method: "POST",
              request: { size: "number" },
              response: { image: "...", status: "..." },
            },
          ],
        };
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
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={3}
      paddingY={4}
    >
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

  const codeSnippet = getCodeSnippet(props);
  const copyToClipboard = useClipboard();
  return (
    <Container maxWidth={"md"}>
      <Stack minWidth={"300px"}>
        <Typography>This is an API endpoint to {props.name}</Typography>
        <Box height={20} />
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
            padding: 1,
          })}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography>Request</Typography>
            <IconButton
              edge={"end"}
              onClick={() => copyToClipboard(codeSnippet)}
            >
              <CopyAllRounded />
            </IconButton>
          </Stack>
          <Divider />
          <pre>
            <code className="language-python">{codeSnippet}</code>
          </pre>
        </Box>
        <Box height={16} />
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
            padding: 1,
          })}
        >
          <Typography>Response</Typography>
          <Divider />
          <pre>
            <code className="language-json">
              {renderStringOrObject(props.response)}
            </code>
          </pre>
        </Box>
      </Stack>
    </Container>
  );
};

const getCodeSnippet = (props: APIEndpoint, language: "python" = "python") => {
  if (props.method === "POST") {
    return `import requests
requests.post("${props.url}", json=${renderStringOrObject(props.request)})
`;
  }

  if (props.method === "PUT") {
    return `import requests
requests.put("${props.url}", json=${renderStringOrObject(props.request)})
`;
  }

  return `import requests
requests.get("${props.url}", ${renderStringOrObject(props.request)})
`;
};

const renderStringOrObject = (data: object | string = "") =>
  typeof data === "string" ? data : JSON.stringify(data, null, 2);

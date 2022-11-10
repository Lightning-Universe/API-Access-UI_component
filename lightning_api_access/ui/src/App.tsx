import { CopyAllRounded } from "@mui/icons-material";
import axios from "axios";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Select,
  SnackbarProvider,
  Stack,
  Typography,
  useSnackbar,
} from "lightning-ui/src/design-system/components";
import ThemeProvider from "lightning-ui/src/design-system/theme";
import React, { useState } from "react";
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

enum Languages {
  python = "Python Example",
  javascript = "Javascript Example",
}

type APIComponentResponse = Partial<{ title: string; apis: APIEndpoint[] }>;
function Main() {
  const [response, setApiMetadata] = React.useState<APIComponentResponse>({});

  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    const update = async () => {
      try {
        const { data } = await axios.get<APIComponentResponse>(
          `${window.location.href}/api_metadata.json`
        );
        setApiMetadata(data);
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
      <Typography fontSize={24}>{response.title}</Typography>
      {response.apis?.map((e) => (
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
  const [language, setLanguage] = useState<Languages>(Languages.python);

  React.useEffect(() => {
    const a = setTimeout(() => {
      // @ts-ignore
      if (window.hljs) window.hljs.highlightAll();
    }, 50);

    return () => {
      clearTimeout(a);
    };
  }, [language]);

  const copyToClipboard = useClipboard();
  const codeSnippet = getCodeSnippet(props, language);
  const sampleResponse = renderStringOrObject(props.response);
  return (
    <Container maxWidth={"md"}>
      <Stack minWidth={"300px"}>
        <Box height={20} />
        <Stack direction={"row"} gap={1} alignItems={"center"}>
          <Typography
            sx={(theme) => ({
              backgroundColor: theme.palette.primary[50],
              padding: "2px 4px",
              borderRadius: "8px",
              color: "#fff",
            })}
          >
            {props.method}
          </Typography>
          <Typography>Access {props.name} endpoint programmatically</Typography>
        </Stack>
        <Box height={8} />
        <Box
          sx={{
            border: "2px solid #e3e3e3",
            borderRadius: 2,
            padding: "8px 12px",
          }}
        >
          <Typography>{props.url}</Typography>
        </Box>
        <Box height={8} />

        <Section>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{
              ".MuiFormControl-root": {
                bottom: "2px",
              },
            }}
          >
            <Select
              value={language}
              options={[
                { value: Languages.python, label: Languages.python },
                { value: Languages.javascript, label: Languages.javascript },
              ]}
              onChange={(e) => e && setLanguage(e as Languages)}
            />
            <IconButton onClick={() => copyToClipboard(codeSnippet)}>
              <CopyAllRounded />
            </IconButton>
          </Stack>
          <Divider />

          <pre>
            <code
              className={`language-${language.split(" ")[0].toLowerCase()}`}
            >
              {codeSnippet}
            </code>
          </pre>
        </Section>

        <Box height={16} />
        <Section>
          <SectionHeader
            title={"Sample Response"}
            onClick={() => copyToClipboard(sampleResponse)}
          />
          <pre>
            <code className="language-json">{sampleResponse}</code>
          </pre>
        </Section>
      </Stack>
    </Container>
  );
};

const getCodeSnippet = (
  props: APIEndpoint,
  language: Languages = Languages.python
) => {
  if (language === Languages.javascript)
    return `fetch("${props.url}",{
  method:"${props.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${renderStringOrObject(props.request)})
})
.then(res=>res.json())
.then(async (data) => {
  console.log(await data);
  // start building cool stuff with data
})`;

  if (props.method === "POST") {
    return `import requests
response = requests.post("${props.url}", json=${renderStringOrObject(props.request)})
print(response.${typeof props.response === "string" ? "text" : "json()"})
`;
  }

  if (props.method === "PUT") {
    return `import requests
response = requests.put("${props.url}", json=${renderStringOrObject(props.request)})
print(response.${typeof props.response === "string" ? "text" : "json()"})
`;
  }

  return `import requests
response = requests.get("${props.url}", ${renderStringOrObject(props.request)})
print(response.${typeof props.response === "string" ? "text" : "json()"})
`;
};

const renderStringOrObject = (data: object | string = "", indentation = 2) =>
  typeof data === "string" ? data : JSON.stringify(data, null, indentation);

const Section = (props: { children: React.ReactNode }) => {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 1.5,
        padding: 1,
        backgroundColor: "#e3e3e3",
      })}
    >
      {props.children}
    </Box>
  );
};

const SectionHeader = (props: { onClick?: () => void; title: string }) => {
  return (
    <>
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography fontWeight={"700"}>{props.title}</Typography>

        {!!props.onClick && (
          <IconButton onClick={props.onClick}>
            <CopyAllRounded />
          </IconButton>
        )}
      </Stack>
      <Divider />
    </>
  );
};

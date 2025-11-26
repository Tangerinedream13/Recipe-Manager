import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Chakra UI v2 imports
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#f8efe7",
      100: "#e9d2bb",
      200: "#dbb58e",
      300: "#cd9861",
      400: "#bf7c34",
      500: "#a6621a",
      600: "#804b14",
      700: "#59340e",
      800: "#331d08",
      900: "#0d0702",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
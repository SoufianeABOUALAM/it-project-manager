import { extendTheme } from "@chakra-ui/react";
import { buttonStyles } from "./components/button";
import { inputStyles } from "./components/input";
import { globalStyles } from "./styles";

export default extendTheme(
  globalStyles,
  buttonStyles, // button styles
  inputStyles, // input styles
);

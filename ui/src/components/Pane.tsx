import styled from "styled-components";
import { Box } from "./Box";

export const Pane = styled(Box)((props) => ({
  backgroundColor: props.theme.colors.dark200,
  borderRadius: "4px",
  width: "100%",
  height: "100%",
  maxHeight: "100%",
  flexDirection: "column",
  overflowY: "auto",
  overflowX: "hidden",
}));
import React from "react";
import { createBoard } from "@wixc3/react-board";
import LandingPage from "../../../../pages/landing";

export default createBoard({
  name: "LandingPage",
  Board: () => <LandingPage />,
  isSnippet: true,
});

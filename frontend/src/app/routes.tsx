import { createBrowserRouter } from "react-router";
import Root from "./components/Layout";
import Home from "./components/Home";
import BreedDetection from "./components/BreedDetection";
import TagSearch from "./components/TagSearch";
import Schemes from "./components/Schemes";
import HealthAnalysis from "./components/HealthAnalysis";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "detect", Component: BreedDetection },
      { path: "search", Component: TagSearch },
      { path: "schemes", Component: Schemes },
      { path: "health", Component: HealthAnalysis },
      { path: "*", Component: NotFound },
    ],
  },
]);
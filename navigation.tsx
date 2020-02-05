import { createAppContainer } from "react-navigation";
import routes from "../routes";

export const AppContainer = () => {
  return createAppContainer(routes);
};

import useAppAutofit from "./hooks/useAppAutofit";
import useHashRoute from "./hooks/useHashRoute";
import { applyAuthGuard } from "./router/guard";
import RouteView from "./router/RouteView";
import "./assets/design-tokens.css";
import "./styles/app.scss";

function App() {
  useAppAutofit();
  const route = useHashRoute();
  const allowed = applyAuthGuard(route);

  if (!allowed) {
    return null;
  }

  return <RouteView route={route} />;
}

export default App;


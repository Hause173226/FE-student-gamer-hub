import {BrowserRouter as Router, Route} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppRoutes } from "./routes";
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>

    </Router>
  );
}

export default App;

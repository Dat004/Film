import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import configs from "./configs";

function App() {
  return (
    <div className="bg-bg-layout">
      <Router>
        <Routes>
          {configs.routerConfig.map((items) => (
            <Route
              key={items.id}
              path={items.path}
              element={
                <items.layout>
                  <items.component />
                </items.layout>
              }
            />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EnterpriseShell } from "./components/EnterpriseShell";
import { RequestWizardPage } from "./pages/RequestWizardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <EnterpriseShell
              title="Request Access"
              subtitle="Replace fragmented access requests with a persona-based Engineering Role catalog."
            >
              <RequestWizardPage />
            </EnterpriseShell>
          }
        />
        <Route
          path="/admin"
          element={
            <EnterpriseShell
              title="Admin Dashboard"
              subtitle="Mock Microsoft Teams approval by toggling request status."
            >
              <AdminDashboardPage />
            </EnterpriseShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

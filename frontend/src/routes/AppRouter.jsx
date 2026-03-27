import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "../pages/SplashScreen";
import SignIn from "../pages/SignIn";
import Dashboard from "../pages/Dashboard";
import IssueDetails from "../pages/IssueDetails";

import MapView from "../pages/MapView";
import Reports from "../pages/Reports";
import PublicNotices from "../pages/PublicNotices";
import AdminPanel from "../pages/AdminPanel";
import DepartmentDesk from "../pages/DepartmentDesk";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<SplashScreen />} />
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notices" element={<PublicNotices />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/departments/:departmentId" element={<DepartmentDesk />} />
          <Route path="/issue/:id" element={<IssueDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

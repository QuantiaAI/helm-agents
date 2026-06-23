import { Routes, Route, Navigate } from "react-router-dom";
import { DEFAULT_LOCALE } from "./locale";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./auth/RequireAuth";
import { Home } from "./pages/Home";
import { Analyze } from "./pages/Analyze";
import { Settings } from "./pages/Settings";
import { History } from "./pages/History";
import { RunDetail } from "./pages/RunDetail";
import { Health } from "./pages/Health";
import { Doc } from "./pages/Doc";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
      <Route path="/:locale" element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="health" element={<Health />} />
        <Route path="docs/*" element={<Doc />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route path="analyze" element={<Analyze />} />
          <Route path="settings" element={<Settings />} />
          <Route path="history" element={<History />} />
          <Route path="runs/:id" element={<RunDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

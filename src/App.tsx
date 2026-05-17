import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { PublicLayout } from "./components/layout/PublicLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { ClientDashboardPage } from "./pages/client/ClientDashboardPage";
import { DesignerDashboardPage } from "./pages/designer/DesignerDashboardPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminProjectsPage } from "./pages/admin/AdminProjectsPage";
import { BriefsBrowsePage } from "./pages/shared/BriefsBrowsePage";
import { BriefDetailPage } from "./pages/shared/BriefDetailPage";
import { BriefEditorPage } from "./pages/shared/BriefEditorPage";
import { BriefForm } from "./components/briefs/BriefForm";
import { ProjectsBrowsePage } from "./pages/shared/ProjectsBrowsePage";
import { ProjectWorkspacePage } from "./pages/shared/ProjectWorkspacePage";
import { UpdatesPage } from "./pages/shared/UpdatesPage";
import { CalendarPage } from "./pages/shared/CalendarPage";
import { MyTasksPage } from "./pages/shared/MyTasksPage";
import { DocumentsPage } from "./pages/shared/DocumentsPage";
import { InvoicesPage } from "./pages/shared/InvoicesPage";
import { ClientsDirectoryPage } from "./pages/shared/ClientsDirectoryPage";
import { CollaboratorsPage } from "./pages/shared/CollaboratorsPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages - standalone, no shell */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      {/* Public marketing pages */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route
        path="client"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["client"]}>
              <DashboardLayout area="client" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="briefs" element={<BriefsBrowsePage />} />
        <Route path="briefs/new" element={<BriefForm />} />
        <Route path="briefs/:id" element={<BriefDetailPage />} />
        <Route path="briefs/:id/edit" element={<BriefEditorPage />} />
        <Route path="projects" element={<ProjectsBrowsePage />} />
        <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      <Route
        path="designer"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["designer"]}>
              <DashboardLayout area="designer" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DesignerDashboardPage />} />
        <Route path="briefs" element={<BriefsBrowsePage />} />
        <Route path="briefs/:id" element={<BriefDetailPage />} />
        <Route path="projects" element={<ProjectsBrowsePage />} />
        <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="teams" element={<CollaboratorsPage />} />
        <Route path="clients" element={<ClientsDirectoryPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["admin"]}>
              <DashboardLayout area="admin" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
        <Route path="briefs" element={<BriefsBrowsePage />} />
        <Route path="briefs/:id" element={<BriefDetailPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="clients" element={<ClientsDirectoryPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

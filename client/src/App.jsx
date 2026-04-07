import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import ServiceDetailsPage from "./pages/ServiceDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserDashboardPage from "./pages/UserDashboardPage.jsx";
import ProviderDashboardPage from "./pages/ProviderDashboardPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const { auth } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route
          path="/book/:id"
          element={
            <ProtectedRoute roles={["user", "admin"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={auth.user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={auth.user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["user", "admin"]}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider"
          element={
            <ProtectedRoute roles={["provider", "admin"]}>
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;

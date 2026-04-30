import { useState,useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider, useAppContext } from "./context/DataContext";

import Sidebar from "./Sidebar";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChangePassword from "./pages/auth/ChangePassword";

import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Customers from "./pages/Customers";
import Plant from "./pages/Plant";
import Items from "./pages/Items";
import Users from "./pages/Users";

// Protected Route (for authenticated users only)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route (for non-authenticated users only)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {


  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
           (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);







  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Redirect to dashboard if already logged in */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar isDark={isDark} setIsDark={setIsDark} />
                  <div className="flex-1 overflow-auto p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard  isDark={isDark}/>} />
                      <Route path="/shipments" element={<Shipments />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/plants" element={<Plant />} />
                      <Route path="/items" element={<Items />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/change-password" element={<ChangePassword />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
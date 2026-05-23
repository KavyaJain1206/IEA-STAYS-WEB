import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import VisitPage from "./pages/VisitPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminCatalogPage from "./pages/AdminCatalogPage.jsx";
import "./styles.css";
import "./forms.css";
import "./admin.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

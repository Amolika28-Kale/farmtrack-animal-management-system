
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import AnimalDetails from "./pages/AnimalDetails";
import MilkRecords from "./pages/MilkRecords";
import DietRecords from "./pages/DietRecords";
import Pregnancy from "./pages/Pregnancy";
import Layout from "./components/Layout";
import React from "react";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/animals" element={<Layout><Animals /></Layout>} />
        <Route path="/animals/:id" element={<Layout><AnimalDetails /></Layout>} />
        <Route path="/milk-records" element={<Layout><MilkRecords /></Layout>} />
        <Route path="/diet-records" element={<Layout><DietRecords /></Layout>} />
        <Route path="/pregnancy" element={<Layout><Pregnancy /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

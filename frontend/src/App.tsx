import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import LandingPage from "./pages/LandingPage";
import AnalyzePage from "./pages/AnalyzePage";

const App = () => (
    <Router>
        <Layout style={{ minHeight: "100vh", padding: "2rem" }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
            </Routes>
        </Layout>
    </Router>
);

export default App;
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DataEntry from "./DataEntry";
import Report from "./Report";

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="flex gap-4 mb-4">
          <Link to="/">Data Entry</Link>
          <Link to="/report">Report</Link>
        </nav>
        <Routes>
          <Route path="/" element={<DataEntry />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
}

import React, { useState } from "react";
import axios from "axios";

const API = "https://machine-backend-ku84.onrender.com"; // Change for deployment

export default function Report() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState([]);

  const fetchReport = async () => {
    const res = await axios.get(`${API}/report`, { params: { location, date } });
    setRows(res.data);
  };

  const totals = rows.reduce((acc, row) => {
    acc.totalIn += row.total_in;
    acc.totalOut += row.total_out;
    acc.profit += row.profit;
    return acc;
  }, { totalIn: 0, totalOut: 0, profit: 0 });

  return (
    <div>
      <h2>Report</h2>
      <div className="flex gap-2 mb-4">
        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={fetchReport}>Generate</button>
      </div>

      {rows.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Current In</th>
              <th>Last In</th>
              <th>Total In</th>
              <th>Current Out</th>
              <th>Last Out</th>
              <th>Total Out</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.machine_name}</td>
                <td>{r.current_in}</td>
                <td>{r.last_in}</td>
                <td>{r.total_in}</td>
                <td>{r.current_out}</td>
                <td>{r.last_out}</td>
                <td>{r.total_out}</td>
                <td>{r.profit}</td>
              </tr>
            ))}
            <tr>
              <td><b>Totals</b></td>
              <td colSpan="2"></td>
              <td><b>{totals.totalIn}</b></td>
              <td colSpan="2"></td>
              <td><b>{totals.totalOut}</b></td>
              <td><b>{totals.profit}</b></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

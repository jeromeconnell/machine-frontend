import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://machine-backend-ku84.onrender.com"; // Change to your server URL when deployed

export default function DataEntry() {
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState("");
  const [currentIn, setCurrentIn] = useState("");
  const [currentOut, setCurrentOut] = useState("");
  const [lastIn, setLastIn] = useState(0);
  const [lastOut, setLastOut] = useState(0);

  useEffect(() => {
    axios.get(`${API}/machines`).then(res => setMachines(res.data));
  }, []);

  const handleMachineChange = async (id) => {
    setMachineId(id);
    const logs = await axios.get(`${API}/report`, {
      params: { location: "", date: new Date().toISOString().split("T")[0] }
    });
    const log = logs.data.find(l => l.machine_id === parseInt(id));
    if (log) {
      setLastIn(log.current_in);
      setLastOut(log.current_out);
    } else {
      setLastIn(0);
      setLastOut(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/log`, {
      machine_id: machineId,
      current_in: parseInt(currentIn),
      current_out: parseInt(currentOut),
    });
    alert("Entry saved!");
    setCurrentIn("");
    setCurrentOut("");
  };

  return (
    <div>
      <h2>Data Entry</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <select onChange={(e) => handleMachineChange(e.target.value)} value={machineId}>
          <option value="">Select Machine</option>
          {machines.map(m => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.machine_name} ({m.location})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Current In"
          value={currentIn}
          onChange={(e) => setCurrentIn(e.target.value)}
        />
        <input
          type="number"
          placeholder="Current Out"
          value={currentOut}
          onChange={(e) => setCurrentOut(e.target.value)}
        />
        <p>Last In: {lastIn} | Last Out: {lastOut}</p>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    user: "",
    date: "",
    questionssolved: "",
    problemLinks: "",
  });

  const fetchEntries = async () => {
    const res = await axios.get("http://localhost:5000/entries");
    setEntries(res.data);
  };

  useEffect(() => {
    fetchEntries();
    socket.on("entriesUpdated", fetchEntries);
    return () => socket.off("entriesUpdated");
  }, []);

  const addEntry = async () => {
    if (!newEntry.user || !newEntry.date) return alert("Please fill all fields!");
    await axios.post("http://localhost:5000/entries", {
      ...newEntry,
      problemLinks: newEntry.problemLinks.split(",").map((l) => l.trim()),
    });
    setNewEntry({ user: "", date: "", questionssolved: "", problemLinks: "" });
  };

  // Filter entries for each user
  const premEntries = entries.filter((e) => e.user.toLowerCase() === "prem");
  const sunnyEntries = entries.filter((e) => e.user.toLowerCase() === "sunny");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">💻 CodeSync Tracker</h1>

      {/* Add Entry Form */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Your Name (prem/sunny)"
          className="border p-2 rounded flex-1"
          value={newEntry.user}
          onChange={(e) => setNewEntry({ ...newEntry, user: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded flex-1"
          value={newEntry.date}
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
        />
        <input
          type="number"
          placeholder="Questions solved"
          className="border p-2 rounded flex-1"
          value={newEntry.questionssolved}
          onChange={(e) =>
            setNewEntry({ ...newEntry, questionssolved: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Problem Links (comma separated)"
          className="border p-2 rounded flex-1"
          value={newEntry.problemLinks}
          onChange={(e) =>
            setNewEntry({ ...newEntry, problemLinks: e.target.value })
          }
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={addEntry}
        >
          Add Entry
        </button>
      </div>

      {/* Two Blocks Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* prem's Block */}
        <div className="border rounded-lg p-4 shadow bg-green-50">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">prem solved</h2>
          {premEntries.length === 0 ? (
            <p>No entries yet.</p>
          ) : (
            <ul className="space-y-2">
              {premEntries.map((e) => (
                <li key={e._id} className="border-b pb-2">
                  <p>
                    <strong>{e.date}</strong> — {e.questionssolved} solved
                  </p>
                  <ul className="list-disc ml-6">
                    {e.problemLinks.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* sunny's Block */}
        <div className="border rounded-lg p-4 shadow bg-blue-50">
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">sunny solved</h2>
          {sunnyEntries.length === 0 ? (
            <p>No entries yet.</p>
          ) : (
            <ul className="space-y-2">
              {sunnyEntries.map((e) => (
                <li key={e._id} className="border-b pb-2">
                  <p>
                    <strong>{e.date}</strong> — {e.questionssolved} solved
                  </p>
                  <ul className="list-disc ml-6">
                    {e.problemLinks.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

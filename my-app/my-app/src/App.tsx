import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState<any>(null);
  const [mobile, setMobile] = useState("9999999998"); // default

  const fetchData = () => {
    fetch("https://my-api-u62u.onrender.com/customer-services", {
      headers: {
        "client-id": "MMM-KHU123",
        "mobile": mobile
      }
    })
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>ServicePulse Dashboard 🚀</h2>

      {/* 🔥 MOBILE INPUT */}
      <input
        type="text"
        placeholder="Enter mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />

      <button onClick={fetchData}>Fetch Data 🔍</button>

      <hr />

      {!data ? (
        <p>Loading...</p>
      ) : data.message ? (
        <p>{data.message}</p>
      ) : (
        Object.entries(data.services).map(([key, value]: any) => (
          <div
            key={key}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px"
            }}
          >
            <h3>{key.toUpperCase()}</h3>
            <p>Status: {value.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("https://my-api-u62u.onrender.com/customer-services", {
      headers: {
        "client-id": "MMM-KHU123",
        "mobile": "9999999998"
      }
    })
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>ServicePulse Dashboard 🚀</h2>

      {!data ? (
        <p>Loading...</p>
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
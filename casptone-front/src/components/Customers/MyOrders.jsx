import React, { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "../Header";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [tracking, setTracking] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const API = "http://localhost:8000/api";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/my-orders`, { headers });
        setOrders(res.data || []);
      } catch (e) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const viewTracking = async (order) => {
    setSelected(order);
    try {
      const res = await axios.get(`${API}/orders/${order.id}/tracking`, { headers });
      setTracking(res.data);
    } catch (e) {
      setTracking({ error: "Failed to fetch tracking" });
    }
  };

  return (
    <AppLayout>
      <div className="container mt-4">
        <h2>My Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th className="text-end">Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{new Date(o.checkout_date).toLocaleDateString()}</td>
                      <td className="text-end">₱{Number(o.total_price).toLocaleString()}</td>
                      <td><span className="badge text-bg-secondary">{o.status}</span></td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => viewTracking(o)}>Track</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selected && tracking && !tracking.error && (
          <div className="card mt-3">
            <div className="card-header">Order #{selected.id} Tracking</div>
            <div className="card-body">
              <div className="row">
                {tracking.stage_summary.map((s) => (
                  <div className="col-md-4 mb-3" key={s.stage}>
                    <div className="p-3 border rounded">
                      <div className="fw-bold">{s.stage}</div>
                      <div className="small text-muted">Pending: {s.pending}</div>
                      <div className="small text-muted">In Progress: {s.in_progress}</div>
                      <div className="small text-muted">Completed: {s.completed}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


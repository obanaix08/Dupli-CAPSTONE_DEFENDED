// src/components/OrderTable.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Badge, Collapse, Card } from "react-bootstrap";
import { FaBox, FaClock, FaTruck, FaCheckCircle } from "react-icons/fa";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const response = await axios.get("http://localhost:8000/api/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data || []);
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-4">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading your orders...</span>
      </div>
    );

  if (error) return <p className="text-danger text-center fw-bold">{error}</p>;

  return (
    <div className="order-container">
      {orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id} className="mb-4 shadow-sm order-card">
            <Card.Header
              className="d-flex justify-content-between align-items-center order-header"
              onClick={() => toggleExpand(order.id)}
            >
              <div>
                <FaBox className="me-2 text-primary" />
                <span className="fw-bold">Order #{order.id}</span>
              </div>
              <div>
                <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
            </Card.Header>

            <Collapse in={expandedOrder === order.id}>
              <div>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Status Tracker:</strong>
                    <div className="d-flex align-items-center mt-2 status-tracker">
                      {renderStatusSteps(order.status)}
                    </div>
                  </div>

                  <h6 className="fw-bold">Order Items</h6>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between border-bottom py-2"
                    >
                      <span>
                        {item.product?.name || "Unknown Product"} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="fw-bold text-success">
                        ₱
                        {(item.product?.price * item.quantity).toLocaleString(
                          "en-PH",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="mt-3 text-muted small">
                    <p>
                      <FaClock className="me-2" />
                      Placed on:{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p>
                      <FaTruck className="me-2" />
                      Estimated Delivery: {order.delivery_date || new Date(new Date(order.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted fw-bold">No orders found.</p>
      )}
    </div>
  );
};

const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "completed":
      return "success";
    case "canceled":
      return "danger";
    default:
      return "secondary";
  }
};

const renderStatusSteps = (status) => {
  const steps = ["Pending", "Processing", "Completed"];
  const statusIndex = steps.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );

  return steps.map((step, idx) => (
    <div key={step} className="me-3 d-flex align-items-center">
      {idx < statusIndex ? (
        <FaCheckCircle className="text-success me-1" />
      ) : idx === statusIndex ? (
        <FaClock className="text-warning me-1" />
      ) : (
        <FaBox className="text-muted me-1" />
      )}
      <small
        className={idx <= statusIndex ? "fw-bold text-dark" : "text-muted"}
      >
        {step}
      </small>
    </div>
  ));
};

export default OrderTable;
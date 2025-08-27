import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate || dateError) {
      setFilteredOrders(orders);
      return;
    }

    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.checkout_date).getTime();
      return orderDate >= start && orderDate <= end;
    });

    setFilteredOrders(filtered);
  }, [startDate, endDate, orders, dateError]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    if (endDate && newStartDate > endDate) {
      setDateError("Start date cannot be later than end date.");
    } else {
      setDateError("");
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    if (startDate && newEndDate < startDate) {
      setDateError("End date cannot be earlier than start date.");
    } else {
      setDateError("");
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
    setShowModal(true);
  };

  const handleMarkAsComplete = (order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
    setShowConfirmModal(true);
  };

  const confirmMarkAsComplete = async () => {
    if (!selectedOrder) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/orders/${selectedOrder.id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-container">
      {/* Filter Section */}
      <div className="filter-box mb-4">
        <h5>📅 Filter Orders</h5>
        <div className="filter-grid">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
            />
          </div>
        </div>
        {dateError && <p className="text-danger mt-2">{dateError}</p>}
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <h5>Order #{order.id}</h5>
              <p>
                <strong>Total:</strong> ₱{parseFloat(order.total_price).toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {order.checkout_date
                  ? new Date(order.checkout_date).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                    })
                  : "N/A"}
              </p>
              <p>
                <span
                  className={`status-badge ${
                    order.status === "completed" ? "completed" : "pending"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <div className="order-actions">
                <button onClick={() => handleViewDetails(order)}>👁 View</button>
                {order.status !== "completed" && (
                  <button onClick={() => handleMarkAsComplete(order)}>
                    ✅ Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-msg">No orders found 🛒</p>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5>Order #{selectedOrder.id} Details</h5>
            <ul>
              {orderItems.map((item) => (
                <li key={item.id}>
                  {item.product?.name} - {item.quantity}x ₱{item.product?.price}
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5>Confirm Order Completion</h5>
            <p>
              Are you sure you want to mark order #{selectedOrder.id} as
              completed?
            </p>
            <ul>
              {orderItems.map((item) => (
                <li key={item.id}>
                  {item.product?.name} - {item.quantity}x ₱{item.product?.price}
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button onClick={confirmMarkAsComplete}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Styling */}
      <style jsx>{`
        .orders-container {
          padding: 20px;
        }
        .filter-box {
          background: #fefaf6;
          border: 2px solid #6b4226;
          padding: 15px;
          border-radius: 12px;
        }
        .filter-grid {
          display: flex;
          gap: 15px;
        }
        input[type="date"] {
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .order-card {
          background: #fffdf9;
          border: 2px solid #e0c097;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 10px rgba(107, 66, 38, 0.1);
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: bold;
        }
        .status-badge.completed {
          background: #27ae60;
          color: white;
        }
        .status-badge.pending {
          background: #f1c40f;
          color: #6b4226;
        }
        .order-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .order-actions button {
          flex: 1;
          padding: 6px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .order-actions button:first-child {
          background: #3498db;
          color: white;
        }
        .order-actions button:last-child {
          background: #27ae60;
          color: white;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-box {
          background: #fffdf9;
          padding: 20px;
          border-radius: 12px;
          width: 400px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .close-btn {
          margin-top: 10px;
          padding: 6px 12px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .empty-msg {
          text-align: center;
          color: #6b4226;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default OrdersTable;

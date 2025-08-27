// src/components/CartTable.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const CartTable = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const response = await axios.get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data || []);
    } catch (err) {
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuantity = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCartItems(); // refresh cart
    } catch (err) {
      alert("Failed to update item quantity.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartItems();
    } catch (err) {
      alert("Failed to remove item.");
    }
  };

  const createProductionsForOrder = async (orderResponse) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token available for production creation");
      return { success: false, error: "Authentication required" };
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const orderId = orderResponse?.data?.order?.id || orderResponse?.data?.id || null;
      const today = new Date().toISOString().slice(0, 10);
      const stageStart = "Design";
      
      // Create production payloads
      const payloads = cartItems.map((item) => ({
        product_name: item.product?.name || item.name || "Product",
        date: today,
        stage: stageStart,
        status: "Pending",
        quantity: item.quantity || 0,
        resources_used: {
          materials: item.product?.materials || "",
          workers: 0,
        },
        notes: orderId ? `From order #${orderId}` : "From checkout",
      }));

      // Create all production records
      const productionResults = await Promise.allSettled(
        payloads.map((payload) =>
          axios.post("http://localhost:8000/api/productions", payload, { headers })
        )
      );

      // Check results
      const successful = productionResults.filter(result => result.status === 'fulfilled');
      const failed = productionResults.filter(result => result.status === 'rejected');

      if (failed.length > 0) {
        console.error("Some production records failed:", failed.map(f => f.reason));
        return { 
          success: successful.length > 0, 
          error: `${failed.length} of ${payloads.length} production records failed`,
          partial: true
        };
      }

      console.log(`Successfully created ${successful.length} production records`);
      return { success: true, count: successful.length };

    } catch (error) {
      console.error("Failed to create production records:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || "Unknown error" 
      };
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/checkout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Try to create production records
      const productionResult = await createProductionsForOrder(response);

      // Show appropriate success message
      if (productionResult.success) {
        if (productionResult.partial) {
          alert(`Order placed successfully!\n\nProduction tracking: ${productionResult.error}`);
        } else {
          alert(`Order placed successfully!\n\n✅ ${productionResult.count || cartItems.length} items added to production tracking.`);
        }
      } else {
        alert(`Order placed successfully!\n\n⚠️ Production tracking setup failed: ${productionResult.error}\n\nPlease contact support if production tracking is not visible.`);
      }

      // Clear cart on successful checkout
      setCartItems([]);

    } catch (err) {
      console.error("Checkout failed:", err);
      alert(`Checkout failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || item.price || 0) * item.quantity,
    0
  );

  // Helper function to get image URL
  const getImageUrl = (item) => {
    const imagePath = item.product?.image || item.image;
    if (!imagePath) return "https://via.placeholder.com/150";
    
    // If image path already includes the full URL, use it as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Try both possible path formats to match your AdminProductsTable
    if (imagePath.startsWith('storage/')) {
      return `http://localhost:8000/${imagePath}`;
    } else {
      return `http://localhost:8000/storage/${imagePath}`;
    }
  };

  // Helper function to get product name
  const getProductName = (item) => {
    return item.product?.name || item.name || "Unknown Product";
  };

  // Helper function to get product price
  const getProductPrice = (item) => {
    return item.product?.price || item.price || 0;
  };

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="cart-container">
      {cartItems.length > 0 ? (
        <div className="cart-grid">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-card">
              <img
                src={getImageUrl(item)}
                alt={getProductName(item)}
                className="cart-item-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />

              <div className="cart-details">
                <h5>{getProductName(item)}</h5>
                <p className="price">₱{getProductPrice(item)}</p>

                <div className="d-flex align-items-center">
                  <button
                    onClick={() =>
                      handleEditQuantity(item.id, Math.max(item.quantity - 1, 1))
                    }
                  >
                    ➖
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => handleEditQuantity(item.id, item.quantity + 1)}
                  >
                    ➕
                  </button>
                </div>

                <p className="subtotal">
                  Subtotal: ₱{getProductPrice(item) * item.quantity}
                </p>
              </div>

              <div className="cart-actions">
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-cart">Your cart is empty 🛍️</p>
      )}

      {cartItems.length > 0 && (
        <div className="summary-box mt-4">
          <h5>Order Summary</h5>
          <p>Total Items: {totalItems}</p>
          <p>Total Price: ₱{totalPrice}</p>
          <button className="btn-checkout" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
        </div>
      )}
  
      <style jsx>{`
        .cart-container {
          padding: 20px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .cart-card {
          background: #fffdf9;
          border: 2px solid #e0c097;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 4px 10px rgba(107, 66, 38, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cart-img img {
          width: 100%;
          height: 150px;
          object-fit: contain;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
        }

        .cart-details h5 {
          color: #6b4226;
          font-weight: bold;
        }

        .price {
          font-weight: bold;
          color: #c0392b;
        }

        .subtotal {
          font-size: 0.9rem;
          color: #555;
        }

        .cart-actions {
          margin-top: auto;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .btn-edit,
        .btn-remove {
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-edit {
          background: #f1c40f;
          color: #6b4226;
        }
        .btn-edit:hover {
          background: #d4ac0d;
        }

        .btn-remove {
          background: #e74c3c;
          color: white;
        }
        .btn-remove:hover {
          background: #c0392b;
        }

        /* Order Summary Box */
        .summary-box {
          background: #fefaf6;
          border: 2px solid #6b4226;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(107, 66, 38, 0.15);
          max-width: 400px;
          margin-left: auto;
        }

        .btn-checkout {
          width: 100%;
          background: #6b4226;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-weight: bold;
          transition: 0.3s;
          border: none;
        }
        .btn-checkout:hover {
          background: #8e5b3d;
        }

        .empty-cart {
          text-align: center;
          font-size: 1.2rem;
          color: #6b4226;
          margin-top: 50px;
        }
        
        .cart-item-image {
          width: 100%;
          max-height: 120px;
          object-fit: contain;
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 10px;
        }

        .d-flex {
          display: flex;
        }

        .align-items-center {
          align-items: center;
        }

        .mx-2 {
          margin: 0 8px;
        }

        .mx-2 {
          margin: 0 8px;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }

        .cart-details button {
          background: #6b4226;
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .cart-details button:hover {
          background: #8e5b3d;
        }
      `}</style>
    </div>
  );
};

export default CartTable;
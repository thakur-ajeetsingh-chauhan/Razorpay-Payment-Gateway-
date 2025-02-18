// src/Payment.js
import React, { useState } from "react";
import axios from "axios";

const Payment = () => {
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      alert("Razorpay script not loaded.");
      return;
    }

    try {
      // Create order on backend
      const { data } = await axios.post("http://localhost:5001/create-order", {
        amount,
      });

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Store in .env
        amount: data.amount,
        currency: "INR",
        name: "My Store",
        description: "Test Transaction",
        order_id: data.orderId,
        handler: async (response) => {
          // Verify payment on backend
          const paymentData = {
            razorpay_order_id: data.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          const result = await axios.post(
            "http://localhost:5001/verify-payment",
            paymentData
          );
          alert(result.data.status);
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options); // Instantiate Razorpay
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed.");
    }
  };

  return (
    <div className="payment-container">
      <h2>Razorpay Payment</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Payment;

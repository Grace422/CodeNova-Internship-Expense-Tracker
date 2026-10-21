"use client";

import { useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";

const categories = {
  income: ["Salary", "Business", "Investment", "Other Income"],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Entertainment",
    "Other Expense"
  ]
};

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TransactionForm({ onTransactionAdded }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getToday);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleTypeChange(newType) {
    setType(newType);
    setCategory(categories[newType][0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      Math.round(numericAmount * 100) !== numericAmount * 100
    ) {
      setError("Enter a valid amount with up to two decimal places.");
      return;
    }

    if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
      setError("Please select a valid date.");
      return;
    }

    if (description.trim().length > 160) {
      setError("Description must be 160 characters or fewer.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          category,
          description: description.trim(),
          date
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save transaction.");
      }

      if (onTransactionAdded) {
        await onTransactionAdded(result);
      }

      setAmount("");
      setDescription("");
      setDate(getToday());
      setSuccess("Transaction saved successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="transaction-form-card">
      <div className="section-heading">
        <div>
          <h2>Add Transaction</h2>
          <p>Record your income or expenses.</p>
        </div>
        <span className="form-heading-icon">
          <Plus size={22} />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Transaction type</label>
          <div className="transaction-type-toggle">
            <button
              type="button"
              className={type === "expense" ? "type-option active expense-option" : "type-option"}
              onClick={() => handleTypeChange("expense")}
              aria-pressed={type === "expense"}
            >
              Expense
            </button>
            <button
              type="button"
              className={type === "income" ? "type-option active income-option" : "type-option"}
              onClick={() => handleTypeChange("income")}
              aria-pressed={type === "income"}
            >
              Income
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="transaction-amount">Amount (₹)</label>
          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 1500.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transaction-category">Category</label>
          <select
            id="transaction-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            {categories[type].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="transaction-date">Date</label>
          <input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transaction-description">
            Description <span className="optional-label">(optional)</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            maxLength={160}
            placeholder="What was this transaction for?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {error && (
          <p className="form-message error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="form-message success-message" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="submit-transaction"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="loading-icon" />
              Saving...
            </>
          ) : (
            <>
              <Plus size={18} />
              Add {type === "income" ? "Income" : "Expense"}
            </>
          )}
        </button>
      </form>
    </section>
  );
}

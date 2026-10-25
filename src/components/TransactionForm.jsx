
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
    setError("");
    setSuccess("");
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

  const inputClasses =
    "w-full min-w-0 rounded-xl border border-border bg-page px-4 py-3 text-primary-text outline-none transition placeholder:text-secondary-text/70 focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5 text-primary-text shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Add Transaction</h2>
          <p className="mt-1 text-sm text-secondary-text">
            Record your income or expenses.
          </p>
        </div>

        <span className="shrink-0 rounded-xl bg-accent/10 p-3 text-accent">
          <Plus size={22} />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Transaction type
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-page p-1">
            {["expense", "income"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleTypeChange(item)}
                aria-pressed={type === item}
                className={`rounded-lg border px-3 py-3 text-sm font-semibold capitalize transition ${
                  type === item
                    ? item === "income"
                      ? "border-border bg-card text-income shadow-sm"
                      : "border-border bg-card text-expense shadow-sm"
                    : "border-transparent text-secondary-text hover:text-primary-text"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="transaction-amount" className="text-sm font-medium">
            Amount (₹)
          </label>
          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 1500.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="transaction-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="transaction-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClasses}
            required
          >
            {categories[type].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="transaction-date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="transaction-description" className="text-sm font-medium">
            Description <span className="font-normal text-secondary-text">(optional)</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            maxLength={160}
            placeholder="What was this transaction for?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClasses}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-expense/10 p-3 text-sm text-expense">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-lg bg-income/10 p-3 text-sm text-income">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
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


"use client";

import { useState } from "react";
import { Trash2, ReceiptText, LoaderCircle } from "lucide-react";

export default function TransactionTable({
  transactions = [],
  onTransactionDeleted
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete transaction.");
      }

      if (onTransactionDeleted) {
        await onTransactionDeleted(id);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary-text">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            Review and manage your transactions.
          </p>
        </div>

        <span className="rounded-xl bg-accent/10 p-3 text-accent">
          <ReceiptText size={22} />
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-expense">
          {error}
        </p>
      )}

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ReceiptText size={40} className="mb-3 text-secondary-text/60" />
          <h3 className="font-medium text-primary-text">
            No transactions yet
          </h3>
          <p className="mt-1 text-sm text-secondary-text">
            Add your first income or expense to see it here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-secondary-text">
                <th className="px-3 py-3 font-medium">Transaction</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="transition hover:bg-page/70">
                  <td className="px-3 py-4">
                    <p className="font-medium text-primary-text">
                      {transaction.description || transaction.category}
                    </p>
                    <p className="mt-1 capitalize text-xs text-secondary-text">
                      {transaction.type}
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {transaction.category}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-secondary-text">
                    {formatDate(transaction.date)}
                  </td>

                  <td
                    className={`whitespace-nowrap px-3 py-4 text-right font-semibold ${
                      transaction.type === "income"
                        ? "text-income"
                        : "text-expense"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "−"}
                    {currency.format(Number(transaction.amount))}
                  </td>

                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(transaction._id)}
                      disabled={deletingId === transaction._id}
                      aria-label={`Delete ${transaction.description || transaction.category}`}
                      title="Delete transaction"
                      className="inline-flex rounded-lg p-2 text-secondary-text transition hover:bg-expense/10 hover:text-expense disabled:opacity-50"
                    >
                      {deletingId === transaction._id ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

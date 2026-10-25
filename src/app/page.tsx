"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardCards from "@/components/Dashboard";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/transactions", {
        cache: "no-store"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load transactions.");
      }

      setTransactions(Array.isArray(result) ? result : result.transactions || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionAdded = async () => {
    await fetchTransactions();
  };

  const handleTransactionDeleted = async () => {
    await fetchTransactions();
  };

  return (
    <main className="min-h-screen bg-page px-4 py-6 text-primary-text transition-colors sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Expense Tracker
              </h1>
              <p className="mt-1 text-sm text-secondary-text">
                Manage your money with confidence.
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Financial Overview</h2>
          <DashboardCards transactions={transactions} />
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-expense/30 bg-expense/5 p-4 text-sm text-expense"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchTransactions}
              className="rounded-lg border border-border px-3 py-2 font-medium text-primary-text hover:bg-page"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-secondary-text">
            <LoaderCircle size={24} className="animate-spin" />
            <span>Loading your transactions...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6">
            <TransactionForm
              onTransactionAdded={handleTransactionAdded}
            />

            <TransactionTable
              transactions={transactions}
              onTransactionDeleted={handleTransactionDeleted}
            />
          </div>
        )}

        <footer className="mt-10 border-t border-border pt-5 text-center text-sm text-secondary-text">
          Expense Tracker · Track smarter, spend better.
        </footer>
      </div>
    </main>
  );
}

"use client";

import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

export default function DashboardCards({ transactions = [] }) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const savings = income - expenses;

  const cards = [
    {
      title: "Total Income",
      amount: income,
      icon: ArrowDownLeft,
      color: "income"
    },
    {
      title: "Total Expenses",
      amount: expenses,
      icon: ArrowUpRight,
      color: "expense"
    },
    {
      title: "Net Savings",
      amount: savings,
      icon: Wallet,
      color: "savings"
    }
  ];

  return (
    <section className="dashboard-cards">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="summary-card" key={card.title}>
            <div className="summary-card-top">
              <span>{card.title}</span>
              <span className={`summary-icon ${card.color}`}>
                <Icon size={20} />
              </span>
            </div>

            <h2>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
              }).format(card.amount)}
            </h2>
          </article>
        );
      })}
    </section>
  );
}

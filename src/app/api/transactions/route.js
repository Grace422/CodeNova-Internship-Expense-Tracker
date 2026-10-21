import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

const allowedCategories = {
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

export async function GET() {
  try {
    await connectDB();

    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date } = body;

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be income or expense" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (
      amount === "" ||
      amount === null ||
      amount === undefined ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      Math.round(numericAmount * 100) !== numericAmount * 100
    ) {
      return NextResponse.json(
        { error: "Amount must be a positive number with at most two decimal places" },
        { status: 400 }
      );
    }

    if (!allowedCategories[type].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category for the selected transaction type" },
        { status: 400 }
      );
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || description.length > 160)
    ) {
      return NextResponse.json(
        { error: "Description must be 160 characters or fewer" },
        { status: 400 }
      );
    }

    const transactionDate = date ? new Date(date) : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "A valid transaction date is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = await Transaction.create({
      type,
      amount: numericAmount,
      category,
      description: description?.trim() ?? "",
      date: transactionDate
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid transaction data" },
        { status: 400 }
      );
    }

    console.error("Create transaction error:", error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

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
    const database = await connectDB();

    const transactions = await database
      .collection("ExpenseCollection")
      .find({})
      .sort({ date: -1 })
      .toArray();

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
        {
          error:
            "Amount must be a positive number with at most two decimal places"
        },
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

    const database = await connectDB();

    const transaction = {
      type,
      amount: numericAmount,
      category,
      description: description?.trim() ?? "",
      date: transactionDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database
      .collection("ExpenseCollection")
      .insertOne(transaction);

    return NextResponse.json(
      { ...transaction, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transaction error:", error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

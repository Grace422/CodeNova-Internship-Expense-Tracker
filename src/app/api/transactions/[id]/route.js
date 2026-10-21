import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete transaction error:", error);

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}

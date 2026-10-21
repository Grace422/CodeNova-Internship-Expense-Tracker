
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
      validate: {
        validator: value =>
          Number.isFinite(value) &&
          Math.round(value * 100) === value * 100,
        message: "Amount must have at most two decimal places"
      }
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Salary",
        "Business",
        "Investment",
        "Other Income",
        "Food",
        "Transport",
        "Shopping",
        "Bills",
        "Health",
        "Education",
        "Entertainment",
        "Other Expense"
      ]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [160, "Description cannot exceed 160 characters"],
      default: ""
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now
    }
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

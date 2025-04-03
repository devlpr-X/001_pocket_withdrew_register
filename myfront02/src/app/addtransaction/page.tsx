"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendRequest } from "../../utils/api";

interface CategoryData {
  id: number;
  uid: number;
  categoryname: string;
  categoryid: number;
  transactiontypename: string;
  transactiontypeid: number;
  createddate: string;
  updateddate: string;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: CategoryData[];
  size: number;
  action: string;
  curdate: string;
}

export default function TransactionPage() {
  const [categoryInfo, setCategoryInfo] = useState<CategoryData[] | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[] | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]); // Default to today's date
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactiontypeid = searchParams.get("transactiontypeid"); // 1 for income, 2 for expense

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const user = JSON.parse(token);
        const surl = "http://localhost:8000/category/";
        const smethod = "POST";
        const sbody = {
          action: "getallcategory",
          uid: user.uid,
        };

        const response: Response = await sendRequest(surl, smethod, sbody);

        if (response.resultCode === 1008) {
          setCategoryInfo(response.data);
          // Filter categories based on transactiontypeid
          if (transactiontypeid) {
            const filtered = response.data.filter(
              (category) => category.transactiontypeid === parseInt(transactiontypeid)
            );
            setFilteredCategories(filtered);
          }
        } else {
          setError(response.resultMessage);
        }
      } catch (err) {
        setError("An error occurred while fetching categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router, transactiontypeid]);

  const handleRegisterTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!amount || !description || !selectedCategory) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to register a transaction.");
        return;
      }

      const user = JSON.parse(token);
      const surl = "http://localhost:8000/transaction/";
      const smethod = "POST";
      const sbody = {
        action: "registtransaction",
        uid: user.uid,
        amount,
        description,
        createddate: date, // Add date field
        category: selectedCategory,
        transactiontype: parseInt(transactiontypeid || "2"),
      };

      const response: Response = await sendRequest(surl, smethod, sbody);

      if (response.resultCode === 1011) {
        setSuccessMessage("Амжилттай бүртгэлээ.");
        setAmount("");
        setDescription("");
        setSelectedCategory(null);
        setDate(new Date().toISOString().split("T")[0]); // Reset date to today
      } else {
        setError(response.resultMessage || "Failed to register transaction.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while registering the transaction.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center text-xl">уншиж байна...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {transactiontypeid === "1" ? "Орлого бүртгэх" : "Зарлага бүртгэх"}
        </h2>

        <form onSubmit={handleRegisterTransaction} className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Нийт дүн
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Утга оруулна уу"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Тайлбар
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Тайлбар оруулна уу"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Төрөл
            </label>
            <select
              id="category"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                төрлөө сонгоно уу
              </option>
              {filteredCategories &&
                filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryname}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Огноо
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={loading}
          >
            {loading ? "Бүртгэх..." : "Гүйлгээ бүртгэх"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Буцах{" "}
          <a href="/dashboard" className="text-indigo-500 hover:underline">
            Dashboard
          </a>
        </p>
        <p className="mt-4 text-sm text-gray-500 text-center">
          <a
            href={transactiontypeid === "1" ? "/incomeCategory" : "/expenseCategory"}
            className="text-indigo-500 hover:underline"
          >
            {transactiontypeid === "1" ? "Орлогын төрөл" : "Зарлагын төрөл"}
          </a>
        </p>
      </div>
    </div>
  );
}

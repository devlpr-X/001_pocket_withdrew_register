"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendRequest } from "../../utils/api";

interface Entry {
  id: number;
  amount: number;
  description: string;
  createddate: string;
  updateddate: string;
  transactiontypeid: number; // 1 for income, 2 for expense
  categoryname: string;
  categoryid: number;
}

interface Category {
  id: number;
  uid: number;
  categoryname: string;
  categoryid: number;
  transactiontypename: string;
  transactiontypeid: number;
  createddate: string;
  updateddate: string | null;
}

interface TransactionResponse {
  resultCode: number;
  resultMessage: string;
  data: Entry[];
}

interface CategoryResponse {
  resultCode: number;
  resultMessage: string;
  data: Category[];
}

export default function EditTransaction() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(token);

        // Fetch all transactions
        const transactionResponse: TransactionResponse = await sendRequest(
          "http://localhost:8000/transaction/",
          "POST",
          {
            action: "getalltransaction",
            uid: parsedUser.uid,
          }
        );

        if (transactionResponse.resultCode === 1010) {
          const foundEntry = transactionResponse.data.find(
            (entry) => entry.id === Number(transactionId)
          );

          if (foundEntry) {
            setEntry(foundEntry);
            setAmount(foundEntry.amount);
            setDescription(foundEntry.description);
            setCategory(foundEntry.categoryid);
          } else {
            setError("Transaction not found.");
          }
        } else {
          setError(transactionResponse.resultMessage);
          return;
        }

        // Fetch all categories
        const categoryResponse: CategoryResponse = await sendRequest(
          "http://localhost:8000/category/",
          "POST",
          {
            action: "getallcategory",
            uid: parsedUser.uid,
          }
        );

        if (categoryResponse.resultCode === 1008) {
          setCategories(categoryResponse.data);
        } else {
          setError(categoryResponse.resultMessage);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, transactionId]);

  useEffect(() => {
    if (entry) {
      // Filter categories based on transactiontypeid
      const filtered = categories.filter(
        (cat) => cat.transactiontypeid === entry.transactiontypeid
      );
      setFilteredCategories(filtered);
    }
  }, [categories, entry]);

  const handleSave = async () => {
    if (!entry || amount === null || !description || category === null) {
      alert("Please fill in all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(token);

      const response: TransactionResponse = await sendRequest(
        "http://localhost:8000/transaction/",
        "POST",
        {
          action: "edittransaction",
          uid: parsedUser.uid,
          id: entry.id,
          amount: amount,
          description: description,
          category: category,
          transactiontype: entry.transactiontypeid
        }
      );

      if (response.resultCode === 1012) {
        alert("Transaction updated successfully.");
        router.push("/dashboard");
      } else {
        alert("Failed to update transaction: " + response.resultMessage);
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      alert("An error occurred while updating the transaction.");
    }
  };

  if (loading) return <p className="text-center text-xl">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Гүйлгээ засах
      </h1>
      {entry && (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Дүн:</label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Тайлбар:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700">Төрөл:</label>
            <select
              value={category || ""}
              onChange={(e) => setCategory(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              <option value="" disabled>
                Төрөл сонгох
              </option>
              {filteredCategories.map((cat) => (
                <option key={cat.categoryid} value={cat.categoryid}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Хадгалах
            </button> <br />
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

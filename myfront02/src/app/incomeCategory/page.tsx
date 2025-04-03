"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../utils/api";

interface IncomeCategory {
  id: number;
  uid: number;
  categoryname: string;
  transactiontypeid: number;
  createddate: string;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: IncomeCategory[];
  size: number;
  action: string;
  curdate: string;
}

export default function IncomeCategoryPage() {
  const [categories, setCategories] = useState<IncomeCategory[] | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

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
          const incomeCategories = response.data.filter(
            (category) => category.transactiontypeid === 1
          );
          setCategories(incomeCategories);
        } else {
          setError(response.resultMessage);
        }
      } catch (err) {
        setError("An error occurred while fetching income categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router, successMessage, error]);

  const handleRegisterCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newCategoryName) {
      setError("Please enter a category name.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to register a category.");
        return;
      }

      const user = JSON.parse(token);
      const surl = "http://localhost:8000/category/";
      const smethod = "POST";
      const sbody = {
        action: "registcategory",
        uid: user.uid,
        categoryname: newCategoryName,
        transactiontype: 1, // Income type
      };

      const response: Response = await sendRequest(surl, smethod, sbody);

      if (response.resultCode === 1006) {
        setSuccessMessage("Category registered successfully.");
        setNewCategoryName("");
        setCategories((prev) => [...(prev || []), ...response.data]);
      } else {
        setError(response.resultMessage || "Failed to register category.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while registering the category.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-xl">Loading categoriesц...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Орлогын төрөл</h2>

        <form onSubmit={handleRegisterCategory} className="space-y-4">
          <div>
            <label
              htmlFor="newCategory"
              className="block text-sm font-medium text-gray-700"
            >
              Шинэ төрөл нэмэх
            </label>
            <input
              type="text"
              id="newCategory"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Шинэ төрлийн нэрээ оруулна уу"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">{successMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={loading}
          >
            {loading ? "Registering..." : "Төрөл бүртгэх"}
          </button>
        </form>

        <h3 className="text-xl font-bold text-center mt-6">төрлийн жагсаалт</h3>
        <ul className="mt-4 space-y-2">
          {categories &&
            categories.map((category) => (
              <li
                key={category.id}
                className="bg-gray-100 px-4 py-2 rounded-md shadow-sm"
              >
                {category.categoryname}
              </li>
            ))}
        </ul>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Буцах{" "}
          <a href="/addtransaction?transactiontypeid=1" className="text-indigo-500 hover:underline">
          Гүйлгээ нэмэх
          </a>
        </p>
      </div>
    </div>
  );
}

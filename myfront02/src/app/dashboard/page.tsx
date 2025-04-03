"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../utils/api";

interface Data {
  uid: number;
  uname: string;
  fname: string;
  lname: string;
  lastlogin?: string;
  skills: [];
  education: [];
}

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

interface Response {
  resultCode: number;
  resultMessage: string;
  data: Data[];
  size: number;
  action: string;
  curdate: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<Entry[]>([]);
  const router = useRouter();
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [changed, setChanged] = useState<string | null>(null);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transitions.length / itemsPerPage);

  const paginatedTransitions = transitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleButtons = () => {
    setShowButtons((prev) => !prev);
  };

  const handleIncome = () => {
    const transactiontypeid = 1;
    router.push(`/addtransaction?transactiontypeid=${transactiontypeid}`);
  };

  const handleExpense = () => {
    const transactiontypeid = 2;
    router.push(`/addtransaction?transactiontypeid=${transactiontypeid}`);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const parsedUser = JSON.parse(token);
    try {
      const response: Response = await sendRequest(
        "http://localhost:8000/transaction/",
        "POST",
        {
          action: "deletetransaction",
          uid: parsedUser.uid,
          id: id,
        }
      );

      if (response.resultCode === 1011) {
        setTransitions((prev) => prev.filter((entry) => entry.id !== id));
        setChanged("Transaction deleted successfully.");
        alert("Transaction deleted successfully.");
      } else {
        setChanged("Failed to delete transaction: " + response.resultMessage);
        alert("Failed to delete transaction: " + response.resultMessage);
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("An error occurred while deleting the transaction.");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/edittransaction?id=${id}`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(token);

        let userResponse: Response = await sendRequest(
          "http://localhost:8000/useredit/",
          "POST",
          {
            action: "getuserresume",
            uid: parsedUser.uid,
          }
        );

        let transactionResponse: Response = await sendRequest(
          "http://localhost:8000/transaction/",
          "POST",
          {
            action: "getalltransaction",
            uid: parsedUser.uid,
          }
        );

        if (userResponse.resultCode === 1006) {
          setUser(userResponse.data[0]);
        } else {
          setError(userResponse.resultMessage);
          localStorage.removeItem("token");
          router.push("/login");
        }

        if (transactionResponse.resultCode === 1010) {
          setTransitions(transactionResponse.data);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching user data");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, changed]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalIncome = transitions
    .filter((entry) => entry.transactiontypeid === 1)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpense = transitions
    .filter((entry) => entry.transactiontypeid === 2)
    .reduce((sum, entry) => sum + entry.amount, 0);

  const accountBalance = totalIncome - totalExpense;

  if (loading) return <p className="text-center text-xl">Loading...</p>;

  return (
    <div className="max-w-fit mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Dashboard
      </h1>

      <div className="bg-gray-50 p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700">
          Тавтай морилно уу, {user?.fname} {user?.lname}!
        </h2>
        <p className="text-lg text-gray-600">Email: {user?.uname}</p>
        {user?.lastlogin && (
          <p className="text-lg text-gray-600">
            Сүүлд нэвтэрсэн: {new Date(user.lastlogin).toLocaleString()}
          </p>
        )}
        <div className="gap-5 justify-center flex">

        <button
          onClick={handleLogout}
          className="bg-indigo-400 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
          >
          Гарах
        </button> 
        <button
          onClick={() => router.push("/")}
          className="bg-indigo-400 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
          >
          Нүүр хуудас
        </button>
        <button
          onClick={() => router.push("/chart")}
          className="bg-indigo-400 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
          >
          График
        </button>
          </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-md shadow-md mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Данс
        </h2>
        <p className="text-lg text-green-700">
          Нийт орлого: {totalIncome.toLocaleString()} ₮
        </p>
        <p className="text-lg text-red-700">
          Нийт зарлага: {totalExpense.toLocaleString()} ₮
        </p>
        <p className="text-lg text-gray-700">
          Нийт дүн: {accountBalance.toLocaleString()} ₮
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md shadow-md mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Гүйлгээнүүд
        </h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Утга</th>
              <th className="border border-gray-300 p-2">Тайлбар</th>
              <th className="border border-gray-300 p-2">Гүйлгээ хийсэн өдөр</th>
              <th className="border border-gray-300 p-2">Төрөл</th>
              <th className="border border-gray-300 p-2">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransitions.map((entry, index) => (
              <tr key={entry.id}>
                <td className="border border-gray-300 p-2 text-center">
                  {index + 1}
                </td>
                <td
                  className={`border border-gray-300 p-2 text-right ${
                    entry.transactiontypeid === 1
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {entry.amount.toLocaleString()} ₮
                </td>
                <td className="border border-gray-300 p-2">
                  {entry.description}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(entry.createddate).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {entry.categoryname}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => handleEdit(entry.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-300 transition mr-2"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-300 transition"
                  >
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            disabled={currentPage === 1}
          >
            Өмнөх
          </button>
          <p className="text-gray-600">
            Хуудас {currentPage} of {totalPages}
          </p>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            disabled={currentPage === totalPages}
          >
            Дараах
          </button>
        </div>
      </div>

      
      <div className="flex justify-between mt-6">
        <button
          onClick={handleToggleButtons}
          className="bg-indigo-400 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
        >
          {showButtons ? "Үйлдэл нуух" : "Гүйлгээ нэмэх"}
        </button>
        {showButtons && (
          <div className="flex gap-4">
            <button
              onClick={handleIncome}
              className="bg-green-400 text-white px-6 py-2 rounded-md hover:bg-green-500 transition"
            >
              Орлого нэмэх
            </button>
            <button
              onClick={handleExpense}
              className="bg-red-400 text-white px-6 py-2 rounded-md hover:bg-red-500 transition"
            >
              Зарлага нэмэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


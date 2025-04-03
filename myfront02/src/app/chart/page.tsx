"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { sendRequest } from "../../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Data {
  uid: number;
  uname: string;
  fname: string;
  lname: string;
  lastlogin?: string;
}

interface Entry {
  id: number;
  amount: number;
  description: string;
  createddate: string;
  updateddate: string | null;
  transactiontypeid: number; // 1 for income, 2 for expense
  categoryname: string;
  categoryid: number;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: Data[] | Entry[];
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

  const monthlyIncome: number[] = Array(12).fill(0); // Сарын орлого
  const monthlyExpense: number[] = Array(12).fill(0); // Сарын зарлага

  transitions.forEach((entry) => {
    const month = new Date(entry.createddate).getMonth(); // Сар авах
    if (entry.transactiontypeid === 1) {
      monthlyIncome[month] += entry.amount;
    } else if (entry.transactiontypeid === 2) {
      monthlyExpense[month] += entry.amount;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(token);

        const userResponse: Response = await sendRequest(
          "http://localhost:8000/useredit/",
          "POST",
          {
            action: "getuserresume",
            uid: parsedUser.uid,
          }
        );

        const transactionResponse: Response = await sendRequest(
          "http://localhost:8000/transaction/",
          "POST",
          {
            action: "getalltransaction",
            uid: parsedUser.uid,
          }
        );

        if (userResponse.resultCode === 1006) {
          setUser(userResponse.data[0] as Data);
        } else {
          setError(userResponse.resultMessage);
          localStorage.removeItem("token");
          router.push("/login");
        }

        if (transactionResponse.resultCode === 1010) {
          setTransitions(transactionResponse.data as Entry[]);
        }
      } catch (err) {
        console.error(err);
        setError("Алдаа гарлаа. Дахин оролдоно уу.");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <p className="text-center text-xl">Уншиж байна...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">График</h1>

      {/* Жилийн орлого, зарлагын график */}
      <div className="bg-gray-50 p-4 rounded-md shadow-md mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Жилийн орлого, зарлага</h2>
        <Bar
          data={{
            labels: [
              "1 сар",
              "2 сар",
              "3 сар",
              "4 сар",
              "5 сар",
              "6 сар",
              "7 сар",
              "8 сар",
              "9 сар",
              "10 сар",
              "11 сар",
              "12 сар",
            ],
            datasets: [
              {
                label: "Орлого (₮)",
                data: monthlyIncome,
                backgroundColor: "#34d399",
                borderColor: "#059669",
                borderWidth: 1,
              },
              {
                label: "Зарлага (₮)",
                data: monthlyExpense,
                backgroundColor: "#f87171",
                borderColor: "#dc2626",
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              title: {
                display: true,
                text: "Жилийн орлого, зарлагын харьцуулалт",
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Цаг хугацаа (сар)",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Мөнгөн дүн (₮)",
                },
              },
            },
          }}
        />
      </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Буцах{" "}
          <a href="/dashboard" className="text-indigo-500 hover:underline">
            
      <button
          className="bg-indigo-400 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition mt-4"
        >
            Dashboard
        </button>
          </a>
        </p>
    </div>
  );
}

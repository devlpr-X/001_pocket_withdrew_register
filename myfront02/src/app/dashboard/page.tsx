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
  transactiontypeid: number;
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

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(token);
        // Assuming `parsedUser` contains a UID or some unique identifier

        let surl = "http://localhost:8000/useredit/";
        let smethod = "POST";
        let sbody = {
          action: "getuserresume",
          uid: parsedUser.uid,
        };

        const response: Response = await sendRequest(surl, smethod, sbody);
        
        const transitions =  await sendRequest("http://localhost:8000/transaction/", "POST", {
          action: "getalltransaction",
          uid: parsedUser.uid
        });

        console.log("getuserresume");
        console.log(response);
        console.log("transitions");
        console.log(transitions);
        
        if (response.resultCode === 1006) {
          setUser(response.data[0]); // Assuming the API response structure
          // console.log(response);
        } else {
          setError(response.resultMessage);
          localStorage.removeItem("token"); // Clear invalid token
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching user data");
        localStorage.removeItem("token"); // Clear token in case of failure
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  const handleIndex = () => {
    router.push("/");
  };

  if (loading) return <p className="text-center text-xl">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Dashboard
      </h1>

      <div className="bg-gray-50 p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700">
          Welcome, {user.fname} {user.lname}! {/* Change Password link */}
          <button
            onClick={() => router.push("/changepassword")}
            className="bg-gray-300 text-white px-6 py-1 rounded-md hover:bg-gray-700 transition"
          >
            Change Password
          </button>{" "}
          <button
            onClick={() => router.push("/edituser")}
            className="bg-gray-300 text-white px-6 py-1 rounded-md hover:bg-gray-700 transition"
          >
            Edit user
          </button>
        </h2>

        <p className="text-lg text-gray-600">Email: {user.uname}</p>
        {user.lastlogin && (
          <p className="text-lg text-gray-600">
            Last Login: {new Date(user.lastlogin).toLocaleString()}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleLogout}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Logout
        </button> <br />
        <button
          onClick={handleIndex}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Index
        </button>
      </div>
    </div>
  );
}

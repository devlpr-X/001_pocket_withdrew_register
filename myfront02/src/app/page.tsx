"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendRequest } from "../utils/api";
import { Data, handleLogout } from "../utils/other";


export default function Dashboard() {
  // const token = localStorage.getItem("token");
  const [user, setUser] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // console.log(token)
  // console.log(JSON.parse(token))
  // setUser(JSON.parse(token))
  // if (loading) return <p className="text-center text-xl">Loading...</p>;

  useEffect(() => {
    // Retrieve the user data from localStorage
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      // Parse the token and user data
      const parsedToken = JSON.parse(savedToken);
      setUser(parsedToken); // Set user state with the parsed token data
    } else {
      // If no token found, redirect to login or some other page
      router.push("/login");
    }
  }, [router]); // Empty dependency array ensures this runs once after initial render

  useEffect(() => {
    // Retrieve the user data from localStorage
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      // Parse the token and user data
      const parsedToken = JSON.parse(savedToken);
      setUser(parsedToken); // Set user state with the parsed token data
    } else {
      // If no token found, redirect to login or some other page
      router.push("/login");
    }
  }, []); // Empty dependency array ensures this runs once after initial render


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        HOME
      </h1>

      <div className="bg-gray-50 p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700">
          {user && (
            <>
              Welcome, {user.fname} {user.lname}!
              {/* Additional components or actions for the logged-in user */}
              <p className="text-lg text-gray-600">
                Last Login: {new Date(user.lastlogin).toLocaleString()}
              </p>
            </>
          )}
          {!user && (
            <>
              Welcome, Guest!
              {/* Optionally, display some content for guest users */}
            </>
          )}
          <br />
          <button
            onClick={() => router.push("/changepassword")}
            style={{ marginTop: "10px" }} 
            className="bg-gray-300 text-white px-6 py-1 rounded-md hover:bg-gray-700 transition"
          >
            Change Password
          </button>{" "} <br />
          <button
            onClick={() => router.push("/edituser")}
            className="bg-gray-300 text-white px-6 py-1 rounded-md hover:bg-gray-700 transition"
            style={{ marginTop: "10px" }} 
          >
            Edit user
          </button>
        </h2>

        {/* <p className="text-lg text-gray-600">Email: {user.uname}</p> */}
        {/* {user.lastlogin && (
          <p className="text-lg text-gray-600">
            Last Login: {new Date(user.lastlogin).toLocaleString()}
          </p>
        )} */}
        
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleLogout}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

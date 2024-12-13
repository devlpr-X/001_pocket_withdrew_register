"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendRequest, convertToMD5password } from "../../utils/api";

interface Data {
  uid: number;
  uname: string;
  lname: string;
  fname: string;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: Data[];
  size: number;
  action: string;
  curdate: string;
}

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Initially set to true
  const router = useRouter();

  // Check if the user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect logged-in users immediately
      router.push("/dashboard");
    } else {
      // No token found, set loading to false after the check
      setLoading(false);
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = convertToMD5password(password); // Convert password to MD5 hash

      let surl = "http://localhost:8000/user/";
      let smethod = "POST";
      let sbody = {
        action: "register",
        uname: email,
        upassword: hashedPassword,
        lname: lastName,
        fname: firstName,
      };

      const response: Response = await sendRequest(surl, smethod, sbody);

      // Handle the response based on the resultCode
      if (response.resultCode === 200) {
        // Successful registration, redirect to login page
        const userData = response.data[0];
        setSuccessMessage(response.resultMessage);
        setError(""); // Clear any previous error
      } else {
        setSuccessMessage(""); // Clear success message on error
        setError(response.resultMessage);
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while trying to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-xl">Loading...</p>; // Show loading state while checking if the user is logged in

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your last name"
            />
          </div>

          {/* Display error or success message */}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

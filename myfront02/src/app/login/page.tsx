"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendRequest, convertToMD5password } from "../../utils/api";

interface Data {
  uid: number;
  uname: string;
  lname: string;
  fname: string;
  lastlogin: string;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: Data[];
  size: number;
  action: string;
  curdate: string;
}

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Initially set to true, as we need to check the login state first
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      setLoading(false); // Once the check is complete, set loading to false and show the login form
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const hashedPassword = convertToMD5password(password); // Convert password to MD5 hash

      let surl = "http://localhost:8000/user/";
      let smethod = "POST";
      let sbody = {
        action: "login",
        uname: email,
        upassword: hashedPassword,
      };

      const response: Response = await sendRequest(surl, smethod, sbody);

      if (response.resultCode === 1002 && response.data?.length) {
        const userData = response.data[0];
        localStorage.setItem("token", JSON.stringify(userData)); // Save user data
        router.push("/dashboard");
      } else {
        setError(response.resultMessage);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-xl">Loading...</p>; // Show loading state while checking if the user is logged in

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to Your Account
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
          {/* Display the error message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <a href="register" className="text-indigo-500 hover:underline">
            Sign up
          </a>
        </p>

        <p className="mt-2 text-sm text-gray-500 text-center">
          Forgot your password?
          <a href="/forgot" className="text-indigo-500 hover:underline">
            Reset it here
          </a>
        </p>
      </div>
    </div>
  );
}

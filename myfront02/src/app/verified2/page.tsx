"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendRequest, convertToMD5password  } from "../../utils/api";
// import { sendRequest, convertToMD5password } from "../../utils/api";

interface Response {
  resultCode: number;
  resultMessage: string;
  data: any[]; // Adjust this type as needed
  size: number;
  action: string;
  curdate: string;
}

export default function Verified() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const router = useRouter();
  const token = new URLSearchParams(window.location.search).get("token");

  const sendRequest = async (url: string, method: string, body?: object) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error during API request:", error);
      throw error;
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setError("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        const surl = `http://localhost:8000/user/?token=${token}`;
        const smethod = "GET";

        const response: Response = await sendRequest(surl, smethod);

        if (response.resultCode === 3010 || response.resultCode === 3011) {
          setSuccessMessage(response.resultMessage);
          setError(null);
        } else {
          setError(response.resultMessage);
          setSuccessMessage(null);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while verifying your account.");
        setSuccessMessage(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetError("Please fill out both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    try {
      const surl = `http://127.0.0.1:8000/user/`;
      const smethod = "POST";
      const sbody = {
        action: "resetpassword",
        token,
        newpass: convertToMD5password(newPassword)
      };

      const response = await sendRequest(surl, smethod, sbody);

      if (response.resultCode === 3019) {
        setResetSuccess(response.resultMessage);
        setResetError(null);
      } else {
        setResetError(response.resultMessage);
        setResetSuccess(null);
      }
    } catch (err) {
      console.error(err);
      setResetError("An error occurred while resetting the password.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Хаяг баталгаажуулалт
      </h1>
      {successMessage && (
        <p className="text-green-600 text-center text-lg">{successMessage}</p>
      )}
      {error && (
        <p className="text-red-600 text-center text-lg">{error}</p>
      )}

      {successMessage && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Шинэ нууц үг оруулна уу:
          </h2>
          <input
            type="password"
            placeholder="Шинэ нууц үг"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <input
            type="password"
            placeholder="Шинэ нууц үгээ давтана уу"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          {resetError && (
            <p className="text-red-600 text-sm mb-2">{resetError}</p>
          )}
          {resetSuccess && (
            <p className="text-green-600 text-sm mb-2">{resetSuccess}</p>
          )}
          <button
            onClick={handleResetPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Нууц үг шинэчлэх
          </button>
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md"
      >
        Нүүр хуудас руу буцах
      </button>
    </div>
  );
}

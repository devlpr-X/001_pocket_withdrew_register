"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendRequest } from "../../utils/api";

interface Data {
  uid: number;
  uname: string;
  fname: string;
  lname: string;
}

interface Response {
  resultCode: number;
  resultMessage: string;
  data: Data[];
  size: number;
  action: string;
  curdate: string;
}

export default function EditUser() {
  const [user, setUser] = useState<Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [newFname, setNewFname] = useState<string>("");
  const [newLname, setNewLname] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = localStorage.getItem("token");
      if (!userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        // Fetching the current user info
        const response: Response = await sendRequest(
          "http://localhost:8000/useredit/",
          "POST",
          {
            action: "getuserresume",
            uid: parsedUser.uid,
          }
        );

        if (response.resultCode === 1006 && response.data?.length) {
          const currentUser = response.data[0];
          setUser(currentUser);
          setNewFname(currentUser.fname);
          setNewLname(currentUser.lname);
          setSuccessMessage(response.resultMessage);
          setError("");
        } else {
          setSuccessMessage("");
          setError(response.resultMessage);
          localStorage.removeItem("token");
          router.push("/login");
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
  }, [router]);

  const handleSaveChanges = async () => {
    if (newFname === user?.fname && newLname === user?.lname) {
      setSuccessMessage("");
      setError("No changes detected.");
      return;
    }

    try {
      // Send the updated first name and last name
      const response = await sendRequest(
        "http://localhost:8000/useredit/",
        "POST",
        {
          action: "edituser",
          uid: user?.uid,
          fname: newFname,
          lname: newLname,
        }
      );

      if (response.resultCode === 1005) {
        setUser({ ...user, fname: newFname, lname: newLname });
        setError("");
        setSuccessMessage(response.resultMessage);
      } else {
        setSuccessMessage("");
        setError(response.resultMessage);
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage("");
      setError("An error occurred while updating user data");
    }
  };

  if (loading) return <p className="text-center text-xl">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Edit User Info
      </h1>

      <div className="bg-gray-50 p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700">
          Edit your details
        </h2>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={newFname}
            onChange={(e) => setNewFname(e.target.value)}
            className="mt-2 p-2 w-full border rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={newLname}
            onChange={(e) => setNewLname(e.target.value)}
            className="mt-2 p-2 w-full border rounded-md"
          />
        </div>

        {/* Display error or success message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm text-center">{successMessage}</p>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSaveChanges}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

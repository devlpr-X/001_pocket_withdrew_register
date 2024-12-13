"use client";
import { useRouter } from "next/navigation";

const router = useRouter();

export interface Data {
  uid: number;
  uname: string;
  fname: string;
  lname: string;
  lastlogin?: string; // Optional as it might not exist initially
  skills: [];
  education: [];
}

export interface Response {
  resultCode: number;
  resultMessage: string;
  // data: Data[];
  size: number;
  action: string;
  curdate: string;
}

export const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
export const sendRequest = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: Record<string, any> | null = null,
  headers: Record<string, string> = {}
): Promise<any> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during API request:", error);
    throw error;
  }
};

export const convertToMD5password = (password: string): string => {
  const crypto = require("crypto");
  return crypto.createHash("md5").update(password).digest("hex");
};

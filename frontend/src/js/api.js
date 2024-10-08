// api.js

// Helper function to make fetch requests
async function fetchAPI(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

const baseUrl = "http://localhost:3000";

// 1. Signup
export async function signup(userData) {
  const url = `${baseUrl}/signup`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  };
  return fetchAPI(url, options);
}

// 2. Sign-in
export async function signin(credentials) {
  const url = `${baseUrl}/signin`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  };
  return fetchAPI(url, options).then((data) => {
    // Store the token in localStorage upon successful sign-in
    localStorage.setItem("token", data.token);
    return data;
  });
}

// 3. Update User Information
export async function updateUser(token, userData) {
  const url = `${baseUrl}/user`;
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(userData),
  };
  return fetchAPI(url, options);
}

// 4. Delete Account
export async function deleteAccount(token) {
  const url = `${baseUrl}/user`;
  const options = {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  };
  return fetchAPI(url, options);
}

// 5. Get All Users Who Need Help
export async function getUsersNeedHelp() {
  const url = `${baseUrl}/users/need-help`;
  const options = {
    method: "GET",
  };
  return fetchAPI(url, options);
}

// 6. Sign-out
export async function signout() {
  localStorage.removeItem("token");
  // You might want to redirect the user to a login page or refresh the page here
}

// 7. Get User Data
export async function getUserData(token) {
  const url = `${baseUrl}/user`;
  const options = {
    method: "GET",
    headers: {
      Authorization: token,
    },
  };
  return fetchAPI(url, options);
}

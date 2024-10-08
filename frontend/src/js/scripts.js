// Helper function to make fetch requests
async function fetchAPI(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Something went wrong");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

const baseUrl = "http://localhost:3000";

// API functions
const api = {
  signup: async (userData) => {
    return fetchAPI(`${baseUrl}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  signin: async (credentials) => {
    const data = await fetchAPI(`${baseUrl}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    localStorage.setItem("token", data.token);
    return data;
  },

  updateUser: async (userData) => {
    const token = localStorage.getItem("token");
    return fetchAPI(`${baseUrl}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(userData),
    });
  },

  deleteAccount: async () => {
    const token = localStorage.getItem("token");
    return fetchAPI(`${baseUrl}/user`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
  },

  getUsersNeedHelp: async () => {
    return fetchAPI(`${baseUrl}/users/need-help`, { method: "GET" });
  },

  signout: () => {
    localStorage.removeItem("token");
  },

  getUserData: async () => {
    const token = localStorage.getItem("token");
    return fetchAPI(`${baseUrl}/user`, {
      method: "GET",
      headers: { Authorization: token },
    });
  },
};

// UI functions
const ui = {
  showFloodPeople: async () => {
    try {
      const users = await api.getUsersNeedHelp();
      const usersList = document.getElementById("usersList");
      usersList.innerHTML = users.map(user => `
        <li>
          <strong>${user.name}</strong>
          <ul>
            <li><strong>Address:</strong> ${user.address}</li>
            <li><strong>Telephone:</strong> ${user.telephone}</li>
          </ul>
        </li>
      `).join('');
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },

  showUserData: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const userData = await api.getUserData();
      document.getElementById("userData").innerHTML = `
        <h2>User Information</h2>
        <p><strong>Name:</strong> ${userData.name}</p>
        <p><strong>Help:</strong> ${userData.help}</p>
        <p><strong>Address:</strong> ${userData.address}</p>
        <p><strong>Telephone:</strong> ${userData.telephone}</p>
      `;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },
};

// Event handlers
const handlers = {
  addVictim: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login first");

      await api.updateUser({ help: 1 });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "You've been added to the victim list.",
      });
      ui.showFloodPeople();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong! Please login!",
      });
      window.location.href = "login.html";
    }
  },

  delVictim: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login first");

      await api.updateUser({ help: 0 });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "You've been removed from the victim list.",
      });
      ui.showFloodPeople();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong! Please login!",
      });
      window.location.href = "login.html";
    }
  },

  logout: async () => {
    try {
      api.signout();
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Logout successful.",
      });
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout failed:", error);
      await Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Logout failed. Please try again.",
      });
    }
  },

  delAct: async () => {
    try {
      await api.deleteAccount();
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Account deleted successfully.",
      });
      window.location.href = "login.html";
    } catch (error) {
      console.error("Account deletion failed:", error);
      await Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Account deletion failed. Please try again.",
      });
    }
  },

  handleRegistration: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      await api.signup(userData);
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Registration successful. Please log in.",
      });
      switchTab("login");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message || "An error occurred during registration.",
      });
    }
  },

  handleLogin: async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const credentials = Object.fromEntries(formData.entries());

    try {
      await api.signin(credentials);
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Login successful.",
      });
      window.location.href = "index.html";
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message || "Invalid username or password.",
      });
    }
  },

  
};
const handleUpdateUserData  = async () => {
  const userData = {
    name: document.getElementById("name").value,
    telephone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
  };

  try {
    await api.updateUser(userData);
    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "User data updated successfully.",
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message || "An error occurred while updating user data.",
    });
  }
}
// Initialize event listeners
function initializeFormListeners() {
  const forms = {
    "register-form": handlers.handleRegistration,
    "login-form": handlers.handleLogin
  };

  Object.entries(forms).forEach(([formId, handler]) => {
    const form = document.getElementById(formId);
    if (form) form.addEventListener("submit", handler);
  });
}

// Call this function when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeFormListeners);

// Expose necessary functions to the global scope
window.addVictim = handlers.addVictim;
window.delVictim = handlers.delVictim;
window.logout = handlers.logout;
window.delAct = handlers.delAct;

// Initialize UI
ui.showFloodPeople();
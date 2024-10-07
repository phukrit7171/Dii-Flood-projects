// Helper function to make fetch requests
async function fetchAPI(url, options) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  }
  
  const baseUrl = 'http://localhost:3000';
  
  // 1. Signup
  async function signup(userData) {
    const url = `${baseUrl}/signup`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };
    return fetchAPI(url, options);
  }
  
  // 2. Sign-in
  async function signin(credentials) {
    const url = `${baseUrl}/signin`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    };
    return fetchAPI(url, options)
      .then(data => {
        // Store the token in localStorage upon successful sign-in
        localStorage.setItem('token', data.token);
        return data; 
      });
  }
  
  // 3. Update User Information
  async function updateUser(token, userData) {
    const url = `${baseUrl}/user`;
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(userData),
    };
    return fetchAPI(url, options);
  }
  
  // 4. Delete Account
  async function deleteAccount(token) {
    const url = `${baseUrl}/user`;
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    };
    return fetchAPI(url, options);
  }
  
  // 5. Get All Users Who Need Help
  async function getUsersNeedHelp() {
    const url = `${baseUrl}/users/need-help`;
    const options = {
      method: 'GET',
    };
    return fetchAPI(url, options);
  }

  // 6. Sign-out
  async function signout() {
    localStorage.removeItem('token');
    // You might want to redirect the user to a login page or refresh the page here
  }
  
 // Example usage:
//   signup({ username: 'testuser', password: 'testpass', name: 'Test User', address: '123 Test St', telephone: '1234567890', help: false })
//     .then(data => console.log(data))
//     .catch(error => console.error(error));
  
//   signin({ username: 'phu', password: '123' })
//     .then(data => console.log(data))
//     .catch(error => console.error(error));
  
// updateUser('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTcyODMyMzUzMiwiZXhwIjoxNzI4MzI3MTMyfQ.n10NGxJIcWLa_mt0LmTnI6lc2g1ZdTFb1UCv0MDS2yo', { help: false})
// .then(data => console.log(data))
// .catch(error => console.error(error));

// deleteAccount('your_jwt_token')
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

//   getUsersNeedHelp()
//     .then(data => console.log(data))
//     .catch(error => console.error(error));

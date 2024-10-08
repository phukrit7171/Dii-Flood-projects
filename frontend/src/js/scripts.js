// scripts.js

import { getUsersNeedHelp,getUserData , signin} from './api.js';

const showFloodPeople = async () => {
  try {
    const users = await getUsersNeedHelp();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = ''; // Clear previous list

    users.forEach(user => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${user.name}</strong>
        <ul>
          <li><strong>Address:</strong> ${user.address}</li>
          <li><strong>Telephone:</strong> ${user.telephone}</li>
        </ul>
      `;
      usersList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const showUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle case where user is not logged in
      return;
    }

    const userData = await getUserData(token);
    const userDataContainer = document.getElementById('userData');
    userDataContainer.innerHTML = `
      <h2>User Information</h2>
      <p><strong>Name:</strong> ${userData.name}</p>
      <p><strong>Help:</strong> ${userData.help}</p>
      <p><strong>Address:</strong> ${userData.address}</p>
      <p><strong>Telephone:</strong> ${userData.telephone}</p>
    `;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

//test
// signin({"username":"phu","password":"123"}).then(data => {
//   console.log(data);
//   showUserData();
// });

// showFloodPeople();
// scripts.js

import { getUsersNeedHelp } from './api.js';

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

showFloodPeople();
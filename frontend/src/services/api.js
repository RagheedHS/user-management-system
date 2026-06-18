const API_BASE_URL = 'http://localhost:8080/api/users';

// Fallback Mock Data for Local Storage
const DEFAULT_USERS = [
  {
    id: 1,
    username: "sconnor",
    name: "Sarah Connor",
    email: "sarah@resistance.io",
    role: "Admin",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 2,
    username: "jconnor",
    name: "John Connor",
    email: "john@resistance.io",
    role: "Editor",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 3,
    username: "mwright",
    name: "Marcus Wright",
    email: "marcus@skynet.com",
    role: "Viewer",
    status: "Pending",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 4,
    username: "kreese",
    name: "Kyle Reese",
    email: "kyle@resistance.io",
    role: "Viewer",
    status: "Inactive",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const getLocalUsers = () => {
  const users = localStorage.getItem('ums_users');
  if (!users) {
    localStorage.setItem('ums_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(users);
};

const setLocalUsers = (users) => {
  localStorage.setItem('ums_users', JSON.stringify(users));
};

export const apiService = {
  async getUsers() {
    try {
      const response = await fetch(API_BASE_URL, { signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      console.log('Fetched from Spring Boot backend API');
      // Sync local storage for consistency
      setLocalUsers(data);
      return data;
    } catch (error) {
      console.warn('Backend offline, using localStorage fallback:', error.message);
      return getLocalUsers();
    }
  },

  async createUser(user) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Backend offline, creating in localStorage');
      const users = getLocalUsers();
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = { 
        ...user, 
        id: newId, 
        createdAt: new Date().toISOString() 
      };
      users.push(newUser);
      setLocalUsers(users);
      return newUser;
    }
  },

  async updateUser(id, user) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Backend offline, updating in localStorage');
      const users = getLocalUsers();
      const index = users.findIndex(u => u.id === Number(id));
      if (index !== -1) {
        users[index] = { ...users[index], ...user };
        setLocalUsers(users);
        return users[index];
      }
      throw new Error('User not found');
    }
  },

  async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error('API failed');
      return true;
    } catch (error) {
      console.warn('Backend offline, deleting from localStorage');
      const users = getLocalUsers();
      const updated = users.filter(u => u.id !== Number(id));
      setLocalUsers(updated);
      return true;
    }
  }
};

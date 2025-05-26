// User API service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const defaultHeaders = {
    'Content-Type': 'application/json'
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    return {
        ...defaultHeaders,
        'Authorization': `Bearer ${token}`,
    };
};

// Get all users (admin only) - used for finding user by email
export const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Find user ID by email (admin only)
export const getUserIdByEmail = async (email) => {
    try {
        const users = await getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            throw new Error('User not found with that email address');
        }
        
        return user.id;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

// Validate if email exists (admin only)
export const validateUserEmail = async (email) => {
    try {
        const users = await getAllUsers();
        return users.some(u => u.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
        console.error('Error validating user email:', error);
        return false;
    }
};

const API_BASE_URL = 'http://localhost:8080'; // Tambahkan http://
const defaultHeaders = {
    'Content-Type': 'application/json'
};
export const fetchCurrentUser = async () => {
    try {
        const token = localStorage.getItem('jwtToken')?.trim();
        if (!token) throw new Error('Token tidak ditemukan');

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                ...defaultHeaders,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data user');
        }

        const userData = await response.json();
        return userData;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

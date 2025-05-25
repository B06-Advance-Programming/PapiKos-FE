const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const defaultHeaders = {
    'Content-Type': 'application/json'
};

export const fetchAllKost = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost`, {
            headers: defaultHeaders
        });
        if (!response.ok) {
            throw new Error('Gagal fetch data kost');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

export const fetchKostByOwnerId = async (ownerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost/${ownerId}`, {
            headers: defaultHeaders
        });
        if (!response.ok) {
            throw new Error('Gagal fetch data kost by owner');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

export const deleteKost = async (kostId) => {
    try {
        const token = localStorage.getItem('jwtToken')?.trim();

        const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost/${kostId}`, {
            method: 'DELETE',
            headers: {
                ...defaultHeaders,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Gagal menghapus kost');
        }
        return true; // sukses delete
    } catch (error) {
        console.error('Error:', error);
        return false; // gagal delete
    }
};

export const editKost = async (kostId, kostData) => {
    try {
        const token = localStorage.getItem('jwtToken')?.trim();

        const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost/${kostId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(kostData),
        });

        if (!response.ok) {
            throw new Error('Gagal update kost');
        }

        return true;
    } catch (error) {
        console.error('Error saat update kost:', error);
        return false;
    }
};

export const addKost = async (kostData) => {
    try {
        const token = localStorage.getItem('jwtToken')?.trim();

        const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(kostData),
        });

        if (!response.ok) {
            throw new Error('Gagal update kost');
        }

        return true;
    } catch (error) {
        console.error('Error saat update kost:', error);
        return false;
    }
};

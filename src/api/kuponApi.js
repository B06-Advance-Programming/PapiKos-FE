// src/api/kuponApi.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BASE_URL = `${API_BASE_URL}/api/kupon`;

const token = localStorage.getItem("jwtToken");

export const getAllKupons = async () => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const getKuponById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const deleteKupon = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    // kamu bisa cek status code untuk pesan lebih spesifik
    throw new Error(`Gagal menghapus kupon (status ${response.status})`);
  }
};

export const createKupon = async (kuponData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(kuponData),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Gagal membuat kupon");
  }
  return response.json();
};

export const updateKupon = async (id, kuponData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(kuponData),
  });
  if (!response.ok) {
    throw new Error(`Gagal mengupdate kupon (status ${response.status})`);
  }
  return response.json();
};

export const getKuponsByKost = async (kostId) => {
  const response = await fetch(`${BASE_URL}/kost/${kostId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon berdasarkan kost");
  }
  return response.json();
};

// Fixed function with better error handling
export async function getKuponsByOwnerId(ownerId) {
  try {
    // Get fresh token from localStorage
    const currentToken = localStorage.getItem("jwtToken");

    const response = await fetch(`${BASE_URL}/owner/${ownerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });

    // Debug logging
    console.log('Request URL:', `${BASE_URL}/owner/${ownerId}`);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle different response statuses
    if (response.status === 204) {
      // No content - return empty array
      console.log('No kupons found for owner');
      return [];
    }

    if (response.status === 403) {
      // Forbidden - likely authorization issue
      const errorText = await response.text();
      console.error('Authorization error:', errorText);
      throw new Error('Tidak memiliki izin untuk mengakses kupon ini');
    }

    if (response.status === 401) {
      // Unauthorized - token issue
      const errorText = await response.text();
      console.error('Authentication error:', errorText);
      throw new Error('Token tidak valid atau sudah expired');
    }

    if (!response.ok) {
      // Other errors
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Gagal memuat kupon pemilik (status ${response.status})`);
    }

    // Check if response has content and is JSON
    const contentType = response.headers.get("content-type");
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      throw new Error("Server mengembalikan response non-JSON");
    }

    const data = await response.json();
    console.log('Successfully parsed JSON data:', data);
    return data;

  } catch (error) {
    console.error('Error in getKuponsByOwnerId:', error);
    throw error;
  }
}

export const getKostByOwner = async (ownerId) => {
  const currentToken = localStorage.getItem("jwtToken");
  try {
    const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost/${ownerId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Network response was not OK');
    }
    
    const data = await response.json();
    console.log("Data:", data);
    return data; // Ini yang penting - return data-nya
  } catch (error) {
    console.error("Error fetching:", error);
    throw error; // Re-throw error agar bisa ditangkap di component
  }
};

export const getAllKost = async () => {
  const currentToken = localStorage.getItem("jwtToken");
  try {
    const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("All Kost Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching all kost data:", error);
    throw error;
  }
};
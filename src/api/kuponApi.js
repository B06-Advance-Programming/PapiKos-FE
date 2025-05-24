// src/api/kuponApi.js
const BASE_URL = "https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/kupon";

const token = localStorage.getItem("jwtToken");

export const getAllKupons = async () => {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"},
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const getKuponById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"},
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const deleteKupon = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"},
  });
  if (!response.ok) {
    // kamu bisa cek status code untuk pesan lebih spesifik
    throw new Error(`Gagal menghapus kupon (status ${response.status})`);
  }
};

export const createKupon = async (kuponData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"},
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
    "Content-Type": "application/json" },
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
    "Content-Type": "application/json"},
  });
  if (!response.ok) {
    throw new Error("Gagal fetch kupon berdasarkan kost");
  }
  return response.json();
};

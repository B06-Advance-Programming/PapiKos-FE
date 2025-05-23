const BASE_URL = "http://localhost:8080/api/kupon";

export const getAllKupons = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const getKuponById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Gagal fetch kupon");
  }
  return response.json();
};

export const deleteKupon = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Gagal menghapus kupon");
};

export const createKupon = async (kuponData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kuponData),
  });
  if (!response.ok) {
    throw new Error("Gagal membuat kupon");
  }
  return response.json();
};

export const updateKupon = async (id, kuponData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kuponData),
  });
  if (!response.ok) {
    throw new Error("Gagal mengupdate kupon");
  }
  return response.json();
};

export const getKuponsByKost = async (kostId) => {
  const response = await fetch(`${BASE_URL}/kost/${kostId}`);
  if (!response.ok) {
    throw new Error("Gagal fetch kupon berdasarkan kost");
  }
  return response.json();
};


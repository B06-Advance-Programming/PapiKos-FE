const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BASE_URL = `${API_BASE_URL}/api/kupon`;

export const getAllKupons = async () => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });
    if (response.status === 403) {
      console.error(`[API Error]: Anda Tidak Memiliki Akses (403)`);
      throw new Error("Anda tidak memiliki izin untuk melihat daftar kupon.");
    }
    if (!response.ok) {
      console.error(`[API Error]: Gagal Mengambil Data (Status: ${response.status})`);
      throw new Error("Gagal mengambil daftar kupon. Silakan coba lagi nanti.");
    }

    return response.json();
  } catch (error) {
    console.error('[API Catch]:', error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil kupon.");
  }
};

export const getKuponById = async (id) => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });
    if (response.status === 403) {
      console.error(`[API Error] getKuponById (${id}): Anda Tidak Memiliki Akses (403)`);
      throw new Error("Anda tidak memiliki izin untuk melihat detail kupon ini.");
    }
    if (!response.ok) {
      console.error(`[API Error] getKuponById (${id}): Gagal Mendapatkan Detail (Status: ${response.status})`);
      throw new Error(`Gagal mengambil detail kupon (ID: ${id}). Coba lagi nanti.`);
    }

    return response.json();
  } catch (error) {
    console.error(`[API Catch] Kupon: `, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil detail kupon.");
  }
};

export const deleteKupon = async (id) => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });
    if (response.status === 403) {
      console.error(`[API Error] deleteKupon (${id}): Anda Tidak Memiliki Akses (403)`);
      throw new Error("Anda tidak memiliki izin untuk menghapus kupon ini.");
    }
    if (!response.ok) {
      console.error(`[API Error] deleteKupon (${id}): Gagal Menghapus (Status: ${response.status})`);
      throw new Error(`Gagal menghapus kupon (ID: ${id}). Coba lagi nanti.`);
    }
    if (response.status === 204) {
      return { success: true, message: "Kupon berhasil dihapus." };
    }
    return response.json();
  } catch (error) {
    console.error(`[API Catch] deleteKupon: `, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat menghapus kupon.");
  }
};

export const createKupon = async (kuponData) => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(kuponData),
    });
    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Membuat Kupon!`);
      throw new Error("Anda Tidak Memiliki Akses")
    }
    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Membuat Kupon (Dari Server): ${response.status}`);
      throw new Error("Gagal membuat kupon, Coba Lagi Nanti!");
    }
    return response.json
  } catch (error) {
    console.error('[API Catch] createKupon: ', error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat membuat kupon.");
  }

};

export const updateKupon = async (id, kuponData) => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(kuponData),
    });
    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Meng-update Data Kupon!`);
      throw new Error("Anda Tidak Memiliki Akses")
    }
    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Melakukan Update Kupon (Dari Server): ${response.status}`);
      throw new Error(`Gagal Mengupdate Kupon! Coba Lagi Nanti!`);
    }
    return response.json();
  }
  catch (error) {
    console.error(`[API Catch] updateKupon: `, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat memperbarui kupon.");
  }
};

export const getKuponsByKost = async (kostId) => {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}/kost/${kostId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });
    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Mengambil Data Kupon!`);
      throw new Error("Anda Tidak Memiliki Akses")
    }
    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Mengambil Data Kupon Berdasarkan Kost (Dari Server): ${response.status}`);
      throw new Error("Gagal Mengambil Data Kupon Berdasarkan Kost! Coba Lagi Nanti");
    }
    return response.json();
  }
  catch (error) {
    console.error(`[API Catch] getKuponsByKost:`, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil kupon berdasarkan kost.");
  }

};

export async function getKuponsByOwnerId(ownerId) {
  try {
    const currentToken = localStorage.getItem("jwtToken");
    const response = await fetch(`${BASE_URL}/owner/${ownerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json"
      },
    });

    if (response.status === 204) {
      console.log('No kupons found for owner');
      return [];
    }

    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Mengambil Data Kupon!`);
      throw new Error('Tidak memiliki Akses!');
    }

    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Memuat Data Kupon (Dari Server): ${response.status}`);
      throw new Error(`Gagal Memuat Data Kupon! Coba Lagi Nanti`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`[API Catch] getKuponsByOwnerId:`, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil kupon berdasarkan owner.");
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

    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Mengambil Data Kupon!`);
      throw new Error('Tidak memiliki Akses!');
    }

    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Memuat Data Kost (Dari Server): ${response.status}`);
      throw new Error(`Gagal Memuat Data Kost! Coba Lagi Nanti`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API Catch] getKostByOwner:`, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil kupon berdasarkan owner.");
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

    if (response.status === 403) {
      console.error(`Anda Tidak Memiliki Akses untuk Mengambil Data Kupon!`);
      throw new Error('Tidak memiliki Akses!');
    }

    if (!response.ok) {
      console.error(`[ERROR] Error Dalam Memuat Data Kost (Dari Server): ${response.status}`);
      throw new Error('Gagal Mengambil Data Kost! Coba Lagi Nanti');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API Catch] getAllKost:`, error.message);
    throw error instanceof Error ? error : new Error("Terjadi kesalahan tak terduga saat mengambil data kost.");
  }
};
// 📁 src/api/penyewaanApi.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchAllKosts = async () => {
  const res = await fetch(`${API_BASE_URL}/api/pengelolaan_kost`, { headers: getAuthHeaders() });
  return res.json();
};

export async function createPenyewaan(payload) {
  const token = localStorage.getItem('jwtToken');
  const res = await fetch(`${API_BASE_URL}/api/penyewaan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to create penyewaan');
  return res.json();
}


export const updatePenyewaan = async (data) => {
  const res = await fetch(`${API_BASE_URL}/api/penyewaan`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deletePenyewaan = async (id) => {
  await fetch(`${API_BASE_URL}/api/penyewaan/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
};

export async function searchKosts(query) {
  const response = await fetch(`${API_BASE_URL}/api/pengelolaan_kost?search=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search kosts');
  return response.json();
}

export async function getMyBookings() {
  const token = localStorage.getItem('jwtToken');
  const response = await fetch(`${API_BASE_URL}/api/penyewaan/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to get bookings');
  return response.json();
}

export async function getPemilikBookings() {
  const token = localStorage.getItem('jwtToken');
  const response = await fetch(`${API_BASE_URL}/api/penyewaan/pemilik`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to get bookings');
  return response.json();
}

export async function cancelBooking(penyewaan) {
  const payload = {
    id: penyewaan.id,
    namaLengkap: penyewaan.namaLengkap,
    nomorTelepon: penyewaan.nomorTelepon,
    tanggalCheckIn: penyewaan.tanggalCheckIn,
    durasiBulan: penyewaan.durasiBulan,
    kostId: penyewaan.kostId,
    userId: penyewaan.userId,
    status: 'DIBATALKAN'
    // status is set in BE, so no need here
  };

  const res = await fetch(`${API_BASE_URL}/api/penyewaan`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to cancel booking');
  return res.json();
}

export async function setujuiBooking(penyewaan) {
  const payload = {
    id: penyewaan.id,
    namaLengkap: penyewaan.namaLengkap,
    nomorTelepon: penyewaan.nomorTelepon,
    tanggalCheckIn: penyewaan.tanggalCheckIn,
    durasiBulan: penyewaan.durasiBulan,
    kostId: penyewaan.kostId,
    userId: penyewaan.userId,
    status: 'DISETUJUI'
    // status is set in BE, so no need here
  };

  const res = await fetch(`${API_BASE_URL}/api/penyewaan`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to setujui booking');
  return res.json();
}
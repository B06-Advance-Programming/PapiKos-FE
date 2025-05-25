import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

// Helper formatting functions
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

function statusColor(status) {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return "#27AE60"; // green
    case "PENDING":
      return "#F2994A"; // orange
    case "FAILED":
      return "#EB5757"; // red
    default:
      return "#999"; // gray
  }
}

function paymentTypeLabel(type) {
  switch (type) {
    case "TOP_UP":
      return "Top Up";
    case "KOST_PAYMENT":
      return "Bayar Kos";
    default:
      return type;
  }
}

function TransactionTable({ transactions }) {
  if (!transactions?.length) {
    return <p>Belum ada transaksi.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
      <thead>
        <tr
          style={{
            background: "#f0f4ff",
            textAlign: "left",
            fontWeight: "600",
            color: "#33475b",
          }}
        >
          <th style={{ padding: "12px 10px", borderBottom: "3px solid #cbd5e1" }}>ID</th>
          <th style={{ padding: "12px 10px", borderBottom: "3px solid #cbd5e1" }}>
            Tanggal Transaksi
          </th>
          <th style={{ padding: "12px 10px", borderBottom: "3px solid #cbd5e1" }}>
            Jenis Pembayaran
          </th>
          <th style={{ padding: "12px 10px", borderBottom: "3px solid #cbd5e1" }}>Jumlah</th>
          <th style={{ padding: "12px 10px", borderBottom: "3px solid #cbd5e1" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((trx) => (
          <tr
            key={trx.id}
            style={{
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: trx.id % 2 === 0 ? "#fafbff" : "#fff",
            }}
          >
            <td style={{ padding: "12px 10px", color: "#344050" }}>{trx.id}</td>
            <td style={{ padding: "12px 10px", color: "#475569" }}>
              {formatDate(trx.transactionDateTime)}
            </td>
            <td style={{ padding: "12px 10px", color: "#475569" }}>
              {paymentTypeLabel(trx.paymentType)}
            </td>
            <td style={{ padding: "12px 10px", fontWeight: "700", color: "#1e293b" }}>
              {formatCurrency(trx.amount)}
            </td>
            <td style={{ padding: "12px 10px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 18,
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 13,
                  backgroundColor: statusColor(trx.paymentStatus),
                  textTransform: "capitalize",
                  userSelect: "none",
                  boxShadow: "0 0 6px rgb(0 0 0 / 0.1)",
                }}
              >
                {trx.paymentStatus.toLowerCase()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PaymentDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("topup");
  const [topupAmount, setTopupAmount] = useState("");
  const [detailTransactions, setDetailTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("KOST_PAYMENT");
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Top Up error state
  const [topupError, setTopupError] = useState(null);

  // Penyewaan kos (bayar kos) states
  const [penyewaanList, setPenyewaanList] = useState([]);
  const [loadingPenyewaan, setLoadingPenyewaan] = useState(false);
  const [errorPenyewaan, setErrorPenyewaan] = useState(null);

  // Coupon payment modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedPenyewaan, setSelectedPenyewaan] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Parse roles from localStorage or default empty array
  const storedRoles = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userRoles")) || [];
    } catch {
      return [];
    }
  }, []);

  // Fetch transaction history function
  const fetchHistory = async () => {
    if (!token) {
      setIsLoading(false);
      setError("User tidak terautentikasi (token tidak tersedia).");
      return;
    }

    const userId = (user && user.id) || localStorage.getItem("userId");
    if (!userId) {
      setIsLoading(false);
      setError("User ID tidak tersedia.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(
        `https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/payments/history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Gagal mengambil riwayat transaksi");
      }

      const data = await res.json();
      setDetailTransactions(data);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat transaksi");
      setDetailTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch penyewaan kos with status DIAJUKAN for current user
  const fetchPenyewaanDiajukan = async () => {
    if (!token || !user?.id) {
      setErrorPenyewaan("User tidak terautentikasi atau ID tidak ada.");
      setPenyewaanList([]);
      return;
    }
    setLoadingPenyewaan(true);
    setErrorPenyewaan(null);

    try {
      const res = await fetch(
        `https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/payments/penyewaan/diajukan?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal mengambil penyewaan kos");
      }

      const data = await res.json();
      setPenyewaanList(data);
    } catch (err) {
      setErrorPenyewaan(err.message);
      setPenyewaanList([]);
    } finally {
      setLoadingPenyewaan(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, user]);

  useEffect(() => {
    if (activeTab === "bayarkos" && storedRoles.includes("PENYEWA")) {
      fetchPenyewaanDiajukan();
    }
  }, [activeTab, token, storedRoles, user]);

  // Handle “Bayar Sekarang” click
  const handleBayarSekarang = (penyewaan) => {
    setSelectedPenyewaan(penyewaan);
    const confirmCoupon = window.confirm(
      "Apakah Anda ingin memasukkan kupon diskon?"
    );
    if (confirmCoupon) {
      setCouponCode("");
      setCouponModalOpen(true);
      setPaymentError(null);
    } else {
      // Submit payment directly without coupon
      submitKostPayment(penyewaan, null);
    }
  };

  // Submit payment request to backend
  const submitKostPayment = async (penyewaan, coupon) => {
    if (!token || !user) {
      alert("User tidak terautentikasi.");
      return;
    }
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const body = {
        userId: user.id,
        ownerId: penyewaan.ownerId ?? penyewaan.owner, // fallback if needed, adjust based on your data!
        kostId: penyewaan.kostId ?? penyewaan.kost,    // likewise adjust
        couponCode: coupon?.trim() || null,
        description: "Bayar kost via dashboard",
      };

      if (!body.couponCode) delete body.couponCode;

      const res = await fetch(
        "https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/payments/kost",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal melakukan pembayaran kost.");
      }

      const data = await res.json();
      alert("Pembayaran berhasil!\nID Pembayaran: " + data.id);
      setCouponModalOpen(false);
      setSelectedPenyewaan(null);
      setCouponCode("");
      fetchHistory();
      fetchPenyewaanDiajukan();
    } catch (err) {
      setPaymentError(err.message || "Kesalahan tak terduga saat membayar kost");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    submitKostPayment(selectedPenyewaan, couponCode);
  };

  // TopUp submit handler
  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    setTopupError(null);

    if (!topupAmount || parseInt(topupAmount, 10) < 10000) {
      setTopupError("Minimal top up adalah Rp10.000");
      return;
    }

    const userId = (user && user.id) || localStorage.getItem("userId");
    if (!userId) {
      setTopupError("User ID tidak tersedia.");
      return;
    }

    try {
      const res = await fetch(
        "https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/payments/topup",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            amount: parseInt(topupAmount, 10),
            description: "Top up saldo lewat dashboard",
          }),
        }
      );

      if (!res.ok) {
        const errResp = await res.text();
        throw new Error(
          errResp || "Terjadi kesalahan saat mencoba melakukan Top Up"
        );
      }

      setTopupAmount("");
      setTopupError(null);
      alert("Top up berhasil! Silakan cek riwayat transaksi Anda.");
      fetchHistory();
    } catch (err) {
      setTopupError(
        err.message || "Terjadi kesalahan tak terduga saat mencoba top up saldo."
      );
    }
  };

  // Filter submit handler
  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    if (!filterStart || !filterEnd) {
      setFilterError("Start dan End date harus diisi.");
      return;
    }

    if (!user?.id) {
      setFilterError("User ID tidak tersedia.");
      return;
    }

    setIsFilterLoading(true);
    setFilterError(null);

    try {
      const params = new URLSearchParams();
      params.append("paymentType", filterPaymentType);
      params.append("startDateTime", filterStart);
      params.append("endDateTime", filterEnd);

      const res = await fetch(
        `https://staging-inthekost-b6afc6b23ff0.herokuapp.com/api/payments/history/${user.id}/filter?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Gagal memfilter transaksi");
      }
      const data = await res.json();
      setDetailTransactions(data);
      setActiveTab("transaksi");
    } catch (err) {
      setFilterError(err.message || "Gagal memfilter transaksi");
    } finally {
      setIsFilterLoading(false);
    }
  };

  if (isLoading)
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 32,
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#475569",
          background: "#f9fafb",
          borderRadius: 16,
          boxShadow: "0 10px 25px rgba(99, 102, 241, 0.1)",
        }}
      >
        <h2>Loading data...</h2>
      </div>
    );

  // Determine tabs shown based on role PENYEWA
  const tabs = ["topup", "transaksi"];
  if (storedRoles.includes("PENYEWA")) {
    tabs.splice(1, 0, "bayarkos"); // insert 'bayarkos' as second tab
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
        padding: 32,
        borderRadius: 24,
        boxShadow: "0 8px 30px rgba(100, 116, 139, 0.15)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#334155",
      }}
    >
      <h1 style={{ fontWeight: "700", marginBottom: 24, color: "#1e293b" }}>
        Payment Dashboard
      </h1>

      {user && (
        <div
          style={{
            marginBottom: 28,
            padding: 20,
            background: "#f1f5f9",
            borderRadius: 20,
            border: "1px solid #cbd5e1",
            boxShadow: "inset 0 0 8px #e2e8f0",
            color: "#334155",
          }}
        >
          <h3 style={{ margin: 0, fontWeight: "700" }}>
            Welcome, {user.username || user.email}
          </h3>
          <p style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>
            UserId: {user.id}
          </p>
        </div>
      )}

      {/* Tab Selector */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 36,
          borderRadius: 20,
          overflow: "hidden",
          userSelect: "none",
          boxShadow: "0 2px 12px rgb(99 102 241 / 0.25)",
          fontWeight: "600",
        }}
      >
        {tabs.map((tab) => {
          const labels = {
            topup: "Top Up",
            bayarkos: "Bayar Kos",
            transaksi: "Lihat Transaksi",
          };
          const colors = {
            topup: "#3b82f6",
            bayarkos: "#22c55e",
            transaksi: "#f59e0b",
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "16px 0",
                backgroundColor: isActive ? colors[tab] : "#e2e8f0",
                color: isActive ? "#fff" : "#475569",
                border: "none",
                fontSize: 16,
                fontWeight: "700",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                borderRadius:
                  tab === "topup" ? "20px 0 0 20px" : tab === "transaksi" ? "0 20px 20px 0" : "0",
                boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.15)" : "none",
              }}
              aria-current={isActive}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {/* Top Up tab */}
      {activeTab === "topup" && (
        <form onSubmit={handleTopupSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
          <h2 style={{ fontWeight: "700", marginBottom: 20, color: "#1e293b" }}>
            Top Up Saldo
          </h2>
          {topupError && (
            <p
              style={{
                color: "#dc2626",
                textAlign: "center",
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              {topupError}
            </p>
          )}
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: "600", color: "#475569" }}
          >
            Jumlah Top Up (Rp):
            <input
              type="number"
              required
              value={topupAmount}
              min={10000}
              onChange={(e) => setTopupAmount(e.target.value)}
              style={{
                display: "block",
                padding: 14,
                width: "100%",
                marginTop: 6,
                marginBottom: 20,
                borderRadius: 12,
                border: "1.5px solid #94a3b8",
                fontSize: 16,
                color: "#334155",
                transition: "border-color 0.3s ease",
              }}
              placeholder="Minimal Rp10.000"
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#94a3b8")}
            />
          </label>
          <button
            type="submit"
            disabled={!topupAmount || parseInt(topupAmount, 10) < 10000}
            style={{
              width: "100%",
              padding: "14px 0",
              background:
                !topupAmount || parseInt(topupAmount, 10) < 10000 ? "#94a3b8" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontWeight: "700",
              fontSize: 16,
              cursor:
                !topupAmount || parseInt(topupAmount, 10) < 10000
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                !topupAmount || parseInt(topupAmount, 10) < 10000
                  ? "none"
                  : "0 6px 12px rgba(59, 130, 246, 0.5)",
              transition: "background-color 0.3s ease",
            }}
          >
            Top Up
          </button>
        </form>
      )}

      {/* Bayar Kos tab */}
      {activeTab === "bayarkos" && (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: "700", marginBottom: 20, color: "#1e293b" }}>
            Penyewaan Kos yang Bisa Dibayar
          </h2>

          {loadingPenyewaan && <p>Loading penyewaan kos yang diajukan...</p>}
          {errorPenyewaan && (
            <p style={{ color: "#dc2626", fontWeight: "600" }}>{errorPenyewaan}</p>
          )}

          {!loadingPenyewaan && penyewaanList.length === 0 && (
            <p>Tidak ada penyewaan kos yang dapat dibayar saat ini.</p>
          )}

          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            }}
          >
            {penyewaanList.map((penyewaan) => (
              <div
                key={penyewaan.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgb(0 0 0 / 0.1)",
                  padding: 20,
                  color: "#334155",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3 style={{ marginBottom: 8 }}>{penyewaan.namaLengkap}</h3>
                <p style={{ margin: "6px 0" }}>
                  <strong>Telepon:</strong> {penyewaan.nomorTelepon}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Check-in:</strong>{" "}
                  {new Date(penyewaan.tanggalCheckIn).toLocaleDateString("id-ID")}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Durasi:</strong> {penyewaan.durasiBulan} bulan
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      backgroundColor: "#f3f4f6",
                      color: "#475569",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {penyewaan.status.toLowerCase()}
                  </span>
                </p>

                <button
                  style={{
                    marginTop: "auto",
                    padding: "12px 0",
                    backgroundColor: "#22c55e",
                    color: "#fff",
                    fontWeight: "700",
                    borderRadius: 14,
                    cursor: paymentLoading ? "not-allowed" : "pointer",
                    border: "none",
                    boxShadow: "0 6px 12px rgba(34, 197, 94, 0.5)",
                    transition: "background-color 0.3s ease",
                  }}
                  onClick={() => handleBayarSekarang(penyewaan)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Memproses..." : "Bayar Sekarang"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaksi tab */}
      {activeTab === "transaksi" && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontWeight: "700", color: "#1e293b", marginBottom: 20 }}>
            Detail Transaksi
          </h2>

          {/* Filter form */}
          <form
            onSubmit={handleFilterSubmit}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
              <label
                htmlFor="filter-start"
                style={{ fontWeight: 600, marginBottom: 6, color: "#475569" }}
              >
                Mulai Tanggal
              </label>
              <input
                id="filter-start"
                type="datetime-local"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1.5px solid #94a3b8",
                  fontSize: 14,
                  color: "#334155",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
              <label
                htmlFor="filter-end"
                style={{ fontWeight: 600, marginBottom: 6, color: "#475569" }}
              >
                Sampai Tanggal
              </label>
              <input
                id="filter-end"
                type="datetime-local"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1.5px solid #94a3b8",
                  fontSize: 14,
                  color: "#334155",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
              <label
                htmlFor="filter-payment-type"
                style={{ fontWeight: 600, marginBottom: 6, color: "#475569" }}
              >
                Jenis Pembayaran
              </label>
              <select
                id="filter-payment-type"
                value={filterPaymentType}
                onChange={(e) => setFilterPaymentType(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1.5px solid #94a3b8",
                  fontSize: 14,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <option value="TOP_UP">Top Up</option>
                <option value="KOST_PAYMENT">Bayar Kos</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isFilterLoading}
              style={{
                padding: "12px 28px",
                background: isFilterLoading ? "#94a3b8" : "#f59e0b",
                color: "#fff",
                borderRadius: 14,
                border: "none",
                fontWeight: "700",
                fontSize: 16,
                cursor: isFilterLoading ? "not-allowed" : "pointer",
                boxShadow: isFilterLoading ? "none" : "0 6px 12px rgba(245, 158, 11, 0.6)",
                transition: "background-color 0.3s ease",
                alignSelf: "center",
                marginTop: "auto",
              }}
            >
              {isFilterLoading ? "Memfilter..." : "Filter"}
            </button>
          </form>

          {filterError && (
            <p
              style={{
                color: "#dc2626",
                textAlign: "center",
                marginBottom: 16,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {filterError}
            </p>
          )}

          {error && (
            <p style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>
              Error: {error}
            </p>
          )}

          <TransactionTable transactions={detailTransactions} />
        </div>
      )}

      {/* Coupon Modal */}
      {couponModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => {
            if (!paymentLoading) {
              setCouponModalOpen(false);
              setPaymentError(null);
              setSelectedPenyewaan(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 20,
              width: "90%",
              maxWidth: 400,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: 20, fontWeight: "700", color: "#1e293b" }}>
              Masukkan Kode Kupon
            </h3>

            {paymentError && (
              <p
                style={{
                  color: "#dc2626",
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                {paymentError}
              </p>
            )}

            <form onSubmit={handleCouponSubmit}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Kode kupon (optional)"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 16,
                  borderRadius: 12,
                  border: "1.5px solid #94a3b8",
                  marginBottom: 20,
                }}
                disabled={paymentLoading}
                autoFocus
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!paymentLoading) {
                      setCouponModalOpen(false);
                      setPaymentError(null);
                      setSelectedPenyewaan(null);
                    }
                  }}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1.5px solid #94a3b8",
                    background: "#f1f5f9",
                    color: "#475569",
                    cursor: paymentLoading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                  }}
                  disabled={paymentLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "none",
                    backgroundColor: "#22c55e",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: paymentLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {paymentLoading ? "Memproses..." : "Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
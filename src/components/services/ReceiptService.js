// services/receiptService.js
export async function getReceipts() {

    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error("Authentication required");
    }
  try {
    const response = await fetch("http://172.31.7.70:8000/api/loan-applications/receipts/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return [];
  }
}


// src/components/services/ReceiptService.js
// export const deleteReceipt = async (id) => {
//   const response = await fetch(`/api/receipts/${id}`, {
//     method: 'DELETE'
//   });
//   if (!response.ok) {
//     throw new Error('Failed to delete receipt');
//   }
//   return response.json();
// };


export async function deleteReceipt(id) {
  const token = localStorage.getItem("access");
  try {
    const response = await fetch(`http://192.168.224.163:8000/api/loan-applications/receipts/${id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Failed to delete receipt:", error);
    return false;
  }
}

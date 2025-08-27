export const API_BASE_URL = "https://loan-backend-production-aece.up.railway.app"

export const getStoredValue = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error parsing localStorage value:", error);
    return defaultValue;
  }
};

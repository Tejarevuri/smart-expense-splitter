import API from "./api";

export const getTransactions = async (userId) => {
  const res = await API.get(`/transactions/${userId}`);
  return res.data;
};

export const createTransaction = async (data) => {
  const res = await API.post("/transactions/add", data);
  return res.data.transaction;
};
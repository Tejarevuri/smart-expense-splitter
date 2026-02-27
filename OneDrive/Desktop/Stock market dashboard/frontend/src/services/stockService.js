import API from "./api";

export const getStockQuote = async (symbol) => {
  const res = await API.get(`/stocks/${symbol}`);
  return res.data;
};

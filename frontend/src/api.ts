import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1/inventory';

export const fetchInventory = async (search = '', status = '') => {
  const { data } = await axios.get(API_URL, { params: { search, status } });
  return data.data;
};

export const createItem = async (itemData: any) => {
  const { data } = await axios.post(API_URL, itemData);
  return data.data;
};

export const updateStock = async (id: string, payload: any) => {
  const { data } = await axios.post(`${API_URL}/${id}/stock`, payload);
  return data.data;
};

export const fetchCategories = async () => {
  const { data } = await axios.get('http://localhost:3001/api/v1/inventory/categories');
  return data.data;
};

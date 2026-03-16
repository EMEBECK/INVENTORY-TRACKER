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

export const updateItem = async (id: string, itemData: any) => {
  const { data } = await axios.put(`${API_URL}/${id}`, itemData);
  return data.data;
};

export const fetchCategories = async () => {
  const { data } = await axios.get('http://localhost:3001/api/v1/inventory/categories');
  return data.data;
};

const ACTIVITY_URL = 'http://localhost:3001/api/v1/activity';

export const fetchActivityReports = async () => {
  const { data } = await axios.get(`${ACTIVITY_URL}/reports`);
  return data.data;
};

export const fetchReportByDate = async (date: string) => {
  const { data } = await axios.get(`${ACTIVITY_URL}/report/${date}`);
  return data.data;
};

export const verifyPassword = async (password: string) => {
  const { data } = await axios.post(`${ACTIVITY_URL}/verify-password`, { password });
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const { data } = await axios.post(`${ACTIVITY_URL}/change-password`, { currentPassword, newPassword });
  return data;
};

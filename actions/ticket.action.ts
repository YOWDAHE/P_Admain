import axios from 'axios';
import { TicketResponseType, TicketType } from '../app/models/Ticket';
import axiosInstance from '@/lib/fetcher';

const BASE_URL = process.env.NEXT_SHORT_BASE_URL;

export const createTicket = async (ticketData: TicketType, accessToken: string): Promise<{ success: boolean; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No access token available.' };
  }

  try {
      const response = await axios.post(`https://www.mindahun.pro.et/api/v1/tickets/`, ticketData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
 
    return { success: true, message: 'Ticket created successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while creating the ticket.' };
    }
  }
};

export const getEventTickets = async (id: number): Promise<TicketResponseType[]> => {

  try {
    const response = await axiosInstance.get(`/events/${id}/tickets`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return [];
    } else {
      return [];
    }
  }
};

export const deleteTicket = async (id: number): Promise<any> => {

  try {
    const response = await axiosInstance.delete(`/tickets/${id}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return [];
    } else {
      return [];
    }
  }
};
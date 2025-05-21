import axios from 'axios';
import { EventCreationType, EventType, PaginatedEventResponseType } from '../app/models/Event';
import axiosInstance from '@/lib/fetcher';

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

export const createEvent = async (
  eventData: EventCreationType,
  accessToken: string
): Promise<{ success: boolean; data?: EventType; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No access token available.' };
  }

  try {
    const response = await axios.post<EventType>(`${BASE_URL}/events/`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: response.data, message: 'Event created successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while creating the event.' };
    }
  }
};

// Function to get an event by ID
export const getEventById = async (
  eventId: number,
  accessToken: string
): Promise<{ success: boolean; data?: EventType; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No access token available.' };
  }

  try {
    console.log('Fetching event with ID:', eventId);
    const response = await axios.get<EventType>(`${BASE_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: response.data, message: 'Event fetched successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while fetching the event.' };
    }
  }
};

// Function to update an event
export const updateEvent = async (
  eventId: number,
  eventData: Partial<EventCreationType>,
  accessToken: string
): Promise<{ success: boolean; data?: EventType; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No access token available.' };
  }

  try {
    console.log('Updating event with ID:', eventId);
    const response = await axios.put<EventType>(`${BASE_URL}/events/${eventId}`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, data: response.data, message: 'Event updated successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while updating the event.' };
    }
  }
};

// Function to get events of a single organizer
export const getEventsByOrganizer = async (
  organizerId: number,
  // accessToken: string
): Promise<{ success: boolean; data?: PaginatedEventResponseType; message: string }> => {
  // if (!accessToken) {
  //   return { success: false, message: 'No access token available.' };
  // }

  try {
    console.log('Fetching events for organizer with ID:', organizerId);
    const response = await axiosInstance.get<PaginatedEventResponseType>(`/organizations/${organizerId}/events/`);

    return { success: true, data: response.data, message: 'Events fetched successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while fetching events.' };
    }
  }
};

// Function to delete an event
export const deleteEvent = async (
  eventId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No access token available.' };
  }

  try {
    console.log('Deleting event with ID:', eventId);
    await axios.delete(`${BASE_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true, message: 'Event deleted successfully.' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: `API Error: ${error.response.data}` };
    } else {
      return { success: false, message: 'An error occurred while deleting the event.' };
    }
  }
};
import { GroupsResponseType } from "@/app/models/Group";
import axiosInstance from "@/lib/fetcher";
import { GroupType } from '@/app/models/Group';

/**
 * Fetch the list of groups for the organization
 * @param accessToken - The access token for authentication
 * @param page - Optional page number for pagination
 * @param pageSize - Optional page size for pagination
 * @returns Promise with the groups response
 */
export async function fetchGroups(
    accessToken: string,
    page: number = 1,
    pageSize: number = 10
): Promise<GroupsResponseType> {
    try {
        const response = await axiosInstance.get(
            `/organizations/groups/?page=${page}&page_size=${pageSize}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error fetching groups:", error);
        throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch groups"
        );
    }
}

/**
 * Delete a group
 * @param groupId - The ID of the group to delete
 * @param accessToken - The access token for authentication
 * @returns Promise with the response data
 */
export async function deleteGroup(
    groupId: number,
    accessToken: string
) {
    try {
        const response = await axiosInstance.delete(`/organizations/groups/${groupId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return {
            success: true,
            message: "Group deleted successfully",
        };
    } catch (error: any) {
        console.error(`Error deleting group ${groupId}:`, error);
        throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to delete group"
        );
    }
}

/**
 * Fetches a group by ID
 * @param groupId The ID of the group to fetch
 * @param accessToken The access token for authorization
 */
export const fetchGroupById = async (groupId: number, accessToken: string): Promise<GroupType> => {
  try {
      const response = await axiosInstance.get(`/communities/${groupId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching group ${groupId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch group');
  }
}; 
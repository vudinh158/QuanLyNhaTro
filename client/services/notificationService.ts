// file: client/services/notificationService.ts
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { INotification, ICreateNotificationPayload } from '@/types/notification';

export const getMyNotifications = async (): Promise<INotification[]> => {
    // API giờ trả về một danh sách các đối tượng INotification đã được xử lý
    const response = await api.get<ApiResponse<{ notifications: INotification[] }>>('/notifications');
    return response.data.data.notifications;
};

export const createNotification = async (payload: ICreateNotificationPayload): Promise<any> => {
    const response = await api.post('/notifications', payload);
    return response.data;
};

export const markAsRead = async (notificationId: number): Promise<boolean> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data.success;
};
import api from '../config/api';

class NotificationService {
  // Send notification to product creator about new guest order
  async notifyProductCreator(orderData) {
    try {
      // Group items by product creator
      const creatorOrders = {};
      
      orderData.items.forEach(item => {
        const creatorId = item.product?.user_id || item.product?.created_by;
        if (creatorId) {
          if (!creatorOrders[creatorId]) {
            creatorOrders[creatorId] = {
              creator_id: creatorId,
              items: [],
              guest_info: orderData.guest_info,
              order_id: orderData.order_id
            };
          }
          creatorOrders[creatorId].items.push(item);
        }
      });

      // Send notification to each creator
      const notifications = [];
      for (const [creatorId, creatorOrder] of Object.entries(creatorOrders)) {
        const notificationData = {
          type: 'guest_order',
          creator_id: creatorId,
          order_id: orderData.order_id,
          guest_info: orderData.guest_info,
          items: creatorOrder.items,
          total: creatorOrder.items.reduce((sum, item) => sum + item.total, 0),
          message: `New guest order #${orderData.order_id} for your products`
        };

        // Send notification via API
        const response = await api.post('/notifications', notificationData);
        notifications.push(response.data);

        // Also send email notification if email service is available
        await this.sendEmailNotification(creatorOrder, notificationData);
      }

      return { success: true, notifications };
    } catch (error) {
      console.error('Error sending notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification to product creator
  async sendEmailNotification(creatorOrder, notificationData) {
    try {
      const emailData = {
        to: creatorOrder.guest_info.email, // This would be creator's email in real implementation
        subject: `New Guest Order - Order #${notificationData.order_id}`,
        template: 'guest-order-notification',
        data: {
          order_id: notificationData.order_id,
          guest_name: notificationData.guest_info.name,
          guest_email: notificationData.guest_info.email,
          guest_phone: notificationData.guest_info.phone,
          guest_address: `${notificationData.guest_info.address}, ${notificationData.guest_info.city} ${notificationData.guest_info.postal_code}`,
          items: notificationData.items,
          total: notificationData.total,
          notes: notificationData.guest_info.notes
        }
      };

      // This would integrate with an email service like SendGrid, Mailgun, etc.
      const response = await api.post('/send-email', emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't fail the order if email fails
      return { success: false, error: error.message };
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId) {
    try {
      const response = await api.get(`/notifications/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();

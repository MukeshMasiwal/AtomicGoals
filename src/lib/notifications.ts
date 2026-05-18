import Notification, { NotificationType } from '@/models/Notification';
import { User } from '@/models/User';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  relatedGoal?: string;
  relatedTeam?: string;
  relatedUser?: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await Notification.create(params);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function notifyAdmins(params: Omit<CreateNotificationParams, 'recipient'>) {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    if (admins.length > 0) {
      const docs = admins.map(admin => ({
        ...params,
        recipient: admin._id
      }));
      await Notification.insertMany(docs);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
}

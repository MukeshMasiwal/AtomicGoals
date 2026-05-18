import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 
  | 'Goal Created' 
  | 'Goal Approved' 
  | 'Goal Rejected' 
  | 'Task Completed' 
  | 'Team Updated' 
  | 'Team Member Added' 
  | 'Employee Approved' 
  | 'Quarterly Reminder';

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  recipient: mongoose.Types.ObjectId;
  relatedGoal?: mongoose.Types.ObjectId;
  relatedTeam?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: [
      'Goal Created',
      'Goal Approved',
      'Goal Rejected',
      'Task Completed',
      'Team Updated',
      'Team Member Added',
      'Employee Approved',
      'Quarterly Reminder'
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  relatedGoal: { type: Schema.Types.ObjectId, ref: 'Goal' },
  relatedTeam: { type: Schema.Types.ObjectId, ref: 'Team' },
  relatedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

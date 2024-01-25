import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId | string;
  message: string;
  messageType: 'human' | 'ai';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['human', 'ai'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;

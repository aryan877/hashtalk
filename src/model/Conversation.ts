import mongoose, { Schema, Document } from 'mongoose';

export interface Conversation extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User
  blogUrl: string;
  markdown: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema<Conversation> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blogUrl: {
      type: String,
      required: [true, 'Blog URL is required'],
    },
    markdown: {
      type: String,
      required: [true, 'Markdown content is required'],
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

const ConversationModel =
  (mongoose.models.Conversation as mongoose.Model<Conversation>) ||
  mongoose.model<Conversation>('Conversation', ConversationSchema);

export default ConversationModel;

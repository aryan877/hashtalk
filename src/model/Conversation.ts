import mongoose, { Schema, Document } from 'mongoose';

export interface Conversation extends Document {
  userId: mongoose.Types.ObjectId;
  blogTitle: string;
  blogSubtitle?: string;
  blogPublishDate: Date;
  blogUrl: string;
  markdown: string;
  coverImage?: string;
  tags?: string[];
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
    blogTitle: {
      type: String,
      required: [true, 'Blog title is required'],
    },
    blogSubtitle: {
      type: String,
      required: false,
    },
    blogPublishDate: {
      type: Date,
      required: [true, 'Blog publish date is required'],
    },
    blogUrl: {
      type: String,
      required: [true, 'Blog URL is required'],
    },
    markdown: {
      type: String,
      required: [true, 'Markdown content is required'],
    },
    coverImage: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      required: false,
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

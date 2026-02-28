import mongoose, { Document, Schema } from 'mongoose';

interface IAssignment extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  expectedColumns: string[];
  hints: string[];
  sampleData: {
    tables: string[];
    description: string;
  };
  solution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    expectedColumns: {
      type: [String],
      required: true
    },
    hints: {
      type: [String],
      default: []
    },
    sampleData: {
      tables: [String],
      description: String
    },
    solution: String
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

interface IUserAttempt extends Document {
  userId: string;
  assignmentId: string;
  query: string;
  result: any;
  status: 'pending' | 'success' | 'error';
  executedAt: Date;
}

const userAttemptSchema = new Schema<IUserAttempt>(
  {
    userId: {
      type: String,
      required: true
    },
    assignmentId: {
      type: String,
      required: true
    },
    query: {
      type: String,
      required: true
    },
    result: Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['pending', 'success', 'error'],
      default: 'pending'
    },
    executedAt: {
      type: Date,
      default: Date.now
    }
  }
);

export const UserAttempt = mongoose.model<IUserAttempt>('UserAttempt', userAttemptSchema);

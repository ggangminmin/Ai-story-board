import mongoose, { Schema, Document } from 'mongoose';

export interface ILink {
  title: string;
  url: string;
  description?: string;
}

export interface INote extends Document {
  content: string;
  summary: string | null;
  tags: string | null;
  links: string | null; // JSON string of ILink[]
  files: string | null;
  embedding: string | null;
  favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

const NoteSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    summary: { type: String, default: null },
    tags: { type: String, default: null },
    links: { type: String, default: null }, // JSON string of ILink[]
    files: { type: String, default: null },
    embedding: { type: String, default: null },
    favorite: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model<INote>('Note', NoteSchema);

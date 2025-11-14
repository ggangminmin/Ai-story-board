import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  content: string;
  summary: string | null;
  tags: string | null;
  link: string | null;
  link_description: string | null;
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
    link: { type: String, default: null },
    link_description: { type: String, default: null },
    files: { type: String, default: null },
    embedding: { type: String, default: null },
    favorite: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model<INote>('Note', NoteSchema);

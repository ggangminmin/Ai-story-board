export interface Note {
  id: string;
  content: string;
  summary: string | null;
  tags: string | null;
  link: string | null;
  link_description: string | null;
  files: string | null;
  embedding: string | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileInfo {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  summary?: string;
}

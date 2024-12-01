interface Model {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface User extends Model {
  username: string;
  email?: string;
  password?: string;
  avatar: string;
  status: string;
}

export interface Post extends Model {
  author_id: number;
  image_file: string;
  caption?: string;
  author?: User;
}

export interface Comment extends Model {
  author_id: number;
  content: string;
  author?: User;
  reply_path: string;
  deleted_at: string;

  // in general, these two properties are mutually exclusive
  reply_count?: number;
  children?: Comment[];
}

interface Model {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface User extends Model {
  username: string;
  email: string;
  password?: string;
  status: string;
}

export interface Post extends Model {
  author_id: number;
  image_file: string;
  caption?: string;
}

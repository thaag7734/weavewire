export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface PostForm {
  caption: string;
  image: Blob;
}

export interface UpdatePostForm {
  postId: number;
  caption: string;
}

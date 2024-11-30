export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
}

export interface PostForm {
  caption: string;
  image: Blob;
}

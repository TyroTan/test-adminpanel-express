interface User {
  user_id: string;
  email: string;
  is_admin: boolean;

  password: string;
  is_active: boolean;
}
declare namespace Express {
  interface Request {
    user: User;
  }
}

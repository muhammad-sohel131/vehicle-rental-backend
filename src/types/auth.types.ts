export interface JwtPayload {
  staffId: number;
  email: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponseBody {
  token: string;
  staff: {
    id: number;
    email: string;
    name: string;
  };
}
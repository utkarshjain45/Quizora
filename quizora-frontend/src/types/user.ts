export interface Authority {
  authority: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  authorities: Authority[];
  username: string;
  enabled: boolean;
  credentialsNonExpired: boolean;
}

export interface UserResponse {
  data: User;
}

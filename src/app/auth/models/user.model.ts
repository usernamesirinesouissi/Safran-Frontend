import { ERole } from './role.model';

export interface User {
  id?: number;
  username: string;
  email: string;
  roles?: ERole[];
  accessToken?: string;
}
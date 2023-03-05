export interface TypeUserModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  role: string;
  photo: string;
  verified: boolean;
  verificationCode: string | null;
}

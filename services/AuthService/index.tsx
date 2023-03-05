import APIService from '@utils/apiService';

class AuthService {
  config: any;
  constructor(config: any) {
    this.config = config;
  }
  async find(query: any) {
    // TODO Query.
  }
  async create(payload: any) {
    // TODO Create.
  }
  async loginWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    console.log('AuthService/index', 'loginWithEmailAndPassword');
    return await APIService.post('/api/auth/login', {
      body: { email, password },
    });
  }

  async verifyEmail(id: string) {
    return await APIService.get(`/api/auth/verifyEmail/${id}`);
  }
  async changePassword({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string;
    newPassword: string;
  }) {
    return await APIService.post('/api/auth/login', {
      body: { oldPassword, newPassword },
    });
  }
  async register({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }) {
    return await APIService.post('/api/auth/register', {
      body: { firstName, lastName, email, password, passwordConfirm },
    });
  }
  async refreshToken() {
    return await APIService.get('/api/auth/refresh');
  }
  async logout() {
    return await APIService.get('/api/auth/logout');
  }
}
const Model = new AuthService({});

export default Model;

import { auth } from '../config/firebase';

export const authService = {
  async login(email: string, password: string) {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return result.user;
  },

  async register(email: string, password: string, name: string) {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    if (result.user) {
      await result.user.updateProfile({ displayName: name });
    }
    return result.user;
  },

  async logout() {
    await auth.signOut();
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  },
};

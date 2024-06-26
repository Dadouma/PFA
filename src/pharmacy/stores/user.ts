import axios from "axios";
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

const BASE_URL = "http://172.201.204.133:3000/pharmacy/api/v1/auth";

interface User {
  userName: string;
  userId: string;
}

interface UserStore {
  user: User | null;
  login: (loginData: LoginData) => Promise<void>;
  signUp: (signUpData: SignUpData) => Promise<void>;
  logout: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export const useUserStore = create<UserStore>((set) => ({
  user: getUserFromLocalStorage(),

  login: async (loginData: LoginData) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, loginData);
      console.log("resp", response);

      if (response.status === 201) {
        // console.log("response.data", response.data.data.result.response.accessToken  );
        const  accessToken  = response.data.data.result.response.accessToken ;
        console.log("token", accessToken);

        const decodedToken: any = jwtDecode(accessToken);

        const user: User = {
          userName: decodedToken.username,
          userId: decodedToken.client_id,
        };
        console.log('user',user )

        localStorage.setItem("token", accessToken);
        set({ user });
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  signUp: async (signUpData: SignUpData) => {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, signUpData);
      if (response.status === 201) {
        await useUserStore.getState().login({
          email: signUpData.email,
          password: signUpData.password,
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresIn");
    set({ user: null });
  },
}));

function getUserFromLocalStorage(): User | null {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken: any = jwtDecode(token);
    return {
      userName: decodedToken.name,
      userId: decodedToken.userId,
    };
  }
  return null;
}

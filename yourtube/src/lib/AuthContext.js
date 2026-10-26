import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, githubProvider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpUserId, setOtpUserId] = useState(null);
  const [otpEmailHint, setOtpEmailHint] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const currentHour = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    });

    const hour = Number(currentHour);

    if (hour >= 10 && hour < 12) {
      setTheme("light");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const logout = async () => {
    setUser(null);
    setOtpRequired(false);
    setOtpUserId(null);
    setOtpEmailHint("");

    localStorage.removeItem("user");

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };

      const response = await axiosInstance.post("/user/login", payload);

      if (response.data.requiresOtp) {
        setOtpUserId(response.data.userId);
        setOtpRequired(true);
        return { success: true, requiresOtp: true };
      }

      if (response.data.result) {
        login(response.data.result);
        return { success: true, result: response.data.result };
      }
    } catch (error) {
      if (error?.code === "auth/cancelled-popup-request" || error?.code === "auth/popup-closed-by-user") {
        console.log("Google login popup was closed.");
        return { success: false, message: "Google sign-in was cancelled" };
      }

      console.error("Google sign in error:", error);
      return { success: false, message: error.message };
    }
  };

  const handlegithubsignin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const firebaseuser = result.user;

      const payload = {
        email: firebaseuser.email || `${firebaseuser.uid}@github.com`,
        name: firebaseuser.displayName || firebaseuser.reloadUserInfo?.screenName || "GitHub User",
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };

      const response = await axiosInstance.post("/user/login", payload);

      if (response.data.requiresOtp) {
        setOtpUserId(response.data.userId);
        setOtpRequired(true);
        return { success: true, requiresOtp: true };
      }

      if (response.data.result) {
        login(response.data.result);
        return { success: true, result: response.data.result };
      }
    } catch (error) {
      if (error?.code === "auth/cancelled-popup-request" || error?.code === "auth/popup-closed-by-user") {
        console.log("GitHub login popup was closed.");
        return { success: false, message: "GitHub sign-in was cancelled" };
      }

      console.error("GitHub sign in error:", error);
      return { success: false, message: error.message };
    }
  };

  const sendLoginOtp = async (username, password) => {
    try {
      const response = await axiosInstance.post("/user/send-login-otp", {
        username: username.trim(),
        password,
      });

      if (response.data?.userId) {
        setOtpUserId(response.data.userId);
      }
      if (response.data?.emailHint) {
        setOtpEmailHint(response.data.emailHint);
      }

      return {
        success: true,
        message: response.data?.message,
        emailHint: response.data?.emailHint,
        devOtp: response.data?.devOtp,
        userId: response.data?.userId,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP to email";
      return { success: false, message };
    }
  };

  const loginWithUsernameOtp = async ({ username, password, otp }) => {
    try {
      const response = await axiosInstance.post("/user/login", {
        username: username.trim(),
        password,
        otp: otp ? String(otp).trim() : undefined,
      });

      if (response.data?.result) {
        login(response.data.result);
        setOtpRequired(false);
        setOtpUserId(null);
        return { success: true, result: response.data.result };
      }

      if (response.data?.requiresOtp) {
        setOtpUserId(response.data.userId);
        setOtpRequired(true);
        if (response.data.emailHint) {
          setOtpEmailHint(response.data.emailHint);
        }
        return {
          success: true,
          requiresOtp: true,
          message: response.data.message,
          emailHint: response.data.emailHint,
          devOtp: response.data.devOtp,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Login failed",
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during login";
      return { success: false, message };
    }
  };

  const signupNewUser = async ({ username, email, password }) => {
    try {
      const response = await axiosInstance.post("/user/signup", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data?.result) {
        login(response.data.result);
        return { success: true, result: response.data.result };
      }

      return {
        success: false,
        message: response.data?.message || "Signup failed",
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during signup";
      return { success: false, message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      if (!otpUserId) {
        console.error("OTP User ID missing");
        return false;
      }

      const enteredOTP = String(otp).trim();

      if (enteredOTP.length !== 6) {
        console.error("OTP must be 6 digits");
        return false;
      }

      const response = await axiosInstance.post("/user/verify-otp", {
        userId: otpUserId,
        otp: enteredOTP,
      });

      if (response.data?.result) {
        login(response.data.result);
        setOtpRequired(false);
        setOtpUserId(null);
        setOtpEmailHint("");
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.status,
        error.response?.data?.message || error.message
      );
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
      console.log(
        firebaseuser ? "Firebase user signed in" : "Firebase user signed out",
      );
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const loginWithPassword = async (email, password) => {
    return loginWithUsernameOtp({ username: email, password });
  };

  const signupWithPassword = async ({ name, email, password }) => {
    return signupNewUser({ username: name, email, password });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        handlegithubsignin,
        sendLoginOtp,
        loginWithUsernameOtp,
        signupNewUser,
        loginWithPassword,
        signupWithPassword,

        otpRequired,
        otpUserId,
        otpEmailHint,
        setOtpRequired,
        verifyOTP,

        theme,
        toggleTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

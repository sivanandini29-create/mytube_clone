import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpUserId, setOtpUserId] = useState(null);

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

      console.log("OTP required for user:", response.data.userId);

      return;
    }

    if (response.data.result) {
      login(response.data.result);
    }
  } catch (error) {
    if (error?.code === "auth/cancelled-popup-request") {
      console.log("Google login popup was cancelled. Please try again.");
      return;
    }

    console.error("Google sign in error:", error);
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

    console.log("Sending OTP verification:");
    console.log("User ID:", otpUserId);
    console.log("OTP:", enteredOTP);

    const response = await axiosInstance.post("/user/verify-otp", {
      userId: otpUserId,
      otp: enteredOTP,
    });

    console.log("OTP response:", response.data);

    if (response.data?.result) {
      login(response.data.result);

      setOtpRequired(false);
      setOtpUserId(null);

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

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,

        otpRequired,
        otpUserId,
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

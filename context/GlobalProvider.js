import { createContext, useContext, useState, useEffect, useRef } from "react";
import { checkCart, getCurrentUser, getUserData } from "../lib/appwrite";
import NetInfo from "@react-native-community/netinfo";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);
export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [order, setOrder] = useState(null);
  const fetchCalledRef = useRef(false);
  const [networkState, setNetworkState] = useState(true);

  const parseArrayofItems = (arr) => {
    let parsedArr = [];
    for (let i = 0; i < arr.length; i++) {
      let parsed = JSON.parse(arr[i]);
      parsedArr.push(parsed);
    }
    return parsedArr;
  };
  const getAllData = async () => {
    try {
      const res = await getCurrentUser();
      if (res) {
        setLoggedIn(true);
        const res3 = await getUserData(res.phone);
        if (res3) {
          const userData = res3.documents[0];
          // Safely parse user data fields, use empty array if undefined
          userData.cart = userData.cart ? parseArrayofItems(userData.cart) : [];
          userData.address = userData.address
            ? parseArrayofItems(userData.address)
            : [];
          userData.search = userData.search
            ? parseArrayofItems(userData.search)
            : [];
          setUser(userData);
        }
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error); // Log the error for debugging
    } finally {
      setInitialLoading(false); // Ensure loading state is always turned off
    }
  };

  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && !fetchCalledRef.current) {
      fetchCalledRef.current = true;
      setTimeout(() => {
        console.log("Global api call");
        getAllData();
      }, 500);
    }
  });

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        initialLoading,
        loggedIn,
        setLoggedIn,
        order,
        setOrder,
        networkState,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

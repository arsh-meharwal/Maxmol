import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { Path, Svg, Circle } from "react-native-svg";
import GlobalProvider, { useGlobalContext } from "@/context/GlobalProvider";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

const TabLayout = () => {
  const { user } = useGlobalContext();
  const [cartLength, setCartLength] = useState(null);
  const [wishlistLength, setWishlistLength] = useState(null);

  useEffect(() => {
    if (user && user.cart && user.wishlist) {
      // Always update cartLength, even when cart is empty
      setCartLength(user.cart.length);
      setWishlistLength(user.wishlist.length);
    } else {
      // Handle case where cart is undefined or null
      setCartLength(0);
      setWishlistLength(0);
    }
  }, [user]);

  //   if (!loading && !isLogged) return <Redirect href="/sign-in" />;

  return (
    <>
      <Navbar />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#15803D",
          tabBarInactiveTintColor: "#78716C",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#CDCDE0",
            height: 50,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`w-[20vw] flex-1 flex justify-center items-center ${
                  focused ? "border-b-4 border-green-500" : ""
                }`}
              >
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth={focused ? "3" : "1.75"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  class="lucide lucide-house"
                >
                  <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <Path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </Svg>
                <Text
                  style={{ color: color }}
                  className={`text-4 ${
                    focused ? "font-semibold" : "font-normal"
                  }`}
                >
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "wishlist",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`w-[20vw] flex-1 flex justify-center items-center ${
                  focused ? "border-b-4 border-green-500" : ""
                }`}
              >
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth={focused ? "3" : "1.75"}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-heart"
                >
                  <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </Svg>
                <Text
                  style={{ color: color }}
                  className={`text-4 ${
                    focused ? "font-semibold" : "font-normal"
                  }`}
                >
                  Wishlist
                </Text>
                {wishlistLength ? (
                  <View className="absolute -top-0 right-4 h-[4vw] w-[4vw] bg-green-600 rounded-full flex justify-center items-center">
                    <Text className="text-white font-semibold text-[3vw]">
                      {wishlistLength}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "cart",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`w-[20vw] flex-1 flex justify-center items-center ${
                  focused ? "border-b-4 border-green-500" : ""
                }`}
              >
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth={focused ? "3" : "1.75"}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-shopping-cart"
                >
                  <Circle cx="8" cy="21" r="1" />
                  <Circle cx="19" cy="21" r="1" />
                  <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </Svg>
                <Text
                  style={{ color: color }}
                  className={`text-4 ${
                    focused ? "font-semibold" : "font-normal"
                  }`}
                >
                  Cart
                </Text>

                {cartLength ? (
                  <View className="absolute -top-0 right-4 h-[4vw] w-[4vw] bg-green-600 rounded-full flex justify-center items-center">
                    <Text className="text-white font-semibold text-center text-[3vw]">
                      {cartLength}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`w-[20vw] flex-1 flex justify-center items-center ${
                  focused ? "border-b-4 border-green-500" : ""
                }`}
              >
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={color}
                  strokeWidth={focused ? "3" : "1.75"}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-circle-user-round"
                >
                  <Path d="M18 20a6 6 0 0 0-12 0" />
                  <Circle cx="12" cy="10" r="4" />
                  <Circle cx="12" cy="12" r="10" />
                </Svg>
                <Text
                  style={{ color: color }}
                  className={`text-4 ${
                    focused ? "font-semibold" : "font-normal"
                  }`}
                >
                  You
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>

      {/* <Loader isLoading={loading} /> */}
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;

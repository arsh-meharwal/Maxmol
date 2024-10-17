import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  Keyboard,
  ActivityIndicator,
  BackHandler,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Circle, Path, Svg } from "react-native-svg";
import {
  getSingleProduct,
  modifySearchHistory,
  searchAllProducts,
} from "@/lib/appwrite";
import { ArrowUp, Back, Cross, Down } from "./Svgs";
import { router, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useGlobalContext } from "@/context/GlobalProvider";
import image from "../assets/Logo2.png";
import { SafeAreaView } from "react-native-safe-area-context";
const Navbar = ({ showBack }) => {
  const { user, setUser } = useGlobalContext();
  const [query, setQuery] = useState("");
  const [userSearchHistory, setUserSearchHistory] = useState(null);
  const [userSearchHistoryData, setUserSearchHistoryData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const { width } = Dimensions.get("window");

  let xl3 = width > 700 ? "text-3xl" : "text-[6vw]";
  let xl2 = width > 700 ? "text-2xl" : "text-[5vw]";
  let xl = width > 700 ? "text-xl" : "text-[3.5vw]";
  let lg = width > 700 ? "text-lg" : "text-[3vw]";

  const searchData = async (quer) => {
    try {
      const res = await searchAllProducts(quer);
      if (res.status) {
        setFilteredProducts(res.data);
      }
    } catch (error) {
      alert(error);
    }
  };

  let navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const selectedItem = async (id, image) => {
    let exists = user.search.some((item) => item.productId === id);
    if (!exists) {
      let obj = { productId: id, imageId: image };
      let updatedArray = [obj, ...userSearchHistory];
      try {
        await modifySearchHistory(user.$id, updatedArray);
        setUserSearchHistory(updatedArray);
        setUser({ ...user, search: updatedArray });
        router.push(`/productDetail?id=${id}`);
      } catch (error) {
        alert(error);
      }
    } else {
      let filteredArray = user.search.filter((item) => item.productId !== id);
      let updatedArray = [{ productId: id, imageId: image }, ...filteredArray];
      try {
        const res = await modifySearchHistory(user.$id, updatedArray);
        setUserSearchHistory(updatedArray);
        setUser({ ...user, search: updatedArray });
        router.push(`/productDetail?id=${id}`);
      } catch (error) {
        alert(error);
      }
    }
  };

  const fetchHistoryData = async () => {
    if (!userSearchHistoryData && user) {
      let arr = [];
      console.log("History click");
      for (let i = 0; i < userSearchHistory.length; i++) {
        console.log("api fetch");
        try {
          const element = await getSingleProduct(
            userSearchHistory[i].productId
          );
          if (element.status) {
            arr.push(element.data);
          }
        } catch (error) {
          alert(error);
          break;
        }
      }
      console.log(arr, "setUserSearchHistoryData");
      setUserSearchHistoryData(arr);
    }
  };

  const formatNumberInIndianStyle = (number) => {
    if (typeof number !== "number" || isNaN(number)) {
      console.error("Invalid number provided:", number);
      return;
    }
    // Convert number to string
    let num = number.toFixed(0);

    let str = num.toString();

    // Split into two parts, the part before the last three digits and the last three digits
    let lastThree = str.substring(str.length - 3);
    let otherNumbers = str.substring(0, str.length - 3);

    // Add commas every two digits in the part before the last three digits
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  useEffect(() => {
    setFilteredProducts(null);
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchData(query);
      } else {
        setFilteredProducts([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn); // Cleanup the timeout if query changes
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        if (user.search.length > 0) {
          let data = user.search.slice(0, 10);
          console.log(data, "search History");
          setUserSearchHistory(data);
        } else {
          setUserSearchHistory(user.search);
        }
      }
    }, [user])
  );

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        setQuery("");
        setIsFocused(false);
        Keyboard.dismiss();
        return true; // Prevent the default back action (exit app)
      }
      return false; // Allow default back action (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the event listener on unmount
  }, [isFocused]);

  return (
    <SafeAreaView className="z-50">
      <View className=" flex-col w-full border-b border-green-600 bg-green-600 relative z-50">
        <View className="w-full h-10 flex-row justify-evenly items-end my-1">
          {/* Back Button */}
          {showBack && (
            <Pressable onPress={handleGoBack}>
              <Back width={"32"} height={"32"} color={"#000000"} />
            </Pressable>
          )}
          {/* Logo */}
          <View className=" w-[22vw] rounded-lg h-8 bg-black justify-center items-center overflow-hidden">
            <Image
              source={image}
              className="w-full h-full mb-2 "
              resizeMode="contain"
            />
          </View>
          {/* Search Bar */}
          <View className="w-[50%] h-8 ml-[8vw] flex-row justify-start items-center border border-gray-500 focus:border-gray-800 rounded-3xl bg-gray-100">
            <View className="px-2">
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Circle cx="11" cy="11" r="8" />
                <Path d="M21 21l-4.3-4.3" />
              </Svg>
            </View>
            <TextInput
              className="w-[70%] text-5"
              value={query}
              placeholder="Search Products..."
              onChangeText={(e) => setQuery(e)}
              onFocus={() => {
                fetchHistoryData();
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
            />
            {isFocused && (
              <TouchableOpacity
                onPress={() => {
                  setQuery("");
                  setIsFocused(false);
                  Keyboard.dismiss();
                }}
              >
                <Cross height={"20"} width={"20"} color={"#000000"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View>
          {query === "" && isFocused && user && (
            <View className="h-auto w-full bg-white absolute rounded-b-xl border-b border-l border-r border-gray-400 z-50 ">
              {userSearchHistoryData && userSearchHistory.length > 0 && (
                <View className="flex justify-center items-center border-b border-gray-500 mx-32">
                  <Text className={`${xl} font-semibold text-gray-600`}>
                    Recent Searches
                  </Text>
                </View>
              )}
              {!userSearchHistoryData && (
                <View className="flex justify-center items-center py-2">
                  <ActivityIndicator size={"small"} />
                </View>
              )}
              {userSearchHistoryData &&
                userSearchHistory.length > 0 &&
                userSearchHistoryData.map((item, index) => (
                  <Pressable
                    className={`flex-row items-center justify-between pr-4 ${
                      index !== userSearchHistoryData.length - 1
                        ? "border-b border-gray-400"
                        : ""
                    }`}
                    key={index}
                    onPress={() => selectedItem(item.$id, item.images[0])}
                  >
                    <View className="flex-row">
                      <Image
                        source={{
                          uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${item.images[0]}/view?project=66c59b5800224d59df96&mode=admin`,
                        }}
                        className={`w-32 h-16`}
                        resizeMode="contain"
                      />
                      <View className="flex-col mt-2">
                        <Text className={`${lg} font-semibold`}>
                          {item.title.length >= 29
                            ? item.title.slice(0, 29) + "..."
                            : item.title}
                        </Text>
                        <View className="flex-row items-end mt-1">
                          <Text className={`${xl} px-2`}>
                            ₹
                            {formatNumberInIndianStyle(
                              item.price -
                                (item.discount *
                                  (item.price +
                                    (item.gst * item.price) / 100)) /
                                  100 +
                                (item.gst * item.price) / 100
                            )}
                          </Text>
                          {item.discount > 0 && (
                            <>
                              <Text className={`${lg} line-through pr-1`}>
                                ₹
                                {formatNumberInIndianStyle(
                                  item.price + (item.gst * item.price) / 100
                                )}
                              </Text>
                              <Down
                                width={"18"}
                                height={"18"}
                                color={"#00d008"}
                              />
                              <Text className={`${lg}`}>{item.discount}%</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    <ArrowUp height={"18"} width={"18"} color={"#000000"} />
                  </Pressable>
                ))}
            </View>
          )}
        </View>
        <View>
          {query !== "" && isFocused && (
            <View className="h-auto w-full bg-white absolute rounded-b-xl border-b border-l border-r border-gray-400 z-50">
              {!filteredProducts && (
                <View className="flex justify-center items-center py-2">
                  <ActivityIndicator size={"small"} />
                </View>
              )}
              {filteredProducts &&
                filteredProducts.slice(0, 8).map((item, index) => (
                  <Pressable
                    className={`flex-row items-center justify-between pr-4 ${
                      index !== filteredProducts.length - 1
                        ? "border-b border-gray-400"
                        : ""
                    }`}
                    key={index}
                    onPress={() => selectedItem(item.$id, item.images[0])}
                  >
                    <View className="flex-row">
                      <Image
                        source={{
                          uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${item.images[0]}/view?project=66c59b5800224d59df96&mode=admin`,
                        }}
                        className={`w-32 h-16`}
                        resizeMode="contain"
                      />
                      <View className="flex-col mt-2">
                        <Text className={`${lg} font-semibold`}>
                          {item.title.length >= 29
                            ? item.title.slice(0, 29) + "..."
                            : item.title}
                        </Text>
                        <View className="flex-row items-end mt-1">
                          <Text className={`${xl} px-2`}>
                            ₹
                            {formatNumberInIndianStyle(
                              item.price -
                                (item.discount *
                                  (item.price +
                                    (item.gst * item.price) / 100)) /
                                  100 +
                                (item.gst * item.price) / 100
                            )}
                          </Text>
                          {item.discount > 0 && (
                            <>
                              <Text className={`${lg} line-through pr-1`}>
                                ₹
                                {formatNumberInIndianStyle(
                                  item.price + (item.gst * item.price) / 100
                                )}
                              </Text>
                              <Down
                                width={"18"}
                                height={"18"}
                                color={"#00d008"}
                              />
                              <Text className={`${lg}`}>{item.discount}%</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    <ArrowUp height={"18"} width={"18"} color={"#000000"} />
                  </Pressable>
                ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Navbar;

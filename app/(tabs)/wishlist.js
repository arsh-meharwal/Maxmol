import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getSingleProduct, modifyWishList } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import HorizontalCard from "@/components/HorizontalCard";
import { Heart } from "@/components/Svgs";
import EmptyWL from "../../assets/emptyWL2.png";
import LoadingScreen from "@/components/LoadingScreen";
import { router } from "expo-router";
import CustomAlert from "@/components/CustomAlert";

const wishlist = () => {
  const { width } = Dimensions.get("window");

  const { user, setUser, fetchUserData } = useGlobalContext();

  const [wishList, setWishList] = useState(null);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNum, setUserNum] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showRemovedAlert, setShowRemovedAlert] = useState(false);

  const handleShowRemovedAlert = () => {
    setShowRemovedAlert(true);
  };
  const handleCloseRemovedAlert = () => {
    setShowRemovedAlert(false);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const onRefresh = () => {
    setLoading(true);

    setTimeout(() => {
      if (user) {
        setUserNum(user);
        setWishList(user.wishlist);

        if (user.wishlist.length > 0) {
          fetchProducts(user.wishlist);
        } else {
          setItems(null);
          setLoading(false);
        }
      }

      setLoading(false);
    }, 100); // Simulate a 2 second delay for the refresh
  };

  const fetchProducts = async (wishListArray) => {
    try {
      let updatedItems = [];

      for (let i = 0; i < wishListArray.length; i++) {
        const resp = await getSingleProduct(wishListArray[i]);

        if (resp.status) {
          updatedItems.push(resp.data);
        } else if (!resp.status) {
          Alert.alert("Some products are unavailable", resp.error);
          fetchUserData();
        }
      }

      setItems(updatedItems);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const removeWL = async (userId, productId) => {
    setLoading(true);

    try {
      let updatedList = wishList.filter((item) => item !== productId);
      await modifyWishList(userId, updatedList);

      setUser({ ...userNum, wishlist: updatedList });
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
      handleShowRemovedAlert();
    }
  };

  useEffect(() => {
    if (user) {
      setUserNum(user);
      setWishList(user.wishlist);

      if (user.wishlist.length > 0) {
        fetchProducts(user.wishlist);
      } else {
        setItems(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <LoadingScreen />;
  else if (!items) {
    return (
      <View className="bg-white w-full h-full">
        <View className=" flex justify-center items-center relative">
          <Image
            source={EmptyWL}
            className="h-full w-full bottom-20"
            resizeMode="contain"
          />
          {!userNum && (
            <Pressable
              className="w-[40vw] h-[10vw] bg-orange-400 bottom-60 flex justify-center items-center rounded-xl"
              onPress={() => router.replace("/profile")}
            >
              <Text className="text-white text-[5vw]">Login / Signup</Text>
            </Pressable>
          )}
          {userNum && (
            <Pressable
              className="w-[40vw] h-[10vw] bg-orange-400 bottom-60 flex justify-center items-center rounded-xl"
              onPress={() => router.replace("/home")}
            >
              <Text className="text-white text-[5vw]">View Products</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={["#ff0000"]}
          />
        }
      >
        <View className="relative">
          <View className="pt-4 pb-3 flex justify-center items-center">
            <Text
              className={`${
                width > 700 ? "text-3xl" : "text-[5vw]"
              }  font-semibold`}
            >
              Your Wishlist
            </Text>
          </View>
          <View className="flex-1 flex justify-center items-center">
            {showAlert && (
              <CustomAlert
                message={"Some Items might be removed from your collection"}
                onClose={handleCloseAlert}
              />
            )}
            {showRemovedAlert && (
              <CustomAlert
                message={"Removed"}
                onClose={handleCloseRemovedAlert}
              />
            )}
          </View>

          <View>
            {items &&
              items.map((item, index) => (
                <View key={index} className="relative">
                  <HorizontalCard
                    keyd={index}
                    id={item.$id}
                    image={item.images[0]}
                    title={item.title}
                    price={item.price + (item.gst * item.price) / 100}
                    discount={item.discount}
                    showHeartButton={true}
                    user={userNum}
                    visibility={true}
                  />
                  <Pressable
                    className="absolute top-[34%] right-4 z-10"
                    onPress={() => removeWL(userNum.$id, item.$id)}
                  >
                    <View className=" flex justify-center items-center h-9 w-9 rounded-full">
                      <Heart
                        fill={"#ff5238"}
                        outline={"#ff5238"}
                        stroke={"1.75"}
                      />
                    </View>
                  </Pressable>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default wishlist;

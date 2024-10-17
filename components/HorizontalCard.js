import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import {
  removeFromWishList,
  removeItemFromcart,
  updateProductStock,
} from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import { DeleteButton, Down, Heart, Minus, Plus } from "./Svgs";
import { router } from "expo-router";
import CustomAlert from "./CustomAlert";

const HorizontalCard = ({
  keyd,
  id,
  image,
  title,
  price,
  discount,
  deliveryDate,
  action,
  quantity,
  showButton,
  deleteFromCart,
  disable,
  productCategory,
  showStock,
  stockValue,
  refreshParent,
  visibility,
  parentLoading,
}) => {
  const [newStock, setNewStock] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { width } = Dimensions.get("window");

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const formatNumberInIndianStyle = (number) => {
    if (typeof number !== "number" || isNaN(number)) {
      console.error("Invalid number provided:", number);
      return;
    }
    // Convert number to string
    let num = number.toFixed(0);
    // Convert number to string
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

  const updateStock = async () => {
    try {
      setStockLoading(true);
      await updateProductStock(id, parseInt(newStock, 10));
      setStockLoading(false);
      //refreshParent();
      handleShowAlert();
      setNewStock(null);
    } catch (error) {
      alert(error);
    }
  };

  const removeFromCart = async (productId) => {
    parentLoading(true);
    await deleteFromCart(productId);
    parentLoading(false);
  };

  return (
    <View className=" mx-2 my-2 border border-b border-gray-400 rounded-lg overflow-hidden bg-white">
      <Pressable
        key={keyd}
        onPress={() => router.push(`/productDetail?id=${id}`)}
        disabled={disable ? disable : false}
      >
        <View className="flex-row justify-between items-center relative ">
          <View className="flex-row gap-2 items-center">
            <View>
              <Image
                source={{
                  uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${image}/view?project=66c59b5800224d59df96&mode=admin`,
                }}
                className={` ${visibility ? "" : "opacity-40"} rounded-lg ${
                  width > 700 ? "h-32 w-56" : "h-[25vw] w-[25vw]"
                } `}
                resizeMode="cover"
              />
            </View>
            <View className="flex-col w-[55vw] pt-1">
              <Text
                className={`${width > 700 ? "text-xl " : "text-[3.5vw]"}  ${
                  visibility ? "text-gray-800" : "text-gray-400"
                } font-medium`}
              >
                {showButton
                  ? title.length > 28
                    ? `${title.slice(0, 28)}..`
                    : title
                  : title.length > 35
                  ? `${title.slice(0, 35)}..`
                  : title}
              </Text>
              {price && (
                <>
                  {discount > 0 && (
                    <View className="flex-row items-end ">
                      <Text
                        className={`${
                          width > 700 ? "text-xl " : "text-[15px]"
                        }  line-through text-gray-600 pl-1 `}
                      >
                        Price: ₹{formatNumberInIndianStyle(price)}
                      </Text>
                      <Down
                        width={width > 700 ? "28" : "18"}
                        height={width > 700 ? "28" : "18"}
                        color={"#00d008"}
                      />
                      <Text
                        className={`${
                          width > 700 ? "text-xl " : "text-[15px]"
                        } font-semibold`}
                      >
                        {discount}%
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center ">
                    <Text
                      className={`${
                        width > 700 ? "text-xl " : "text-[3.5vw]"
                      }  font-semibold pl-1 ${
                        visibility ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      Price: ₹
                      {formatNumberInIndianStyle(
                        price - (discount * price) / 100
                      )}
                    </Text>
                    {quantity && (
                      <Text
                        className={`${
                          width > 700 ? "text-2xl " : "text-[3.5vw]"
                        }  font-normal pl-2`}
                      >
                        x {quantity}
                      </Text>
                    )}
                  </View>
                  {showAlert && (
                    <CustomAlert
                      message="Stock Updated Successfully7!"
                      onClose={handleCloseAlert}
                    />
                  )}
                </>
              )}
              {showStock && (
                <View className="flex-col gap-2 items-start justify-center pt-1">
                  <View className="flex-row items-center">
                    <Text className={`${width > 700 ? "text-lg" : ""} `}>
                      Stock :{" "}
                    </Text>
                    <TextInput
                      className={`${
                        width > 700 ? "text-lg h-5" : "text-[14px] h-[5vw]"
                      } px-1 font-normal border border-gray-400  rounded-sm w-auto`}
                      placeholder={`${stockValue}`}
                      keyboardType="numeric"
                      onChangeText={(e) => setNewStock(parseInt(e, 10))}
                    />
                  </View>
                  <View className="mb-1">
                    <Pressable
                      className="border border-gray-500 bg-green-600 flex justify-center items-center w-[23vw] rounded-xl"
                      onPress={updateStock}
                      disabled={newStock === null}
                    >
                      {stockLoading ? (
                        <Text className="text-[3.2vw] text-white font-semibold">
                          Loading...
                        </Text>
                      ) : (
                        <Text
                          className={`${
                            width > 700 ? "text-lg" : "text-[3.2vw]"
                          }  text-white font-semibold`}
                        >
                          Update Stock
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
              {showButton && (
                // delete button and Low/Out of Stock message
                <View className="flex-col mt-[1vw]">
                  <View>
                    <Text
                      className={`${
                        width > 700 ? "text-xl " : "text-[3vw]"
                      }  text-red-600 `}
                    >
                      {stockValue === 0
                        ? `Out of Stock`
                        : stockValue <= 3
                        ? `Only ${stockValue} left`
                        : ""}
                    </Text>
                  </View>
                  {deliveryDate && (
                    <View>
                      <Text
                        className={`${
                          width > 700 ? "text-lg " : "text-[3vw]"
                        } mt-[0.5vw] text-gray-600 `}
                      >
                        Delivery by {deliveryDate}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          {showButton && (
            <Pressable
              onPress={() => {
                switch (action) {
                  case "deleteFromCart":
                    removeFromCart(id);
                    break;
                }
              }}
            >
              <View className=" flex-1 justify-center items-center w-[9vw] bg-red-400 ">
                <DeleteButton
                  height={width > 700 ? "32" : "24"}
                  width={width > 700 ? "32" : "24"}
                  color={"#ffffff"}
                />
              </View>
            </Pressable>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default HorizontalCard;

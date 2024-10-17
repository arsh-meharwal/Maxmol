import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Path, Svg } from "react-native-svg";
import { addToWishList, getImagePreview } from "@/lib/appwrite";
import { Down, Star } from "./Svgs";

const Caard = ({
  keyd,
  title,
  price,
  discount,
  image,
  user,
  year,
  id,
  style,
  mrp,
  stars,
  customWidth,
  capacity,
  imageStyle,
  subtitle,
  numCols,
}) => {
  const submit = () => {
    router.push(`/productDetail?id=${id}`);
  };

  const formatNumberInIndianStyle = (number) => {
    // Convert number to string
    let str = number.toString();

    // Split into two parts, the part before the last three digits and the last three digits
    let lastThree = str.substring(str.length - 3);
    let otherNumbers = str.substring(0, str.length - 3);

    // Add commas every two digits in the part before the last three digits
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  return (
    <View
      className={`${
        !customWidth ? (numCols > 2 ? "w-[33%]" : "w-[48%]") : "w-[45vw]"
      } relative`}
      key={keyd}
    >
      <View
        className={`bg-white rounded-lg overflow-hidden shadow-md mx-1 mb-2  ${style}`}
      >
        <Pressable onPress={submit}>
          <View
            className={`w-full ${
              imageStyle ? `${imageStyle}` : `h-[16vh]`
            } mb-1 relative`}
          >
            <Image
              source={{
                uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${image}/view?project=66c59b5800224d59df96&mode=admin`,
              }}
              className={`w-full h-full`}
              resizeMode="cover"
            />
            {discount > 0 && (
              <View className="absolute bottom-0 -left-3 flex justify-center items-center w-[13vw] h-[4vw] bg-green-500 rounded-xl">
                {/* The tilted view with green background */}
                <View className="flex-row justify-end items-center w-full h-full pr-1">
                  <Text className="text-white text-[3vw] font-semibold">
                    Sale{" "}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Pressable>
        <TouchableOpacity onPress={submit}>
          <Text
            className={`${
              numCols > 2 ? "text-xl" : "text-[3.5vw]"
            } font-bold px-2`}
          >
            {title.length > 36 ? title.slice(0, 36) + "..." : title}
          </Text>
          {capacity && (
            <Text
              className={`${
                numCols > 2 ? "text-xl" : "text-[3.1vw]"
              }  font-semibold px-2`}
            >
              Capacity: {capacity}
            </Text>
          )}

          <View className="flex-row items-center px-2">
            <Text
              className={`${
                numCols > 2 ? "text-xl" : "text-[3.1vw]"
              } font-semibold `}
            >
              Price:{" "}
            </Text>
            <Text
              className={`${numCols > 2 ? "text-xl" : "text-[3.1vw]"}  ${
                discount > 0 ? "line-through font-normal" : "font-semibold"
              }`}
            >
              {`₹` + formatNumberInIndianStyle(price.toFixed(0))}
            </Text>
            {discount > 0 && (
              <Text
                className={`${
                  numCols > 2 ? "text-xl" : "text-[3.1vw]"
                } font-semibold `}
              >
                {"  "}₹
                {formatNumberInIndianStyle(
                  (price - (price * discount) / 100).toFixed(0)
                )}
              </Text>
            )}
          </View>

          <View className="flex flex-row justify-between items-center px-2 pb-1">
            <Text className={`${numCols > 2 ? "text-xl" : "text-[2.9vw]"} `}>
              {mrp
                ? `MRP: ₹ ` + formatNumberInIndianStyle(mrp.toFixed(0))
                : "MRP: ₹ Not Set"}
            </Text>
          </View>
        </TouchableOpacity>
        <View className="absolute w-[27%] h-[9%] border border-gray-200 rounded-md top-0 left-0 bg-white flex-row justify-evenly items-center">
          <Text
            className={`${
              numCols > 2 ? "text-xl" : "text-[3.2vw] "
            } font-semibold`}
          >
            {stars ? stars.toFixed(1) : 5}
          </Text>
          <Star height={16} width={16} fillPercentage={1} />
        </View>
        {year && <Text className="pb-2 px-2 text-sm">{year}</Text>}
      </View>
    </View>
  );
};

export default Caard;

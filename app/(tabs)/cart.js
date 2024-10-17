import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  BackHandler,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getSingleProduct, modifyCart } from "@/lib/appwrite";
import HorizontalCard from "@/components/HorizontalCard";
import { Minus, Plus } from "@/components/Svgs";
import { router } from "expo-router";
import EmptyCart from "../../assets/emptycart.png";
import { useFocusEffect } from "@react-navigation/native";
import LoadingScreen from "@/components/LoadingScreen";

const cart = () => {
  const { user, setOrder, setUser, networkState } = useGlobalContext();
  const [cartData, setCartData] = useState(null);
  const [productData, setProductData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [userAddressess, setUserAddressess] = useState([]);
  const [addressPop, setAddressPop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clickedAddress, setClickedAddress] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const { width } = Dimensions.get("window");

  const onRefresh = () => {
    setTimeout(() => {
      setUserData(user);
      setCartData(user.cart);
      console.log(user.cart);
      setUserAddressess(user.address);
      fetchProductData(user.cart);
      setLoading(false);
    }, 100); // Simulate a 2 second delay for the refresh
  };

  function getFormattedDate() {
    // Get today's date
    let today = new Date();
    // Add 10 days
    today.setDate(today.getDate() + 10);

    // Get the day and month
    let day = today.getDate();
    let month = today.toLocaleString("default", { month: "short" });

    // Add the ordinal suffix for the day (st, nd, rd, th)
    let suffix = getDaySuffix(day);

    // Return the formatted date
    let date = `${day}${suffix} ${month}`;
    setDeliveryDate(date);
  }

  function getDaySuffix(day) {
    if (day > 3 && day < 21) return "th"; // 11th to 20th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const fetchProductData = async (cart) => {
    setLoading(true);
    try {
      const newProductData = [];
      let totalPrice = 0;
      let totalAmount = 0;
      for (let i = 0; i <= cart.length - 1; i++) {
        const res = await getSingleProduct(cart[i].productId);
        if (res.status) {
          res.data.quantity = cart[i].quantity; // adding a new key => quantity
          let itemprice = individualPrice(
            parseInt(
              res.data.price + (res.data.price * res.data.gst) / 100,
              10
            ),
            parseInt(res.data.discount, 10)
          );
          if (res.data.stock > 0) {
            console.log("+1");

            totalPrice += itemprice * parseInt(res.data.quantity, 10);
            totalAmount +=
              parseInt(res.data.price, 10) * parseInt(res.data.quantity, 10);
          }
          newProductData.push(res.data);
        } else if (!res.status) {
          Alert.alert("Some products are unavailable", res.error);
        }
      }
      setTotalAmount(formatNumberInIndianStyle(Math.floor(totalPrice)));
      setTotalPrice(formatNumberInIndianStyle(totalAmount));
      console.log(newProductData, "productData");
      setProductData(newProductData);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = async (id) => {
    try {
      setLoading(true);
      for (let i = 0; i <= cartData.length - 1; i++) {
        if (
          cartData[i].productId === id &&
          Number(productData[i].stock) > Number(cartData[i].quantity)
        ) {
          cartData[i].quantity = (
            parseInt(cartData[i].quantity, 10) + 1
          ).toString();
          productData[i].quantity = parseInt(productData[i].quantity, 10) + 1;
          const res = await modifyCart(userData.$id, cartData);
          if (res) {
            console.log("inc");
            setUser((prev) => ({ ...prev, cart: cartData }));
          }
          break;
        }
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const decreaseQuantity = async (id) => {
    try {
      for (let i = 0; i <= cartData.length - 1; i++) {
        setLoading(true);
        if (cartData[i].productId === id && Number(cartData[i].quantity) > 1) {
          const currentQuantity = parseInt(cartData[i].quantity, 10);
          console.log(currentQuantity, "currentQuantity");

          if (currentQuantity > 1) {
            cartData[i].quantity = (
              parseInt(cartData[i].quantity, 10) - 1
            ).toString();
            productData[i].quantity = (
              parseInt(productData[i].quantity, 10) - 1
            ).toString();
          }
          const res = await modifyCart(userData.$id, cartData);
          if (res) {
            console.log("dec");
            setUser((prev) => ({ ...prev, cart: cartData }));
          }
          break;
        }
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
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

  const individualPrice = (amount, discount) => {
    return (amount - (discount * amount) / 100).toFixed(0);
  };

  const selectAddress = async () => {
    setAddressPop(!addressPop);
  };

  // function formatDateTime() {
  //   const now = new Date(); // Get current date and time

  //   // Format the date in dd-mm-yyyy
  //   const day = String(now.getDate()).padStart(2, "0");
  //   const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  //   const year = now.getFullYear();

  //   // Format the time in hh:mm (24-hour format)
  //   const hours = String(now.getHours()).padStart(2, "0");
  //   const minutes = String(now.getMinutes()).padStart(2, "0");

  //   return `${day}-${month}-${year} ${hours}:${minutes}`;
  // }

  const createOrder = () => {
    let products = [];
    for (let product of productData) {
      let Id = product.$id;
      let prices = formatNumberInIndianStyle(
        individualPrice(
          product.price + (product.gst * product.price) / 100,
          product.discount
        ) * parseInt(product.quantity, 10)
      );
      let name = product.title;
      let shipping = product.shippingCharge;
      let quantity = product.quantity;
      let obj = {
        productId: Id,
        productName: name,
        productPrice: prices,
        productShipping: shipping,
        quantity: quantity,
      };
      products.push(obj);
    }
    const date = new Date();
    const order = {};
    order.deliverTo = userAddressess[clickedAddress];
    order.date = date;
    order.user = `${userData.name} - ${userData.number}`;
    order.products = products;
    setOrder(order);
    console.log(order);
    router.push("/paymentSelect");
  };

  const removeItemFromcart = async (productId) => {
    let updatedCart = cartData.filter((item) => item.productId !== productId);
    console.log(updatedCart, "updatedCart");

    try {
      const res = await modifyCart(userData.$id, updatedCart);
      if (res) {
        setUser((prev) => ({ ...prev, cart: updatedCart }));
      }
    } catch (error) {
      alert(error);
    }
  };

  // useFocusEffect(useCallback(()=>{if (user) {
  //     console.log(user.cart);
  //     setUserData(user);
  //     setCartData(user.cart);
  //     console.log(user.cart);
  //     setUserAddressess(user.address);
  //     fetchProductData(user.cart);
  //   } else {
  //     setLoading(false);
  //   }},[user]))

  useEffect(() => {
    if (user) {
      setUserData(user);
      setCartData(user.cart);
      console.log(user.cart);
      setUserAddressess(user.address);
      fetchProductData(user.cart);
    } else {
      setLoading(false);
    }
  }, [user, networkState]);

  useFocusEffect(
    useCallback(() => {
      getFormattedDate();
    }, [])
  );

  if (loading) return <LoadingScreen />;

  if (!cartData || cartData.length === 0) {
    return (
      <View className="bg-white w-full h-full">
        <View className=" flex justify-center items-center relative">
          <Image
            source={EmptyCart}
            className="h-full w-full bottom-20"
            resizeMode="contain"
          />
          {!userData && (
            <Pressable
              className="w-[40vw] h-[10vw] bg-orange-400 bottom-60 flex justify-center items-center rounded-xl"
              onPress={() => router.replace("/profile")}
            >
              <Text className="text-white text-[5vw]">Login / Signup</Text>
            </Pressable>
          )}
          {userData && (
            <Pressable
              className="w-[40vw] h-[10vw] bg-orange-400 bottom-60 flex justify-center items-center rounded-xl"
              onPress={() => router.replace("/home")}
            >
              <Text className="text-white text-[5vw]">Shop Products</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  } else {
    return (
      <>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={["#ff0000"]}
            />
          }
        >
          <Pressable
            disabled={!addressPop}
            onPress={() => setAddressPop(false)}
          >
            <View
              className={`pt-4  h-screen ${
                addressPop ? "opacity-40 blur-xl bg-black/90" : ""
              }`}
              pointerEvents={`${addressPop ? "none" : "auto"}`}
            >
              <View className="flex justify-center items-center pb-3">
                <Text
                  className={`${
                    width > 700 ? "text-3xl" : "text-[5vw]"
                  }  font-semibold`}
                >
                  Your Cart
                </Text>
              </View>

              {productData.length > 0 &&
                productData.map((item, index) => (
                  <View key={index} className="relative">
                    <HorizontalCard
                      keyd={index}
                      id={item.$id}
                      image={item.images[0]}
                      title={item.title}
                      price={item.price + (item.price * item.gst) / 100}
                      discount={item.discount}
                      user={userData.$id}
                      action="deleteFromCart"
                      quantity={item.quantity}
                      showButton={true}
                      deleteFromCart={removeItemFromcart}
                      disable={addressPop}
                      parentLoading={setLoading}
                      stockValue={item.stock}
                      deliveryDate={deliveryDate}
                      visibility={true}
                    />
                    <View
                      className={`${
                        width > 700 ? "h-6 w-[18vw]" : "h-[5.5vw] w-[18vw]"
                      } absolute top-[50%] right-[15vw] border border-gray-600 flex-row overflow-hidden rounded-lg`}
                    >
                      <TouchableOpacity
                        className=" border-r border-gray-600 w-[6vw] flex justify-center items-center"
                        onPress={() => decreaseQuantity(item.$id)}
                      >
                        <Minus height={"18"} width={"18"} color={"#000000"} />
                      </TouchableOpacity>
                      <View className="h-full w-[6vw]">
                        <Text className="text-[15px] text-center">
                          {item.quantity}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className=" border-l border-gray-600  h-full w-[6vw] flex justify-center items-center"
                        onPress={() => increaseQuantity(item.$id)}
                      >
                        <Plus height={"18"} width={"18"} color={"#000000"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              {productData.length > 0 && (
                <View className="py-4 px-2 ">
                  <View className=" border border-gray-400 rounded-md py-2 px-2">
                    <View className="flex justify-start">
                      <Text className="text-base font-semibold pl-2">
                        Price Details
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-2 border-b border-gray-400">
                      <View>
                        {productData.map(
                          (item, index) =>
                            item.stock > 0 && (
                              <Text className="text-sm px-2" key={index}>
                                {item.title.length > 28
                                  ? `${item.title.slice(0, 28)}...`
                                  : item.title}
                              </Text>
                            )
                        )}
                      </View>
                      <View className="flex-col items-end">
                        {productData.map(
                          (item, index) =>
                            item.stock > 0 && (
                              <Text className="text-sm px-2" key={index}>
                                ₹{" "}
                                {formatNumberInIndianStyle(
                                  individualPrice(
                                    item.price + (item.gst * item.price) / 100,
                                    item.discount
                                  ) * parseInt(item.quantity, 10)
                                )}
                              </Text>
                            )
                        )}
                      </View>
                    </View>
                    <View className="flex-row justify-between pt-1">
                      <Text className="text-sm px-2 font-semibold">
                        Estimated Total
                      </Text>

                      <Text className="text-sm px-2">₹ {totalAmount}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        </ScrollView>

        {/* Address Selection Popup */}
        {addressPop && (
          <View
            className={`absolute -bottom-0 bg-white h-auto max-h-[80vh] w-full border border-gray-300 flex justify-center items-center  overflow-hidden z-50 rounded-tl-xl rounded-tr-xl ${
              width > 700 ? "mb-[5vh]" : "mb-[8vh] "
            }`}
          >
            <ScrollView>
              {userAddressess.length > 0 ? (
                <View className="flex-row justify-between items-center my-4 mx-6">
                  <View>
                    <Text className="text-xl font-semibold">
                      Select Address
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      className="h-10 w-28 border-4 border-cyan-400 rounded-lg flex-row justify-center items-center"
                      onPress={() => router.push("/(screens)/addressForm")}
                    >
                      <Plus height={"22"} width={"20"} color={"#000000"} />
                      <Text className="text-lg font-semibold pr-2">
                        Add New
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex justify-center items-center">
                  <Text className="text-xl font-semibold py-3 mb-3 ">
                    No Addresses Found
                  </Text>
                </View>
              )}
              <ScrollView>
                {userAddressess.length > 0 ? (
                  userAddressess.map((item, index) => (
                    <Pressable
                      className="flex-row items-start px-4 gap-4 py-2"
                      key={index}
                      onPress={() => setClickedAddress(index)}
                      disabled={clickedAddress === index ? true : false}
                    >
                      <View
                        className={`h-5 w-5 rounded-full border-2 ${
                          clickedAddress === index
                            ? "bg-cyan-400 border-gray-200 "
                            : "border-gray-500 "
                        }`}
                      />
                      <View className="flex-col mb-4">
                        <Text className="text-[17px] font-semibold">
                          {`${item.name}, ${item.phone}`}
                        </Text>
                        <Text className="text-[15px] pt-2 pr-6">{`${item.houseNo}, ${item.area}, ${item.city}, ${item.state}, ${item.pin}, `}</Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <TouchableOpacity
                    className="h-10 w-40 mb-10 border-4 border-cyan-400 rounded-lg flex-row justify-center items-center"
                    onPress={() => router.push("/(screens)/addressForm")}
                  >
                    <Plus height={"22"} width={"20"} color={"#000000"} />
                    <Text className="text-lg font-semibold">Add Address</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </ScrollView>
          </View>
        )}
        {/* Bottom 2 buttons */}
        <View
          className={`${
            width > 700 ? "h-[5vh]" : "h-[8vh]"
          } w-full  bottom-0 flex-row border-t border-gray-200`}
        >
          <View className="w-1/2 bg-white flex justify-center items-center">
            {totalAmount !== null && totalPrice !== null && (
              <View className="flex-col justify-center items-center">
                <View>
                  <Text className="text-[3vw] font-semibold text-gray-600">
                    Total
                  </Text>
                </View>
                <View className="flex-row items-end justify-center gap-1">
                  <Text
                    className={`${
                      width > 700 ? "text-lg" : "text-[3.7vw]"
                    }  font-semibold text-gray-800 line-through`}
                  >
                    ₹{totalPrice}
                  </Text>
                  <Text
                    className={`${
                      width > 700 ? "text-3xl" : "text-[4.7vw]"
                    } font-semibold text-gray-800`}
                  >
                    ₹{totalAmount}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {!addressPop ? (
            <TouchableOpacity
              className="w-1/2 bg-green-600 flex justify-center items-center"
              onPress={selectAddress}
              disabled={Number(totalAmount) === 0 ? true : false}
            >
              <View className="">
                <Text
                  className={`${
                    width > 700 ? "text-3xl" : "text-[5vw]"
                  } font-bold text-gray-50`}
                >
                  Place Order
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="w-1/2 bg-red-400 flex justify-center items-center"
              onPress={createOrder}
              disabled={Number(totalAmount) === 0 ? true : false}
            >
              <View className="">
                <Text
                  className={`${
                    width > 700 ? "text-3xl" : "text-[5vw]"
                  }  font-bold text-gray-50`}
                >
                  Continue
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }
};

export default cart;

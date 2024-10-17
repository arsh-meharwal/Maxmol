import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Pressable,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
  AddProduct,
  ArrowUp,
  BannerSvg,
  CancelledOrders,
  Delivered,
  DownArrow,
  Orders,
  Setting,
  UpArrow,
  Users,
  ViewProduct,
} from "@/components/Svgs";
import {
  checkCancelValidity,
  createToken,
  getAllOrdersByUser,
} from "@/lib/appwrite";
import LoginComponent from "@/components/LoginComponent";
import RefundInput from "@/components/RefundInput";
import LoadingScreen from "@/components/LoadingScreen";
import { Picker } from "@react-native-picker/picker";
import image from "../../assets/orders.png";

const profile = () => {
  const { user, networkState } = useGlobalContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [userOrders, setUserOrders] = useState(null);
  const [showFullOrderData, setshowFullOrderData] = useState(null);
  const [componentLoading, setComponentLoading] = useState(null);
  const [showRefundBox, setShowRefundBox] = useState(false);
  const [selectedOrderID, setSelectedOrderID] = useState();
  const [selecedOrderPayment, setSelecedOrderPayment] = useState();
  const [selectedValue, setSelectedValue] = useState("twoMonth");
  const { width } = Dimensions.get("window");

  let xl3 = width > 700 ? "text-3xl" : "text-[6vw]";
  let xl2 = width > 700 ? "text-2xl" : "text-[5vw]";
  let xl = width > 700 ? "text-xl" : "text-[4vw]";
  let lg = width > 700 ? "text-lg" : "text-[3vw]";

  function setDatetwoMonthsAgo(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }

  function setDateYearAgo(years) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date;
  }

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

  const addProduct = async () => {
    const res = await createToken(currentUser.name);
    if (res !== false) {
      const token = res.$id;
      const url = `https://ecomproducts.vercel.app/?token=${token}`;
      Linking.openURL(url);
    }
  };

  const fetchOrders = async (userId, date) => {
    try {
      const res = await getAllOrdersByUser(userId, date);
      if (res.status) {
        setUserOrders(res.orders);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const selectOrderToRefund = async (id, payment) => {
    const res = await checkCancelValidity(id);
    if (res) {
      setSelectedOrderID(id);
      if (payment === "Online Payment") {
        setSelecedOrderPayment(true);
      }
      setShowRefundBox(true);
    } else {
      Alert.alert(
        "Non Cancellable",
        "The order is processed and is non-cancellable at this stage"
      );
    }
  };

  const reloadOrderStatus = async (id) => {
    //setLoading(true);
    console.log("reload");
    setComponentLoading(id);
    setSelectedValue("twoMonth");
    date = setDatetwoMonthsAgo(2);
    console.log("fetchOrders");
    await fetchOrders(user.$id, date.toISOString());
    setComponentLoading(null);
    setShowRefundBox(false);
  };

  useEffect(() => {
    console.log("selected value");

    if (!loading && user && selectedValue) {
      let date;
      if (selectedValue === "twoMonth") {
        date = setDatetwoMonthsAgo(2);
        fetchOrders(user.$id, date.toISOString());
      } else if (selectedValue === "oneYear") {
        date = setDateYearAgo(1);
        fetchOrders(user.$id, date.toISOString());
      } else if (selectedValue === "allYear") {
        date = setDateYearAgo(10);
        fetchOrders(user.$id, date.toISOString());
      }
    }
  }, [selectedValue]);

  useFocusEffect(
    useCallback(() => {
      if (user && !userOrders) {
        setCurrentUser(user);
        let date = setDatetwoMonthsAgo(2);
        let strDate = date.toISOString();
        fetchOrders(user.$id, strDate);
        setAdmin(user.isAdmin);
      }
      setLoading(false);
    }, [user, networkState])
  );

  if (loading) return <LoadingScreen />;

  if (!loading && !currentUser) {
    return <LoginComponent />;
  } else {
    return (
      <ScrollView>
        <View className="min-h-screen bg-white">
          <View className="relative  ">
            <View>
              <Pressable
                onPress={() => setShowRefundBox(false)}
                disabled={!showRefundBox}
              >
                <View
                  className={` ${
                    showRefundBox ? "opacity-30 bg-gray-800/90 h-screen" : ""
                  }`}
                  pointerEvents={showRefundBox ? "none" : "auto"}
                >
                  {/* User Greeting */}
                  <View className="pt-2 pb-4 bg-gray-400 ">
                    <View className="flex-row justify-evenly items-center">
                      <View className="flex-col items-center">
                        <Text
                          className={`${xl2} text-white font-semibold pt-2`}
                        >
                          Hello, {currentUser.name}
                        </Text>
                        <Text
                          className={`${xl2} text-white font-semibold pt-2`}
                        >
                          {currentUser.number}
                        </Text>
                      </View>
                      <View>
                        <View className="h-20 w-20 rounded-full border-2 border-white bg-neutral-500 flex justify-center items-center">
                          <View className="pb-1">
                            <Text className=" flex justify-center items-center text-[48px] text-white  font-semibold">
                              {currentUser.name.slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  {/* Admin Panel */}
                  {currentUser.isAdmin && (
                    <View className="px-4 my-4">
                      <View className="w-full h-auto border border-gray-700  rounded-xl pb-2 ">
                        <View className="flex justify-center items-center border-b border-gray-300 mx-8 mb-4">
                          <Text className="text-gray-500 font-semibold text-lg">
                            Admin Panel
                          </Text>
                        </View>
                        <View className="flex-row pt-2 px-2 items-center flex flex-wrap justify-evenly gap-4">
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={addProduct}
                          >
                            <AddProduct
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">Add Product</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/viewProducts")}
                          >
                            <ViewProduct
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">View Products</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/currentOrders")}
                          >
                            <Orders
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">Current Orders</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/viewUsers")}
                          >
                            <Users
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">Users</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/settings")}
                          >
                            <Setting
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">Settings</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/deliveredOrders")}
                          >
                            <Delivered
                              height={"48"}
                              width={"48"}
                              color={"#404040"}
                            />
                            <Text className="text-[12px]">
                              Delivered Orders
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-col items-center"
                            onPress={() => router.push("/cancelledOrders")}
                          >
                            <CancelledOrders />
                            <Text className="text-[12px]">
                              Cancelled Orders
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                  {/* Buttons */}
                  <View className="flex-row flex-wrap justify-evenly gap-y-4 pt-3">
                    <TouchableOpacity
                      className="rounded-3xl bg-red-400 flex justify-center items-center w-[150px]"
                      onPress={() =>
                        Linking.openURL("https://maxmol.com/complain")
                      }
                    >
                      {/* Set a fixed width */}
                      <Text className="font-semibold text-xs text-white p-1">
                        Register Complaint
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-3xl bg-green-500 flex justify-center items-center w-[150px]"
                      onPress={() =>
                        Linking.openURL("https://maxmol.com/demo1")
                      }
                    >
                      {/* Set a fixed width */}
                      <Text className="font-semibold text-xs text-white p-1">
                        About Maxmol
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-3xl bg-slate-400 flex justify-center items-center w-[150px]"
                      onPress={() =>
                        Linking.openURL("https://maxmol.com/distributor")
                      }
                    >
                      {/* Set a fixed width */}
                      <Text className="font-semibold text-xs text-white p-1">
                        Become Distributor
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-3xl bg-yellow-500 flex justify-center items-center w-[150px]"
                      onPress={() =>
                        Linking.openURL("https://maxmol.com/contact")
                      }
                    >
                      {/* Set a fixed width */}
                      <Text className="font-semibold text-xs text-white p-1">
                        Contact Us
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Order List */}
                  <View className="flex justify-center items-center  pt-2 pb-14">
                    <Text className="text-lg font-semibold ">Your Orders</Text>
                    <View className="border border-gray-300 rounded-md w-[40%] h-[7vw] justify-center mb-4 mt-2">
                      <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) =>
                          setSelectedValue(itemValue)
                        }
                        style={{ textAlign: "text-center" }}
                      >
                        <Picker.Item
                          label="Past 60 days"
                          value="twoMonth"
                          style={{ fontSize: 14 }}
                        />
                        <Picker.Item
                          label="Past One Year"
                          value="oneYear"
                          style={{ fontSize: 14 }}
                        />
                        <Picker.Item
                          label="All Orders"
                          value="allYear"
                          style={{ fontSize: 14 }}
                        />
                      </Picker>
                    </View>
                    {userOrders &&
                      userOrders.map((item, index) => (
                        <View className="my-2 " key={index}>
                          <View className="flex-col border h-auto w-[90vw] border-gray-400 py-2 rounded-lg px-3 gap-1">
                            {componentLoading === item.id ? (
                              <View className="my-2" key={index}>
                                <View className="flex justify-center items-center h-32 w-[90vw] pt-3 rounded-lg px-3 gap-1">
                                  <Text>Loading</Text>
                                </View>
                              </View>
                            ) : (
                              <>
                                {/* Status Chain */}
                                <View className="flex-row justify-center items-center">
                                  {!item.cancelStatus ? (
                                    <>
                                      <Text
                                        className={` ${
                                          item.status === "New Order"
                                            ? `${xl}  text-green-600 font-semibold`
                                            : `${lg}  text-gray-500`
                                        }  `}
                                      >
                                        Created
                                      </Text>
                                      <View className="h-[4%] mb-0 border-t border-gray-500 w-[7%] mx-1 "></View>
                                      <Text
                                        className={` ${
                                          item.status === "Accepted"
                                            ? `${xl}  text-green-600 font-semibold`
                                            : `${lg}  text-gray-500`
                                        }  `}
                                      >
                                        Accepted
                                      </Text>
                                      <View className="h-[4%] mb-0 border-t border-gray-500 w-[7%] mx-1 "></View>
                                      <Text
                                        className={` ${
                                          item.status === "Shipped"
                                            ? `${xl}  text-green-600 font-semibold`
                                            : `${lg}  text-gray-500`
                                        }  `}
                                      >
                                        Shipped
                                      </Text>
                                      <View className="h-[4%] mb-0 border-t border-gray-500 w-[7%] mx-1 "></View>
                                      <Text
                                        className={` ${
                                          item.status === "Delivered"
                                            ? `${xl}  text-green-600 font-semibold`
                                            : `${lg}  text-gray-500`
                                        }  `}
                                      >
                                        Delivered
                                      </Text>
                                    </>
                                  ) : (
                                    <Text
                                      className={`${xl}  text-red-600 font-semibold`}
                                    >
                                      {item.cancelStatus}
                                    </Text>
                                  )}
                                </View>
                                {item.cancelStatus && (
                                  <View className="flex justify-center items-center">
                                    <Text className={`text-gray-500 ${lg}`}>
                                      ( if paid online money will be refunded in
                                      7-10 working days )
                                    </Text>
                                  </View>
                                )}
                                {item.status !== "Delivered" &&
                                  !item.cancelStatus && (
                                    <View className="flex justify-center items-center pb-1">
                                      <Text className="font-semibold">
                                        Delivery by {item.estimatedDelivery}
                                      </Text>
                                    </View>
                                  )}
                                {item.status === "Delivered" && (
                                  <View className="flex justify-center items-center pb-1">
                                    <Text className="font-semibold">
                                      Delivered on {item.deliveredDate}
                                    </Text>
                                  </View>
                                )}
                                {/* Items details */}
                                <Text>Items :</Text>
                                {item.products &&
                                  item.products.map((item, index) => (
                                    <View key={index}>
                                      <View className="flex-row justify-between items-end w-full">
                                        <View className="flex-row w-[55%] items-start">
                                          <Text>{index + 1}. </Text>
                                          <TouchableOpacity
                                            onPress={() =>
                                              router.push(
                                                `/(screens)/productDetail?id=${item.productId}`
                                              )
                                            }
                                            className=""
                                          >
                                            <Text className="text-gray-700">
                                              {item.productName}
                                              {"  "}
                                            </Text>
                                          </TouchableOpacity>
                                        </View>
                                        {item.quantity > 1 && (
                                          <Text> x {item.quantity}</Text>
                                        )}
                                        <View>
                                          <Text>
                                            ₹
                                            {formatNumberInIndianStyle(
                                              parseInt(
                                                item.productPrice.replace(
                                                  /,/g,
                                                  ""
                                                ),
                                                10
                                              ) +
                                                parseInt(
                                                  item.productShipping,
                                                  10
                                                ) *
                                                  item.quantity
                                            )}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                {item.extraShippingCharge && (
                                  <Text>
                                    Extra Shipping Charge : ₹
                                    {item.extraShippingCharge}
                                  </Text>
                                )}
                                <Text className="font-semibold">{`Total Order Value: ₹${item.price}`}</Text>
                                <Text>{`Ordered on: ${item.createdDate.slice(
                                  0,
                                  10
                                )}`}</Text>
                                {showFullOrderData === item.$id &&
                                  item.status === "Accepted" && (
                                    <Text>{`Accepted on: ${item.acceptedDate}`}</Text>
                                  )}
                                {showFullOrderData === item.$id &&
                                  item.status === "Shipped" && (
                                    <Text>{`Shipped on: ${item.shippedDate}`}</Text>
                                  )}
                                {showFullOrderData === item.$id &&
                                  item.status === "Delivered" && (
                                    <Text>{`Delivered on: ${item.deliveredDate}`}</Text>
                                  )}
                                {showFullOrderData === item.$id && (
                                  <Text>{`Payment: ${item.payment}`}</Text>
                                )}
                                {showFullOrderData === item.$id && (
                                  <Text>{`Delivery Address: ${item.address.name}, ${item.address.phone} - ${item.address.houseNo}, ${item.address.area}, ${item.address.city}, ${item.address.state}, ${item.address.pin}`}</Text>
                                )}
                                {/* Cancel Button */}
                                {showFullOrderData === item.$id &&
                                  item.status === "New Order" &&
                                  !item.cancelStatus && (
                                    <TouchableOpacity
                                      className="pt-1"
                                      onPress={() =>
                                        selectOrderToRefund(
                                          item.$id,
                                          item.payment
                                        )
                                      }
                                    >
                                      <Text className={`text-red-500 ${lg}`}>
                                        Cancel Order ?
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                {showFullOrderData === item.$id ? (
                                  <Pressable
                                    className="flex justify-center items-center"
                                    onPress={() => setshowFullOrderData(null)}
                                  >
                                    <UpArrow
                                      width={"32"}
                                      height={"32"}
                                      color={"#000000"}
                                    />
                                  </Pressable>
                                ) : (
                                  <Pressable
                                    className="flex justify-center items-center"
                                    onPress={() => {
                                      reloadOrderStatus(item.$id);
                                      setshowFullOrderData(item.$id);
                                    }}
                                  >
                                    <DownArrow
                                      width={"32"}
                                      height={"32"}
                                      color={"#000000"}
                                    />
                                  </Pressable>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    {(!userOrders || userOrders.length === 0) && (
                      <View className="">
                        <Image source={image} />
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
            {/* Refund Details Box */}
            {showRefundBox && (
              <View className=" absolute top-20 w-full">
                <RefundInput
                  onlinePayment={selecedOrderPayment}
                  orderId={selectedOrderID}
                  reloadAfterRefund={reloadOrderStatus}
                />
              </View>
            )}
          </View>
          <View className="absolute bottom-0 left-0 right-0 flex-col items-center mb-4">
            <Text className="text-xs text-gray-500">
              Maxmol Renewable Energy, Saharanpur, Uttar Pradesh
            </Text>
            <Text className="text-xs text-gray-500">
              All Rights Reserved 2024
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
};

export default profile;

import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import HorizontalCard from "@/components/HorizontalCard";
import RazorpayCheckout from "react-native-razorpay";
import { router } from "expo-router";
import {
  addOrder,
  getMiscellaneousData,
  getSingleProduct,
  modifyCart,
  modifyProductBought,
  updateProductStock,
} from "@/lib/appwrite";
import LoadingScreen from "@/components/LoadingScreen";

const paymentSelect = () => {
  const { user, order, setUser } = useGlobalContext();
  const [userOrder, setUserOrder] = useState(null);
  const [statesData, setStatesData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState();
  const [deliveryDate, setDeliveryDate] = useState(null);

  function getFormattedDate(extraDays) {
    // Get today's date
    let today = new Date();
    // Add 10 days
    today.setDate(today.getDate() + 10 + extraDays);

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

  const formatNumberInIndianStyle = (number) => {
    if (number) {
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
    }
  };

  const fetchProductData = async (idsArray) => {
    try {
      const newProductData = [];
      for (let i = 0; i <= idsArray.length - 1; i++) {
        const res = await getSingleProduct(idsArray[i].productId);
        if (res.status) {
          newProductData.push({
            ...res.data,
            buyQty: parseInt(idsArray[i].quantity, 10),
          });
        }
      }
      setProductData(newProductData);
    } catch (error) {
      alert("Couldn't fetch Data");
    }
  };

  const fetchMiscData = async () => {
    try {
      const res = await getMiscellaneousData();
      if (res.status) {
        let parsedData = res.data.states.map((item) => JSON.parse(item));
        setStatesData(parsedData);
      }
    } catch (error) {
      alert(error);
    }
  };

  const createOrder = async (payment, razorpayId) => {
    setLoading(true);
    try {
      // Removing stock qty from Database for all products
      const stockUpdatePromises = productData.map(async (product) => {
        if (product.stock >= product.buyQty) {
          let updatedStock = product.stock - product.buyQty;
          await updateProductStock(product.$id, updatedStock);
        } else {
          throw new Error(`Insufficient stock for product: ${product.title}`);
        }
      });
      // Wait for all stock updates to complete
      await Promise.all(stockUpdatePromises);

      // Removing the products from Cart
      let updatedCart = userData.cart;
      let updatedBought = userData.productsBought;

      for (let i = 0; i < userData.cart.length; i++) {
        let cartItemId = userData.cart[i].productId;
        // Check if the product exists in productData
        const productExists = productData.some(
          (product) => product.$id === cartItemId
        );
        // If the product exists, filter it out of updatedCart
        if (productExists) {
          updatedCart = updatedCart.filter(
            (item) => item.productId !== cartItemId
          );
        }
      }

      // updating ProductsBoughtArray
      for (let i = 0; i < productData.length; i++) {
        let currItemId = productData[i].$id;
        // Check if the product exists in boughtData
        const productExists = updatedBought.some((item) => item === currItemId);
        // If the product exists, filter it out of updatedCart
        if (!productExists) {
          updatedBought.push(currItemId);
        }
      }

      try {
        await modifyCart(userData.$id, updatedCart);
        await modifyProductBought(userData.$id, updatedBought);
        setUser({ ...userData, cart: updatedCart });
      } catch (error) {
        Alert.alert("Error Updating Cart", error);
      }
      try {
        let ExtraCharge =
          statesData.filter(
            (item) =>
              item.name.trim().toLowerCase() ===
              userOrder.deliverTo.state.trim().toLowerCase()
          )[0]?.charge || 0;

        await addOrder(
          userOrder,
          userData.$id,
          payment,
          razorpayId,
          total.toString(),
          deliveryDate,
          parseInt(ExtraCharge, 10)
        );
        router.replace("/confirmationScreen");
      } catch (error) {
        alert(error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const cashOnDelivery = async () => {
    let payment = "Cash on Delivery";
    await createOrder(payment);
  };

  const handleOnlinePayment = () => {
    const options = {
      description: "Purchase description",
      image: "https://maxmol.com/wp-content/uploads/2024/09/1724135581902.png", // Optional: Your company's logo
      currency: "INR",
      key: "", // Add your Razorpay API Key
      amount: parseInt(total) * 100,
      name: "Maxmol Renewable Energy Pvt Ltd",
      prefill: {
        email: "customer@example.com",
        contact: `${userData.number}`,
        name: `${userData.name}`,
      },
      theme: { color: "#F37254" },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        // Handle successful payment
        let payment = "Online Payment";
        createOrder(payment, data.razorpay_payment_id);
        console.log(data); //data.razorpay_payment_id is the pay id
      })
      .catch((error) => {
        // Handle failed payment
        Alert.alert(error);
      });
  };

  useEffect(() => {
    if (productData && statesData && userOrder) {
      let sum = 0;
      for (data of productData) {
        let price = data.price - (data.price * data.discount) / 100;
        sum +=
          (price + (price * data.gst) / 100 + data.shippingCharge) *
          data.buyQty;
      }
      sum +=
        Number(
          statesData.filter(
            (item) =>
              item.name.trim().toLowerCase() ===
              userOrder.deliverTo.state.trim().toLowerCase()
          )[0]?.charge
        ) || 0;
      setTotal(sum.toFixed(0));
      let extra =
        Number(
          statesData.filter(
            (item) =>
              item.name.trim().toLowerCase() ===
              userOrder.deliverTo.state.trim().toLowerCase()
          )[0]?.days
        ) || 0;
      getFormattedDate(extra);
      setLoading(false);
    }
  }, [productData, statesData, userOrder]);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
    if (order) {
      console.log(order, "order");
      fetchMiscData();
      setUserOrder(order);
      fetchProductData(order.products);
    }
  }, [user, order]);

  if (loading) return <LoadingScreen />;

  return (
    <View className="min-h-screen">
      <ScrollView>
        {userOrder !== null && (
          <View className="flex-row items-start px-4  pt-2 ">
            <View className="flex-col mb-4 border border-gray-400 rounded-md w-full py-2  px-2">
              <View className="flex justify-center items-center">
                <Text className=" text-[4vw] font-semibold">Address</Text>
              </View>

              <Text className="text-[3.5vw] ">
                {userOrder.deliverTo.name}, {userOrder.deliverTo.phone}
              </Text>
              <Text className="text-[3.5vw] pt-1">
                {userOrder.deliverTo.houseNo}, {userOrder.deliverTo.area},{" "}
                {userOrder.deliverTo.city}, {userOrder.deliverTo.state}, Pin -{" "}
                {userOrder.deliverTo.pin}
              </Text>
            </View>
          </View>
        )}
        <View className=" flex justify-center items-center pb-4">
          <Text className="text-[4vw] font-bold">
            Delivery by {deliveryDate}! 😀
          </Text>
        </View>
        <View className=" flex justify-center items-center py-2">
          {(!productData || productData.length === 0) && (
            <Text className="text-[4vw] font-bold text-red-500">
              Item currently unavailable 🙁
            </Text>
          )}
        </View>
        <View>
          {productData && productData.length > 0 && userOrder && statesData && (
            <View className="border border-gray-400 rounded-md mx-2">
              <View className="flex justify-center items-center py-2">
                <Text className="text-[4vw] font-semibold">Particulars</Text>
              </View>
              {productData.map((item, index) => (
                <View className="flex-row px-2" key={index}>
                  <View className="flex-col">
                    <Text>{index + 1}. </Text>
                  </View>
                  <View className="flex-col w-[95%]">
                    <View className="flex-row justify-between items-end w-full">
                      <Text className="max-w-[77%] text-gray-800">
                        {item.title}
                      </Text>
                      <Text>
                        ₹{formatNumberInIndianStyle(item.price.toFixed(0))} x{" "}
                        {item.buyQty}
                      </Text>
                    </View>
                    {item.discount > 0 && (
                      <View className="flex-row justify-between items-center pl-2">
                        <Text>Sale Discount {item.discount} % </Text>
                        <Text>
                          -{((item.price * item.discount) / 100).toFixed(0)} x{" "}
                          {item.buyQty}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-center pl-2">
                      <Text>GST {item.gst}% </Text>
                      <Text>
                        ₹
                        {item.gst > 0
                          ? formatNumberInIndianStyle(
                              (
                                ((item.price -
                                  (item.price * item.discount) / 100) *
                                  item.gst) /
                                100
                              ).toFixed(0)
                            )
                          : 0}{" "}
                        x {item.buyQty}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center pl-2">
                      <Text>Shipping </Text>
                      <Text>
                        ₹{item.shippingCharge.toFixed(0)} x {item.buyQty}
                      </Text>
                    </View>

                    <View className="w-[100%] h-1 border-b border-gray-400 "></View>
                  </View>
                </View>
              ))}
              <View className="flex-row justify-between items-center px-3">
                <Text>
                  Extra Shipping Charge for {userOrder.deliverTo.state}
                </Text>
                <Text>
                  ₹
                  {statesData.filter(
                    (item) =>
                      item.name.trim().toLowerCase() ===
                      userOrder.deliverTo.state.trim().toLowerCase()
                  )[0]?.charge || "₹0"}
                </Text>
              </View>
              <View className="w-[100%] h-1 border-b border-gray-400 "></View>
              <View className="flex-row justify-between items-center px-3 py-1">
                <Text className="font-semibold">Total</Text>
                <Text className="font-semibold">
                  ₹{formatNumberInIndianStyle(total)}
                </Text>
              </View>
            </View>
          )}
        </View>
        {/* Payment Buttons */}
        <View className="flex-row justify-center items-center py-8 gap-4">
          <Pressable
            className="w-[42%] h-14 flex justify-center items-center rounded-md"
            style={{ backgroundColor: "#dca80e" }}
            onPress={handleOnlinePayment}
            disabled={!productData || productData.length === 0}
          >
            <Text
              className={`text-[20px] font-semibold text-gray-50 ${
                !productData || productData.length === 0 ? "opacity-60" : ""
              }`}
            >
              Pay Online
            </Text>
          </Pressable>
          <Pressable
            className="w-[42%] bg-yellow-600 h-14 flex justify-center items-center rounded-md"
            style={{ backgroundColor: "#dca80e" }}
            onPress={cashOnDelivery}
            disabled={true}
          >
            <Text className="text-[20px] font-semibold text-gray-50 opacity-60">
              Cash on Delivery
            </Text>
          </Pressable>
        </View>
        <Text className="text-[18px] font-semibold pl-4">
          {" "}
          Items you bought :
        </Text>
        <View className="mb-20">
          {productData &&
            productData.length > 0 &&
            productData.map((item, index) => (
              <View key={index} className="relative">
                <HorizontalCard
                  keyd={index}
                  id={item.$id}
                  image={item.images[0]}
                  title={item.title}
                  price={item.price + (item.price * item.gst) / 100}
                  discount={item.discount}
                  quantity={item.buyQty}
                  showButton={false}
                  visibility={true}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default paymentSelect;

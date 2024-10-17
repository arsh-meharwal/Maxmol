import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  getAllAcceptedOrders,
  getAllCancellRequestOrders,
  getAllNewOrders,
  getAllShippedOrders,
  getSingleProduct,
  modifyOrderStatus,
} from "@/lib/appwrite";
import { Copy, DownArrow, UpArrow } from "@/components/Svgs";
import HorizontalCard from "@/components/HorizontalCard";
import Clipboard from "@react-native-clipboard/clipboard";
import { router } from "expo-router";
import RNFS from "react-native-fs";
import Share from "react-native-share";

const currentOrders = () => {
  const [newOrders, setNewOrders] = useState([]);
  const [newOrdersLength, setNewOrdersLength] = useState(null);
  const [showNewOrders, setShowNewOrders] = useState(true); // used to bolden button
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [acceptedOrdersLength, setAcceptedOrdersLength] = useState(null);
  const [showAcceptedOrders, setShowAcceptedOrders] = useState(false); // used to bolden button
  const [shippedOrders, setShippedOrders] = useState([]);
  const [shippedOrdersLength, setShippedOrdersLength] = useState(null);
  const [showShippedOrders, setShowShippedOrders] = useState(false); // used to bolden button
  const [showDeliveredOrders, setShowDeliveredOrders] = useState(false); // used to bolden button
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [cancelledOrdersLength, setCancelledOrdersLength] = useState(null);
  const [showCancelledOrders, setShowCancelledOrders] = useState(false); // used to bolden button
  const [displayData, setDisplayData] = useState(); // the current displayed data on screen
  const [showFullData, setShowFullData] = useState(null); // show full data for individual order
  const [loading, setLoading] = useState(true);
  const [componentLoading, setComponentLoading] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const formatNumberInIndianStyle = (number) => {
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

  const fetchFullOrderData = async (order) => {
    setComponentLoading(order.$id);
    // let arr = [];
    // let products = JSON.parse(order.products);
    // for (let i = 0; i < products.length; i++) {
    //   const res = await getSingleProduct(products[i].productId);
    //   if (res.status === true) {
    //     let obj = res.data;
    //     obj.quantity = products[i].quantity;
    //     arr.push(obj);
    //   } else {
    //     alert(res.error);
    //     break;
    //   }
    // }
    setShowFullData(order.$id);
    setComponentLoading(null);
  };

  const fetchInitialData = async () => {
    try {
      const res = await getAllNewOrders();
      if (res.status) {
        //let stringifiedProducts =

        console.log(res.orders, "res.oredrs");
        setNewOrders(res.orders);
        setNewOrdersLength(res.totalPages);
        setShowCancelledOrders(false);
        setShowShippedOrders(false);
        setShowAcceptedOrders(false);
        setShowNewOrders(true);
        setDisplayData(res.orders); // show New Orders at the beginning
        fetchAcceptedData();
        fetchShippedData();
        fetchCancellRequestData();
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewOrderData = async () => {
    try {
      const res = await getAllNewOrders();
      if (res.status) {
        setNewOrders(res.orders);
        setNewOrdersLength(res.totalPages);
      }
    } catch (error) {
      alert(error);
    }
  };

  const displayNewOrders = async () => {
    if (newOrders.length === 0) {
      await fetchNewOrderData();
      setDisplayData(newOrders);
      setShowNewOrders(true);
      setShowDeliveredOrders(false);
      setShowCancelledOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(false);
    } else {
      setDisplayData(newOrders);
      setShowNewOrders(true);
      setShowCancelledOrders(false);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(false);
    }
  };

  const fetchAcceptedData = async () => {
    try {
      const res = await getAllAcceptedOrders();
      if (res.status) {
        setAcceptedOrders(res.orders);
        setAcceptedOrdersLength(res.totalPages);
      }
    } catch (error) {
      alert(error);
    }
  };

  const displayAcceptedOrders = async () => {
    if (acceptedOrders.length === 0) {
      await fetchAcceptedData();
      setDisplayData(acceptedOrders);
      setShowNewOrders(false);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(true);
      setShowShippedOrders(false);
      setShowCancelledOrders(false);
    } else {
      setDisplayData(acceptedOrders);
      setShowNewOrders(false);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(true);
      setShowShippedOrders(false);
      setShowCancelledOrders(false);
    }
  };

  const fetchShippedData = async () => {
    try {
      const res = await getAllShippedOrders();
      if (res.status) {
        setShippedOrders(res.orders);
        setShippedOrdersLength(res.totalPages);
      }
    } catch (error) {
      alert(error);
    }
  };

  const displayShippedOrders = async () => {
    if (shippedOrders.length === 0) {
      await fetchShippedData();
      setDisplayData(shippedOrders);
      setShowNewOrders(false);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(true);
      setShowCancelledOrders(false);
    } else {
      setDisplayData(shippedOrders);
      setShowNewOrders(false);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(true);
      setShowCancelledOrders(false);
    }
  };

  const fetchCancellRequestData = async () => {
    try {
      const res = await getAllCancellRequestOrders();
      if (res.status) {
        setCancelledOrders(res.orders);
        setCancelledOrdersLength(res.totalPages);
      }
    } catch (error) {
      alert(error);
    }
  };

  const displayCancellRequestOrders = async () => {
    if (cancelledOrders.length === 0) {
      await fetchCancellRequestData();
      setDisplayData(cancelledOrders);
      setShowNewOrders(false);
      setShowCancelledOrders(true);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(false);
    } else {
      setDisplayData(cancelledOrders);
      setShowNewOrders(false);
      setShowCancelledOrders(true);
      setShowDeliveredOrders(false);
      setShowAcceptedOrders(false);
      setShowShippedOrders(false);
    }
  };

  const copyToClipboard = (razorpayId) => {
    Clipboard.setString(razorpayId);
  };

  function formatDateTime() {
    const now = new Date(); // Get current date and time

    // Format the date in dd-mm-yyyy
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = now.getFullYear();

    // Format the time in hh:mm (24-hour format)
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  const changeOrderStatus = async (id, status) => {
    if (status !== "") {
      let date = formatDateTime();
      const res = await modifyOrderStatus(id, status, date);
      if (res.status) {
        setComponentLoading(id);
        await fetchInitialData();
        setComponentLoading(null);
      }
    }
  };

  const changeMultipleOrderStatus = async (orderIdArray, status) => {
    if (orderIdArray.length > 0) {
      setLoading(true);
      for (const id of orderIdArray) {
        const date = formatDateTime(); // Get the date for each order
        const res = await modifyOrderStatus(id, status, date);
        console.log(`Order ID: ${id} status changed to: ${status}`, res); // Log the result for each order
      }
      setSelectedOrders([]);
      await fetchInitialData();
    }
  };

  const changeCancelStatus = async (id, status) => {
    if (status !== "") {
      let date = formatDateTime();
      const res = await modifyOrderStatus(id, status, date);
      if (res.status === true) {
        setComponentLoading(id);
        await fetchInitialData();
        setComponentLoading(null);
      }
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const generateExcelReport = async () => {
    setLoading(true);
    try {
      const loadExcelJS = async () => {
        const ExcelJS = await import("exceljs");
        return ExcelJS;
      };
      // Create a new Excel workbook
      const ExcelJs = await loadExcelJS();
      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Define the header row
      worksheet.columns = [
        { header: "Order No.", key: "number", width: 8 },
        { header: "Status", key: "status", width: 10 },
        { header: "Registered User", key: "user", width: 25 },
        { header: "Order Items", key: "items", width: 40 },
        { header: "Quantity", key: "qty", width: 8 },
        { header: "Order Amount", key: "total", width: 10 },
        { header: "Payment Id", key: "razorpay", width: 8 },
        { header: "Address", key: "address", width: 50 },
        { header: "Order Date", key: "ordered", width: 12 },
        { header: "Accepted Date", key: "accepted", width: 12 },
        { header: "Shipped Date", key: "shipped", width: 10 },
      ];

      // Add rows from displayData
      displayData.forEach((item) => {
        const addressObject = JSON.parse(item.address[0]); // Assuming address is stored as JSON
        const fullAddress = `${addressObject?.name || ""}, ${
          addressObject?.phone || ""
        }, ${addressObject?.houseNo || ""}, ${addressObject?.area || ""}, ${
          addressObject?.city || ""
        }, ${addressObject?.state || ""}, ${addressObject?.pin || ""}`;
        const productNames = item.products
          .map((product) => `${product.productName} x ${product.quantity}`)
          .join(", ");

        const totalItems = item.products.reduce(
          (total, product) => total + parseInt(product.quantity, 10),
          0
        );
        worksheet.addRow({
          number: item.number,
          status: item.cancelStatus ? item.cancelStatus : item.status,
          user: item.user,
          address: fullAddress,
          items: productNames,
          qty: totalItems,
          total: item.price,
          razorpay: item.razorpayId || "NA",
          accepted: item.acceptedDate || "NA",
          shipped: item.shippedDate || "NA",
          ordered: item.createdDate.slice(0, 10),
        });
      });

      // Write the Excel file to a temporary location
      const filePath = `${RNFS.DocumentDirectoryPath}/report.xlsx`;

      // Write the workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Write the buffer to a file
      await RNFS.writeFile(filePath, buffer.toString("base64"), "base64");

      // Share the Excel file
      const shareOptions = {
        title: "Share Report",
        url: `file://${filePath}`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      Share.open(shareOptions)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } catch (error) {
      Alert.alert("Error Generating Excel", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View className="flex justify-center  items-center h-screen">
        <Text>Loading...</Text>
      </View>
    );
  else {
    return (
      <ScrollView>
        <View className="pt-14">
          {/* Top 4 buttons */}
          <View className="flex-row flex-wrap justify-between px-4">
            <Pressable
              className={`h-8 w-[48%] ${
                showNewOrders ? "bg-green-600" : "bg-white"
              } border border-gray-400 flex justify-center items-center rounded-xl mb-4`}
              onPress={displayNewOrders}
            >
              <Text
                className={`${
                  showNewOrders ? "text-white font-semibold" : "text-black"
                }`}
              >
                New Orders - {newOrdersLength}
              </Text>
            </Pressable>
            <Pressable
              className={`h-8 w-[48%] ${
                showAcceptedOrders ? "bg-green-600" : "bg-white"
              } border border-gray-400 flex justify-center items-center rounded-xl mb-4`}
              onPress={displayAcceptedOrders}
            >
              <Text
                className={`${
                  showAcceptedOrders ? "text-white font-semibold" : "text-black"
                }`}
              >
                Accepted - {acceptedOrdersLength}
              </Text>
            </Pressable>
            <Pressable
              className={`h-8 w-[48%] ${
                showShippedOrders ? "bg-green-600" : "bg-white"
              } border border-gray-400 flex justify-center items-center rounded-xl mb-4`}
              onPress={displayShippedOrders}
            >
              <Text
                className={`${
                  showShippedOrders ? "text-white font-semibold" : "text-black"
                }`}
              >
                Shipped - {shippedOrdersLength}
              </Text>
            </Pressable>
            {/* <Pressable
              className={`h-8 w-[48%] ${
                showDeliveredOrders ? "bg-green-600" : "bg-white"
              } border border-gray-400 flex justify-center items-center rounded-xl mb-4`}
              onPress={displayDeliveredOrders}
            >
              <Text
                className={`${
                  showDeliveredOrders
                    ? "text-white font-semibold"
                    : "text-black"
                }`}
              >
                Delivered - {deliveredOrdersLength}
              </Text>
            </Pressable> */}

            <Pressable
              className={`h-8 w-[48%] ${
                showCancelledOrders ? "bg-green-600" : "bg-white"
              } border border-gray-400 flex justify-center items-center rounded-xl mb-4`}
              onPress={displayCancellRequestOrders}
            >
              <Text
                className={`${
                  showCancelledOrders
                    ? "text-white font-semibold"
                    : "text-red-500"
                }`}
              >
                Cancel Request - {cancelledOrdersLength}
              </Text>
            </Pressable>
          </View>
          {/* Orders data */}
          <View className="flex-col mr-2 ml-4">
            {displayData && displayData.length > 0 && (
              <View className="flex-row pb-1 justify-between items-center w-full">
                <View>
                  <TouchableOpacity
                    onPress={generateExcelReport}
                    className="bg-blue-300 rounded-lg "
                  >
                    <Text className="text-center px-2 text-xs py-1">
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="w-1/2 h-6 border border-gray-400 rounded-lg overflow-hidden justify-center">
                  <Picker
                    //selectedValue={value}
                    className="text-sm"
                    onValueChange={(itemValue) =>
                      changeMultipleOrderStatus(selectedOrders, itemValue)
                    }
                  >
                    <Picker.Item
                      label="Change Status"
                      value=""
                      style={{ fontSize: 12 }}
                    />
                    <Picker.Item label="Accepted" value="Accepted" />
                    <Picker.Item label="Shipped" value="Shipped" />
                    <Picker.Item label="Delivered" value="Delivered" />
                  </Picker>
                </View>
              </View>
            )}
            {!displayData ||
              (displayData.length === 0 && (
                <View className="flex justify-center items-center mt-40">
                  <Text>No Data..</Text>
                </View>
              ))}
            <View>
              {displayData &&
                displayData.length > 0 &&
                displayData.map((item, index) =>
                  componentLoading === item.$id ? (
                    <View className="my-2" key={index}>
                      <View className="flex justify-center items-center border h-40 border-gray-500 pt-3 rounded-lg px-3 gap-1">
                        <Text>Loading</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="my-2 " key={index}>
                      <View className="flex-row border h-auto border-gray-400 pt-1 rounded-lg px-1 gap-1">
                        <View className="flex pt-4 pr-1">
                          <TouchableOpacity
                            className={`h-4 w-4 rounded-full border border-gray-400 ${
                              selectedOrders.some((order) => order === item.$id)
                                ? "bg-cyan-400"
                                : ""
                            }`}
                            onPress={() => {
                              if (!item.cancelStatus) {
                                if (
                                  selectedOrders.some(
                                    (order) => order === item.$id
                                  )
                                ) {
                                  setSelectedOrders(
                                    selectedOrders.filter(
                                      (order) => order !== item.$id
                                    )
                                  );
                                } else {
                                  setSelectedOrders((prev) => [
                                    ...prev,
                                    item.$id,
                                  ]);
                                }
                              }
                              console.log(selectedOrders);
                            }}
                          ></TouchableOpacity>
                        </View>
                        <View className="flex-col pr-8 w-full">
                          <View className="flex-row justify-between">
                            <Text>
                              Order No. -{" "}
                              <Text className="font-semibold text-red-400 text-[4vw]">
                                {item.number}
                              </Text>
                            </Text>

                            <Text className="text-[3.4vw] font-semibold">
                              {item.status}
                            </Text>
                            {item.cancelStatus && (
                              <Text className="text-[3.4vw] text-red-500 font-semibold">
                                {item.cancelStatus}
                              </Text>
                            )}
                          </View>
                          {item.cancelReason && (
                            <Text>Cancel Reason - {item.cancelReason}</Text>
                          )}
                          <Text>Registered User : {item.user}</Text>
                          {/* Address */}
                          {showFullData === item.$id && (
                            <>
                              <Text>
                                {`Address - ${
                                  JSON.parse(item.address[0]).name
                                } - ${JSON.parse(item.address[0]).phone} - ${
                                  JSON.parse(item.address[0]).houseNo
                                }, ${JSON.parse(item.address[0]).area}, ${
                                  JSON.parse(item.address[0]).city
                                }, ${JSON.parse(item.address[0]).state}, ${
                                  JSON.parse(item.address[0]).pin
                                }`}
                              </Text>
                              <Text>{`Order Date: ${item.createdDate.slice(
                                0,
                                10
                              )}`}</Text>
                            </>
                          )}
                          {item.acceptedDate && (
                            <Text>{`Accepted Date: ${item.acceptedDate}`}</Text>
                          )}
                          <Text>{`Order Value: ₹${formatNumberInIndianStyle(
                            item.price
                          )}`}</Text>
                          {showFullData === item.$id && (
                            <Text>
                              {`Items: Total ${item.products.reduce(
                                (total, product) =>
                                  total + parseInt(product.quantity, 10),
                                0
                              )} units`}
                            </Text>
                          )}
                          <View>
                            {showFullData === item.$id && (
                              <View className="flex-col">
                                <Text>{`Payment Status: ${item.payment}`}</Text>
                                <View className="flex-row justify-start items-center">
                                  <Text className="pr-2">{`Payment Id: ${item.razorpayId}`}</Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      copyToClipboard(item.razorpayId)
                                    }
                                  >
                                    <Copy
                                      height={14}
                                      width={14}
                                      color={"#00c9af"}
                                    />
                                  </TouchableOpacity>
                                </View>

                                {item.cancelStatus !== null &&
                                  item.refundAccDetails !== null && (
                                    <>
                                      <Text>{`Payment Refund Account Details :`}</Text>
                                      <View className="flex flex-col justify-center items-center border border-gray-500 rounded-lg py-2 my-1">
                                        <View className="flex-row justify-start items-center">
                                          <Text className="pr-2">{`Account Name - ${
                                            JSON.parse(item.refundAccDetails)
                                              .accountName
                                          }`}</Text>
                                          <TouchableOpacity
                                            onPress={() =>
                                              copyToClipboard(
                                                JSON.parse(
                                                  item.refundAccDetails
                                                ).accountName
                                              )
                                            }
                                          >
                                            <Copy
                                              height={14}
                                              width={14}
                                              color={"#00c9af"}
                                            />
                                          </TouchableOpacity>
                                        </View>
                                        <View className="flex-row justify-start items-center py-2">
                                          <Text>{`Account Number - ${
                                            JSON.parse(item.refundAccDetails)
                                              .accountNumber
                                          } `}</Text>
                                          <TouchableOpacity
                                            onPress={() =>
                                              copyToClipboard(
                                                JSON.parse(
                                                  item.refundAccDetails
                                                ).accountNumber
                                              )
                                            }
                                          >
                                            <Copy
                                              height={14}
                                              width={14}
                                              color={"#00c9af"}
                                            />
                                          </TouchableOpacity>
                                        </View>
                                        <View className="flex-row justify-start items-center">
                                          <Text>{`IFSC Code - ${
                                            JSON.parse(item.refundAccDetails)
                                              .ifsc
                                          } `}</Text>
                                          <TouchableOpacity
                                            onPress={() =>
                                              copyToClipboard(
                                                JSON.parse(
                                                  item.refundAccDetails
                                                ).ifsc
                                              )
                                            }
                                          >
                                            <Copy
                                              height={14}
                                              width={14}
                                              color={"#00c9af"}
                                            />
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    </>
                                  )}
                                <Text>Items :</Text>
                                <View>
                                  {item.products.map((item, index) => (
                                    <View
                                      className="flex-row justify-between items-end w-full"
                                      key={index}
                                    >
                                      <View className="flex-row w-[60%]">
                                        <Text>{index + 1}.</Text>
                                        <TouchableOpacity
                                          onPress={() =>
                                            router.push(
                                              `/(screens)/productDetail?id=${item.productId}`
                                            )
                                          }
                                        >
                                          <Text className="text-cyan-600">
                                            {item.productName}
                                          </Text>
                                        </TouchableOpacity>
                                      </View>
                                      <View className="flex-row">
                                        <Text>
                                          ₹
                                          {parseInt(
                                            item.productPrice.replace(/,/g, ""),
                                            10
                                          ) / parseInt(item.quantity, 10)}{" "}
                                          + ₹{item.productShipping} x{" "}
                                          {item.quantity}
                                        </Text>
                                      </View>
                                    </View>
                                  ))}
                                  {item.extraShippingCharge === true && (
                                    <Text>
                                      Extra Shipping Charge : ₹
                                      {item.extraShippingCharge}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                          {showFullData === item.$id ? (
                            <>
                              <Text className="pt-2">
                                Change Order Status :
                              </Text>
                              <View className="h-10 border border-gray-400 rounded-lg overflow-hidden justify-center mt-2">
                                {item.cancelStatus ? (
                                  <Picker
                                    selectedValue={item.status}
                                    className="text-sm"
                                    onValueChange={(itemValue) =>
                                      changeCancelStatus(item.$id, itemValue)
                                    }
                                  >
                                    <Picker.Item
                                      label={item.cancelStatus}
                                      value=""
                                      style={{ color: "gray" }}
                                    />
                                    <Picker.Item
                                      label="Refund Completed"
                                      value="Refund Completed"
                                    />
                                  </Picker>
                                ) : (
                                  <Picker
                                    selectedValue={item.status}
                                    className="text-sm"
                                    onValueChange={(itemValue) =>
                                      changeOrderStatus(item.$id, itemValue)
                                    }
                                  >
                                    <Picker.Item
                                      label={item.status}
                                      value=""
                                      style={{ color: "gray" }}
                                    />
                                    <Picker.Item
                                      label="Accepted"
                                      value="Accepted"
                                    />
                                    <Picker.Item
                                      label="Shipped"
                                      value="Shipped"
                                    />
                                    <Picker.Item
                                      label="Delivered"
                                      value="Delivered"
                                    />
                                  </Picker>
                                )}
                              </View>
                              <Pressable
                                className="flex justify-center items-center"
                                onPress={() => setShowFullData(null)}
                              >
                                <UpArrow
                                  width={"32"}
                                  height={"24"}
                                  color={"#000000"}
                                />
                              </Pressable>
                            </>
                          ) : (
                            <Pressable
                              className="flex justify-center items-center"
                              onPress={() => fetchFullOrderData(item)}
                            >
                              <DownArrow
                                width={"32"}
                                height={"24"}
                                color={"#000000"}
                              />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  )
                )}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
};

export default currentOrders;

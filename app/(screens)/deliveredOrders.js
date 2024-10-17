import {
  View,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getAllDeliveredOrders, getSingleProduct } from "@/lib/appwrite";
import Clipboard from "@react-native-clipboard/clipboard";
import HorizontalCard from "@/components/HorizontalCard";
import { Copy, DownArrow, UpArrow } from "@/components/Svgs";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import LoadingScreen from "@/components/LoadingScreen";

const deliveredOrders = () => {
  const [data, setdata] = useState(null);
  const [totalData, setTotalData] = useState(null);
  const [componentLoading, setComponentLoading] = useState(null);
  const [showFullData, setShowFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const limit = 7;
  const [offset, setOffset] = useState(limit);

  const copyToClipboard = (razorpayId) => {
    Clipboard.setString(razorpayId);
  };

  const fetchFullOrderData = async (order) => {
    setComponentLoading(order.$id);
    setShowFullData(order.$id);
    setComponentLoading(null);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    const res = await getAllDeliveredOrders(limit, 0);
    if (res.status) {
      setdata(res.orders);
      setTotalData(res.totalPages);
    }
    setLoading(false);
  };

  const fetchLaterData = async () => {
    const res = await getAllDeliveredOrders(limit, offset);
    if (res.status) {
      let updatedData = [...data, ...res.orders];
      if (offset < Number(totalData)) {
        setOffset((prev) => prev + limit);
      }
      setdata(updatedData);
    }
  };

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
        { header: "Delivered Date", key: "delivered", width: 10 },
      ];

      // Add rows from displayData
      data.forEach((item) => {
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
          delivered: item.deliveredDate || "NA",
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
      console.error("Error generating Excel report:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

  if (loading) return <LoadingScreen />;

  return (
    <View className="flex-col">
      {!data && (
        <View className="flex justify-center items-center mt-40">
          <Text>No Data..</Text>
        </View>
      )}
      <View className="flex justify-center items-center">
        <Text>Total {totalData}</Text>
      </View>
      <TouchableOpacity
        onPress={generateExcelReport}
        className="bg-blue-300 rounded-lg w-1/6 mx-4"
      >
        <Text className="text-center px-2 text-xs py-1">Report</Text>
      </TouchableOpacity>
      <View className="mx-2 mb-10">
        <FlatList
          data={data}
          keyExtractor={(item) => item.$id}
          onEndReachedThreshold={0.1}
          onEndReached={fetchLaterData}
          renderItem={({ item }) => (
            <>
              {componentLoading === item.$id ? (
                <View className="my-2">
                  <View className="flex justify-center items-center border h-40 border-gray-500 pt-3 rounded-lg px-3 gap-1">
                    <Text>Loading</Text>
                  </View>
                </View>
              ) : (
                <View className="my-2">
                  <View className="flex-col border h-auto border-gray-500 pt-3 rounded-lg px-2 gap-1">
                    <View className="flex-row justify-between pb-2">
                      <Text>
                        Order No. -{" "}
                        <Text className="font-semibold text-red-400 text-[4vw]">
                          {item.number}
                        </Text>
                      </Text>

                      <Text className="text-[3.4vw] font-semibold">
                        {item.status}
                      </Text>
                    </View>

                    <Text>Registered User : {item.user}</Text>

                    <Text>{`Address - ${JSON.parse(item.address[0]).name} - ${
                      JSON.parse(item.address[0]).phone
                    } - ${JSON.parse(item.address[0]).houseNo}, ${
                      JSON.parse(item.address[0]).area
                    }, ${JSON.parse(item.address[0]).city}, ${
                      JSON.parse(item.address[0]).state
                    }, ${JSON.parse(item.address[0]).pin}`}</Text>
                    <Text>{`Order Date: ${item.createdDate}`}</Text>
                    {item.deliveredDate && (
                      <Text>{`Delivered Date: ${item.acceptedDate}`}</Text>
                    )}
                    <Text>{`Order Value: ₹${item.price}`}</Text>

                    <Text>
                      {`Items: Total ${item.products.reduce(
                        (total, product) =>
                          total + parseInt(product.quantity, 10),
                        0
                      )} units`}
                    </Text>

                    {showFullData === item.$id && (
                      <Text>{`Payment Status: ${item.payment}`}</Text>
                    )}
                    {showFullData === item.$id && item.razorpayId && (
                      <View className="flex-row justify-start items-center">
                        <Text className="pr-2">{`Razorpay Payment Id: ${item.razorpayId}`}</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(item.razorpayId)}
                        >
                          <Copy height={14} width={14} color={"#00c9af"} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {showFullData === item.$id && item.cancelStatus && (
                      <Text>{`Payment Refund Account Details :`}</Text>
                    )}
                    {showFullData === item.$id && item.cancelStatus && (
                      <View className="flex flex-col justify-center items-center border border-gray-500 rounded-lg py-2 my-1">
                        <View className="flex-row justify-start items-center">
                          <Text className="pr-2">{`Account Name - ${
                            JSON.parse(item.refundAccDetails).accountName
                          }`}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              copyToClipboard(
                                JSON.parse(item.refundAccDetails).accountName
                              )
                            }
                          >
                            <Copy height={14} width={14} color={"#00c9af"} />
                          </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-start items-center py-2">
                          <Text>{`Account Number - ${
                            JSON.parse(item.refundAccDetails).accountNumber
                          } `}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              copyToClipboard(
                                JSON.parse(item.refundAccDetails).accountNumber
                              )
                            }
                          >
                            <Copy height={14} width={14} color={"#00c9af"} />
                          </TouchableOpacity>
                        </View>
                        <View className="flex-row justify-start items-center">
                          <Text>{`IFSC Code - ${
                            JSON.parse(item.refundAccDetails).ifsc
                          } `}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              copyToClipboard(
                                JSON.parse(item.refundAccDetails).ifsc
                              )
                            }
                          >
                            <Copy height={14} width={14} color={"#00c9af"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {showFullData === item.$id && <Text>{`Items :`}</Text>}
                    {showFullData === item.$id && (
                      <>
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
                                  + ₹{item.productShipping} x {item.quantity}
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
                      </>
                    )}
                    {showFullData === item.$id ? (
                      <>
                        <Pressable
                          className="flex justify-center items-center"
                          onPress={() => setShowFullData(null)}
                        >
                          <UpArrow
                            width={"32"}
                            height={"32"}
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
                          height={"32"}
                          color={"#000000"}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        />
      </View>
      {/* {data &&
        data.map((item, index) =>
          componentLoading === item.$id ? (
            <View className="my-2" key={index}>
              <View className="flex justify-center items-center border h-40 border-gray-500 pt-3 rounded-lg px-3 gap-1">
                <Text>Loading</Text>
              </View>
            </View>
          ) : (
            <View className="my-2" key={index}>
              <View className="flex-col border h-auto border-gray-500 pt-3 rounded-lg px-3 gap-1">
                <View className="flex-row justify-between pb-2">
                  <Text>
                    Order No. -{" "}
                    <Text className="font-semibold text-red-400 text-[4vw]">
                      {item.number}
                    </Text>
                  </Text>

                  <Text className="text-[3.4vw] font-semibold">
                    {item.status}
                  </Text>
                </View>

                <Text>Registered User : {item.user}</Text>

                <Text>{`Address - ${JSON.parse(item.address[0]).name} - ${
                  JSON.parse(item.address[0]).phone
                } - ${JSON.parse(item.address[0]).houseNo}, ${
                  JSON.parse(item.address[0]).area
                }, ${JSON.parse(item.address[0]).city}, ${
                  JSON.parse(item.address[0]).state
                }, ${JSON.parse(item.address[0]).pin}`}</Text>
                <Text>{`Order Date: ${item.createdDate}`}</Text>
                {item.deliveredDate && (
                  <Text>{`Delivered Date: ${item.acceptedDate}`}</Text>
                )}
                <Text>{`Order Value: ₹${item.price}`}</Text>

                <Text>
                  {`Items: Total ${JSON.parse(item.products).reduce(
                    (total, product) => total + parseInt(product.quantity, 10),
                    0
                  )} units`}
                </Text>

                {showFullData === item.$id && (
                  <Text>{`Payment Status: ${item.payment}`}</Text>
                )}
                {showFullData === item.$id && item.razorpayId && (
                  <View className="flex-row justify-start items-center">
                    <Text className="pr-2">{`Razorpay Payment Id: ${item.razorpayId}`}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(item.razorpayId)}
                    >
                      <Copy height={14} width={14} color={"#00c9af"} />
                    </TouchableOpacity>
                  </View>
                )}
                {showFullData === item.$id && item.cancelStatus && (
                  <Text>{`Payment Refund Account Details :`}</Text>
                )}
                {showFullData === item.$id && item.cancelStatus && (
                  <View className="flex flex-col justify-center items-center border border-gray-500 rounded-lg py-2 my-1">
                    <View className="flex-row justify-start items-center">
                      <Text className="pr-2">{`Account Name - ${
                        JSON.parse(item.refundAccDetails).accountName
                      }`}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            JSON.parse(item.refundAccDetails).accountName
                          )
                        }
                      >
                        <Copy height={14} width={14} color={"#00c9af"} />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-start items-center py-2">
                      <Text>{`Account Number - ${
                        JSON.parse(item.refundAccDetails).accountNumber
                      } `}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            JSON.parse(item.refundAccDetails).accountNumber
                          )
                        }
                      >
                        <Copy height={14} width={14} color={"#00c9af"} />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-start items-center">
                      <Text>{`IFSC Code - ${
                        JSON.parse(item.refundAccDetails).ifsc
                      } `}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(
                            JSON.parse(item.refundAccDetails).ifsc
                          )
                        }
                      >
                        <Copy height={14} width={14} color={"#00c9af"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {showFullData === item.$id && <Text>{`Items :`}</Text>}
                {showFullData !== null &&
                  showFullData === item.$id &&
                  productsArray !== null &&
                  productsArray.map((product, index) => (
                    <View key={index} className="relative">
                      <HorizontalCard
                        keyd={index}
                        id={product.$id}
                        image={product.images[0]}
                        title={product.title}
                        price={product.price}
                        discount={product.discount}
                        quantity={product.quantity}
                        showButton={false}
                      />
                    </View>
                  ))}
                {showFullData === item.$id ? (
                  <>
                    <Pressable
                      className="flex justify-center items-center"
                      onPress={() => setShowFullData(null)}
                    >
                      <UpArrow width={"32"} height={"32"} color={"#000000"} />
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    className="flex justify-center items-center"
                    onPress={() => fetchFullOrderData(item)}
                  >
                    <DownArrow width={"32"} height={"32"} color={"#000000"} />
                  </Pressable>
                )}
              </View>
            </View>
          )
        )} */}
    </View>
  );
};

export default deliveredOrders;

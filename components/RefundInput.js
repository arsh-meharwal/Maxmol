import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { modifyOrderStatus } from "@/lib/appwrite";

const RefundInput = ({ onlinePayment, orderId, reloadAfterRefund }) => {
  const [reason, setreason] = useState("");
  const [accNo, setAccNo] = useState("");
  const [accName, setAccName] = useState("");
  const [ifsc, setIfsc] = useState("");

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

  const cancelOrder = async (id) => {
    try {
      let status = "Cancel Request";
      let obj = { accountNumber: accNo, ifsc: ifsc, accountName: accName };
      let strObj = JSON.stringify(obj);
      let date = formatDateTime();
      const res = await modifyOrderStatus(id, status, date, reason, strObj);
      if (res.status) {
        reloadAfterRefund(id);
      }
    } catch (error) {
      alert(error);
    }
  };

  const submitData = async () => {
    if (reason && accName && accNo && ifsc) {
      try {
        await cancelOrder(orderId);
      } catch (error) {
        Alert.alert("Error Cancelling Order", error);
      }
    }
  };
  return (
    <View className="flex justify-center items-center top-20">
      <View
        className={`w-[90vw] h-[80vw]
         bg-white rounded-md flex justify-center items-center`}
      >
        <View className="flex-col h-full flex justify-center items-center gap-2">
          <Text className="font-bold">Cancel Reason</Text>
          <TextInput
            keyboardType="default"
            className="w-[80vw] h-[20%] border border-gray-500 rounded-md px-2"
            multiline={true}
            placeholder="Reason for cancelling this order...."
            onChangeText={(e) => setreason(e)}
          />

          <Text className="font-bold">Account Details</Text>

          <TextInput
            keyboardType="default"
            className="w-[80vw] h-[10%] border border-gray-500 rounded-md px-2"
            multiline={true}
            placeholder="Account Holder Name"
            onChangeText={(e) => setAccName(e)}
          />

          <TextInput
            keyboardType="numeric"
            className="w-[80vw] h-[10%] border border-gray-500 rounded-md px-2"
            placeholder="Account Number"
            onChangeText={(e) => setAccNo(e)}
          />

          <TextInput
            keyboardType="default"
            className="w-[80vw] h-[10%] border border-gray-500 rounded-md px-2"
            placeholder="Bank IFSC"
            onChangeText={(e) => setIfsc(e)}
          />

          <TouchableOpacity
            className="w-20 h-8 bg-green-500 m-2 rounded-md flex justify-center items-center"
            onPress={submitData}
          >
            <Text className="text-white text-[3.5vw] font-semibold">
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RefundInput;

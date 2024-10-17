import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
  Linking,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  addSale,
  createToken,
  getAllCategories,
  getMiscellaneousData,
  modifyMiscellaneousDelivery,
} from "@/lib/appwrite";
import { ArrowUp } from "@/components/Svgs";
import { useFocusEffect } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";

const settings = () => {
  const { user } = useGlobalContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [statesData, setStatesData] = useState([]);
  const [salePercent, setSalePercent] = useState();
  const [currentSalePercent, setCurrentSalePercent] = useState();
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch (error) {
      alert(error);
    }
  };

  const fetchMiscData = async () => {
    try {
      const res = await getMiscellaneousData();
      if (res.status) {
        let parsedData = res.data.states.map((item) => JSON.parse(item));
        console.log(res.data, "res");
        console.log(parsedData, "parseddata");
        //let data = [res.data[0].states];
        setCurrentSalePercent(res.data.sale.toString());
        setStatesData(parsedData);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const addNewSale = async () => {
    setLoading(true);
    try {
      console.log(salePercent);

      const res = await addSale(parseInt(salePercent, 10));
      if (res) {
        console.log("done");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
      fetchMiscData();
    }
  };

  const addBannerImages = async () => {
    const res = await createToken(currentUser.name);
    if (res) {
      const token = res.$id;
      const url = `https://ecomproducts.vercel.app/?token=${token}&banner=yes`;
      Linking.openURL(url);
    }
  };

  const changeDelivCharge = async (index, data) => {
    statesData[index].charge = data.toString();
    console.log(statesData[index]);
  };

  const changeDelivDays = async (index, data) => {
    statesData[index].days = data.toString();
    console.log(statesData[index]);
  };

  const updateDeliveryData = async () => {
    try {
      await modifyMiscellaneousDelivery(statesData);
    } catch (error) {
      alert(error);
    }
  };

  const submitData = async () => {
    await updateDeliveryData();
    await fetchMiscData();
  };

  useEffect(() => {
    //fetchCategories();
    fetchMiscData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        setCurrentUser(user);
      }
    }, [user])
  );

  if (!loading) {
    return (
      <ScrollView>
        <View className="flex-col justify-between items-center my-4 mx-4 h-full">
          <View className="my-2 flex justify-between items-center w-full">
            <TouchableOpacity
              className={`${
                width > 700 ? "h-10" : "h-[8vw]"
              }  w-[58%] bg-orange-400 rounded-lg flex flex-row justify-center items-center`}
              onPress={addBannerImages}
            >
              <Text className="text-white">Change Banner Images</Text>
              <ArrowUp height={"18"} width={"18"} color={"#ffffff"} />
            </TouchableOpacity>
          </View>
          <View className="mx-4 my-2  h-[8vw] w-full flex-row justify-between items-center">
            <Text>Add Sale % (All Items)</Text>
            <TextInput
              className="border border-gray-400 w-1/4 rounded-md px-2"
              keyboardType="numeric"
              placeholder={currentSalePercent + "%"}
              onChangeText={(e) => setSalePercent(e)}
            />
          </View>
          <View className="my-2 flex justify-between items-center w-full">
            <TouchableOpacity
              className={`${
                width > 700 ? "h-10" : "h-[8vw]"
              } w-[38%] bg-green-500 rounded-lg flex flex-row justify-center items-center`}
              onPress={addNewSale}
            >
              <Text className="text-white">Update Sale</Text>
            </TouchableOpacity>
          </View>
          <View className="mx-4 my-3 h-auto w-full flex-col items-center">
            <View className="mb-2">
              <Text>Charges/ Region</Text>
            </View>
            <View className=" flex-row w-full px-4">
              <View className="flex-col items-center justify-center w-full">
                <View className="flex-row flex justify-between items-center w-full pb-1">
                  <Text className="w-[60%] text-[3.4vw] font-semibold">
                    Region
                  </Text>
                  <Text
                    className={`${
                      width > 700 ? "text-base" : "text-[2.8vw]"
                    } w-[20%]  font-semibold`}
                  >
                    Extra Delivery Charge
                  </Text>
                  <Text
                    className={`${
                      width > 700 ? "text-base" : "text-[2.8vw]"
                    } w-[20%]  font-semibold`}
                  >
                    Extra Delivery Days
                  </Text>
                </View>
                {statesData &&
                  statesData.map((item, index) => (
                    <View
                      className="flex-row flex justify-between items-center w-full py-1 border-b border-gray-400"
                      key={index}
                    >
                      <Text className="w-[50%] text-[3.4vw]">{item.name}</Text>
                      <TextInput
                        className={`${
                          width > 700 ? "text-base" : "text-[3vw]"
                        } w-14 h-5 border border-gray-500 flex justify-center items-center rounded-sm  placeholder:px-2`}
                        placeholder={"₹ " + item.charge}
                        keyboardType="numeric"
                        onChangeText={(e) => changeDelivCharge(index, e)}
                      />
                      <TextInput
                        className={`${
                          width > 700 ? "text-base" : "text-[3vw]"
                        } w-14 h-5 border border-gray-500 flex justify-center items-center rounded-sm placeholder:px-1 `}
                        placeholder={item.days + " days"}
                        keyboardType="numeric"
                        onChangeText={(e) => changeDelivDays(index, e)}
                      />
                    </View>
                  ))}
              </View>
            </View>
          </View>
          <View className="w-[40%] h-[20%] mt-4">
            <Pressable
              className={`border-2 border-white bg-green-600 flex justify-center items-center rounded-lg`}
              onPress={submitData}
            >
              <Text className="text-white py-2 text-[4vw]">Update</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  } else {
    return (
      <View className="flex justify-center items-center h-screen">
        <Text>Loading....</Text>
      </View>
    );
  }
};

export default settings;

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { addAddress, getMiscellaneousData } from "@/lib/appwrite";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const addressForm = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState();
  const [userData, setUserData] = useState(null);
  const [houseNo, setHouseNo] = useState("");
  const [area, setArea] = useState("");
  const [pin, setPin] = useState();
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [statePop, setStatePop] = useState(false);
  const [currStateValue, setCurrStateValue] = useState("");
  const [fetchedStates, setFetchedStates] = useState(null);
  const [selectedStates, setSelectedStates] = useState(null);
  const { user, setUser } = useGlobalContext();

  let navigation = useNavigation();

  const saveAddress = async () => {
    let form = {};
    if (name !== "") {
      form.name = name;
    } else {
      alert("Enter Name");
      return;
    }
    if (phone !== undefined && phone.length === 10) {
      form.phone = phone.toString();
    } else {
      alert("Enter valid mobile number ");
      return;
    }
    if (houseNo !== "") {
      form.houseNo = houseNo;
    } else {
      alert("Enter House Number");
      return;
    }
    if (area !== "") {
      form.area = area;
    } else {
      alert("Enter Area or Colony name");
      return;
    }
    if (pin !== undefined && pin.length === 6) {
      form.pin = pin.toString();
    } else {
      alert("Enter valid Pin");
      return;
    }
    if (city !== "") {
      form.city = city;
    } else {
      alert("Enter City name");
      return;
    }
    if (state !== "") {
      form.state = state;
    } else {
      alert("Select State");
      return;
    }
    console.log(user, "form");

    let updAddress = [...userData.address, form];

    try {
      await addAddress(userData.$id, updAddress);
      setUser({ ...userData, address: updAddress });
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error Updating Address", error);
    }
  };

  const fetchMisc = async () => {
    const res = await getMiscellaneousData();
    if (res.status) {
      let data = res.data.states;
      let parsedData = data.map((item) => JSON.parse(item));
      setFetchedStates(parsedData);
    } else {
      Alert.alert(res.error);
    }
  };

  const sortByTyping = (e) => {
    if (e !== "") {
      let data = fetchedStates.filter((item) =>
        item.name.toLowerCase().includes(e.toLowerCase())
      );
      setCurrStateValue(e);
      setStatePop(true);
      setSelectedStates(data);
    } else {
      setCurrStateValue("");
      setStatePop(false);
      setSelectedStates(null);
    }
  };

  const chooseState = (name) => {
    if (name !== "") {
      console.log(name);
      setState(name);
      setCurrStateValue(name);
      setStatePop(false);
      setSelectedStates(null);
    }
  };

  useEffect(() => {
    if (!userData && user) {
      console.log(user);
      setUserData(user);
      fetchMisc();
    }
  }, [user]);

  return (
    <View className="px-3">
      <View className="flex-col gap-4 pt-10 relative">
        <TextInput
          placeholder="Full Name"
          className="w-fit h-12 px-4 text-base border border-gray-400 rounded-md "
          onChangeText={(e) => setName(e)}
        />
        <TextInput
          placeholder="Phone Number"
          keyboardType="numeric"
          className={`w-fit h-12 px-4 text-base  ${
            phone !== undefined && phone.length >= 1 && phone.length <= 9
              ? "border-2 border-red-500"
              : "border border-gray-400"
          } rounded-md`}
          onChangeText={(e) => setPhone(e)}
        />

        <TextInput
          placeholder="House No., Society Name, House Owner"
          className="w-fit h-12 px-4 text-base border border-gray-400 rounded-md "
          onChangeText={(e) => setHouseNo(e)}
        />
        <TextInput
          placeholder="Area, Colony, Road name"
          className="w-fit h-12 px-4 text-base border border-gray-400 rounded-md "
          onChangeText={(e) => setArea(e)}
        />
        <TextInput
          placeholder="Pin Code"
          keyboardType="numeric"
          className={`w-[45%] h-12 px-4 text-base  ${
            pin !== undefined && pin.length >= 1 && pin.length <= 5
              ? "border-2 border-red-500"
              : "border border-gray-400"
          } rounded-md`}
          onChangeText={(e) => setPin(e)}
        />
        <View className="flex-row w-full">
          <TextInput
            placeholder="City"
            className="w-[45%] h-12 text-base px-4 border border-gray-400 rounded-md "
            onChangeText={(e) => setCity(e)}
          />
          <View className="flex-col w-full">
            {statePop && (
              <View className="absolute bottom-12 flex-col w-1/2 border border-gray-500 bg-white flex justify-center items-center rounded-lg z-50">
                <Text className="text-[3vw] py-1">
                  *Select from suggestions only
                </Text>
                {selectedStates &&
                  selectedStates.slice(0, 9).map((item, index) => (
                    <Pressable
                      className="w-full h-8 border-t border-gray-500 flex justify-center items-center"
                      key={index}
                      onPress={() => chooseState(item.name)}
                    >
                      <Text>{item.name}</Text>
                    </Pressable>
                  ))}
              </View>
            )}
            <TextInput
              placeholder="State"
              className="w-[45%] h-12 text-base px-4 border border-gray-400 rounded-md ml-4"
              onChangeText={(e) => sortByTyping(e)}
              value={currStateValue}
            />
          </View>
        </View>
        <TouchableOpacity
          className="w-fit h-14 bg-red-400  px-4 flex justify-center items-center"
          onPress={saveAddress}
        >
          <Text className="text-white text-base font-semibold">
            Save Address
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default addressForm;

import { View, Text, FlatList, Alert, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { getAllUsers, searchAllUsers } from "@/lib/appwrite";
import debounce from "lodash.debounce";

const viewUsers = () => {
  const [users, setUsers] = useState(null);
  const [total, setTotal] = useState(null);

  const fetchInitialData = async () => {
    try {
      const res = await getAllUsers();
      if (res.status) {
        setUsers(res.data);
        setTotal(res.totalPages);
      }
    } catch (error) {
      alert(error);
    }
  };

  const filterBySearch = debounce(async (e) => {
    if (e !== "") {
      console.log(e, "e");
      const res = await searchAllUsers(e);
      console.log(res);

      if (res.status) {
        setUsers(res.data);
      } else {
        Alert.alert("Error", error);
      }
    } else {
      fetchInitialData();
    }
  }, 300);

  useEffect(() => {
    if (!users) {
      fetchInitialData();
    }
  }, []);
  return (
    <View className="h-full flex justify-center items-center pt-4">
      <View className="w-full px-4 h-10 mt-4">
        <TextInput
          className="h-full w-full border border-gray-500 text-base px-4 rounded-md"
          placeholder="Search Users..."
          onChangeText={(e) => filterBySearch(e)}
        />
      </View>
      <Text className="py-2">Total users - {total}</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View className="flex-row gap-4">
            <Text>{item.name}</Text>
            <Text>{item.number}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default viewUsers;

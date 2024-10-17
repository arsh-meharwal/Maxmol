import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  KeyboardAvoidingViewComponent,
} from "react-native";
import React, { useEffect, useState } from "react";
import HorizontalCard from "@/components/HorizontalCard";
import {
  createToken,
  getAllCategories,
  getAllProductOfSingleCategory,
  getAllProducts,
  getAllProductWithoutCategory,
  getLowStockProducts,
  getOutStockProducts,
  removeCategory,
  removeProduct,
  searchAllProducts,
  updateProductVisibility,
} from "@/lib/appwrite";
import Navbar from "@/components/Navbar";
import {
  CloseEye,
  DeleteButton,
  OpenEye,
  Pencil,
  Plus,
} from "@/components/Svgs";
import { useGlobalContext } from "@/context/GlobalProvider";
import { setStatusBarHidden } from "expo-status-bar";
import debounce from "lodash.debounce";
import { Picker, PickerIOS } from "@react-native-picker/picker";

const viewProducts = () => {
  const [data, setData] = useState(null); // this is the flatList data in Products categ.
  const [categoryData, setCategoryData] = useState(null);
  const [productData, setProductData] = useState(null); // all product Data
  const [showProducts, setShowProducts] = useState(true); // this boldens/unbolden Products & Categories Text
  const [viewAllProducts, setViewAllProducts] = useState(true); // this boldens All prod. Button
  const [lowStockData, setLowStockData] = useState(null);
  const [showLowProducts, setShowLowProducts] = useState(false); // this boldens Low Stock Button
  const [outStockData, setOutStockData] = useState(null);
  const [showOutProducts, setShowOutProducts] = useState(false); // this boldens Out Stock Button
  const [loading, setLoading] = useState(true);
  const [allLoaded, setAllLoaded] = useState(false);
  const { user } = useGlobalContext();
  const [currentUser, setCurrentUser] = useState(null);
  const limit = 10; // fetching more works perfectly well and tested
  const [offset, setOffset] = useState(0);
  const [totalProducts, setTotalProducts] = useState(null); // this is count of total prods.
  const [totalLowProducts, setTotalLowProducts] = useState(null); // this is count of low stock prods.
  const [totalOutProducts, setTotalOutProducts] = useState(null); // this is count of out stock prods.
  const [sortSelect, setSortSelect] = useState("All");
  const [popConfirmAction, setPopConfirmAction] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { width } = Dimensions.get("window");

  const editProduct = async (productId, action) => {
    if (action === "Edit") {
      try {
        const res = await createToken(currentUser.name);
        if (res !== false) {
          const token = res.$id;
          const url = `https://ecomproducts.vercel.app/?product=${productId}&token=${token}`;
          Linking.openURL(url);
        }
      } catch (error) {
        alert(error);
      }
    }
    if (pendingAction) {
      setLoading(true);
      if (pendingAction.action === "Show") {
        try {
          console.log("Show");
          await updateProductVisibility(pendingAction.productId, true);
          fetchProductsData();
        } catch (error) {
          Alert.alert("Error Updating Visiblity", error);
        }
      } else if (pendingAction.action === "Hide") {
        try {
          console.log("Hide");
          await updateProductVisibility(pendingAction.productId, false);
          fetchProductsData();
        } catch (error) {
          Alert.alert("Error Updating Visiblity", error);
        }
      } else if (pendingAction.action === "Delete") {
        try {
          await removeProduct(pendingAction.productId);
          fetchProductsData();
        } catch (error) {
          Alert.alert("Error Deleting", error);
        }
      }
      setPopConfirmAction(false);
      setPendingAction(null);
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    setLoading(true);
    try {
      await removeCategory(pendingAction.categoryId);
    } catch (error) {
      Alert.alert("Error Deleting Category", error);
    } finally {
      setCategoryData(null);
      setPopConfirmAction(false);
      setPendingAction(null);
      fetchCategoriesData();
    }
  };

  const editCategory = async (categoryId) => {
    try {
      const res = await createToken(currentUser.name);
      if (res !== false) {
        const token = res.$id;
        const url = `https://ecomproducts.vercel.app/?category=${categoryId}&token=${token}`;
        Linking.openURL(url);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleAddCategory = async () => {
    try {
      const res = await createToken(currentUser.name);
      if (res !== false) {
        const token = res.$id;
        const url = `https://ecomproducts.vercel.app/?token=${token}&category=yes`;
        Linking.openURL(url);
      }
    } catch (error) {
      alert(error);
    }
  };

  const fetchProductsData = async () => {
    setLoading(true);
    try {
      if (sortSelect === "All") {
        const res = await getAllProducts(limit, 0);
        if (res.status) {
          setProductData(res.data);
          setData(res.data);
          setOffset(limit);
          setTotalProducts(res.totalPages);
        }
      } else if (sortSelect === "null") {
        const res = await getAllProductWithoutCategory();
        setData(res.data);
        setTotalProducts(res.totalPages);
      } else {
        const res = await getAllProductOfSingleCategory(limit, 0, sortSelect);
        if (res.status) {
          setData(res.data);
          setOffset(limit);
          setTotalProducts(res.totalPages);
        }
      }

      if (!categoryData) {
        const res2 = await getAllCategories();
        setCategoryData(res2.data);
      }
    } catch (error) {
      alert(error);
    } finally {
      setShowProducts(true); // this boldens Products text
      setViewAllProducts(true); // this boldens All product button
      setLoading(false);
      setShowOutProducts(false); // this unboldens Out Stock Button
      setShowLowProducts(false); // this unboldens Low Stock Button
      fetchLowStockProducts();
      fetchOutStockProducts();
    }
  };

  const fetchCategoriesData = async () => {
    if (categoryData === null) {
      const res = await getAllCategories();
      if (res.status) {
        console.log("fetched Categ");
        setCategoryData(res.data);
      } else {
        alert(res.error);
      }
    }
    setShowProducts(!showProducts);
    setLoading(false);
  };

  const loadMoreProductsData = async () => {
    if (!loading) {
      console.log(currOffset);
      let currOffset = offset;
      let currLimit = limit;
      // we are not doing infinite scrolling here like at home page
      if (currOffset >= totalProducts) {
        setAllLoaded(true);
        return;
      } else {
        setOffset((prev) => prev + currLimit);
        try {
          console.log("Fetched more Single Cat Prod data");
          const res = await getAllProducts(limit, offset);
          if (res.status === true) {
            let updatedProd = [...productData, ...res.data];
            setProductData(updatedProd);
            setData(updatedProd);
          }
        } catch (error) {
          alert(error);
        }
      }
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const res = await getLowStockProducts();
      if (res.status) {
        setLowStockData(res.data);
        setTotalLowProducts(res.totalPages);
        return res.data;
      }
    } catch (error) {
      alert(error);
    }
  };

  const fetchOutStockProducts = async () => {
    const res = await getOutStockProducts();
    if (res.status) {
      setOutStockData(res.data);
      setTotalOutProducts(res.totalPages);
      return res.data;
    }
  };

  const showAllProducts = async () => {
    if (!productData) {
      fetchProductsData();
    } else {
      setData(productData);
      setViewAllProducts(true);
      setShowOutProducts(false); // this unboldens Out Stock Button
      setShowLowProducts(false); // this boldens Low Stock Button
    }
  };

  const showAllLowStockProducts = async () => {
    if (!lowStockData) {
      const res = await fetchLowStockProducts();
      setData(res); // this sets the current showing data to Low Stock
      setShowOutProducts(false); // this unboldens Out Stock Button
      setViewAllProducts(false); // this unboldens All Prod. Button
      setShowLowProducts(true); // this boldens Low Stock Button
    } else {
      setData(lowStockData);
      setShowOutProducts(false); // this unboldens Out Stock Button
      setViewAllProducts(false); // this unboldens All Prod. Button
      setShowLowProducts(true); // this boldens Low Stock Button
    }
  };

  const showAllOutStockProducts = async () => {
    if (!outStockData) {
      const res = await fetchOutStockProducts();
      setData(res); // this sets the current showing data to Out Stock
      setShowLowProducts(false); // this unboldens Low Stock Button
      setViewAllProducts(false); // this unboldens All Prod Button
      setShowOutProducts(true); // this boldens Out Stock Button
    } else {
      setData(outStockData);
      setShowLowProducts(false); // this unboldens Low Stock Button
      setViewAllProducts(false); // this unboldens All Prod Button
      setShowOutProducts(true); // this boldens Out Stock Button
    }
  };

  const filterBySearch = debounce(async (e) => {
    if (showProducts) {
      if (e === "") {
        setSortSelect("All");
      } else {
        const res = await searchAllProducts(e);
        if (res.status) {
          setData(res.data);
          setViewAllProducts(true); // this boldens All Prod Button
          setShowOutProducts(false); // this unboldens Out Stock Button
          setShowLowProducts(false); // this unboldens Low Stock Button
        }
      }
    }
  }, 300);

  const refreshViewProduct = async () => {
    try {
      setLoading(true);
      setData(null);
      const res = await getAllProducts(limit, 0);
      if (res.status) {
        setData(res.data);
        setProductData(res.data);
        setViewAllProducts(true); // this boldens All Prod Button
        setShowOutProducts(false); // this unboldens Out Stock Button
        setShowLowProducts(false); // this unboldens Low Stock Button
      }
      setLoading(false);
      fetchLowStockProducts();
      fetchOutStockProducts();
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, [sortSelect]);

  useEffect(() => {
    if (user !== undefined && user !== null) {
      setCurrentUser(user);
    }
  }, [user]);

  if (loading)
    return (
      <View className="flex justify-center  items-center h-screen gap-4">
        <ActivityIndicator size={"large"} color={"green"} />
        <Text>Loading...Kindly Do Not close app</Text>
      </View>
    );
  return (
    <View className="pb-4 mt-8">
      {/* Search Bar */}
      <View className="w-full px-4 h-10 mt-4">
        <TextInput
          className="h-full w-full border border-gray-500 text-base px-4 rounded-md"
          placeholder="Search Products..."
          onChangeText={(e) => filterBySearch(e)}
        />
      </View>
      {/* Products | Categories */}
      <View className="flex-row pt-4 px-14 justify-between ">
        <TouchableOpacity onPress={fetchProductsData}>
          <Text
            className={`${
              width > 700
                ? showProducts
                  ? "text-2xl font-bold"
                  : "text-2xl font-normal"
                : showProducts
                ? "text-base font-bold"
                : "text-base font-normal"
            }`}
          >
            Products
          </Text>
        </TouchableOpacity>
        <Text className="text-base font-medium">|</Text>
        <TouchableOpacity onPress={fetchCategoriesData}>
          <Text
            className={`${
              width > 700
                ? !showProducts
                  ? "text-2xl font-bold"
                  : "text-2xl font-normal"
                : !showProducts
                ? "text-base font-bold"
                : "text-base font-normal"
            }`}
          >
            Categories
          </Text>
        </TouchableOpacity>
      </View>
      <View
        className={`pb-64 h-full ${popConfirmAction ? "opacity-30" : ""}`}
        pointerEvents={popConfirmAction ? "none" : "auto"}
      >
        {showProducts && (
          <View className="flex-col">
            {/* All, Low Stock & Out of Stock Buttons */}
            <View className="flex-row justify-center items-center gap-1 px-2 pt-2">
              <Pressable
                className={`w-[30%] h-10 border ${
                  viewAllProducts ? " bg-green-600" : ""
                } border-gray-400 flex justify-center items-center rounded-xl`}
                onPress={showAllProducts}
              >
                <Text
                  className={`${
                    viewAllProducts ? "text-white font-semibold" : "text-black"
                  } text-[3.2vw] `}
                >
                  Items - {totalProducts}
                </Text>
              </Pressable>
              <Pressable
                className={`w-[30%] h-10 ${
                  showLowProducts ? "border-2 bg-green-600" : "border"
                } border-gray-400 flex justify-center items-center rounded-xl`}
                onPress={showAllLowStockProducts}
              >
                <Text
                  className={`${
                    showLowProducts ? "text-white font-semibold" : "text-black"
                  } text-[3.2vw] `}
                >
                  Low Stock - {totalLowProducts}
                </Text>
              </Pressable>
              <Pressable
                className={`w-[30%] h-10 ${
                  showOutProducts ? "border bg-green-600" : "border"
                } border-gray-400 flex justify-center items-center rounded-xl`}
                onPress={showAllOutStockProducts}
              >
                <Text
                  className={`${
                    showOutProducts ? "text-white font-semibold" : "text-black"
                  } text-[3.2vw] `}
                >
                  Out of Stock - {totalOutProducts}
                </Text>
              </Pressable>
            </View>
            {/* Sort Select */}
            <View className="flex flex-col items-end mt-2 w-full px-6">
              <View className="border border-gray-300 rounded-md w-[40%] h-[7vw] justify-center">
                <Picker
                  selectedValue={sortSelect}
                  onValueChange={(itemValue) => setSortSelect(itemValue)}
                  style={{ textAlign: "text-center" }}
                >
                  <Picker.Item
                    label="All"
                    value="All"
                    style={{ fontSize: 14 }}
                  />
                  {categoryData &&
                    categoryData.map((item, index) => (
                      <Picker.Item
                        label={item.name}
                        value={item.$id}
                        key={index}
                        style={{ fontSize: 14 }}
                      />
                    ))}
                  <Picker.Item
                    label="No Category"
                    value="null"
                    style={{ fontSize: 14 }}
                  />
                </Picker>
              </View>
            </View>
            {/* Products */}
            {/* <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            > */}
            <FlatList
              data={data}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 300 }}
              onEndReached={
                viewAllProducts && sortSelect !== "null"
                  ? loadMoreProductsData
                  : null
              }
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                viewAllProducts && sortSelect !== "null" ? (
                  allLoaded ? (
                    <></>
                  ) : (
                    <ActivityIndicator />
                  )
                ) : null
              }
              keyExtractor={() => Math.random()}
              renderItem={({ item }) => (
                <View className="relative">
                  <View className="flex-1">
                    <KeyboardAvoidingView>
                      <HorizontalCard
                        id={item.$id}
                        image={item.images[0]}
                        title={item.title}
                        price={item.price + (item.gst * item.price) / 100}
                        discount={item.discount}
                        showButton={false}
                        showStock={true}
                        stockValue={item.stock}
                        refreshParent={refreshViewProduct}
                        visibility={item.visible}
                      />
                    </KeyboardAvoidingView>
                  </View>
                  <View className="absolute top-4 left-4 h-8 w-8 rounded-full border border-gray-600 flex justify-center items-center bg-white">
                    {item.visible ? (
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center"
                        onPress={() => {
                          setPendingAction({
                            productId: item.$id,
                            action: "Hide",
                          });
                          setPopConfirmAction(true);
                        }}
                      >
                        <CloseEye
                          height={"20"}
                          width={"20"}
                          color={"#000000"}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center"
                        onPress={() => {
                          setPendingAction({
                            productId: item.$id,
                            action: "Show",
                          });
                          setPopConfirmAction(true);
                        }}
                      >
                        <OpenEye height={"20"} width={"20"} color={"#000000"} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="absolute bottom-4 right-4 flex-col justify-center items-center gap-3 overflow-hidden">
                    <View className="h-8 w-8 rounded-full border border-gray-600 flex justify-center items-center">
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center"
                        onPress={() => editProduct(item.$id, "Edit")}
                      >
                        <Pencil height={"18"} width={"18"} color={"#000000"} />
                      </TouchableOpacity>
                    </View>
                    <View className="h-8 w-8 rounded-full flex justify-center items-center bg-red-500">
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center "
                        onPress={() => {
                          setPendingAction({
                            productId: item.$id,
                            action: "Delete",
                          });
                          setPopConfirmAction(true);
                        }}
                      >
                        <DeleteButton
                          height={"18"}
                          width={"18"}
                          color={"#ffffff"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
            {/* </KeyboardAvoidingView> */}
          </View>
        )}
        {/* Categories */}
        {!showProducts && (
          <>
            <View className="flex justify-center items-center py-2">
              <TouchableOpacity
                className="h-10 w-44 border-4 border-green-500 rounded-lg flex-row justify-center items-center"
                onPress={handleAddCategory}
              >
                <Plus height={"22"} width={"20"} color={"#000000"} />
                <Text
                  className={`${
                    width > 700 ? "text-xl" : "text-[3vw]"
                  }  font-semibold pr-2`}
                >
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
            {categoryData &&
              categoryData.map((item, index) => (
                <View className="relative" key={index}>
                  <HorizontalCard
                    keyd={index}
                    id={item.$id}
                    image={item.image}
                    title={item.name}
                    showButton={false}
                    visibility={true}
                  />
                  <View className="absolute bottom-6 right-4 flex-col justify-center items-center gap-3 overflow-hidden">
                    <View className="h-8 w-8 rounded-full border border-gray-600 flex justify-center items-center">
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center"
                        onPress={() => editCategory(item.$id)}
                      >
                        <Pencil height={"18"} width={"18"} color={"#000000"} />
                      </TouchableOpacity>
                    </View>
                    <View className="h-8 w-8 rounded-full flex justify-center items-center bg-red-500">
                      <TouchableOpacity
                        className=" w-8 flex justify-center items-center "
                        onPress={() => {
                          setPendingAction({
                            categoryId: item.$id,
                          });
                          setPopConfirmAction(true);
                        }}
                      >
                        <DeleteButton
                          height={"18"}
                          width={"18"}
                          color={"#ffffff"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
          </>
        )}
      </View>
      {popConfirmAction && (
        <View className="absolute inset-0 top-40 flex justify-center items-center z-10 w-full">
          <View className=" h-[20vh] border-2 border-gray-600 rounded-lg flex justify-center items-center bg-white">
            <Text>Did you confirm the action?</Text>
            <View className="flex-row mt-4">
              <TouchableOpacity
                className="w-1/4 bg-red-400 mx-2 rounded-lg "
                onPress={() => setPopConfirmAction(false)}
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-1/4 bg-green-500 mx-2 rounded-lg"
                onPress={() => {
                  showProducts ? editProduct() : deleteCategory();
                }}
              >
                <Text className="text-white text-center font-bold">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default viewProducts;

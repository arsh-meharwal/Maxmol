import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  getAllCategories,
  getAllVisibleProductOfSingleCategory,
  getAllVisibleProducts,
  getMiscellaneousData,
} from "@/lib/appwrite";
import Caard from "@/components/Caard";
import { AutoImageCarousel } from "@/components/AutoImageCarousal";
import { useGlobalContext } from "@/context/GlobalProvider";
import LoadingScreen from "@/components/LoadingScreen";
import NetInfo from "@react-native-community/netinfo";
import { Back, Forward } from "@/components/Svgs";

const home = () => {
  const [products, setProducts] = useState([]);
  const [userNum, setUserNum] = useState();
  const limit = 6;
  const [offset, setOffset] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [bannerImg, setBannerImg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const fetchCalledRef = useRef(false);
  const flatListRef = useRef(null);
  const { user, networkState } = useGlobalContext();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [categoriesScrollOffset, setCategoriesScrollOffset] = useState(0);
  const { width } = Dimensions.get("window");

  const numColumns = width > 700 ? 3 : 2;

  const onRefresh = () => {
    setLoading(true);
    setProducts(null);

    setTimeout(() => {
      fetchMiscData();
      getCategoriesData();
      selectOneCategory("ALL");
    }, 100);
  };

  const getProductData = async () => {
    try {
      const res = await getAllVisibleProducts(limit, 0);
      if (res.status) {
        fetchCalledRef.current = false;
        setProducts(res.data);
        setTotalProducts(parseInt(res.totalPages, 10));
        setOffset(limit);
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Could not fetch data", error);
    }
  };

  const fetchMiscData = async () => {
    try {
      const res = await getMiscellaneousData();
      if (res.status) {
        setBannerImg(res.data.bannerImages);
        console.log(res.data.bannerImages, "res.bannerImages");
      }
    } catch (error) {
      alert(error);
    }
  };

  const getCategoriesData = async () => {
    const res = await getAllCategories();
    if (res.status) {
      let allProd = {
        $id: "ALL",
        name: "All Products",
        image: "670d195d000be3560fa3",
        gst: 0,
        discount: 0,
      };
      let catData = [allProd, ...res.data];
      setCategories(catData);
    } else {
      alert(res.error);
    }
  };

  const loadMoreProductsData = async () => {
    if (!loading) {
      console.log(offset, "entered fetch More DATA");
      let currOffset = offset;
      // This logic is must for infinite scrolling
      if (currOffset >= totalProducts) {
        setOffset(0);
        currOffset = 0;
      }
      if (selectedCategory === "ALL") {
        try {
          console.log("fetched All Products more Data");
          const res = await getAllVisibleProducts(limit, currOffset);
          if (res.status) {
            let updatedProd = [...products, ...res.data];
            setProducts(updatedProd);
            setOffset((prev) => prev + limit);
          }
        } catch (error) {
          alert(res.error);
        }
      } else {
        try {
          console.log("fetched Selected Category more Data");
          const res = await getAllVisibleProductOfSingleCategory(
            limit,
            currOffset,
            selectedCategory
          );
          if (res.status === true) {
            let updatedProd = [...products, ...res.data];
            setProducts(updatedProd);
            setOffset((prev) => prev + limit);
          }
        } catch (error) {}
      }
    }
  };

  const selectOneCategory = async (id) => {
    if (!loading) {
      if (id !== "ALL") {
        try {
          setOffset(limit); // this is async op. seting it for future
          let currOffset = 0;
          setSelectedCategory(id);
          setLoading(true);
          const res = await getAllVisibleProductOfSingleCategory(
            limit,
            currOffset,
            id
          );
          if (res.status) {
            setProducts(res.data);
            setTotalProducts(res.totalPages);
          }
        } catch (error) {
          alert(error);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          setOffset(limit);
          let currOffset = 0;
          setSelectedCategory("ALL");
          setLoading(true);
          const res = await getAllVisibleProducts(limit, currOffset);
          if (res.status) {
            setProducts(res.data);
            setTotalProducts(res.totalPages);
            setOffset(limit);
          }
        } catch (error) {
          alert(error);
        } finally {
          setLoading(false);
        }
      }
    }
    //setProducts(products.filter((item) => item.category === name));
  };

  //TODO If user is OTP verified but has closed app during name, add a box to update name here also
  const fetchData = () => {
    if (products.length === 0) {
      console.log("fetch MiscData & ProductData");
      fetchMiscData();
      getProductData();
    }
    if (categories.length === 0) {
      console.log("get CategoriesData");
      getCategoriesData();
    }
  };

  const networkEventListner = NetInfo.addEventListener((state) => {
    if (state.isConnected && !fetchCalledRef.current) {
      fetchCalledRef.current = true;
      setTimeout(() => {
        console.log("networkEventListner api call");
        fetchData();
      }, 600);
    }
  });

  useEffect(() => {
    if (user) {
      console.log("user in Home");
      setUserNum(user.phone);
    }
  }, [user]);

  const handleCategorySelect = (item, index) => {
    setSelectedCategoryIndex(index);
    selectOneCategory(item.$id);
    console.log(index);
  };

  const handleScrollRight = () => {
    const newOffset = categoriesScrollOffset + 100;
    flatListRef.current.scrollToOffset({ offset: newOffset, animated: true });
    setCategoriesScrollOffset(newOffset); // Update the current offset state
  };

  const handleScrollLeft = () => {
    if (categoriesScrollOffset - 100 >= 0) {
      const newOffset = categoriesScrollOffset - 100;
      flatListRef.current.scrollToOffset({ offset: newOffset, animated: true });
      setCategoriesScrollOffset(newOffset); // Update the current offset state
    } else {
      const newOffset = 0;
      flatListRef.current.scrollToOffset({ offset: newOffset, animated: true });
      setCategoriesScrollOffset(newOffset);
    }
  };

  useEffect(() => {
    if (flatListRef.current && selectedCategoryIndex) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: false,
      });
    }
  }, [selectedCategoryIndex]);

  const renderCategories = ({ item, index }) => (
    <View
      className="flex justify-center items-center"
      style={{
        minWidth: width >= 700 ? 200 : 100,
        maxWidth: width >= 700 ? 250 : 120,
      }}
    >
      <TouchableOpacity
        className="flex justify-center items-center "
        onPress={() => handleCategorySelect(item, index)}
      >
        <View
          className={`${
            selectedCategory === item.$id
              ? "h-[9vw] w-[9vw]"
              : "h-[7vw] w-[7vw]"
          }  rounded-full border border-gray-400 overflow-hidden`}
        >
          <Image
            source={{
              uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${item.image}/view?project=66c59b5800224d59df96&mode=admin`,
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
        <Text
          className={`${
            selectedCategory === item.$id
              ? "text-[3vw] text-gray-700 font-semibold"
              : "text-[2.7vw] text-gray-600"
          }  `}
        >
          {item.name}
        </Text>
        {selectedCategory === item.$id && (
          <View className=" mt-1 w-1 h-1 bg-black rounded-full"></View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View className="m-0 p-0">
      <View className="w-full" style={{ height: 90 }}>
        {bannerImg && <AutoImageCarousel images={bannerImg} />}
      </View>
      <View className="flex justify-center items-center  ">
        {categories && products && (
          <View className="flex">
            <View className="relative w-full flex-row justify-center items-center mt-1">
              <View className="flex justify-center items-center">
                <TouchableOpacity onPress={handleScrollLeft}>
                  <Back height={28} width={28} color={"#000000"} />
                </TouchableOpacity>
              </View>
              <FlatList
                ref={flatListRef}
                horizontal={true}
                data={categories}
                renderItem={renderCategories}
                keyExtractor={(item) => item.$id}
                showsHorizontalScrollIndicator={false}
                getItemLayout={
                  (data, index) => ({
                    length: width >= 700 ? 180 : 100,
                    offset: width >= 700 ? 200 * index : 100 * index,
                    index,
                  }) // Adjust item width according to your layout
                }
                initialScrollIndex={selectedCategoryIndex}
              />

              <View className="flex justify-center items-center">
                <TouchableOpacity onPress={handleScrollRight}>
                  <Forward height={28} width={28} color={"#000000"} />
                </TouchableOpacity>
              </View>
            </View>
            <View className=" flex-1 justify-center items-center">
              <FlatList
                data={products}
                showsVerticalScrollIndicator={false}
                onEndReached={() => loadMoreProductsData()}
                onEndReachedThreshold={0.7}
                ListFooterComponent={
                  <ActivityIndicator size={"large"} color={"black"} />
                }
                keyExtractor={() => Math.random()}
                renderItem={({ item }) => (
                  <Caard
                    title={item.title}
                    id={item.$id}
                    price={item.price + (item.gst * item.price) / 100}
                    discount={item.discount}
                    image={item.images[0]}
                    user={userNum}
                    mrp={item.mrp}
                    stars={item.stars}
                    numCols={numColumns}
                    capacity={item.capacity}
                  />
                )}
                numColumns={numColumns}
                columnWrapperStyle={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={onRefresh}
                    colors={["#ff0000"]}
                  />
                }
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default home;

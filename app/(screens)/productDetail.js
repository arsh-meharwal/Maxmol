import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Share,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ImageCarousel } from "@/components/ImageCarousal";
import {
  Cart,
  DeleteButton,
  Down,
  Heart,
  Plus,
  Replace,
  Star,
  Truck,
} from "@/components/Svgs";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
  getSimilarProducts,
  getSingleProduct,
  modifyCart,
  modifyProductComments,
  modifyProductReviewed,
  modifyWishList,
  setProductReview,
} from "@/lib/appwrite";
import RenderHtml from "react-native-render-html";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Navbar from "@/components/Navbar";
import { StarRating } from "@/components/StarRating";
import Caard from "@/components/Caard";
import LoadingScreen from "@/components/LoadingScreen";
import NetInfo from "@react-native-community/netinfo";

const productDetail = () => {
  const { id } = useLocalSearchParams();
  const { setOrder, setUser } = useGlobalContext();
  const [data, setData] = useState(null);
  const [similarData, setSimilarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [wishListed, setWishListed] = useState(false);
  const [userWishlist, setUserWishlist] = useState(null);
  const [userAddressess, setUserAddressess] = useState([]);
  const [productIsBought, setProductIsBought] = useState(false);
  const [productIsReviewed, setProductIsReviewed] = useState(false);
  const [addressPop, setAddressPop] = useState(false);
  const [clickedAddress, setClickedAddress] = useState(0);
  const { width } = Dimensions.get("window");
  const { user, cart, networkState } = useGlobalContext();
  const [rating, setRating] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [comments, setComments] = useState("");

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      dataFetch(id);
      if (user) {
        console.log(user, "user");

        setUserData(user);
        setUserWishlist(user.wishlist);
        if (user.wishlist.length > 0) {
          let wishlisted = user.wishlist.some((item) => item === id);
          setWishListed(wishlisted);
        }
        if (user.cart.length > 0) {
          const check = checkItemInCart(user.cart, id);
          if (check) {
            setCartAdded(true);
          }
        }
        setUserAddressess(user.address);
        if (user.productsBought.includes(id)) {
          setProductIsBought(true);
        }
        if (user.productsReviewed.includes(id)) {
          setProductIsReviewed(true);
        }
      }
      getFormattedDate();
      setLoading(false);
    }, 100); // Simulate a 2 second delay for the refresh
  };

  const tagsStyles = useMemo(
    () => ({
      p: {
        margin: 0, // Remove margin around <p> tags
        padding: 0, // Remove padding if any
        marginBottom: 2,
      },
      h2: {
        margin: 0, // Remove margin around <p> tags
        padding: 0, // Remove padding if any
      },
      h3: {
        margin: 0, // Remove margin around <p> tags
        padding: 0, // Remove padding if any
      },
      h1: {
        margin: 0, // Remove margin around <p> tags
        padding: 0, // Remove padding if any
      },
      li: {
        marginBottom: 5, // Adjust margin between <li> elements
        lineHeight: 20, // Adjust the line height for list items
      },
    }),
    []
  );

  const handleScrollEnd = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Check if user has scrolled to the bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      // Load more data when near the bottom
      console.log("SCroll Below");
      if (!similarData) {
        similarDataFetch();
      }
    }
  };

  const source = useMemo(() => data && { html: data.description }, [data]);

  function extractYouTubeVideoId(url) {
    try {
      const parsedUrl = new URL(url);

      // For shortened youtu.be links
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.substring(1); // Get the path after '/'
      }

      // For regular YouTube URLs like https://www.youtube.com/watch?v=VIDEO_ID
      if (parsedUrl.hostname.includes("youtube.com")) {
        const params = new URLSearchParams(parsedUrl.search);
        return params.get("v"); // Get the 'v' query parameter
      }

      return null; // Return null if no valid video ID found
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  function getFormattedDate() {
    // Get today's date
    let today = new Date();
    // Add 10 days
    today.setDate(today.getDate() + 10);

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

  const selectAddress = async () => {
    setAddressPop(!addressPop);
  };

  const createOrder = () => {
    if (userData.number) {
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
      const price = formatNumberInIndianStyle(
        data.price -
          (data.discount * data.price) / 100 +
          (data.gst * data.price) / 100
      );
      const date = new Date();
      const order = {};
      order.deliverTo = userAddressess[clickedAddress];
      order.date = date;
      order.user = `${userData.name} - ${userData.number}`;
      order.products = [
        {
          productId: id,
          productName: data.title,
          productPrice: price,
          productShipping: data.shippingCharge,
          quantity: "1",
        },
      ];
      setOrder(order);

      router.push("/paymentSelect");
    }
  };

  const similarDataFetch = async () => {
    console.log("similar data fetch");
    const res = await getSimilarProducts(data.title, data.category);
    if (res.status) {
      setSimilarData(res.data);
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const dataFetch = async (id) => {
    try {
      const res = await getSingleProduct(id);
      if (res.status) {
        setData(res.data);
        if (res.data.video) {
          const vidId = extractYouTubeVideoId(res.data.video);
          setVideoId(vidId);
        }
        setLoading(false);
      } else if (!res.status) {
        router.replace("/home");
      }
    } catch (error) {
      Alert.alert("Error : 401", "Can't fetch data");
    }
  };

  const checkItemInCart = (cart, product) => {
    return cart.some((item) => item.productId === product);
  };

  const addCart = async () => {
    try {
      if (userData) {
        let newItem = { productId: id.toString(), quantity: "1" };
        let newCart = [...userData.cart, newItem];
        const res2 = await modifyCart(userData.$id, newCart);
        if (res2) {
          setCartAdded(true);
          setUser((prev) => ({ ...prev, cart: newCart }));
          router.push("/cart");
        }
      }
    } catch (error) {
      alert(error);
    }
  };

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

  const addtoWL = async () => {
    if (!wishListed) {
      let updatedWL = [...userWishlist, id];
      try {
        const res = await modifyWishList(userData.$id, updatedWL);
        setWishListed(true);
        setUser({ ...userData, wishlist: updatedWL });
      } catch (error) {
        alert(error);
      }
    } else {
      let updatedWL = userWishlist.filter((item) => item !== id);
      try {
        const res = await modifyWishList(userData.$id, updatedWL);
        setWishListed(false);
        setUser({ ...userData, wishlist: updatedWL });
      } catch (error) {
        alert(error);
      }
    }
  };

  const starPress = (num) => {
    console.log(num);
    setRating(num);
  };

  const handleDeleteComment = async (ind) => {
    let commentArray = data.comments.filter((_, index) => index !== ind);
    console.log(commentArray);
    try {
      const res = await modifyProductComments(id, commentArray);
      if (res) {
        Alert.alert("Deleted", "Comment removed Successfully !");
        setLoading(true);
        dataFetch(id);
      }
    } catch (error) {
      Alert.alert("Error Deleting Comments", error);
    }
  };

  const handleSubmitReview = async () => {
    if (rating) {
      setLoading(true);
      let totalRatings = data.totalRatings ? data.totalRatings : 1; // Use total ratings from data, or 1 as a fallback
      let avgStar =
        (rating + (data.stars ? data.stars : 5) * totalRatings) /
        (totalRatings + 1);
      let updatedProdReviewArr = [...userData.productsReviewed, id];
      if (comments) {
        let commentArray = [...data.comments, `${comments} - ${userData.name}`];
        console.log(data.comments);
        try {
          await setProductReview(
            id,
            userData.$id,
            avgStar,
            totalRatings + 1,
            commentArray,
            updatedProdReviewArr
          );
          setUser((prev) => ({
            ...prev,
            productsReviewed: updatedProdReviewArr,
          }));
          setProductIsReviewed(true);
        } catch (error) {
          alert(error);
        }
      } else {
        try {
          console.log(data.comments);
          await setProductReview(
            id,
            userData.$id,
            avgStar,
            totalRatings + 1,
            data.comments,
            updatedProdReviewArr
          );
          setUser((prev) => ({
            ...prev,
            productsReviewed: updatedProdReviewArr,
          }));
          setProductIsBought(true);
        } catch (error) {
          alert(error);
        }
      }
      setRating(null);
      setComments(null);
      setLoading(false);
    }
  };

  let xl3 = width > 700 ? "text-4xl" : "text-[6vw]";
  let xl2 = width > 700 ? "text-2xl" : "text-[5vw]";
  let xl = width > 700 ? "text-xl" : "text-[4.2vw]";
  let lg = width > 700 ? "text-lg" : "text-[3.5vw]";

  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log(user, "user");

        setUserData(user);
        setUserWishlist(user.wishlist);
        if (user.wishlist.length > 0) {
          let wishlisted = user.wishlist.some((item) => item === id);
          setWishListed(wishlisted);
        }
        if (user.cart.length > 0) {
          const check = checkItemInCart(user.cart, id);
          if (check) {
            setCartAdded(true);
          }
        }
        setUserAddressess(user.address);
        if (user.productsBought.includes(id)) {
          setProductIsBought(true);
        }
        if (user.productsReviewed.includes(id)) {
          setProductIsReviewed(true);
        }
      }
      getFormattedDate();
    }, [user, cart])
  );

  useEffect(() => {
    dataFetch(id);
  }, [id, networkState]);

  if (loading || !data) {
    return <LoadingScreen />;
  } else {
    return (
      <>
        {data && (
          <>
            <View className="z-50">
              <Navbar showBack={true} />
            </View>
            <ScrollView
              className="h-full"
              onScroll={handleScrollEnd}
              scrollEventThrottle={10}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={onRefresh}
                  colors={["#ff0000"]}
                />
              }
            >
              <Pressable
                disabled={!addressPop}
                onPress={() => setAddressPop(false)}
                className=""
              >
                <View
                  className={` ${
                    addressPop ? "opacity-40 blur-xl bg-black/30" : ""
                  } `}
                  pointerEvents={`${addressPop ? "none" : "auto"}`}
                >
                  <View className="flex-row justify-end items-center px-4">
                    <Text className={`${xl} font-normal`}>
                      {" "}
                      {data.stars ? data.stars.toFixed(1) : "5"}{" "}
                    </Text>
                    <StarRating rating={data.stars ? data.stars : 5} />
                    <Text className={`${lg} font-normal`}>
                      ({data.totalRatings > 0 ? data.totalRatings : "1"})
                    </Text>
                  </View>
                  <Text className={`${xl2} font-semibold px-4`}>
                    {data.title}
                  </Text>
                  {data.capacity && (
                    <Text className={`${xl}  font-normal px-4 pb-2`}>
                      Capacity: {data.capacity}
                    </Text>
                  )}
                  {/* Images and WishList Button */}
                  <View className="flex-col relative overflow-hidden">
                    <TouchableOpacity
                      className="absolute bottom-16 right-6 z-10"
                      onPress={addtoWL}
                    >
                      <View className="h-9 w-9 bg-white rounded-full justify-center items-center pt-1">
                        {wishListed ? (
                          <Heart
                            fill={"#ff5238"}
                            outline={"#ff5238"}
                            stroke={"1.75"}
                          />
                        ) : (
                          <Heart
                            fill={"none"}
                            outline={"#000000"}
                            stroke={"1.75"}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    <ImageCarousel images={data.images} link={videoId} />
                    {data.discount > 0 && (
                      <View className="absolute bottom-8 -left-3 bg-green-500 rounded-xl pl-4">
                        {/* The tilted view with green background */}
                        <View className="flex-row justify-center items-center px-4 py-1 ">
                          <Text className={`${xl} text-white font-semibold`}>
                            Sale{"  "}
                          </Text>
                          <Text className={`${xl} text-white  font-semibold`}>
                            {data.discount}%
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View className="mb-4">
                    {/* Price Section */}
                    <View className=" flex-col gap-2 px-4 py-2 ">
                      <View className="flex-row items-end">
                        <Text className={`${xl2} font-semibold py-1`}>
                          MRP :{" "}
                          <Text className={`${xl3}  font-semibold `}>
                            {" "}
                            ₹{formatNumberInIndianStyle(data.mrp)}
                          </Text>
                        </Text>
                        {data.stock <= 4 && data.stock >= 1 && (
                          <View className=" border-2 border-yellow-500 ml-3 mb-1 flex justify-center items-center rounded-lg">
                            <Text className="font-semibold text-yellow-600 text-[3vw] p-2">
                              Only {data.stock} left
                            </Text>
                          </View>
                        )}
                        {data.stock === 0 && (
                          <View className="h-[6vw] w-[30vw] mb-1 border-2 border-red-400 flex justify-center items-center rounded-lg ml-4">
                            <Text className="font-semibold text-red-500 text-[3vw]">
                              Out of Stock
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-col">
                        <View className="flex-row items-end">
                          <Text className={`${xl2} font-semibold text-end`}>
                            Price :{" "}
                          </Text>
                          <Text
                            className={`${
                              data.discount > 0
                                ? `${xl2} font-normal line-through`
                                : `${xl3} font-semibold `
                            } `}
                          >
                            ₹{formatNumberInIndianStyle(data.price)}
                          </Text>
                          {data.discount > 0 && (
                            <Text className={`${xl3} font-semibold`}>
                              {" "}
                              ₹
                              {formatNumberInIndianStyle(
                                data.price - (data.price * data.discount) / 100
                              )}{" "}
                            </Text>
                          )}
                          <Text className={`${xl} font-normal`}>
                            {" "}
                            excl. GST
                          </Text>
                        </View>
                        <View className="flex-row items-end">
                          <Text className={`${xl2} font-semibold text-end`}>
                            Price :{" "}
                          </Text>
                          <Text
                            className={`${
                              data.discount > 0
                                ? `${xl2} font-normal line-through`
                                : `${xl3} font-semibold `
                            } `}
                          >
                            ₹
                            {formatNumberInIndianStyle(
                              data.price + (data.gst * data.price) / 100
                            )}{" "}
                          </Text>
                          {data.discount > 0 && (
                            <Text className={`${xl3} font-semibold`}>
                              {" "}
                              ₹
                              {formatNumberInIndianStyle(
                                data.price -
                                  (data.price * data.discount) / 100 +
                                  ((data.price -
                                    (data.price * data.discount) / 100) *
                                    data.gst) /
                                    100
                              )}{" "}
                            </Text>
                          )}
                          <Text className={`${xl} font-normal`}>
                            {" "}
                            incl. GST
                          </Text>
                        </View>
                      </View>

                      <Text className={`${xl2}  font-semibold`}>
                        Shipping:{" "}
                        <Text className={`${xl3}  font-semibold`}>
                          ₹
                          {data.shippingCharge > 0
                            ? formatNumberInIndianStyle(data.shippingCharge)
                            : "Free"}{" "}
                        </Text>
                      </Text>
                      <View className="flex justify-center items-center border-t border-b border-gray-400">
                        <View className=" p-1">
                          <Text className={`${xl} font-semibold`}>
                            You Save:{" "}
                            <Text className={`${xl2} font-semibold`}>
                              ₹
                              {formatNumberInIndianStyle(
                                data.mrp -
                                  (data.price +
                                    (data.gst * data.price) / 100 -
                                    (data.discount * data.price) / 100)
                              )}{" "}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-evenly border-b border-gray-400 pb-1 px-3">
                        <View className="flex-row justify-center items-center ">
                          <Truck
                            width={26}
                            height={26}
                            color={"#006aba"}
                            fill={"#006aba"}
                          />
                          <Text className={`${lg} pl-1 font-semibold`}>
                            Delivery by {deliveryDate}
                          </Text>
                        </View>
                        <View className="flex-row justify-center items-center">
                          <Replace width={26} height={26} color={"#07bd2b"} />
                          <Text className={`${lg} pl-1 font-semibold`}>
                            1 Year Warranty
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Rating Section */}
                    {((userData && userData.isAdmin) ||
                      (productIsBought && !productIsReviewed)) && (
                      <View className="flex-col px-2 items-center justify-center">
                        {/* Star  */}
                        <Text className="text-[4.5vw] font-semibold text-gray-800 py-2 pb-2">
                          Your Review
                        </Text>
                        <View className="flex-row justify-center items-center">
                          {Array.from({ length: 5 }, (_, index) => (
                            <TouchableOpacity
                              key={index}
                              className="mx-2"
                              onPress={() => starPress(index + 1)}
                            >
                              <Star
                                height={40}
                                width={40}
                                fillPercentage={rating >= index + 1 ? 1 : 0}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                        <View className="my-3 h-[20vw] w-full flex justify-center items-center">
                          <TextInput
                            className="border-2 border-gray-300 rounded-lg h-full w-[70%] bg-white px-2 py-2 "
                            placeholder="Write your comments.."
                            multiline={true} // Enable multiline
                            textAlignVertical="top"
                            onChangeText={(e) => setComments(e)}
                          />
                        </View>
                        <View className="my-3 h-[8vw] w-[40%] flex justify-center items-center ">
                          <Pressable
                            className="flex justify-center items-center bg-green-600 h-full w-full rounded-xl"
                            onPress={handleSubmitReview}
                          >
                            <Text className="text-white text-[4vw] font-semibold">
                              Submit
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                    {/* Product Detail and Writing */}
                    <View className="flex-col pt-2">
                      <View className="px-4">
                        {source && (
                          <RenderHtml
                            contentWidth={width}
                            source={source}
                            tagsStyles={tagsStyles}
                          />
                        )}
                      </View>
                    </View>

                    {/* Similar Data */}
                    <View className="flex-col px-2 items-center justify-center">
                      <Text className="text-[4.5vw] font-semibold text-gray-800 py-2 ">
                        Similar Products
                      </Text>
                      <View className="border-b w-[40%] border-gray-400 "></View>
                    </View>
                    {similarData ? (
                      <>
                        {/* Similar Poducts */}
                        <View>
                          <FlatList
                            data={similarData}
                            keyExtractor={(item) => item.$id}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => (
                              <Caard
                                customWidth={true}
                                title={item.title}
                                id={item.$id}
                                price={item.price}
                                discount={item.discount}
                                image={item.images[0]}
                                mrp={item.mrp}
                                stars={item.stars}
                                numCols={1}
                              />
                            )}
                          />
                        </View>
                        {/* User Review Section */}
                        <View className="flex-col px-2 items-center justify-center">
                          <Text className="text-[4.5vw] font-semibold text-gray-800 py-2 pb-2">
                            Customer Reviews
                          </Text>
                          <View className="border-b w-[40%] border-gray-400 "></View>
                          {data && data.comments.length > 0 ? (
                            data.comments.map((item, index) => (
                              <View
                                key={index}
                                className="flex-row items-center "
                              >
                                <Text
                                  className={`${xl} text-gray-800 py-1 pr-2`}
                                >
                                  {item}
                                </Text>
                                {userData && userData.isAdmin && (
                                  <Pressable
                                    onPress={() => handleDeleteComment(index)}
                                  >
                                    <DeleteButton
                                      width={18}
                                      height={18}
                                      color={"#000000"}
                                    />
                                  </Pressable>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text className={`${xl} text-gray-800 py-1`}>
                              Rated by {data.totalRatings} Customers, No
                              Comments..
                            </Text>
                          )}
                        </View>
                      </>
                    ) : (
                      <ActivityIndicator size="large" color="black" />
                    )}
                  </View>
                </View>
              </Pressable>
            </ScrollView>
            {/* Address Pop */}
            {addressPop && (
              <View className="absolute bottom-0 bg-white h-auto max-h-80 w-full border border-gray-300 flex justify-center items-center mb-[12vw] overflow-hidden z-50">
                <ScrollView>
                  {/*  Title Heading */}
                  {userAddressess.length > 0 ? (
                    <View className="flex-row justify-between items-center my-4 mx-6">
                      <View>
                        <Text className="text-xl font-semibold">
                          Select Address
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity
                          className="h-10 w-28 border-4 border-cyan-400 rounded-lg flex-row justify-center items-center"
                          onPress={() => router.push("/(screens)/addressForm")}
                        >
                          <Plus height={"22"} width={"20"} color={"#000000"} />
                          <Text className="text-lg font-semibold pr-2">
                            Add New
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="flex justify-center items-center">
                      <Text className="text-xl font-semibold py-3 mb-3 ">
                        No Addresses Found
                      </Text>
                    </View>
                  )}
                  {/* Address Selection */}
                  <ScrollView>
                    {userAddressess.length > 0 ? (
                      userAddressess.map((item, index) => (
                        <Pressable
                          className="flex-row items-start px-4 gap-4 py-2"
                          key={index}
                          onPress={() => setClickedAddress(index)}
                          disabled={clickedAddress === index ? true : false}
                        >
                          <View
                            className={`h-5 w-5 rounded-full border-2 ${
                              clickedAddress === index
                                ? "bg-cyan-400 border-gray-200 "
                                : "border-gray-500 "
                            }`}
                          />
                          <View className="flex-col mb-4">
                            <Text className="text-[17px] font-semibold">
                              {`${item.name}, ${item.phone}`}
                            </Text>
                            <Text className="text-[15px] pt-2 pr-6">{`${item.houseNo}, ${item.area}, ${item.city}, ${item.state}, ${item.pin}, `}</Text>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <TouchableOpacity
                        className="h-10 w-40 mb-10 border-4 border-cyan-400 rounded-lg flex-row justify-center items-center"
                        onPress={() => router.push("/(screens)/addressForm")}
                      >
                        <Plus height={"22"} width={"20"} color={"#000000"} />
                        <Text className="text-lg font-semibold">
                          Add Address
                        </Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </ScrollView>
              </View>
            )}
            {/* Bottom 2 buttons */}
            <View className="w-full h-[6vh] bottom-0 flex-row">
              {addressPop ? (
                <TouchableOpacity
                  className="w-1/2 bg-orange-400 flex justify-center items-center"
                  onPress={createOrder}
                >
                  <View className="">
                    <Text className={`${xl2} font-semibold text-white`}>
                      Go To Payment
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className={`w-1/2 bg-orange-400 flex justify-center items-center ${
                    !data.stock || !data.visible ? "opacity-70" : ""
                  }`}
                  onPress={() => {
                    userData ? selectAddress() : router.push("/profile");
                  }}
                  disabled={!data.stock || !data.visible}
                >
                  <View className="">
                    <Text className={`${xl2} font-semibold text-white`}>
                      Buy Now
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {cartAdded ? (
                <TouchableOpacity
                  className="w-1/2 bg-white  flex justify-center items-center"
                  onPress={() => router.replace("/cart")}
                >
                  <View className="flex-row items-center ">
                    <Text className={`${xl2} font-semibold text-black pr-2`}>
                      Go to Cart
                    </Text>
                    <Cart
                      height={width > 700 ? 30 : 20}
                      width={width > 700 ? 30 : 20}
                      color={"#000000"}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className={`w-1/2 bg-white flex justify-center items-center ${
                    !data.stock || !data.visible ? "opacity-70" : ""
                  }`}
                  onPress={() => {
                    userData ? addCart() : router.push("/profile");
                  }}
                  disabled={!data.stock || !data.visible}
                >
                  <View className="flex-row items-center ">
                    <Text className={`${xl2} font-semibold text-black pr-2`}>
                      Add to Cart
                    </Text>
                    <Cart height={20} width={20} color={"#000000"} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </>
    );
  }
};

export default productDetail;

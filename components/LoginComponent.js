import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  addUser,
  checkUserInDatabase,
  getCurrentUser,
  mobileOTP,
  verifyOTP,
} from "@/lib/appwrite";
import { Redirect, router } from "expo-router";
import male from "../assets/male.png";
import female from "../assets/girl.png";
import lady from "../assets/lady.png";
import group from "../assets/group.png";
import group1 from "../assets/group1.png";
import boy from "../assets/boy.png";
import { useGlobalContext } from "@/context/GlobalProvider";

const LoginComponent = () => {
  const { setUser, setCart } = useGlobalContext();
  const [number, setNumber] = useState();
  const [otp, setOtp] = useState();
  const [username, setUsername] = useState();
  const images = [male, female, lady, group, group1, boy];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMobile, setShowMobile] = useState(false); // this shows ph.no. enter screen
  const [otpVerified, setOtpVerified] = useState(false); //otp is verified by appwrite
  const [showOTP, setShowOTP] = useState(false); // this shows otp enter screen
  const [showNameScreen, setShowNameScreen] = useState(false);
  const [didNotRecieveOtp, setDidNotRecieveOtp] = useState(false);
  const [timer, setTimer] = useState(45);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const parseArrayofItems = (arr) => {
    let parsedArr = [];
    for (let i = 0; i < arr.length; i++) {
      let parsed = JSON.parse(arr[i]);
      parsedArr.push(parsed);
    }
    return parsedArr;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out the image
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Toggle the image source after fading out
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 2500); // 3-second interval
    getCurrentUser();
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fadeAnim]);

  const redirect = () => {
    setShowMobile(true);
    Keyboard.isVisible();
  };
  const outsidePress = () => {
    if (showMobile) {
      setShowMobile(false);
    } else return;
  };

  useEffect(() => {
    if (showOTP) {
      let interval;
      if (timer > 0) {
        interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      }
      if (timer === 0) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [timer, showOTP]);

  const sendOtpRequest = async () => {
    Keyboard.dismiss();
    if (number.length === 10) {
      const num = `+91${number.toString()}`;
      const res = await mobileOTP(num);
      if (res) {
        setShowMobile(false);
        setShowOTP(true);
        setTimer(45);
      }
    }
  };

  const sendOtp = async () => {
    try {
      if (otp.length === 6) {
        console.log(otp);
        const res = await verifyOTP(otp);
        if (res.success) {
          setShowOTP(false);
          setOtpVerified(true);
          checkUser();
        } else {
          alert(res.message);
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  const checkUser = async () => {
    setShowOTP(false);
    const num = `+91${number.toString()}`;
    const res = await checkUserInDatabase(num);
    console.log(res.total);
    if (res.total === 0) {
      // user is a first timer
      setShowNameScreen(true);
    } else {
      // user is not a first timer, he is now logged in and his name is already with us
      console.log(res.documents[0], "checkUserInDatabase");
      const userData = res.documents[0];
      userData.cart = userData.cart ? parseArrayofItems(userData.cart) : [];
      userData.address = userData.address
        ? parseArrayofItems(userData.address)
        : [];
      userData.search = userData.search
        ? parseArrayofItems(userData.search)
        : [];
      setUser(userData);
      console.log(userData, "userData to be global provided");
      router.replace("/home");
    }
  };

  // First timer user when he enters his name
  const updateUser = async () => {
    const num = `+91${number.toString()}`;
    let data = { name: username, number: num };
    const res = await addUser(data);
    if (res) {
      console.log(res, "addUser");
      setUser(res);
      setShowNameScreen(false);
      router.replace("/home");
    }
  };

  return (
    <ScrollView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Pressable onPress={outsidePress} disabled={!showMobile}>
          <View className="flex relative h-screen justify-center items-center">
            <View
              className={` h-full flex justify-center items-center bottom-10 ${
                showMobile ? "opacity-70" : "opacity-100"
              }`}
            >
              <View className="h-40 w-40 rounded-full border border-gray-500 overflow-hidden">
                <Animated.Image
                  style={{ opacity: fadeAnim }}
                  source={images[currentIndex]}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-row justify-evenly items-center gap-4 py-8">
                <TouchableOpacity
                  onPress={redirect}
                  className="w-64 h-14 bg-orange-400 rounded-lg"
                >
                  <View className="flex-col justify-center items-center">
                    <Text className="text-white text-2xl font-semibold">
                      Sign Up / Log In
                    </Text>
                    <Text className="text-white text-sm">
                      Click to access your Account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {showOTP && (
              <View className="h-[20vh] absolute top-[30%] w-[90vw] bg-zinc-300 flex-col justify-center items-center pt-[1vh] rounded-xl mx-20">
                <TextInput
                  className="w-[60%]  border border-gray-500 bg-white text-center rounded-lg text-[8vw] placeholder:text-base"
                  placeholder="6 Digits OTP"
                  keyboardType="numeric"
                  onChangeText={(e) => setOtp(e)}
                />
                <View className="pt-[4vh] flex-col gap-[2vh] justify-center items-center">
                  <View className="flex-row ">
                    <TouchableOpacity
                      className={`w-[30vw] bg-orange-400 flex justify-center items-center rounded-lg mx-2 ${
                        timer ? "opacity-60" : ""
                      }`}
                      onPress={sendOtpRequest}
                      disabled={timer ? true : false}
                    >
                      <Text className="text-white text-base  font-semibold p-1 text-center">
                        {`${timer ? timer : ""} Resend`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-[20vw]  bg-orange-400 flex justify-center items-center rounded-lg "
                      onPress={sendOtp}
                    >
                      <Text className="text-white text-base  font-semibold">
                        Enter
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {showMobile && (
              <View className="h-[40vw] absolute top-[30%] w-[90vw] bg-zinc-300 flex-col justify-center items-center pt-[1vh] rounded-xl mx-20">
                <TextInput
                  className="w-[60%] h-10 border border-gray-500 bg-white text-center rounded-lg text-[8vw] placeholder:text-base"
                  placeholder="Mobile Number"
                  keyboardType="numeric"
                  onChangeText={(e) => setNumber(e)}
                />
                <View className="pt-[2vh] ">
                  <TouchableOpacity
                    className="z-50 w-20 h-10 bg-orange-400 flex justify-center items-center rounded-lg "
                    onPress={() => sendOtpRequest()}
                  >
                    <Text className="text-white text-base text-[4.5]vw]">
                      Get OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showNameScreen && (
              <View className="h-[40vw] absolute top-[30%] w-[90vw] bg-zinc-300 flex-col justify-center items-center pt-[1vh] rounded-xl mx-20">
                <TextInput
                  className="w-[80%] h-10 border border-gray-500 bg-white text-center rounded-lg text-[8vw] placeholder:text-[4vw]"
                  placeholder="Enter Full Name"
                  keyboardType="default"
                  onChangeText={(e) => setUsername(e)}
                />
                <View className="pt-[2vh]">
                  <TouchableOpacity
                    className="w-20 h-10 bg-orange-400 flex justify-center items-center rounded-lg"
                    onPress={updateUser}
                  >
                    <Text className="text-white text-base text-[4.5]vw]">
                      Enter
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default LoginComponent;

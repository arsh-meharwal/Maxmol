import React, { useState } from "react";
import { ScrollView, Image, View, Dimensions } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

export const ImageCarousel = ({ images, link }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const dotsLength = images.length + 1;

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / width);
    setActiveIndex(currentIndex);
  };

  return (
    <View>
      <View className="flex-row">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={{
                uri: `https://cloud.appwrite.io/v1/storage/buckets/66c5a1030009cc3c7fa4/files/${image}/view?project=66c59b5800224d59df96&mode=admin`,
              }}
              style={{ width: width, height: width }} // Adjust height as per your design
              resizeMode="contain"
            />
          ))}
          {link && (
            <View
              style={{
                width: width,
                height: width,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: width * 0.4,
                backgroundColor: "#D6D3D1",
              }}
            >
              <YoutubeIframe
                height={width}
                width={width}
                videoId={link}
                onReady={() => console.log("Video is ready")}
                onError={(error) => console.log("Error: ", error)}
                onPlaybackQualityChange={(quality) =>
                  console.log("Quality: ", quality)
                }
                onPlaybackRateChange={(rate) => console.log("Rate: ", rate)}
              />
            </View>
          )}
        </ScrollView>
      </View>
      {/* Dots Indicator */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {images.map((_, index) => (
          <View
            key={index}
            style={{
              width: activeIndex === index ? 12 : 8, // Active dot size
              height: activeIndex === index ? 12 : 8, // Active dot size
              borderRadius: 6, // Make it a circle
              backgroundColor: activeIndex === index ? "#000" : "#888", // Active dot color
              marginHorizontal: 4,
            }}
          />
        ))}
        {link && (
          <View
            style={{
              width: activeIndex === images.length ? 12 : 8, // Active dot size
              height: activeIndex === images.length ? 12 : 8, // Active dot size
              borderRadius: 6, // Make it a circle
              backgroundColor: activeIndex === images.length ? "#000" : "#888", // Active dot color
              marginHorizontal: 4,
            }}
          />
        )}
      </View>
    </View>
  );
};

import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Auth from "./Auth"; // Import the Auth component

export default function Content({ setComp, session, setMapPrevComp }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Track sign in or sign up

  useEffect(() => {
    setMapPrevComp(false);
  }, []);

  const handleGetStarted = () => {
    setIsSignUp(false); // Default to sign in
    setIsModalVisible(true);
  };

  const handleSignUp = () => {
    setIsSignUp(true);
    setIsModalVisible(true);
  };

  return (
    <LinearGradient
      colors={["#27187E", "#7F69FF"]}
      style={{ flex: 1 }} // Ensure the gradient takes full space
    >
      <View className="flex-1">
        <View className="py-12 md:py-24 lg:py-32 xl:py-48 mt-24">
          <View className="px-4 md:px-6">
            <View className="flex flex-col items-center gap-4 text-center">
              <Image
                source={require("../public/mont_logo.png")}
                style={{ width: 75, height: 75 }}
                resizeMode="contain"
              />
              <Text className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
                Find Your Happy Place
              </Text>
              <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
                Discover how your environment influences your mood. Track your mood in different locations and explore patterns that emerge with{" "}
                <Text className="text-amber-500">MO:NT </Text>(Mood Organizing: Noticing and Tracking).
              </Text>
            </View>
          </View>
        </View>

        <View className="absolute bottom-12 left-0 right-0 flex items-center">
          <View className="w-full flex items-center">
            <View className="w-auto max-w-[700px] flex flex-col items-center">
              <TouchableOpacity
                onPress={handleGetStarted}
                className="h-16 w-80 items-center justify-center rounded-full bg-amber-500 transition-colors hover:bg-indigo-800 active:bg-indigo-900 focus:outline-none"
                accessibilityLabel="Get Started"
              >
                <Text className="text-black text-lg">Get Started</Text>
              </TouchableOpacity>

              <View className="flex-row items-center mt-4">
                <Text className="italic text-sm text-white dark:text-gray-400">
                  Don’t have an account?{" "}
                </Text>
                <TouchableOpacity onPress={handleSignUp} accessibilityLabel="Sign up">
                  <Text className="text-white text-sm underline italic">Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Auth Modal */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={{ flex: 1 }}>
            <BlurView intensity={50} style={{ flex: 1 }} experimentalBlurMethod="dimezisBlurView">
              <View className="flex-1 justify-center items-center">
                <View className="h-5/6 w-5/6 p-5 bg-white/50 rounded-3xl items-center">
                  <Image
                    source={require("../public/mont_logo.png")}
                    style={{ width: 75, height: 75, position: 'absolute', top: 145, left: 115 }} // Adjust top/left for positioning
                    resizeMode="contain"
                  />
                  <Image
                    source={require("../public/curved-text.png")} // Use your second image source
                    style={{ width: 200, height: 200 }} // Keep it in normal flow
                    resizeMode="contain"
                  />
                  <Auth setComp={setComp} setIsModalVisible={setIsModalVisible} isSignUp={isSignUp} session={session} />
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

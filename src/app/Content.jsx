import React, { useEffect, useState } from "react";
import { Text, View, Image, Button, TouchableOpacity, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Auth from "./Auth"; // Import the Auth component

export default function Content({ setComp, session, setMapPrevComp }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Track sign in or sign up

  useEffect(() => {
    setMapPrevComp(false);
  },[])
  const handleGetStarted = () => {
    setIsSignUp(false); // Default to sign in
    setIsModalVisible(true);
  };

  const handleSignUp = () => {
    setIsSignUp(true);
    setIsModalVisible(true);
  };

  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Image
              source={require("../public/mont_logo.png")}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
            <Text
              role="heading"
              className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
            >
              MO:NT
            </Text>
            <Text className="text-3xl text-center native:text-5xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Find Your Happy Place
            </Text>
            <Text className="mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
              Discover how your environment influences your mood. Track your mood in different locations and explore patterns that emerge with MO:NT (Mood Organizing: Noticing and Tracking).
            </Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-4 left-0 right-0 flex items-center">
        <View className="w-full flex items-center">
          <View className="flex w-full max-w-[700px]">
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              className="flex h-12 w-full items-center justify-center rounded-md text-gray-50 transition-colors hover:bg-gray-900/90 active:bg-gray-400/90 focus:outline-none"
              accessibilityLabel="Get Started"
            />
            <Text className="mt-16 text-sm text-gray-500 dark:text-gray-400">
              Don’t have an account?{" "}
              <TouchableOpacity onPress={handleSignUp} accessibilityLabel="Sign up">
                <Text className="text-blue-500">Sign up</Text>
              </TouchableOpacity>
            </Text>
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 p-5 bg-white rounded-lg">
            <Auth setComp={setComp} setIsModalVisible={setIsModalVisible} isSignUp={isSignUp} session={session} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
const moodImages = {
  happy: require("../public/happy.png"),
  sad: require("../public/sad.png"),
  neutral: require("../public/neutral.png"),
  angry: require("../public/angry.png"),
};

const Main = ({ setComp, session, mapPrevComp }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [modalVisible, setModalVisible] = useState(mapPrevComp === false);
  const [moodCounts, setMoodCounts] = useState({
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
  });

  useEffect(() => {
    if (coordinates) {
      const existingCoordinates = JSON.parse(coordinates);
      const counts = { happy: 0, sad: 0, neutral: 0, angry: 0 };

      existingCoordinates.forEach((entry) => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
      });

      setMoodCounts(counts);
    }
  }, [coordinates]);
  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, full_name, coordinates`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setFullName(data.full_name);
        setCoordinates(data.coordinates);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const handleImagePress = async (mood) => {
    try {
      const location = await requestLocationPermission();
      if (!location) return;

      const coordinatesToUpdate = {
        latitude: location.latitude,
        longitude: location.longitude,
        mood: mood,
      };
      console.log(coordinatesToUpdate);
      // Assuming `coordinates` holds the existing coordinates in JSON format
      const existingCoordinates = coordinates ? JSON.parse(coordinates) : []; // Parse existing JSON
      const updatedCoordinates = [...existingCoordinates, coordinatesToUpdate]; // Append new coordinates

      // Convert back to JSON for the database
      const jsonCoordinates = JSON.stringify(updatedCoordinates);

      const { error } = await supabase
        .from("profiles")
        .update({ coordinates: jsonCoordinates })
        .eq("id", session.user.id);

      if (error) throw error;
      setCoordinates(jsonCoordinates);
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error updating coordinates: " + error.message);
    }
  };

  return (
    <View className="flex-1 overflow-auto">
      {/*header*/}
      <View className = "flex flex-row w-full justify-center items-center bg-indigo-800">
            <Image
              source={require("../public/mont_logo.png")}
              className="w-10 h-10 mr-2"
              resizeMode="contain"
            />
            <Image
              source={require("../public/straight-text.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => setComp("auth")} className="flex absolute left-3/4">
              <Text className="text-lg  underline text-slate-300">Sign Out</Text>
            </TouchableOpacity>
          </View>
          <LinearGradient
               // Button Linear Gradient
            colors={['#4c669f', '#3b5998', '#192f6a']}>
        <View className="py-12 md:py-24 lg:py-32 xl:py-48 h-screen flex items-center justify-between">
              <Text className="text-5xl">Hello, {fullName}</Text>
              <View className = "h-1/6 w-5/6 bg-white rounded-3xl flex items-center bottom-5">
                <View className = "w-full h-1/3 bg-indigo-500 rounded-t-3xl flex items-center justify-center">
                  <Text className = "text-white text-xl">Based on our analysis...</Text>
                </View>
                <View className = "top-3 flex items-center mx-5">
                  <Text className = "text-xl text-center">You tend to feel more happy at: <Text className = "color-indigo-500">Lonsdale Quay</Text></Text>
                </View>
                {/* {coordinates &&
                  JSON.parse(coordinates).map((entry, index) => (
                    <Text key={index}>
                      Mood: {entry.mood}, Latitude: {entry.latitude}, Longitude:{" "}
                      {entry.longitude}
                      {"\n"}
                    </Text>
                  ))} */}
              </View>

              <View className = "h-1/6 w-5/6 bg-white rounded-3xl flex items-center bottom-5">
                <View className = "w-full h-1/3 bg-indigo-500 rounded-t-3xl flex items-center justify-center">
                  <Text className = "text-white text-xl">Your Recent Trends</Text>
                </View>
                <View className = "top-3 flex items-center mx-5">
                  <Text className = "text-xl text-center">You felt most sad at <Text className="text-indigo-500">St.Paul's Hospital</Text> last week.</Text>
                </View>
              </View>
              <View className = "h-1/4 w-5/6 rounded-3xl bg-white bottom-5">
                <Text className = "text-xl left-3 mb-1">Your past week:</Text>
                <View className="flex-row flex-wrap justify-around w-full px-4">
                  {["happy", "sad", "neutral", "angry"].map((mood) => (
                    <View key = {mood} className = "flex w-1/2 items-center mb-4">
                      <View className = "flex-row items-center">
                        <Image
                          source={moodImages[mood]}
                          className="w-16 h-16"
                          resizeMode="contain"
                        />
                        <Text className = "text-2xl"> X{moodCounts.happy}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <View className="flex-row justify-between bottom-8 w-full">
              <TouchableOpacity onPress={() => setComp("map")} className="flex items-center justify-center h-16 w-1/2 bg-white rounded-l-full">
                  <Image
                    source={require("../public/house.png")} // Replace with your right button image path
                    className="w-full h-11" // Adjust size as needed
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setComp("map")} className="flex items-center justify-center w-1/2 bg-slate-500 rounded-r-full">
                  <Image
                    source={require("../public/map.png")} // Replace with your right button image path
                    className="w-full h-11" // Adjust size as needed
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

        </View>
        </LinearGradient>

      {/* Modal for selecting coordinates */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
      <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView">
        <View className = "flex flex-col justify-center items-center top-16">
          <View className="flex justify-center items-center w-full rounded-lg h-5/6 bg-slate-800/90">
            <Text className="text-4xl mb-5 text-white text-center">How are you feeling?</Text>
            <View className="flex-row flex-wrap justify-around w-full px-4">
              {["happy", "sad", "neutral", "angry"].map((mood) => (
                <TouchableOpacity
                key={mood}
                onPress={() => handleImagePress(mood)}
                className="flex items-center w-1/2 mb-4 h-24 justify-center" // Set width to half for two in a row
              >
                <Image
                  source={moodImages[mood]}
                  className="w-100 h-100"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              ))}
            </View>
            <Text className = "text-slate-300 mt-6">Tap to log answer</Text>
          </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default Main;

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
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View>
          {/*header*/}
          <View className = "flex w-full">
            <Text className="text-xl font-bold">MO:NT</Text>
            <Image
              source={require("../public/mont_logo.png")}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>
          <Text className="text-lg">Hello {fullName}</Text>
          <Text>Based on our analysis</Text>
          <Text>Yo liam uncomment the line below to see the coordinate data. You can do JSON.parse(coordinates)</Text>
          {/* {coordinates &&
            JSON.parse(coordinates).map((entry, index) => (
              <Text key={index}>
                Mood: {entry.mood}, Latitude: {entry.latitude}, Longitude:{" "}
                {entry.longitude}
                {"\n"}
              </Text>
            ))} */}
          <Text>Your recent trends</Text>
          <Text>dummy data Last week you felt most sad at</Text>
          <Text>Your past week:</Text>
          <Text>Happy: {moodCounts.happy}</Text>
          <Text>Sad: {moodCounts.sad}</Text>
          <Text>Neutral: {moodCounts.neutral}</Text>
          <Text>Angry: {moodCounts.angry}</Text>

          <View className="flex-row justify-between mt-4">
            <Button title="Left Button" onPress={() => setComp("main")} />
            <Button title="Right Button" onPress={() => setComp("map")} />
          </View>
          <TouchableOpacity onPress={() => setComp("auth")} className="mt-4">
            <Text className="text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for selecting coordinates */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
      </Modal>
    </View>
  );
};

export default Main;

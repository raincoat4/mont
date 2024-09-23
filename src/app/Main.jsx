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
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
  const [trend, setTrend] = useState("");
  const [emotion, setEmotion] = useState("");
  const [mostHappy, setMostHappy] = useState("");
  const [moodCounts, setMoodCounts] = useState({
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
  });

  const openAISummarizer = async (AIcoordinates) => {
    const apikey = process.env.EXPO_PUBLIC_API_OPEN_AI_KEY;
    console.log(JSON.stringify(AIcoordinates));
    console.log("start");
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `for every pair of coordinates you receive, find  the location name and remember it out based on where the coordinates are: using these coordinates
                Given an array of objects formatted like this: 
              [{"latitude": latitude, "longitude": longitude, "mood": mood}, ...], 
              please analyze the data to remember an object structured as follows:
              {
                "most_happy": "You tend to feel most happy at [Place Name]",
                "trends": "You have been feeling [emotion] at [Place Name] recently."
              }
              Make sure to use the provided coordinates to identify locations and describe recent trends based on the moods. 
              Here’s an example of the expected input format: 
              [{"latitude": 49.3473991, "longitude": -123.0333468, "mood": "angry"}, {"latitude": 49.3473991, "longitude": -123.0333468, "mood": "neutral"}, {"latitude": 49.3473106, "longitude": -123.0333149, "mood": "angry"}, {"latitude": 49.3473106, "longitude": -123.0333149, "mood": "sad"}]

              Your job is to fill in the square brackets using the coordinate data
              "You tend to feel most happy at [most_happy]",
              You have been feeling [emotion] at [trends] recently."

              for emotion the only possible options are 'sad', 'happy', 'angry', 'neutral'

              use the location names from your memory earlier when i first asked you to find the location names for each coordinate

              only return the object like {
                "most_happy": "[Place Name]",
                "trends": "[Place Name]"
                "emotion: [mood]
              }
              
              For the place names be as specific as possible, but only use things like infrastructure buildings, parks or cities.
              Things like St.Paul's Hospital, DeepCove, Starbucks, Greenwood park are all good examples.
              Things like Canada, British Columbia, are too general and things like Osler St and 37th Avenue is too specific.


                do not add any additional text. do not ad code blocks around this object.
                do not make trends and most_happy reference the same place. if they reference the same place
                 simply make them slightly different but nearyby locations
                 
                 never return Unknown for any fields you do not know always return the name of a location and a mood
                 Try to avoid using the example locations i gave you. if you really don't know then do the city name`,
              },
              { role: "user", content: JSON.stringify(AIcoordinates) },
            ],
          }),
        }
      );

      const json = await response.json();
      console.log("this is the result", json.choices[0].message.content);
      const content = JSON.parse(json?.choices?.[0]?.message?.content);
      console.log("this is the content", content);

      // Set trend with fallback to "Starbucks in North Vancouver"
      const AItrend = content?.trends || "Error parsing data";
      setTrend(AItrend);

      // Set mostHappy with fallback to "Starbucks in North Vancouver"
      const AImostHappy = content?.most_happy || "Error parsing data";
      setMostHappy(AImostHappy);

      const AIemotion = content?.emotion || "Error parsing data";
      setEmotion(AIemotion);
    } catch (error) {
      console.error("this is the result", error);
    }
  };

  useEffect(() => {
    if (coordinates) {
      const existingCoordinates = coordinates ? JSON.parse(coordinates) : [];
      console.log("existingCoordinates", existingCoordinates);
      openAISummarizer(existingCoordinates);
    }
  }, [coordinates]);

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
      <View className="flex flex-row w-full justify-center items-center bg-indigo-800">
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
        <TouchableOpacity
          onPress={() => setComp("auth")}
          className="flex absolute left-3/4"
        >
          <Text className="text-lg  underline text-slate-300">Sign Out</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient
        // Button Linear Gradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
      >
        <View className="py-12 md:py-24 lg:py-32 xl:py-48 h-screen flex items-center justify-between">
          <Text className="text-5xl">Hello, {fullName}</Text>
          <View className="h-1/6 w-5/6 bg-white rounded-3xl flex items-center bottom-5">
            <View className="w-full h-1/3 bg-indigo-500 rounded-t-3xl flex items-center justify-center">
              <Text className="text-white text-xl">
                Based on our analysis...
              </Text>
            </View>
            <View className="top-3 flex items-center mx-5">
              <Text className="text-xl text-center">
                You tend to feel more happy at:{" "}
                <Text className="color-indigo-500">{mostHappy}</Text>
              </Text>
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

          <View className="h-1/6 w-5/6 bg-white rounded-3xl flex items-center bottom-5">
            <View className="w-full h-1/3 bg-indigo-500 rounded-t-3xl flex items-center justify-center">
              <Text className="text-white text-xl">Your Recent Trends</Text>
            </View>
            <View className="top-3 flex items-center mx-5">
              <Text className="text-xl text-center">
                You felt most{" "}
                <Text className="text-indigo-500"> {emotion}</Text> at{" "}
                <Text className="text-indigo-500">{trend}</Text> last week.
              </Text>
            </View>
          </View>
          <View className="h-1/4 w-5/6 rounded-3xl bg-white bottom-5">
            <Text className="text-xl left-3 mb-1">Your past week:</Text>
            <View className="flex-row flex-wrap justify-around w-full px-4">
              {["happy", "sad", "neutral", "angry"].map((mood) => (
                <View key={mood} className="flex w-1/2 items-center mb-4">
                  <View className="flex-row items-center">
                    <Image
                      source={moodImages[mood]}
                      className="w-16 h-16"
                      resizeMode="contain"
                    />
                    <Text className="text-2xl"> X{moodCounts[mood]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View className="flex-row justify-between bottom-8 w-full">
            <TouchableOpacity
              onPress={() => setComp("map")}
              className="flex items-center justify-center h-16 w-1/2 bg-white rounded-l-full"
            >
              <Image
                source={require("../public/house.png")} // Replace with your right button image path
                className="w-full h-11" // Adjust size as needed
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setComp("map")}
              className="flex items-center justify-center w-1/2 bg-slate-500 rounded-r-full"
            >
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
          <View className="flex flex-col justify-center items-center top-16">
            <View className="flex justify-center items-center w-full rounded-lg h-5/6 bg-slate-800/90">
              <Text className="text-4xl mb-5 text-white text-center">
                How are you feeling?
              </Text>
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
              <Text className="text-slate-300 mt-6">Tap to log answer</Text>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default Main;

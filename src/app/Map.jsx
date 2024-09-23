import React from "react";
import {
  Text,
  View,
  Button,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MapView, { Marker } from 'react-native-maps';

// Map moods to their respective images
const moodImages = {
  happy: require('../public/happy.png'),
  sad: require('../public/sad.png'),
  neutral: require('../public/neutral.png'),
  angry: require('../public/angry.png'),
};

const Map = ({ setComp, session, setMapPrevComp }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [mostRecentCoordinate, setMostRecentCoordinate] = useState(null);

  useEffect(() => {
    setMapPrevComp(true);
  }, []);

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

        // Parse the coordinates if it's a JSON string
        const parsedCoordinates = typeof data.coordinates === 'string' 
          ? JSON.parse(data.coordinates) 
          : data.coordinates;

        setCoordinates(parsedCoordinates);

        // Set the most recent coordinate
        if (parsedCoordinates.length > 0) {
          setMostRecentCoordinate(parsedCoordinates[parsedCoordinates.length - 1]);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1">
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
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="flex justify-between">
        {mostRecentCoordinate ? (
            <View className="rounded-3xl overflow-hidden w-4/5 h-4/5 mx-auto">
              <MapView
                style={{ width: '100%', height: '100%' }} // Ensure MapView fills the container
                initialRegion={{
                  latitude: mostRecentCoordinate.latitude,
                  longitude: mostRecentCoordinate.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                {coordinates.map((coordinate, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: coordinate.latitude,
                      longitude: coordinate.longitude,
                    }}
                    title={`Mood: ${coordinate.mood}`}
                    description={`Latitude: ${coordinate.latitude}, Longitude: ${coordinate.longitude}`}
                    image={moodImages[coordinate.mood]}  // Custom image based on mood
                  />
                ))}
              </MapView>
            </View>
          ) : (
            <Text>Loading map...</Text>
          )}

          <View className = "flex items-center">
            <Text className = "">Scroll to Explore Your Map</Text>
          </View>

          <View className="flex-row justify-between w-full top-14">
              <TouchableOpacity onPress={() => setComp("main")} className="flex items-center justify-center h-16 w-1/2 bg-slate-500 rounded-l-full">
                  <Image
                    source={require("../public/house.png")} // Replace with your right button image path
                    className="w-full h-11" // Adjust size as needed
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setComp("map")} className="flex items-center justify-center w-1/2 bg-white rounded-r-full">
                  <Image
                    source={require("../public/map.png")} // Replace with your right button image path
                    className="w-full h-11" // Adjust size as needed
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
        </View>
      </View>
    </View>
  );
};

export default Map;

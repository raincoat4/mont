import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { useNavigation } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

const Map = ({ setComp, session, setMapPrevComp }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [coordinates, setCoordinates] = useState("");
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

  return (
    <View className="flex-1">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View>
          <View>
            <Text>MO:NT</Text>
            <Image
              source={require("../public/mont_logo.png")}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          </View>
          <Text>Yo liam uncomment the line below to see the coordinate data. You can do JSON.parse(coordinates)</Text>
          {/* {coordinates &&
            JSON.parse(coordinates).map((entry, index) => (
              <Text key={index}>
                Mood: {entry.mood}, Latitude: {entry.latitude}, Longitude:{" "}
                {entry.longitude}
                {"\n"}
              </Text>
            ))} */}

          <View className="flex-row justify-between mt-4">
            <Button title="Left Button" onPress={() => setComp("main")} />
            <Button title="Right Button" onPress={() => setComp("map")} />
          </View>
          <TouchableOpacity onPress={() => setComp("auth")} className="mt-4">
            <Text className="text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Map;

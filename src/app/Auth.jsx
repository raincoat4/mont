import React from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  AppState,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { useNavigation } from "expo-router";
import { supabase } from "../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

const Auth = ({ setComp, setIsModalVisible, isSignUp, session }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const navigation = useNavigation();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setComp("main");
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
    } else if (!session) {
      Alert.alert("Please check your inbox for email verification!");
      setLoading(false);
    } else {
      const { error: insertError } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq('id',session.user.id);

      if (insertError) {
        setLoading(false);
        Alert.alert("Error inserting name: " + insertError.message);
      } else {
        setLoading(false);
        setComp("main");
      }
    }
  }

  return (
    <View>
      {isSignUp && (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          className="mt-4"
        />
      )}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        className="mt-4"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        placeholder="Password"
        className="mt-4"
      />
      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        disabled={loading || (isSignUp && !name)}
        onPress={isSignUp ? signUpWithEmail : signInWithEmail}
      />
    </View>
  );
};

export default Auth;

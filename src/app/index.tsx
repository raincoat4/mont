import { Link } from "expo-router";
import React, { useState, useEffect  } from "react";
import { Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Content from "./Content";
import Map from "./Map";
import Main from "./Main";
import Auth from "./Auth";
import { supabase } from '../lib/supabase'
export default function Page() {
  const [comp, setComp] = useState("content");
  const [session, setSession] = useState(null)
  const [mapPrevComp, setMapPrevComp] = useState(false);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])


  const renderComponent = () => {
    switch (comp) {
      case "map":
        return <Map setComp={setComp} session={session} setMapPrevComp={setMapPrevComp}/>;
      case "main":
        return <Main setComp={setComp} session={session} mapPrevComp={mapPrevComp}/>;
      default:
        return <Content setComp={setComp} session={session} setMapPrevComp={setMapPrevComp}/>; 
    }
  };

  return <View className="flex flex-1">{renderComponent()}</View>;
}

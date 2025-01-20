import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomNavigator from "./BottomNavigator";
import TodoDetailScreen from "../screens/TodoDetailScreen";


const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="TodoDetail" component={TodoDetailScreen} />
      <Stack.Screen name="Main" component={BottomNavigator} />
    </Stack.Navigator>
  );
}
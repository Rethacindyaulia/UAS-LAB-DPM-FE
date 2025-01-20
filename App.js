import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./src/navigations/MainNavigator";
import { TodoProvider } from './src/context/TodoContext';


export default function App() {
  return (
    <NavigationContainer>
      <TodoProvider>
        <MainNavigator />
      </TodoProvider>
    </NavigationContainer>
  );
}
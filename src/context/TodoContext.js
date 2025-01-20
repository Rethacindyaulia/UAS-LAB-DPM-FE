import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/config";

const TodoContext = createContext(undefined);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch todos";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (title, description) => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/todos/create`,
        { title: title.trim(), description: description.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newTodo = response.data.data;
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      return newTodo;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create todo";
      setError(errorMessage);
      throw error;
    }
  };

  const updateTodo = async (id, updates) => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const todoId = id.toString();
      const response = await axios.put(
        `${API_URL}/todos/${todoId}`,
        {
          title: updates.title.trim(),
          description: updates.description.trim(),
          completed: updates.completed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedTodo = response.data.data;
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo._id === todoId ? updatedTodo : todo))
      );
      return updatedTodo;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update todo";
      setError(errorMessage);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const todoId = id.toString();
      await axios.delete(`${API_URL}/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== todoId));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete todo";
      setError(errorMessage);
      throw error;
    }
  };

  const getTodoById = async (id) => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const todoId = id.toString();
      const response = await axios.get(`${API_URL}/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch todo";
      setError(errorMessage);
      throw error;
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        error,
        fetchTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        getTodoById,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
};
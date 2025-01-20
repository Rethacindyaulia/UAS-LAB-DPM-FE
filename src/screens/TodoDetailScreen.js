import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/config";
import { useTodos } from "../context/TodoContext";

const TodoDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { updateTodo } = useTodos();
  const [todo, setTodo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: "Todo Detail",
      headerStyle: {
        backgroundColor: "#fff",
      },
      headerTitleStyle: {
        color: "#1a1a1a",
        fontSize: 18,
        fontWeight: "600",
      },
    });
  }, [navigation]);

  useEffect(() => {
    fetchTodo();
  }, [id]);

  const fetchTodo = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Auth");
        return;
      }

      const response = await axios.get(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedTodo = response.data.data;
      setTodo(fetchedTodo);
      setTitle(fetchedTodo.title);
      setDescription(fetchedTodo.description);
    } catch (error) {
      console.log("Failed to fetch todo", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Auth");
        return;
      }

      const response = await axios.put(
        `${API_URL}/todos/${id}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedTodo = response.data.data;
      setTodo(updatedTodo);
      updateTodo(updatedTodo);
      setModalVisible(true);
    } catch (error) {
      alert("Failed to update todo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!todo) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.updateButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleUpdateTodo}
              disabled={isSubmitting}
            >
              <Text style={styles.updateButtonText}>
                {isSubmitting ? "Updating..." : "Update Todo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalText}>Todo updated successfully</Text>
            <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  descriptionInput: {
    height: 120,
    paddingTop: 12,
  },
  updateButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#90caf9",
    shadowOpacity: 0.1,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TodoDetailScreen;
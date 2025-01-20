import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTodos } from "../context/TodoContext";

const TodoScreen = ({ navigation, route }) => {
  const { createTodo, updateTodo, deleteTodo, getTodoById } = useTodos();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const todoId = route.params?.id;
  const isEditing = !!todoId;

  useEffect(() => {
    const loadTodoData = async () => {
      if (isEditing) {
        setIsLoading(true);
        try {
          const todo = await getTodoById(todoId);
          setTitle(todo.title);
          setDescription(todo.description);
        } catch (error) {
          Alert.alert("Error", "Failed to load todo data");
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTodoData();
  }, [todoId, isEditing]);

  const handleSaveTodo = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Both title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTodo(todoId, { title, description });
        Alert.alert("Success", "Todo updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await createTodo(title, description);
        Alert.alert("Success", "Todo created successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} todo`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this todo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTodo(todoId);
              Alert.alert("Success", "Todo deleted successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete todo"
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? "Edit Task" : "New Task"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSaveTodo}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting
                  ? "Saving..."
                  : `${isEditing ? "Update" : "Create"} Task`}
              </Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDeleteTodo}
              >
                <Text style={styles.deleteButtonText}>Delete Task</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: 25,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    gap: 16,
    marginTop: 8,
  },
  button: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButton: {
    backgroundColor: "#0F172A",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default TodoScreen;
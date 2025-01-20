import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { useTodos } from "../context/TodoContext";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }) => {
  const { todos, loading, error, fetchTodos } = useTodos();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTodos();
    } catch (error) {
      Alert.alert("Error", "Failed to refresh todos");
    } finally {
      setRefreshing(false);
    }
  };

  const renderTodoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.todoCard}
      onPress={() => navigation.navigate("Todo", { id: item._id })}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: item.completed ? "#16A34A" : "#0F172A" },
        ]}
      />
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.todoDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Tasks Yet</Text>
      <Text style={styles.emptyMessage}>
        Add your first task by tapping the + button below
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchTodos}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={todos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0F172A"]}
            tintColor="#0F172A"
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Todo")}
        activeOpacity={0.9}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: 35,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  errorMessage: {
    fontSize: 17,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 24,
    fontWeight: "500",
  },
  retryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: "#0F172A",
    borderRadius: 14,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  todoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    backgroundColor: "#0F172A",
  },
  todoContent: {
    padding: 20,
  },
  todoTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  todoDescription: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  todoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoStatus: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todoDate: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    height: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyMessage: {
    fontSize: 17,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 26,
    letterSpacing: 0.3,
    maxWidth: 280,
  },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addButtonText: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: -4,
  },
});

export default HomeScreen;
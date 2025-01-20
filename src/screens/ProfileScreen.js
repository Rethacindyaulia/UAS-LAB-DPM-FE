import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../config/config";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchProfile();
    startLoadingAnimation();
  }, []);

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.replace("Auth");
        return;
      }
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.data);
    } catch (error) {
      console.log("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  const Avatar = ({ label }) => (
    <View style={styles.avatar}>
      <Text style={styles.avatarLabel}>{label}</Text>
    </View>
  );

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <ActivityIndicator size="large" color="#0F172A" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.profileCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        {profile ? (
          <>
            <View style={styles.avatarContainer}>
              <Avatar label={profile.username.substring(0, 2).toUpperCase()} />
            </View>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>{profile.username}</Text>

            <View style={styles.infoContainer}>
              <InfoRow icon="👤" label="Username" value={profile.username} />
              <InfoRow icon="📧" label="Email" value={profile.email} />
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noDataText}>No profile data available</Text>
        )}
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 150,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
  avatarLabel: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginBottom: 32,
    gap: 16,
  },
  infoRow: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 22,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  logoutButton: {
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#DC2626",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  noDataText: {
    fontSize: 17,
    color: "#64748B",
    textAlign: "center",
    marginTop: 24,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  confirmButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  confirmButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
import { View, Text, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff8f3",
        }}
      >
        {/* Cute Deer ASCII Art */}
        <Text
          style={{
            fontSize: 80,
            marginBottom: 20,
          }}
        >
          🦌
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: "#333",
            marginBottom: 8,
          }}
        >
          Bucky
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 40,
          }}
        >
          Your Smart Grocery Assistant
        </Text>
        <Pressable
          onPress={() => router.push("/screens/welcome")}
          style={{
            marginTop: 20,
            paddingHorizontal: 40,
            paddingVertical: 12,
            backgroundColor: "#8B6F47",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </>
  );
}

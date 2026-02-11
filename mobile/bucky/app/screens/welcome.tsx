import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";

export default function WelcomeScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");

  const handleContinue = () => {
    if (name.trim() && budget.trim()) {
      router.push("/screens/shop");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Welcome",
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          padding: 20,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#333",
            }}
          >
            Welcome to Bucky
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#666",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Let us get you set up for your grocery shopping
          </Text>

          <View
            style={{
              width: "100%",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 8,
                color: "#333",
              }}
            >
              Your Name
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#333",
              }}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View
            style={{
              width: "100%",
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 8,
                color: "#333",
              }}
            >
              Budget ($)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#333",
              }}
              placeholder="Enter your budget"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={!name.trim() || !budget.trim()}
            style={{
              width: "100%",
              backgroundColor:
                name.trim() && budget.trim() ? "#4CAF50" : "#ccc",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function EditListScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = React.useRef<FlatList>(null);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setInputText("");
    }
  };

  const handleCheckmark = () => {
    router.push("/screens/results");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={{
        marginBottom: 12,
        alignItems: item.sender === "user" ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: item.sender === "user" ? "#4CAF50" : "#f0f0f0",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: item.sender === "user" ? "#fff" : "#333",
          }}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit list",
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                marginTop: 4,
              }}
            >
              Chat with Bucky to customize your grocery list
            </Text>
          </View>

          {/* Messages */}
          {messages.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#999",
                  textAlign: "center",
                }}
              >
                Start chatting to build your perfect grocery list
              </Text>
            </View>
          ) : (
            <FlatList
              ref={scrollViewRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                padding: 16,
              }}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}

          {/* Input Area */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: "#e0e0e0",
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 14,
                backgroundColor: "#f9f9f9",
                maxHeight: 100,
              }}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: inputText.trim() ? "#4CAF50" : "#ddd",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                ➤
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCheckmark}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#2196F3",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                ✓
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

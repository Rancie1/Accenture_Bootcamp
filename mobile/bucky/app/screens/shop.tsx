import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter, Stack } from "expo-router";

interface GroceryItem {
  id: string;
  name: string;
  emoji: string;
}

const GROCERY_ITEMS: GroceryItem[] = [
  { id: "1", name: "Milk", emoji: "🥛" },
  { id: "2", name: "Eggs", emoji: "🥚" },
  { id: "3", name: "Bread", emoji: "🍞" },
  { id: "4", name: "Butter", emoji: "🧈" },
  { id: "5", name: "Cheese", emoji: "🧀" },
  { id: "6", name: "Yogurt", emoji: "🥣" },
  { id: "7", name: "Apples", emoji: "🍎" },
  { id: "8", name: "Bananas", emoji: "🍌" },
];

interface CardProps {
  item: GroceryItem;
}

function GroceryCard({ item }: CardProps) {
  return (
    <View
      style={{
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
        }}
      >
        {item.name}
      </Text>
    </View>
  );
}

export default function ShopScreen() {
  const router = useRouter();

  const handleStartNewList = () => {
    router.push("/screens/edit-list");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Shop",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#333",
            }}
          >
            Grocery Essentials
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 24,
            }}
          >
            Popular items for your shopping list
          </Text>

          <FlatList
            scrollEnabled={false}
            data={GROCERY_ITEMS}
            renderItem={({ item }) => <GroceryCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        </ScrollView>

        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
          }}
        >
          <TouchableOpacity
            onPress={handleStartNewList}
            style={{
              backgroundColor: "#4CAF50",
              paddingVertical: 16,
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
              Start a New List
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

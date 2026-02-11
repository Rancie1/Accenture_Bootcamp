import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";

interface StoreResult {
  id: string;
  name: string;
  price: string;
  time: string;
  distance: string;
}

function StoreCard({ store }: { store: StoreResult }) {
  return (
    <View
      style={{
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#333",
            flex: 1,
          }}
        >
          {store.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#4CAF50",
          }}
        >
          {store.price}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 12,
              color: "#999",
              marginBottom: 4,
            }}
          >
            Time to arrival
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#333",
            }}
          >
            {store.time}
          </Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: "#999",
              marginBottom: 4,
            }}
          >
            Distance
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#333",
            }}
          >
            {store.distance}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();

  const stores: StoreResult[] = [
    {
      id: "1",
      name: "Fresh Market",
      price: "$45.99",
      time: "12 min",
      distance: "2.3 km",
    },
    {
      id: "2",
      name: "Local Grocers",
      price: "$52.50",
      time: "8 min",
      distance: "1.5 km",
    },
    {
      id: "3",
      name: "SaveMart Supermarket",
      price: "$48.75",
      time: "15 min",
      distance: "3.1 km",
    },
  ];

  const handleTryAgain = () => {
    router.back();
  };

  const handleSaveForLater = () => {
    router.push("/screens/shop");
  };

  const handleSubmit = () => {
    router.push("/screens/shop");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Results",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120,
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
            Best Deals Found
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginBottom: 24,
            }}
          >
            Here are the best places to pick up your groceries
          </Text>

          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleTryAgain}
            style={{
              backgroundColor: "#f0f0f0",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text
              style={{
                color: "#333",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveForLater}
            style={{
              backgroundColor: "#f0f0f0",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text
              style={{
                color: "#333",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Save for Later
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#4CAF50",
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
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

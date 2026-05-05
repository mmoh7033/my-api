import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
console.log("NEW UI LOADED 🔥");
export default function App() {
  const [data, setData] = useState<any>(null);
  const [mobile, setMobile] = useState("9999999998");

  const fetchData = () => {
    fetch("https://my-api-u62u.onrender.com/customer-services", {
      headers: {
        "client-id": "MMM-KHU123",
        mobile: mobile,
      },
    })
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>🚀 ServicePulse</Text>

      {/* Input Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          placeholder="Enter mobile number"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={fetchData}>
          <Text style={styles.btnText}>Fetch Data 🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Response */}
      {!data ? (
        <Text style={styles.message}>Loading...</Text>
      ) : data.message ? (
        <Text style={styles.message}>{data.message}</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>📦 Services</Text>

          {Object.entries(data.services).map(([key, value]: any) => (
            <View key={key} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.serviceName}>
                  {key.toUpperCase()}
                </Text>

                <Text
                  style={[
                    styles.status,
                    value.status === "active"
                      ? styles.active
                      : styles.inactive,
                  ]}
                >
                  {value.status}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.selectBtn}>
                  <Text style={styles.btnText}>Select</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn}>
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function App() {
  const [data, setData] = useState<any>(null);
  const [mobile, setMobile] = useState("9999999998");

  const fetchData = () => {
    fetch("https://my-api-u62u.onrender.com/customer-services", {
      headers: {
        "client-id": "MMM-KHU123",
        mobile: mobile,
      },
    })
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>🚀 ServicePulse</Text>

      {/* Input Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          placeholder="Enter mobile number"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={fetchData}>
          <Text style={styles.btnText}>Fetch Data 🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Response */}
      {!data ? (
        <Text style={styles.message}>Loading...</Text>
      ) : data.message ? (
        <Text style={styles.message}>{data.message}</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>📦 Services</Text>

          {Object.entries(data.services).map(([key, value]: any) => (
            <View key={key} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.serviceName}>
                  {key.toUpperCase()}
                </Text>

                <Text
                  style={[
                    styles.status,
                    value.status === "active"
                      ? styles.active
                      : styles.inactive,
                  ]}
                >
                  {value.status}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.selectBtn}>
                  <Text style={styles.btnText}>Select</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn}>
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
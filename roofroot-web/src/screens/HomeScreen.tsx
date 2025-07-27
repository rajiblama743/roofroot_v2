import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../components/Header';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="RoofRoot" />
      <View style={styles.content}>
        <Text style={styles.message}>RoofRoot Web App is working</Text>
        <Text style={styles.subtitle}>
          Your real estate platform is ready for development
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default HomeScreen; 
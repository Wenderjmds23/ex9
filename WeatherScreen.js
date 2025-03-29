// WeatherScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ImageBackground } from 'react-native';
import * as Location from 'expo-location';

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const getWeather = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada. Usando localização padrão.');
        fetchWeather(-23.5505, -46.6333); // São Paulo
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchWeather(latitude, longitude);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await response.json();
      setWeather(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando previsão do tempo...</Text>
      </View>
    );
  }

  const weatherCodeToText = (code) => {
    const map = {
      0: 'Céu limpo ☀️',
      1: 'Principalmente limpo ️',
      2: 'Parcialmente nublado ⛅',
      3: 'Nublado ☁️',
      45: 'Nevoeiro ️',
      48: 'Nevoeiro com gelo ️',
      51: 'Garoa fraca ️',
      61: 'Chuva fraca ️',
      80: 'Pancadas de chuva ️',
      95: 'Tempestade ⛈️',
    };
    return map[code] || 'Tempo indefinido';
  };

  return (
    <ImageBackground source={require('./assets/black-rain-abstract-dark-power (1).jpg')} style={styles.background}>
      <View style={styles.content}>
        <Text style={styles.title}>Previsão do Tempo</Text>
        <Text style={styles.info}>Temperatura atual: {weather.current_weather.temperature}°C</Text>
        <Text style={styles.info}>
          Condição: {weatherCodeToText(weather.current_weather.weathercode)}
        </Text>
        <Text style={styles.info}>
          Vento: {weather.current_weather.windspeed}°km/h
        </Text>
        <Text style={styles.subTitle}>Próximas horas:</Text>
        <FlatList
          data={weather.hourly.time.slice(0, 12)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.hourItem}>
              <Text style={styles.hourText}>{item.slice(11, 16)}h</Text>
              <Text style={styles.hourTemp}>{weather.hourly.temperature_2m[index]}°C</Text>
              <Text style={styles.hourWind}>{weather.hourly.windspeed_10m[index]}km/h</Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        <Text style={styles.subTitle}>Próximos dias:</Text>
        <FlatList
          data={weather.daily.time}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.dayItem}>
              <Text style={styles.dayText}>{item.slice(0, 10)}</Text>
              <Text style={styles.dayTemp}>Max: {weather.daily.temperature_2m_max[index]}°C</Text>
              <Text style={styles.dayTemp}>Min: {weather.daily.temperature_2m_min[index]}°C</Text>
              <Text style={styles.dayCondition}>{weatherCodeToText(weather.daily.weathercode[index])}</Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajusta a imagem para cobrir o fundo
  },
  content: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fundo semi-transparente para melhor legibilidade
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  info: {
    fontSize: 18,
    marginBottom: 6,
    color: '#fff',
  },
  subTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  hourItem: {
    padding: 12,
    margin: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  hourText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  hourTemp: {
    color: '#fff',
  },
  hourWind: {
    color: '#fff',
  },
  dayItem: {
    padding: 12,
    margin: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    width: 150,
  },
  dayText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  dayTemp: {
    color: '#fff',
  },
  dayCondition: {
    color: '#fff',
  },
});
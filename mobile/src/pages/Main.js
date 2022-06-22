import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../services/socket';

function Main({ navigation }) {
  const [devs, setDevs] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [techs, setTechs] = useState('');

  useEffect(() => {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true,
        });

        const { latitude, longitude } = coords;

        setCurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        })
      }
    }

    loadInitialPosition();
  }, []);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);

  function setupWebsocket() {
    disconnect();

    const { latitude, longitude } = currentRegion;

    connect(
      latitude,
      longitude,
      techs,
    );
  }

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    const response = await api.get('/search', {
      params: {
        latitude,
        longitude,
        techs
      }
    });
    
    setDevs(response.data.devs);
    setupWebsocket();
  }

  function handleRegionChanged(region) {
    setCurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return (
    <>
      <MapView 
        onRegionChangeComplete={handleRegionChanged} 
        initialRegion={currentRegion} 
        style={styles.map}
      >
        {devs.map(dev => (
          <Marker 
            key={dev._id}
            coordinate={{ 
              longitude: dev.location.coordinates[0],
              latitude: dev.location.coordinates[1], 
            }}
          >
            <Image 
              style={styles.avatar} 
              source={{ uri: dev.avatar_url }}
            />

            <Callout onPress={() => {
              navigation.navigate('Profile', { github_username: dev.github_username });
            }}>
              <View style={styles.callout}>
                <Text style={styles.devName}>{dev.name}</Text>
                <Text style={styles.devBio}>{dev.bio}</Text>
                <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {/* <Marker
            coordinate={{ 
              longitude: -34.97051,
              latitude: -8.11021, 
            }}
          >
            <Image 
              style={styles.avatar} 
              source={{ uri: "https://avatars.githubusercontent.com/u/67799522?v=4" }}
            />

            <Callout onPress={() => {
              navigation.navigate('Profile', { github_username: 'Dev-Paulo-Henrique' });
            }}>
              <View style={styles.callout}>
                <Text style={styles.devName}>Paulo Santos</Text>
                <Text style={styles.devBio}>Recife, 18</Text>
                <Text style={styles.devTechs}>Usuário da Safe Woman desde Abril</Text>
              </View>
            </Callout>
          </Marker>
        <Marker
            coordinate={{ 
              longitude: -34.96051,
              latitude: -8.12321, 
            }}
          >
            <Image 
              style={styles.avatar} 
              source={{ uri: "https://instagram.frec43-1.fna.fbcdn.net/v/t51.2885-19/280558890_1643318082714634_4977609424545019575_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.frec43-1.fna.fbcdn.net&_nc_cat=110&_nc_ohc=-zpftb-Yr5kAX-DlgBa&edm=ALbqBD0BAAAA&ccb=7-5&oh=00_AT-gMYQQjnL2Lom3uuUGjc9bWTj-BcWHr2jDUXDz6vh5cA&oe=62BADB44&_nc_sid=9a90d6" }}
            />

            <Callout onPress={() => {
              navigation.navigate('Profile', { github_username: 'Dev-Paulo-Henrique' });
            }}>
              <View style={styles.callout}>
                <Text style={styles.devName}>Geovana Evelyn</Text>
                <Text style={styles.devBio}>Jaboatão dos Guararapes, 17</Text>
                <Text style={styles.devTechs}>Usuário da Safe Woman desde Março</Text>
              </View>
            </Callout>
          </Marker> */}
      </MapView>
      <View style={styles.searchForm}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar locais seguros..."
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          value={techs}
          onChangeText={setTechs}
        />

        <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
          <MaterialIcons name="my-location" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: '#FFF'
  },

  callout: {
    width: 260,
  },

  devName: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  devBio: {
    color: '#666',
    marginTop: 5,
  },

  devTechs: {
    marginTop: 5,
  },

  searchForm: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row',
  },

  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    color: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    elevation: 2,
  },

  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#D53F8C',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
})

export default Main;
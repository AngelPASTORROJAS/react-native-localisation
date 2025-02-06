import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface PersonLocation {
  id: string;
  coords: {
    latitude: number;
    longitude: number;
  };
}

const MapComponent: React.FC = () => {
  const [personLocations, setPersonLocations] = useState<PersonLocation[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      // Simuler la position de deux personnes
      const person1 = { id: 'person1', coords: { latitude: 48.8566, longitude: 2.3522 } };
      const person2 = { id: 'person2', coords: { latitude: 48.85795530833568, longitude: 2.352908103193448 } };
      setPersonLocations([person1, person2]);

      // Centrer la carte sur la première personne
      updateRegion(person1.coords);

      // Simuler le mouvement des personnes
      const interval = setInterval(() => {
        setPersonLocations(prevLocations => 
          prevLocations.map(person => ({
            ...person,
            coords: {
              latitude: person.coords.latitude + (Math.random() - 0.5) * 0.001,
              longitude: person.coords.longitude + (Math.random() - 0.5) * 0.001,
            }
          }))
        );
      }, 5000);

      return () => clearInterval(interval);
    })();
  }, []);

  const updateRegion = (coords: { latitude: number; longitude: number }) => {
    setRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
      >
        {personLocations.map(person => (
          <Marker
            key={person.id}
            coordinate={person.coords}
            title={`Personne ${person.id}`}
            description={`Latitude: ${person.coords.latitude}, Longitude: ${person.coords.longitude}`}
            pinColor={person.id === 'person1' ? 'red' : 'blue'}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapComponent;

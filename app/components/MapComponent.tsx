import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface PersonLocation {
  id: string;
  name: string;
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
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const person1 = { id: 'person1', name: 'Alice', coords: { latitude: 48.8566, longitude: 2.3522 } };
      const person2 = { id: 'person2', name: 'Bob', coords: { latitude: 48.85795530833568, longitude: 2.352908103193448 } };
      setPersonLocations([person1, person2]);
      setSelectedPerson(person1.id);
      updateRegion(person1.coords);

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

  const centerMapOnPerson = (personId: string) => {
    const person = personLocations.find(p => p.id === personId);
    if (person) {
      setSelectedPerson(personId);
      mapRef.current?.animateToRegion({
        latitude: person.coords.latitude,
        longitude: person.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
      >
        {personLocations.map(person => (
          <Marker
            key={person.id}
            coordinate={person.coords}
            title={person.name}
            description={`Latitude: ${person.coords.latitude.toFixed(4)}, Longitude: ${person.coords.longitude.toFixed(4)}`}
            pinColor={person.id === 'person1' ? 'red' : 'blue'}
          />
        ))}
      </MapView>
      <View style={styles.overlay}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {personLocations.map(person => (
            <TouchableOpacity
              key={person.id}
              style={[styles.personButton, selectedPerson === person.id && styles.selectedButton]}
              onPress={() => centerMapOnPerson(person.id)}
            >
              <Text style={styles.personButtonText}>{person.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
  },
  personButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#0056b3',
  },
  personButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapComponent;

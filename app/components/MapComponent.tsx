import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Region, Marker, Polyline } from 'react-native-maps';
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
  role: 'deliverer' | 'customer';
}

interface DeliveryState {
  status: 'pending' | 'in_progress' | 'completed';
  route: { latitude: number; longitude: number }[];
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
  const [deliveryState, setDeliveryState] = useState<DeliveryState>({
    status: 'pending',
    route: [],
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const deliverer = { id: 'person1', name: 'Livreur', coords: { latitude: 48.8566, longitude: 2.3522 }, role: 'deliverer' as const };
      const customer = { id: 'person2', name: 'Client', coords: { latitude: 48.8606, longitude: 2.3376 }, role: 'customer' as const };
      setPersonLocations([deliverer, customer]);
      setSelectedPerson(deliverer.id);
      updateRegion(deliverer.coords);

      const interval = setInterval(() => {
        setPersonLocations(prevLocations => 
          prevLocations.map(person => ({
            ...person,
            coords: person.role === 'deliverer' ? simulateMovement(person.coords) : person.coords,
          }))
        );
      }, 5000);

      return () => clearInterval(interval);
    })();
  }, []);

  useEffect(() => {
    if (deliveryState.status === 'in_progress') {
      const deliverer = personLocations.find(p => p.role === 'deliverer');
      const customer = personLocations.find(p => p.role === 'customer');
      if (deliverer && customer) {
        const newRoute = calculateRoute(deliverer.coords, customer.coords);
        setDeliveryState(prev => ({ ...prev, route: newRoute }));
      }
    }
  }, [personLocations, deliveryState.status]);

  const simulateMovement = (coords: { latitude: number; longitude: number }) => ({
    latitude: coords.latitude + (Math.random() - 0.5) * 0.001,
    longitude: coords.longitude + (Math.random() - 0.5) * 0.001,
  });

  const calculateRoute = (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
    // Ceci est une simulation simple. Dans une application réelle, vous utiliseriez un service de routage.
    return [start, end];
  };

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

  const startDelivery = () => {
    setDeliveryState({ status: 'in_progress', route: [] });
  };

  const completeDelivery = () => {
    setDeliveryState({ status: 'completed', route: [] });
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
            description={`${person.role === 'deliverer' ? 'Livreur' : 'Client'}`}
            pinColor={person.role === 'deliverer' ? 'red' : 'blue'}
          />
        ))}
        {deliveryState.status === 'in_progress' && (
          <Polyline
            coordinates={deliveryState.route}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
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
        <View style={styles.deliveryControls}>
          {deliveryState.status === 'pending' && (
            <TouchableOpacity style={styles.deliveryButton} onPress={startDelivery}>
              <Text style={styles.deliveryButtonText}>Commencer la livraison</Text>
            </TouchableOpacity>
          )}
          {deliveryState.status === 'in_progress' && (
            <TouchableOpacity style={styles.deliveryButton} onPress={completeDelivery}>
              <Text style={styles.deliveryButtonText}>Terminer la livraison</Text>
            </TouchableOpacity>
          )}
          {deliveryState.status === 'completed' && (
            <Text style={styles.deliveryStatus}>Livraison terminée</Text>
          )}
        </View>
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
  deliveryControls: {
    marginTop: 10,
    alignItems: 'center',
  },
  deliveryButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  deliveryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deliveryStatus: {
    color: '#28a745',
    fontWeight: 'bold',
  },
});

export default MapComponent;

// __tests__/MapComponent.integration.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MapComponent from '../components/MapComponent';

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View,
  };
});

describe('MapComponent Integration', () => {
  it('starts and completes delivery', async () => {
    const { getByText } = render(<MapComponent />);
    
    fireEvent.press(getByText('Commencer la livraison'));
    await waitFor(() => expect(getByText('Terminer la livraison')).toBeTruthy());
    
    fireEvent.press(getByText('Terminer la livraison'));
    await waitFor(() => expect(getByText('Livraison terminée')).toBeTruthy());
  });
});

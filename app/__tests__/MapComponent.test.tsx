// __tests__/MapComponent.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
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

describe('MapComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MapComponent />);
    expect(getByText('Livreur')).toBeTruthy();
    expect(getByText('Client')).toBeTruthy();
  });
});



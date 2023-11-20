import { writable } from 'svelte/store';

// Store for the map coordinates
const coordinates = writable({ latitude: 0, longitude: 0 });

// Method to update coordinates
export const setCoordinates = (lat: number, lng: number) => {
  coordinates.set({ latitude: lat, longitude: lng });
};

// Method to get geolocation
export const getGeoLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
};

export default coordinates;

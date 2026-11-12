import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { TrafficSignal, CongestionSegment, AmbulanceData } from '../types';

export function useCitySocket(cityId: string) {
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [segments, setSegments] = useState<CongestionSegment[]>([]);
  const [ambulance, setAmbulance] = useState<AmbulanceData | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    setSocketInstance(socket);

    // Join city-specific room
    socket.emit('city:join', { cityId });

    socket.on('traffic-feed-update', (data) => {
      if (data.signals) setSignals(data.signals);
      if (data.segments) setSegments(data.segments);
      if (data.ambulance) setAmbulance(data.ambulance);
    });

    socket.on('ambulance:location', (data) => {
      setAmbulance((prev: AmbulanceData | null) => prev ? { ...prev, currentLocation: data.location, speedKmph: data.speedKmph } : null);
    });

    return () => {
      socket.emit('city:leave', { cityId });
      socket.disconnect();
    };
  }, [cityId]);

  return { signals, segments, ambulance, socket: socketInstance };
}

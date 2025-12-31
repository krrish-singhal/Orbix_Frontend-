
import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            setIsConnected(true);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('❌ Socket reconnection error:', error);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
        });

        // Global error handler
        newSocket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
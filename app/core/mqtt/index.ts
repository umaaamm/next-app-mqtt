import type { Message, MQTTError } from 'paho-mqtt';
import { Client, Message as PahoMessage } from 'paho-mqtt';

import { PASSWORD_MQTT, PUBLIC_BROKER_URL, USERNAME_MQTT } from '../../constants/constants';


const ports = 8884;
const hosts = `wss://${PUBLIC_BROKER_URL}:${ports}/mqtt`;
const clientId = USERNAME_MQTT;
const credentials = PASSWORD_MQTT;

export const mqttClient = new Client(hosts, clientId);

type ConnectToBrokerParams = {
  topic: string;
  onMessageArrived: (message: Message) => void;
  onConnectionLost: (error: MQTTError) => void;
  onConnectionSuccess?: () => void;
  onConnectionFailure?: (error: MQTTError) => void;
};

export const connectToBroker = ({
  topic,
  onMessageArrived,
  onConnectionLost,
  onConnectionSuccess,
  onConnectionFailure,
}: ConnectToBrokerParams) => {
  // Set up MQTT client handlers
  mqttClient.onConnectionLost = onConnectionLost;

  if (onMessageArrived) mqttClient.onMessageArrived = onMessageArrived;

  // Connect to MQTT broker
  mqttClient.connect({
    useSSL: true,
    userName: credentials,
    password: credentials,
    onSuccess: () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(topic, {
        qos: 0,
        onSuccess: () => {
          console.log(`Subscribed to topic: ${topic}`);
          onConnectionSuccess?.();
        },
        onFailure: (error) => {
          console.error('Failed to subscribe:', error.errorMessage);
          onConnectionFailure?.(error);
        },
      });
    },
    onFailure: (error) => {
      console.error('Connection failed:', error.errorMessage);
      onConnectionFailure?.(error);
    },
  });
};


export const publishMessage = ({
  topic,
  payload,
  qos = 0,
  retained = false,
}: {
  topic: string;
  payload: string;
  qos?: 0 | 1 | 2;
  retained?: boolean;
}) => {
  if (!mqttClient.isConnected()) {
    console.warn('⚠️ MQTT client is not connected. Message not sent.');
    return;
  }

  const message = new PahoMessage(payload);
  message.destinationName = topic;
  message.qos = qos;
  message.retained = retained;

  mqttClient.send(message);
  console.log(`📤 Published to ${topic}:`, payload);
};
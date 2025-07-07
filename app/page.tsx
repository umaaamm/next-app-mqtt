'use client';

import { Code } from "@heroui/code";

import { title, subtitle } from "@/components/primitives";
import { Card, CardHeader, CardBody, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/react";
import { useEffect, useState } from "react";
import { connectToBroker } from "./core/mqtt";
import { PUBLIC_TOPIC_ID } from "./constants/constants";
import axios from "axios";
import { setInterval } from "node:timers";
import SensorTable from "./sensorTable";

export interface Sensor {
  sensorSuhuAir: string;
  sensorSuhu: string;
  sensorPPM: string;
  sensorPh: string;
  lastUpdate: string;
}

const renderCard = (title: string, description: string, value: string) => {
  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">{title}</p>
          <p className="text-small text-default-500">{description}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex justify-right items-right text-right font-bold">
        <p>{value}</p>
      </CardBody>
    </Card>
  )
};

export default function Home() {
  const [dataBE, setDataBE] = useState<Sensor[] | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDataFromBe = async () => {
    setLoading(true);
    axios.get<Sensor[]>('http://localhost:3000/sensor')
      .then((res) => {
        setDataBE(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error('Gagal mengambil data sensor:', err);
      });
  }

  useEffect(() => {
    setInterval(() => {
      getDataFromBe();
    }, 5000);
  }, []);

  useEffect(() => {
    connectToBroker({
      topic: PUBLIC_TOPIC_ID,
      onMessageArrived: (message) => {
        console.log('Received message:', message.payloadString);
        setSensor(JSON.parse(message.payloadString));
      },
      onConnectionLost: (error) => {
        console.error('Connection lost:', error.errorMessage);
      },
      onConnectionSuccess: () => {
        console.log('Connected to MQTT broker');
        setIsConnected(true)
      },
      onConnectionFailure: (error) => {
        console.error('Connection failed:', error.errorMessage);
        setIsConnected(false)
      },
    });
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Hidroponik</span>
        <span className={subtitle()}>Data Realtime dari Hidroponik</span>
        <span>
          {isConnected ? <Code color="success">Connected!</Code> : <Code color="danger">Disconnected!</Code>}
        </span>
      </div>

      <div className="flex gap-3">
        {renderCard("Sensor", "Suhu air", `${sensor?.sensorSuhuAir ?? "-"} C`)}
        {renderCard("Sensor", "Suhu Ruangan", `${sensor?.sensorSuhu ?? "-"} C`)}
        {renderCard("Sensor", "PPM", `${sensor?.sensorPPM ?? "-"} ppm`)}
        {renderCard("Sensor", "pH", `${sensor?.sensorPh ?? "-"} pH`)}
      </div>
      <span>
        {loading ? <Code color="warning">Loading...</Code> : null}
      </span>
      <div className="mt-8">
        {SensorTable({ data: dataBE ?? [] })}
      </div>
    </section>
  );
}

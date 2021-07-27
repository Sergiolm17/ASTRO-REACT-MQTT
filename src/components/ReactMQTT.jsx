import { useState, useEffect } from "react";
import mqtt from "mqtt/dist/mqtt.min";

export default function ReactCounter() {
  const [client, setClient] = useState(null);
  const [connectStatus, setConnectStatus] = useState("Connect");
  const [isSubed, setIsSub] = useState(false);
  const [payload, setPayload] = useState({});

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus("Connecting");
    setClient(mqtt.connect(host, mqttOption));
  };
  useEffect(() => {
    if (client) {
      console.log(client);
      client.on("connect", () => {
        setConnectStatus("Connected");
      });
      client.on("error", (err) => {
        console.error("Connection error: ", err);
        client.end();
      });
      client.on("reconnect", () => {
        setConnectStatus("Reconnecting");
      });
      client.on("message", (topic, message) => {
        const payload = { topic, message: message.toString() };
        setPayload(payload);
      });
    }
  }, [client]);
  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription;
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log("Subscribe to topics error", error);
          return;
        }
        setIsSub(true);
      });
    }
  };
  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic } = subscription;
      client.unsubscribe(topic, (error) => {
        if (error) {
          console.log("Unsubscribe error", error);
          return;
        }
        setIsSub(false);
      });
    }
  };
  return (
    <div id="react" className="counter">
      <button
        onClick={() =>
          mqttConnect("mqtt://mqtt.flespi.io", {
            //port: 1883,
            clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
            username:
              "FlespiToken WldwjLB4BQgGBGmZYtQsz0DYh1R4Dn0ow3KFE9y3PCze7J4V3IbqyEcDtTyX4obq",
          })
        }
      >
        {connectStatus}
      </button>
      {!isSubed ? (
        <button
          onClick={() =>
            mqttSub({
              topic: "feeds/onoff",
              qos: 0,
            })
          }
        >
          mqttSub
        </button>
      ) : (
        <button
          onClick={() =>
            mqttUnSub({
              topic: "feeds/onoff",
            })
          }
        >
          mqttUnSub
        </button>
      )}
      {isSubed && JSON.stringify(payload)}
    </div>
  );
}

import { config } from 'dotenv';
import aedes from 'aedes';
import net from 'net';

config();
const broker = aedes();

// Auth
broker.authenticate = (client, username, password, callback) => {
  console.log('client', username);
  client.username = username;
  if (
    username === process.env.MQTT_CLIENT_USERNAME &&
    password.toString() === process.env.MQTT_CLIENT_PASSWORD
  ) {
    callback(null, true);
  } else {
    console.log('Unauthorised');
    callback(null, false);
  }
};

// broker.authorizePublish = (client, packet, callback) => {
//   // console.log(client)
// }

const server = net.createServer(broker.handle);

const PORT = process.env.BROKER_PORT || 1883;

server.listen(PORT, () => {
  console.log(`MQTT broker started on port ${PORT}`);
});

// On publish
broker.on('publish', (packet, client) => {
  // console.log('Message: ', packet.payload);
  // console.log('New publish on topic:', packet.topic);

  if (!client || !client.username) return;

  try {
    const payload = JSON.parse(packet.payload.toString());

    // On new-fire topic
    if (packet.topic === 'new-fire') {
      const fire = payload.fire[0];
      const timestamp = fire.timestamp;
      const latitude = fire.latitude;
      const longitude = fire.longitude;

      // Add fire data to database
      console.log(fire)
    }
  } catch (error) {
    console.error(error);
  }
});


// Firmware update
const publishFirmareUpdate = (deviceType, firmwareStamp) => {
  broker.publish(
    {
      topic: `firmware/update/${deviceType}`,
      payload: firmwareStamp,
      qos: 1,
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('[INFO] New firmware published');
      }
    }
  );
};

export { publishFirmareUpdate };

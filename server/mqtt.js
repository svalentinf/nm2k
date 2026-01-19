import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://192.168.1.90:1883');

client.on('connect', () => {
    console.log('Connected to Venus MQTT');
    client.subscribe('#'); // ALL messages
});

client.on('message', (topic, payload) => {
    try {
        const msg = payload.toString();
        console.log(topic, msg);
    } catch (e) {
        console.error('Parse error', e);
    }
});
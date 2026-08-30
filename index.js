const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/send-push', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) return res.status(400).send('Missing fields');

  // ОБНОВЛЕННЫЙ, "АГРЕССИВНЫЙ" ПУШ ДЛЯ XIAOMI/POCO
  const message = {
    notification: { 
      title: title, 
      body: body 
    },
    token: token,
    android: {
      priority: 'high', // Заставляем телефон проснуться
      notification: {
        channelId: 'Lumo_Chat_Channel', // Тот самый канал из нашего Android-кода
        sound: 'default'
      }
    }
  };

  try {
    await admin.messaging().send(message);
    res.status(200).send({ success: true, message: 'Push sent!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.get('/ping', (req, res) => res.send('Pong!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

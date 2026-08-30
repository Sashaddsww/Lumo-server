const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// 1. Авторизация в Firebase через переменную окружения (настроим на Render)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 2. Эндпоинт для отправки пуша (Сюда будет стучаться наш Андроид)
app.post('/send-push', async (req, res) => {
  const { token, title, body } = req.body;
  if (!token || !title || !body) return res.status(400).send('Missing fields');

  const message = {
    notification: { title, body },
    token: token
  };

  try {
    await admin.messaging().send(message);
    res.status(200).send({ success: true, message: 'Push sent!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// 3. Эндпоинт-пинг для UptimeRobot (чтобы сервер не засыпал)
app.get('/ping', (req, res) => {
  res.send('Pong! Lumo Server is alive.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
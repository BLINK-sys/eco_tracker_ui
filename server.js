import express from 'express';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Сжатие для лучшей производительности
app.use(compression());

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y', // Кэширование на год
  etag: true
}));

// SPA роутинг - все маршруты ведут к index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'dist')}`);
});

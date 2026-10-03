import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import projectRoutes from './routes/projectRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
const app = express();
const frontendOrigins = new Set(
	(process.env.FRONTEND_URL || 'http://localhost:5173')
		.split(',')
		.map((origin) => origin.trim().replace(/\/$/, ''))
		.filter(Boolean),
);
app.use(helmet());
app.use(cors({
	origin(origin, callback) {
		if (!origin || frontendOrigins.has(origin.replace(/\/$/, ''))) return callback(null, true);
		return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
	},
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.get('/api/health', (req,res) => res.json({ success: true, message: 'Impact Construction API is running' }));
app.use('/api/projects', projectRoutes); app.use('/api/settings', settingsRoutes); app.use('/api/admin', adminRoutes); app.use('/api', publicRoutes); app.use(errorHandler);
app.listen(Number(process.env.PORT || 5001), () => console.log(`Impact Construction API listening on ${process.env.PORT || 5001}`));

import express from "express";
import cors from "cors";
import { router as apiRoutes } from "./routes/index.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { limiter } from "./middlewares/rateLimiter.js";

export const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://jsd-react-assessment-solution-psi.vercel.app"
  ],
  credentials: true, // Allow cookies to be sent
};
app.set("trust proxy", 1); // Trust first proxy

//global middleware
app.use(helmet());

app.use(cors(corsOptions));

app.use(limiter)

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", apiRoutes);

//Catch-all for 404 Not Found
app.use((req, res, next) => {
  const error = new Error(`Not Found ${req.method} ${req.originalUrl}`);
  error.name = "NotFoundError";
  error.status = 404;
  next(error);
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // log error (dev)
  console.error(err.stack);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    name: err.name || "Error",
    message: err.message || "Internal Server Error",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });
});

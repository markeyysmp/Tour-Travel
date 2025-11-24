import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { jwtMiddleware } from "./controller/authen/jwt";
import { auth } from "./controller/authen/authen";
import "./passport";


export const app = express();
app.set("trust proxy", true);

app.use(bodyParser.json());
app.use(bodyParser.text());

const allowedOrigins = [
  "http://localhost:4200", 'http://10.21.210.234::4200'// local dev frontend
];

app.use(cors());
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Check if the origin of the request is in our whitelist
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true); // Allow the request
//       } else {
//         callback(new Error("Not allowed")); // Deny the request
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );


// Register + login
app.use("/api/auth", auth);

app.use(jwtMiddleware, (err: any, req: any, res: any, next: any) => {
  if (err.name === "UnauthorizedError") {
    res.status(err.status).send({ message: err.message });
    return;
  }
  next();
});

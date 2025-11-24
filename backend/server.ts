
import http from "http";
import { app } from "./app";
import express from "express";


const port = 3000;
const server = http.createServer(app);

app.use("/uploads", express.static("uploads"));


server.listen(port, () => {
    console.log(`Server is started on port ${port}`);
},).on("error", (error) => {
    console.error(error);
})
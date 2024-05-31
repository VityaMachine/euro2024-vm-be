const express = require("express");
const cors = require("cors");
require("dotenv").config();

const UserModel = require("./api/models/user.model");

const authRouter = require("./api/routers/auth.router");
const userRouter = require("./api/routers/user.router");

class Server {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initSequelizeModels();
    this.initRoutes();
    this.intiErrorHandlers();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({}));
  }

  initSequelizeModels() {
    UserModel.sync();
    // UserModel.sync({force: true});
  }

  initRoutes() {
    this.server.use("/users", userRouter);
    this.server.use("/auth", authRouter);
  }

  intiErrorHandlers() {
    this.server.use((req, res) => {
      res.status(404).json({ message: "Not found" });
    });

    this.server.use((err, req, res, next) => {
      res.status(500).json({ message: err.message });
    });
  }

  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log(`Server started at port: ${process.env.PORT}`);
    });
  }
}

module.exports = Server;

import express from "express";
import cors from "cors";
import { dashboard, event, subscription, user } from "./src/routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", user);
app.use("/event", event);
app.use("/dashboard", dashboard);
app.use("/subscription", subscription);

/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  console.log("error at handler middleware");
  console.log(err);
  if (err.name === "UnauthorizedError") {
    return res.status(401).send(err.message);
  }
  if (err.name === "NotFoundError") {
    return res.status(404).send(err.message);
  }
  if (err.name === "ValidationError") {
    return res.status(403).send(err);
  }
  if (err.name === "ForbiddenError") {
    return res.status(403).send(err.message);
  }
  return res.status(500).send({
    msg: "Internal server error"
  });
});

export default app;

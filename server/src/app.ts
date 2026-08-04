import express from "express";
import type { Express } from "express";

export function createApplication(): Express {
  const app = express();

  return app;
}

// This file is used by Prisma 7 for configuration.
// Learn more: https://pris.ly/d/prisma7-config
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

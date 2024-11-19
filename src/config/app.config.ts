import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
    port: process.env.APP_PORT,
    jwtSecret: process.env.JWT_SECRET
}));
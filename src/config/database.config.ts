import { registerAs } from "@nestjs/config";
import * as dotenv from 'dotenv';
dotenv.config();
export default  registerAs("database",()=>({
    type: 'mysql'as "mysql",
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME ,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: process.env.TYPEORM_SYNCRONIZE === "true",
}));
import { load } from "@std/dotenv";

const envConfig = await load();
const defaultPort = 8000;

class Config {
  public app: { port: number };

  static createConfig() {
    return new Config(envConfig);
  }

  constructor(envConfig: Record<string, string>) {
    this.app = {
      port: Number(envConfig["PORT"] || defaultPort),
    };
  }
}

export default Config.createConfig();

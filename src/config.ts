import { load } from "@std/dotenv";

const envConfig = await load();
const defaultPort = 8000;

class Config {
  public app: { port: number };
  public cryptoService: {
    key: string;
    iv: string;
    mode: string;
  };

  static createConfig() {
    return new Config(envConfig);
  }

  constructor(envConfig: Record<string, string>) {
    this.app = {
      port: Number(envConfig["PORT"] || defaultPort),
    };
    this.cryptoService = {
      key: envConfig["CRYPTO_SERVICE_KEY"],
      iv: envConfig["CRYPTO_SERVICE_IV"],
      mode: envConfig["CRYPTO_SERVICE_MODE"],
    };
  }
}

export default Config.createConfig();

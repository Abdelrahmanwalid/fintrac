
import AppConfig from './app.config.json';

class Config {
    constructor() {
        this.APP_MODE = AppConfig.APP_MODE;
        this.SERVER_URL = AppConfig.SERVER_URL[this.APP_MODE]
    }

    get BASE_ENDPOINT() {
        return this.SERVER_URL;
    }
}

export default new Config();
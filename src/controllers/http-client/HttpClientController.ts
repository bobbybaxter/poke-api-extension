import axios from 'axios';

export default class HttpClientController {
  constructor() {}

  async get<T>(url: string) {
    return await axios.get<T>(url);
  }
}

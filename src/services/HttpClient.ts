import axios from 'axios';

export default class HttpClient {
  constructor() {}

  async get<T>(url: string) {
    return await axios.get<T>(url);
  }
}

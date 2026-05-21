import type { IpInfoModel } from '@/models';
import axios from 'axios'

const geoapifyApi = axios.create({
  baseURL: 'https://api.geoapify.com/v1',
  timeout: 2000,
});
geoapifyApi.interceptors.request.use(config => {
  if(!config.params) {
    config.params = {}
  }
  config.params.apiKey = import.meta.env.VITE_GEOAPIFY_KEY
  return config;
})

export const GeoapifyApiService = {
  getIpInfo() {
    const url = 'ipinfo';
    return Promise.resolve<IpInfoModel>({
      location: {latitude: 49.8004, longitude: 30.1285}
    })
    return geoapifyApi.get<IpInfoModel>(url).then(res => res.data)
  },
}

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto = require('crypto');
import * as dotenv from 'dotenv';
import axios, { AxiosInstance } from 'axios';
import { Console } from 'node:console';

dotenv.config();

const ACCESS_KEY: string = process.env.ACCESS_KEY || '';
const SECRET_KEY: string = process.env.SECRET_KEY || '';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://api.upbit.com',
});

const generateAuthorizationToken = (params: any | undefined): string => {
  const payload: {
    access_key: string;
    nonce: string;
    query_hash?: string;
    query_hash_alg?: string;
  } = {
    access_key: ACCESS_KEY,
    nonce: uuidv4(),
  };

  if (params) {
    let query: string = '';

    // Make querystring
    for (const key in params) {
      if (typeof params[key] === 'object' && 'length' in params[key]) {
        // If value is an array
        for (const value of params[key]) {
          query += `${key}[]=${value}&`;
        }
      } else {
        query += `${key}=${params[key]}`;
      }
    }

    query = query.substring(0, query.length - 1);
    const hash = crypto.createHash('sha512');
    const queryHash = hash.update(query, 'utf-8').digest('hex');

    payload.query_hash = queryHash;
    payload.query_hash_alg = 'SHA512';
  }

  const jwtToken = jwt.sign(payload, SECRET_KEY);
  const authorizationToken = `Bearer ${jwtToken}`;

  return authorizationToken;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const params: any[] = config.params ? config.params : config.data;
    const authorizationToken = generateAuthorizationToken(params);

    config.headers.Authorization = authorizationToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

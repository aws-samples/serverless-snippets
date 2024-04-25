// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Snippet uses the ioredis library, but other redis clients will also work
import { Cluster } from 'ioredis';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { formatUrl } from '@aws-sdk/util-format-url';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

let redisClient: Cluster;

/**
 * MemoryDB (and Elasticache) with Redis v7.0+ offer IAM authentication. In this mode, pass
 * the username with a presigned URL as the password. This function generates the presigned
 * URL, which acts as an authentication token. Note that this token expires after 15 minutes
 * and will need to be refreshed.
 * 
 * Snippet assumes that cache parameters are included as environment variables. Note that
 * cache cluster name is distinct from endpoint.
 */

const getAuthToken = async(): Promise<string> => {
    const signer = new SignatureV4({
      service: 'memorydb',
      region: process.env['AWS_REGION'],
      credentials: fromNodeProviderChain(),
      sha256: Sha256
    });
  
    const protocol = 'https';
  
    const presigned = await signer.presign({
      method: 'GET',
      protocol,
      hostname: process.env['CACHE_CLUSTER_NAME'],
      path: '/',
      query: {
        Action: 'connect',
        User: process.env['CACHE_USERNAME']
      },
      headers: {
        host: process.env['CACHE_CLUSTER_NAME']
      }
    }, { expiresIn: 900 });
  
    const token = formatUrl(presigned).replace(`${protocol}://`, '');
  
    return token;
  };

  redisClient = new Cluster(
    [
      {
        host: process.env['CACHE_ENDPOINT'],
        port: parseInt(process.env['CACHE_PORT']), // usually 6379
      }
    ],
    {
      // dnsLookup resolves an issue with TLS encryption and MemoryDB clusters
      // see https://github.com/redis/ioredis#special-note-aws-elasticache-clusters-with-tls
      dnsLookup: (address, callback) => callback(null, address),
      redisOptions: {
        username: process.env['CACHE_USERNAME'],
        password: await getAuthToken(),
        tls: {}
      }
    }
  );
}

// set a value in the cache, see ioredis docs for other options
await redisClient.set("foo", "bar");

// get the value back
const result = redisClient.get("foo");
/* eslint no-param-reassign: 0, indent: 0 */
import { Api, JsonRpc } from 'eosjs';
import ecc from 'eosjs-ecc';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';

import { AUTOLOGIN_DATA } from 'containers/Login/constants';

import {
  BLOCKCHAIN_NAME,
  DEFAULT_EOS_PERMISSION,
  SCATTER_APP_NAME,
  EOS_IS_NOT_INIT,
  LOCAL_STORAGE_BESTNODE,
} from './constants';

import { parseTableRows, createPushActionBody } from './ipfs';
import { ApplicationError, BlockchainError } from './errors';
import { payForCpu } from './web_integration/src/wallet/pay-for-cpu/pay-for-cpu';
import { getBestNode } from './web_integration/src/wallet/get-best-node/get-best-node';

class EosioService {
  constructor() {
    this.initialized = false;
    this.eosInstance = null;
    this.scatterInstance = null;
    this.scatterInstalled = null;
    this.node = null;
    this.isScatterWindowOpened = false;
  }

  init = async (
    privateKey,
    initWithScatter = false,
    selectedAccount = null,
  ) => {
    const autologinData = JSON.parse(
      sessionStorage.getItem(AUTOLOGIN_DATA) ||
        localStorage.getItem(AUTOLOGIN_DATA),
    );

    this.node = await this.getNode();

    if ((autologinData && autologinData.loginWithScatter) || initWithScatter) {
      await this.initEosioWithScatter();
      this.selectedAccount = await this.selectAccount();

      if (!this.scatterInstalled) {
        this.initEosioWithoutScatter();
        this.selectedAccount = null;
      }
    } else {
      this.initEosioWithoutScatter(privateKey);
      this.selectedAccount = selectedAccount;
    }

    this.initialized = true;
    this.compareSavedAndBestNodes();
  };

  initEosioWithScatter = async () => {
    const scatterConfig = this.getScatterConfig();

    ScatterJS.plugins(new ScatterEOS());

    const network = ScatterJS.Network.fromJson(scatterConfig);
    const rpc = new JsonRpc(network.fullhost());
    const connected = await ScatterJS.connect(
      SCATTER_APP_NAME,
      { network },
    );

    this.scatterInstalled = connected === true;

    if (this.scatterInstalled) {
      const eos = ScatterJS.eos(network, Api, { rpc });

      await ScatterJS.login();

      window.scatter = null;
      this.eosApi = {
        transact: eos.transact,
        authorityProvider: rpc,
      };
    }
  };

  initEosioWithoutScatter = key => {
    const keys = key ? [key] : [];
    const signatureProvider = new JsSignatureProvider(keys);
    const rpc = new JsonRpc(this.node.endpoint, { fetch });

    const api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });

    this.eosApi = api;
  };

  privateToPublic = privateKey => {
    try {
      return ecc.privateToPublic(privateKey);
    } catch (err) {
      return null;
    }
  };

  publicToAccounts = async publicKey => {
    if (!publicKey) {
      return null;
    }

    const accounts = await this.eosApi.authorityProvider.history_get_key_accounts(
      publicKey,
    );

    if (accounts && accounts.account_names) {
      return accounts.account_names[0] || null;
    }

    return null;
  };

  getAccount = async eosName => {
    try {
      const accountInfo = await this.eosApi.authorityProvider.get_account(
        eosName,
      );

      return accountInfo;
    } catch (err) {
      return null;
    }
  };

  getSelectedAccount = async () => {
    const autologinData = JSON.parse(
      sessionStorage.getItem(AUTOLOGIN_DATA) ||
        localStorage.getItem(AUTOLOGIN_DATA),
    );

    if (!autologinData) return null;

    return this.selectedAccount;
  };

  forgetIdentity = async () => {
    if (ScatterJS.scatter && ScatterJS.scatter.identity) {
      await ScatterJS.scatter.logout();
      return true;
    }

    return null;
  };

  selectAccount = async () => {
    const requiredFields = { accounts: [this.getScatterConfig()] };

    let result;
    try {
      result = await ScatterJS.scatter.getIdentity(requiredFields);
    } catch (error) {
      return null;
    }

    const account = result.accounts.find(x => x.blockchain === BLOCKCHAIN_NAME);

    if (!account) {
      return null;
    }

    this.selectedAccount = account.name;

    return account.name;
  };

  sendTransaction = async (actor, action, data, account) => {
    if (!this.initialized) throw new ApplicationError(EOS_IS_NOT_INIT);

    Object.keys(data).forEach(x => {
      if (typeof data[x] === 'string') {
        data[x] = data[x].trim();
      }
    });

    createPushActionBody(data);

    if (this.isScatterWindowOpened) {
      throw new Error('Scatter window is already opened');
    }

    if (this.scatterInstance) {
      this.isScatterWindowOpened = true;
    }

    try {
      const transaction = {
        actions: [
          {
            account: account || process.env.EOS_CONTRACT_ACCOUNT,
            name: action,
            authorization: [
              {
                actor,
                permission: DEFAULT_EOS_PERMISSION,
              },
            ],
            data: {
              ...data,
            },
          },
        ],
      };

      const transactionHeader = {
        blocksBehind: 3,
        expireSeconds: 60,
      };

      if (!this.eosApi.signatureProvider) {
        await this.eosApi.transact(transaction, {
          ...transactionHeader,
        });

        return;
      }

      const serverTransactionPushArgs = await payForCpu(
        transaction,
        transactionHeader,
      );

      if (!serverTransactionPushArgs) {
        throw new Error('No server args');
      }

      if (serverTransactionPushArgs) {
        await this.eosApi.transact(transaction, {
          ...transactionHeader,
          sign: false,
          broadcast: false,
        });

        const requiredKeys = await this.eosApi.signatureProvider.getAvailableKeys();
        const serializedTx = serverTransactionPushArgs.serializedTransaction;
        const signArgs = {
          chainId: this.node.chainID,
          requiredKeys,
          serializedTransaction: serializedTx,
          abis: [],
        };

        const pushTransactionArgs = await this.eosApi.signatureProvider.sign(
          signArgs,
        );

        pushTransactionArgs.signatures.unshift(
          serverTransactionPushArgs.signatures[0],
        );

        await this.eosApi.pushSignedTransaction(pushTransactionArgs);
        this.isScatterWindowOpened = false;
      }
    } catch (err) {
      this.isScatterWindowOpened = false;
      throw new BlockchainError(err);
    }
  };

  getTableRow = async (table, scope, primaryKey, code) => {
    if (!this.initialized) throw new ApplicationError(EOS_IS_NOT_INIT);

    const request = {
      json: true,
      code: code || process.env.EOS_CONTRACT_ACCOUNT,
      scope,
      table,
      lower_bound: primaryKey,
      upper_bound: primaryKey,
      limit: 1,
    };

    const response = await this.eosApi.authorityProvider.get_table_rows(
      request,
    );

    if (response && response.rows && response.rows.length) {
      parseTableRows(response.rows[0]);
      return response.rows[0];
    }

    return null;
  };

  getTableRows = async (
    table,
    scope,
    lowerBound,
    limit,
    upperBound,
    indexPosition,
    keyType,
    code,
  ) => {
    if (!this.initialized) throw new ApplicationError(EOS_IS_NOT_INIT);

    const request = {
      json: true,
      code: code || process.env.EOS_CONTRACT_ACCOUNT,
      scope,
      table,
      lower_bound: lowerBound,
      upper_bound: upperBound,
      limit,
      index_position: indexPosition,
      key_type: keyType,
    };

    const response = await this.eosApi.authorityProvider.get_table_rows(
      request,
    );

    if (response && response.rows) {
      response.rows.forEach(x => parseTableRows(x));
      return response.rows;
    }

    return [];
  };

  getScatterConfig = () => ({
    blockchain: BLOCKCHAIN_NAME,
    protocol: process.env.SCATTER_PROTOCOL || this.node.protocol,
    host: process.env.SCATTER_HOST || this.node.host,
    port: process.env.SCATTER_PORT || this.node.port,
    chainId: process.env.SCATTER_CHAINID || this.node.chainID,
  });

  getNode = () => {
    const node = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BESTNODE));
    return node || getBestNode();
  };

  compareSavedAndBestNodes = async () => {
    const savedNode = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BESTNODE));
    const bestNode = await getBestNode();

    if (!savedNode || savedNode.endpoint !== bestNode.endpoint) {
      localStorage.setItem(LOCAL_STORAGE_BESTNODE, JSON.stringify(bestNode));
    }
  };
}

export default EosioService;

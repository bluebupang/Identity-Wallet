'use strict';

const electron = require('electron');
const path = require('path');

const countriesList = require('./../../assets/data/country-list.json');
const ethTokensList = require('./../../assets/data/eth-tokens.json');

module.exports = function (app) {

    const controller = function () { };

    const dbFilePath = path.join(app.config.userDataPath, 'IdentityWalletStorage.sqlite');
    const knex = require('knex')({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbFilePath
        }
    });

    // select wallets.id , json_extract(wallets.name, '$.test') as phone from wallets where phone = 'is';

    /**
     * tables
     */
    function createCountries() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('countries').then((exists) => {
                if (!exists) {
                    knex.schema.createTable('countries', (table) => {
                        table.increments('id');
                        table.string('name').unique().notNullable();
                        table.string('code').unique().notNullable();
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        let promises = [];
                        for (let i in countriesList) {
                            let item = countriesList[i];
                            promises.push(insertIntoTable('countries', item));
                        }

                        Promise.all(promises).then(()=>{
                            console.log("Table:", "countries", "created.");
                            resolve("countries created");
                        }).catch((error)=>{
                            reject(error);
                        });

                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createDocuments() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('documents').then((exists) => {
                if (!exists) {
                    knex.schema.createTable('documents', (table) => {
                        table.increments('id');
                        table.string('filename').notNullable();
                        table.string('mime_type').notNullable();
                        table.integer('size').notNullable();
                        table.binary('file').notNullable();
                        table.integer('created_at').notNullable().defaultTo(new Date().getTime());
                        table.integer('updated_at');
                    }).then((resp) => {
                        console.log("Table:", "documents", "created.");
                        resolve("documents created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createIdAttributeTypes() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('id_attribute_types').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('id_attribute_types', (table) => {
                        table.increments('id');
                        table.string('key').notNullable();
                        table.string('category').unique().notNullable();
                        table.string('type').notNullable();
                        table.string('entity').notNullable();
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "id_attribute_types", "created.");
                        resolve("id_attribute_types created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });

    }

    function createTokens() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('tokens').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('tokens', (table) => {
                        table.increments('id');
                        table.string('symbol').unique().notNullable();
                        table.integer('decimal').notNullable();
                        table.string('address').notNullable();
                        table.binary('icon');
                        table.integer('isCustom').notNullable().defaultTo(0);
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        for (let i in ethTokensList) {
                            let item = ethTokensList[i];
                            insertIntoTable('tokens', { address: item.address, symbol: item.symbol, decimal: item.decimal });
                        }
                        console.log("Table:", "tokens", "created.");
                        resolve("tokens created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createAppSettings() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('app_settings').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('app_settings', (table) => {
                        table.increments('id');
                        table.string('dataFolderPath').notNullable();
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "app_settings", "created.");
                        insertIntoTable('app_settings', { dataFolderPath: electron.app.getPath('userData') }).then(() => {
                            resolve("tokens created");
                        }).catch((error) => {
                            reject(error);
                        });
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createGuideSettings() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('guide_settings').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('guide_settings', (table) => {
                        table.increments('id');
                        table.integer('guideShown').defaultTo(0);
                        table.integer('icoAdsShown').defaultTo(0);
                        table.integer('termsAccepted').defaultTo(0);
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "app_settings", "created.");
                        insertIntoTable('guide_settings', { guideShown: 0, icoAdsShown: 0, termsAccepted: 0 }).then(() => {
                            resolve("app_settings created");
                        }).catch((error) => {
                            reject(error);
                        });
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createWallet() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('wallets').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('wallets', (table) => {
                        table.increments('id');
                        table.string('name');
                        table.string('publicKey').unique().notNullable();
                        table.string('privateKey');
                        table.string('keystoreFilePath');
                        table.binary('profilePicture');
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "wallets", "created.");
                        resolve("wallets created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createIdAttributes() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('id_attributes').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('id_attributes', (table) => {
                        table.increments('id');
                        table.integer('walletId').notNullable().references('wallets.id');
                        table.integer('idAttributeTypeId').notNullable().references('id_attribute_types.id');
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "id_attributes", "created.");
                        resolve("id_attributes created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createIdAttributeItems() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('id_attribute_items').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('id_attribute_items', (table) => {
                        table.increments('id');
                        table.integer('idAttributeId').notNullable().references('id_attributes.id');
                        table.string('name');
                        table.integer('isVerified').notNullable().defaultTo(0);
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "id_attribute_items", "created.");
                        resolve("id_attribute_items created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createIdAttributeValues() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('id_attribute_item_values').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('id_attribute_item_values', (table) => {
                        table.increments('id');
                        table.integer('idAttributeItemId').notNullable().references('id_attribute_items.id');
                        table.integer('documentId').references('documents.id');
                        table.string('staticData');
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "id_attribute_item_values", "created.");
                        resolve("id_attribute_item_values created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createTokenPrices() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('token_prices').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('token_prices', (table) => {
                        table.increments('id');
                        table.string('symbol').notNullable().unique();
                        table.string('source');
                        table.decimal('priceUSD');
                        table.decimal('priceBTC');
                        table.decimal('priceETH');
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "token_prices", "created.");
                        resolve("token_prices created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createWalletTokens() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('wallet_tokens').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('wallet_tokens', (table) => {
                        table.increments('id');
                        table.integer('walletId').notNullable().references('wallets.id');
                        table.integer('tokenId').notNullable().references('tokens.id');
                        table.decimal('balance').defaultTo(0);
                        table.integer('recordState').defaultTo(1);
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "wallet_tokens", "created.");
                        resolve("wallet_tokens created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createTransactionsHistory() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('transactions_history').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('transactions_history', (table) => {
                        table.increments('id');
                        table.integer('wallet_id').notNullable().references('wallets.id');
                        table.integer('token_id').notNullable().references('tokens.id');
                        table.string('tx_id').notNullable();
                        table.decimal('value').notNullable();
                        table.integer('timestamp').notNullable();
                        table.integer('blockNumber').notNullable();
                        table.integer('created_at').notNullable().defaultTo(new Date().getTime());
                        table.integer('updated_at');
                    }).then((resp) => {
                        console.log("Table:", "transactions_history", "created.");
                        resolve("transactions_history created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createActionLogs() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('action_logs').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('action_logs', (table) => {
                        table.increments('id');
                        table.integer('walletId').notNullable().references('wallets.id');
                        table.string('title');
                        table.string('content');
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "action_logs", "created.");
                        resolve("action_logs created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    function createWalletSettings() {
        return new Promise((resolve, reject) => {
            knex.schema.hasTable('wallet_settings').then(function (exists) {
                if (!exists) {
                    knex.schema.createTable('wallet_settings', (table) => {
                        table.increments('id');
                        table.integer('walletId').notNullable().references('wallets.id');
                        table.integer('sowDesktopNotifications').notNullable().defaultTo(0);
                        table.integer('createdAt').notNullable().defaultTo(new Date().getTime());
                        table.integer('updatedAt');
                    }).then((resp) => {
                        console.log("Table:", "wallet_settings", "created.");
                        resolve("wallet_settings created");
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * public methods
     */
    controller.prototype.init = () => {
        let promises = [];

        /**
         * countries
         */
        promises.push(createCountries());

        /**
         * documents
         */
        promises.push(createDocuments());

        /**
         * id_attribute_types
         */
        promises.push(createIdAttributeTypes());

        /**
         * tokens
         */
        promises.push(createTokens());

        /**
         * wallets
         */
        promises.push(createWallet());

        /**
         * app_settings
         */
        promises.push(createAppSettings());

        /**
         * guide_settings
         */
        promises.push(createGuideSettings());

        /**
         * id_attributes
         */
        promises.push(createIdAttributes());

        /**
         * id_attribute_items
         */
        promises.push(createIdAttributeItems());

        /**
         * id_attribute_item_values
         */
        promises.push(createIdAttributeValues());

        /**
         * token_prices
         */
        promises.push(createTokenPrices());

        /**
         * token_prices
         */
        promises.push(createWalletTokens());

        /**
         * transactions_history
         */
        promises.push(createTransactionsHistory());

        /**
         * action_logs
         */
        promises.push(createActionLogs());

        /**
         * wallet_settings
         */
        promises.push(createWalletSettings());

        return Promise.all(promises)
    }

    /**
     * wallets
     */
    controller.prototype.wallets_insert = (data) => {
        return insertIntoTable('wallets', data);
    }

    controller.prototype.wallets_update = (data) => {
        return updateById('wallets', data);
    }

    controller.prototype.wallets_selectById = (id) => {
        return getById('wallets', id);
    }

    controller.prototype.wallets_selectByPublicKey = (publicKey) => {
        return new Promise((resolve, reject) => {
            knex('wallets').select().where('publicKey', publicKey).then((rows) => {
                if (rows && rows.length === 1) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_updating", error: error });
            });
        });
    }

    controller.prototype.wallets_selectAll = () => {
        return new Promise((resolve, reject) => {
            knex('wallets').select().then((rows) => {
                if (rows && rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    /**
     * id_attribute_types
     */
    controller.prototype.idAttributeTypes_insert = (data) => {
        return insertIntoTable('id_attribute_types', data);
    }

    controller.prototype.idAttributeTypes_update = (data) => {
        return updateById('id_attribute_types', data);
    }

    controller.prototype.idAttributeTypes_selectAll = () => {
        return new Promise((resolve, reject) => {
            knex('id_attribute_types').select().then((rows) => {
                if (rows && rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    /**
     * tokens
     */
    controller.prototype.tokens_selectAll = () => {
        return new Promise((resolve, reject) => {
            knex('tokens').select().then((rows) => {
                if (rows && rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    /**
     * token_prices
     */
    controller.prototype.tokenPrices_selectAll = () => {
        return new Promise((resolve, reject) => {
            knex('token_prices').select().then((rows) => {
                if (rows && rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    controller.prototype.tokenPrices_insert = (data) => {
        return insertIntoTable('token_prices', data);
    }

    /**
     * guide_settings
     */
    controller.prototype.guideSettings_selectAll = () => {
        return new Promise((resolve, reject) => {
            knex('guide_settings').select().then((rows) => {
                if (rows && rows.length) {
                    resolve(rows);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_selecting", error: error });
            });
        });
    }

    controller.prototype.guideSettings_update = (data) => {
        return updateById('guide_settings', data);
    }

    /**
     *
     */
    function insertIntoTable(table, data) {
        return new Promise((resolve, reject) => {
            knex.insert(data).into(table).then((resp) => {
                if (!resp || resp.length !== 1) {
                    return reject({ message: "error_while_creating" });
                }

                knex.select().from(table).where('id', resp[0]).then((rows) => {
                    if (rows && rows.length === 1) {
                        resolve(rows[0]);
                    } else {
                        reject({ message: "error_while_creating" });
                    }
                }).catch((error) => {
                    reject({ message: "error_while_creating", error: error });
                });
            }).catch((error) => {
                reject({ message: "error_while_creating", error: error });
            })
        });
    }

    function updateById(table, data) {
        return new Promise((resolve, reject) => {
            data.updatedAt = new Date().getTime();
            knex(table).update(data).where('id', '=', data.id).then((resp) => {
                if (!resp || resp !== 1) {
                    return reject({ message: "error_while_updating" });
                }

                knex.select().from(table).where('id', data.id).then((rows) => {
                    if (rows && rows.length === 1) {
                        resolve(rows[0]);
                    } else {
                        reject({ message: "error_while_updating" });
                    }
                }).catch((error) => {
                    reject({ message: "error_while_updating", error: error });
                });
            }).catch((error) => {
                reject({ message: "error_while_updating", error: error });
            })
        });
    }

    function getById(table, id) {
        return new Promise((resolve, reject) => {
            knex(table).select().where('id', id).then((rows) => {
                if (rows && rows.length === 1) {
                    resolve(rows[0]);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                reject({ message: "error_while_updating", error: error });
            });
        });
    }

    return controller;
};

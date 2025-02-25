// @ts-check
'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('openbackhaul-oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
var PrepareApprovedLinks = require('./service/individualServices/PrepareApprovedLinks');
var serverPort = 3036;

const ElasticsearchPreparation = require('./service/individualServices/ElasticsearchPreparation');
const preApprovedLinks = require('./utils/preApprovedLinks.json');

// uncomment if you do not want to validate security e.g. operation-key, basic auth, etc
// appCommons.openApiValidatorOptions.validateSecurity = false;

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
    openApiValidator: appCommons.openApiValidatorOptions
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
appCommons.setupExpressApp(app);


//setting the path to the database 
global.databasePath = './database/config.json'

ElasticsearchPreparation.prepareElasticsearch().catch(err => {
    console.error(`Error preparing Elasticsearch : ${err}`);
}).finally(
    () => {
        // Initialize the Swagger middleware
        http.createServer(app).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
        });
        PrepareApprovedLinks.createPreApprovedLinks(preApprovedLinks).catch(
             err => {
                 console.error(`Error entering preapproved links : ${err}`);
             }
         );
        appCommons.performApplicationRegistration();
   }
);



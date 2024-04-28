const config = require("../v1/config/config");


//! <================> SWAGGER CONFIGERATION <================>  https://swagger-autogen.github.io/docs  


const options = {
    openapi:          "3.0.0",     // Enable/Disable OpenAPI.                        By default is null
    language:         'en-US',     // Change response language.                      By default is 'en-US'
    disableLogs:      false,    // Enable/Disable logs.                           By default is false
    autoHeaders:      true,    // Enable/Disable automatic headers recognition.  By default is true
    autoQuery:        true,    // Enable/Disable automatic query recognition.    By default is true
    autoBody:         true,    // Enable/Disable automatic body recognition.     By default is true
    writeOutputFile:  true     // Enable/Disable writing the output file.        By default is true
};


const swaggerAutogen = require('swagger-autogen')(options);


const doc = {
    info: {
        version: '',            // by default: '1.0.0'
        title: '',              // by default: 'REST API'
        description: ''         // by default: ''
    },
    servers: [
        {
            url: config.API_URL,              // by default: 'http://localhost:3000'
            description: ''       // by default: ''
        },
        // { ... }
    ],
    components: {
        securitySchemes:{
            bearerAuth: {
                type: 'http',
                scheme: 'Bearer'
            }
        }
    }            
};

const outputFile = `./src/swagger/${config.SWAGGER_FILE}`;
const routes = ['./src/server.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

//! якщо треба тільки згенерувати swager документацію
// swaggerAutogen(outputFile, routes, doc);


//! якщо треба згенерувати swager документацію і запустити додаток
swaggerAutogen(outputFile, routes, doc).then(() => {
    require('../server.js'); // Your project's root file
  });
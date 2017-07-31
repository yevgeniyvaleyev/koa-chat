const defer = require('config/defer').deferConfig;
const path = require('path');

module.exports = {
    // secret data can be moved to env variables
    // or a separate config
    secret:   '--',
    server: {
        siteHost: 'http://localhost:3000'
    },
    providers: {
        facebook: {
            appId: '--',
            appSecret: '--',
            test: {
                login: '--',
                password: '--'
            },
            passportOptions: {
                display: 'popup',
                scope:   ['email']
            }
        }
    },
    mailer: {
        transport: 'gmail',
        gmail: {
            user: '--',
            password: '--'
        },
        senders:  {
            // transactional emails, register/forgot pass etc
            default:  {
                fromEmail: '--',
                fromName:  'JavaScript',
                signature: "<em>Best regards,<br>Bigmot</em>"
            },
            // newsletters
            informer: {
                fromEmail: '--',
                fromName:  'Newsletters',
                signature: "<em>Have fun!</em>"
            }
        }
    },
    mongoose: {
        uri:     'mongodb://localhost/app',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                },
                poolSize:      5
            }
        }
    },
    crypto: {
        hash: {
            length:     128,
            // may be slow(!): iterations = 12000 take ~60ms to generate strong password
            iterations: process.env.NODE_ENV == 'production' ? 12000 : 1
        }
    },
    template: {
        // template.root uses config.root
        root: defer(function(cfg) {
            return path.join(cfg.root, 'templates');
        })
    },
    root:     process.cwd()
};

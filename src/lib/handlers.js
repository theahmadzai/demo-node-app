const _data = require('./data');
const helpers = require('./helpers');

const handlers = {};

handlers.home = (data, cb) => {
    cb(406, {
        'name': 'home handler'
    });
};

handlers.users = (data, cb) => {
    const acceptableMethods = ['post', 'put', 'get', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, cb);
        return;
    }

    cb(405, { message: 'Invalid method' });
};

handlers._users = {};

handlers._users.post = (data, cb) => {
    let firstName = data.payload.firstName;
    let lastName = data.payload.lastName;
    let phone = data.payload.phone;
    let password = data.payload.password;
    let tosAgreement = data.payload.tosAgreement;
    firstNname = typeof (firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastNname = typeof (lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof (phone) == 'string' && phone.trim().length >= 10 ? phone.trim() : false;
    password = typeof (password) == 'string' && password.length > 0 ? password : false;
    tosAgreement = typeof (tosAgreement) == 'boolean' && tosAgreement;

    if (!firstName || !lastName || !phone || !password || !tosAgreement) {
        cb('400', {
            error: 'Missing required fields.'
        });
        return;
    }

    _data.read('users', phone, (err, data) => {
        if (!err) {
            cb(400, {
                error: 'A user with that phone number already exists.'
            });
            return;
        }

        let hashedPassword = helpers.hash(password);

        if (!hashedPassword) {
            cb(500, {
                error: 'Could not hash the password.'
            });
            return;
        }

        let userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement
        };

        _data.create('users', phone, userObject, err => {
            if (err) {
                cb(500, {
                    error: 'Could not create the new user.'
                });
                return;
            }

            cb(200, {
                success: 'User created successfuly'
            });
            return;
        });

    });

};

handlers._users.get = (data, cb) => {

    let phone = data.queryStringObject.phone;
    phone = typeof (phone) == 'string' && phone.length >= 10 ? phone.trim() : false;

    if (!phone) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, isValid => {
        if (!isValid) {
            cb(403, {
                error: 'Missing required token in header or invalid token.'
            });
            return;
        }

        _data.read('users', phone, (err, data) => {
            if (err) {
                cb(404, {
                    error: 'user not found.'
                });
                return;
            }

            delete data.hashedPassword;

            cb(200, data);
            return;
        });

    });
};

handlers._users.put = (data, cb) => {
    let firstName = data.payload.firstName;
    let lastName = data.payload.lastName;
    let phone = data.payload.phone;
    let password = data.payload.password;
    firstNname = typeof (firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastNname = typeof (lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof (phone) == 'string' && phone.trim().length >= 10 ? phone.trim() : false;
    password = typeof (password) == 'string' && password.length > 0 ? password : false;

    if (!phone) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    if (!firstName && !lastName && !password) {
        cb(400, {
            error: 'Missing fields to update.'
        });
        return;
    }

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, isValid => {
        if (!isValid) {
            cb(403, {
                error: 'Missing required token in header or invalid token.'
            });
            return;
        }

        _data.read('users', phone, (err, data) => {
            if (err) {
                cb(400, {
                    error: 'The specified user does not exist'
                });
                return;
            }

            if (firstName) data.firstName = firstName;
            if (lastName) data.lastName = lastName;
            if (password) data.hashedPassword = helpers.hash(password);

            _data.update('users', phone, data, err => {
                if (err) {
                    cb(500, {
                        error: 'Could not update the user'
                    });
                    return;
                }

                cb(200, {
                    success: 'The user has been updated'
                });
            });
        });
    });
};

handlers._users.delete = (data, cb) => {
    let phone = data.queryStringObject.phone;
    phone = typeof (phone) == 'string' && phone.length >= 10 ? phone.trim() : false;

    if (!phone) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, isValid => {
        if (!isValid) {
            cb(403, {
                error: 'Missing required token in header or invalid token.'
            });
            return;
        }

        _data.read('users', phone, (err, data) => {
            if (err) {
                cb(400, {
                    error: 'Could not find the spicified user.'
                });
                return;
            }

            _data.delete('users', phone, err => {
                if (err) {
                    cb(500, {
                        error: 'Could not delete the specified user.'
                    });
                    return;
                }

                cb(200, {
                    success: 'Deleted the user successfuly.'
                });
            });
        });
    });
};

handlers.tokens = (data, cb) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, cb);
        return;
    }

    cb(405, { message: 'Invalid method' });
};

handlers._tokens = {};

handlers._tokens.post = (data, cb) => {
    let phone = data.payload.phone;
    let password = data.payload.password;
    phone = typeof (phone) == 'string' && phone.trim().length >= 10 ? phone.trim() : false;
    password = typeof (password) == 'string' && password.length > 0 ? password : false;

    if (!phone || !password) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    _data.read('users', phone, (err, data) => {
        if (err) {
            cb(400, {
                error: 'Could not find the spicified user.'
            });
            return;
        }

        if (helpers.hash(password) != data.hashedPassword) {
            cb(400, {
                error: 'Password did not match.'
            });
            return;
        }

        let tokenObject = {
            phone,
            id: helpers.createRandomString(20),
            expires: Date.now() + 1000 * 60 * 60
        };

        _data.create('tokens', tokenObject.id, tokenObject, err => {
            if (err) {
                cb(500, {
                    error: 'Could not create a new token.'
                });
                return;
            }

            cb(200, tokenObject);
        });

    });
};

handlers._tokens.get = (data, cb) => {
    let id = data.queryStringObject.id;
    id = typeof (id) == 'string' && id.length >= 20 ? id.trim() : false;

    if (!id) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    _data.read('tokens', id, (err, data) => {
        if (err) {
            cb(404, {
                error: 'token does not exist'
            });
            return;
        }

        cb(200, data);
    });
};

handlers._tokens.put = (data, cb) => {
    let id = data.payload.id;
    let extend = data.payload.extend;
    id = typeof (id) == 'string' && id.trim().length >= 20 ? id.trim() : false;
    extend = typeof (extend) == 'boolean' && extend;

    if (!id || !extend) return cb(400, {
        error: 'Missing required fields.'
    });

    _data.read('tokens', id, (err, data) => {
        if (err) return cb(400, {
            error: 'Specified token does not exist.'
        });

        if (data.expires < Date.now()) return cb(400, {
            error: 'The token has already been expired, cannot be extended'
        });

        data.expires = Date.now() + 1000 * 60 * 60;

        _data.update('tokens', id, data, err => {
            if (err) return cb(500, {
                error: 'Could not update the token\'s expiration'
            });

            cb(200, {
                success: 'Successfuly extended token expiration'
            });
        });

    });
};

handlers._tokens.delete = (data, cb) => {
    let id = data.queryStringObject.id;
    id = typeof (id) == 'string' && id.length >= 10 ? id.trim() : false;

    if (!id) {
        cb(400, {
            error: 'Missing required fields.'
        });
        return;
    }

    _data.read('tokens', id, (err, data) => {
        if (err) {
            cb(400, {
                error: 'Could not find the spicified token.'
            });
            return;
        }

        _data.delete('tokens', id, err => {
            if (err) {
                cb(500, {
                    error: 'Could not delete the specified token.'
                });
                return;
            }

            cb(200, {
                success: 'Deleted the token successfuly.'
            });
        });
    });
};

handlers._tokens.verifyToken = (id, phone, cb) => {
    _data.read('tokens', id, (err, data) => {
        if (err) {
            return cb(false);
        }

        if (data.phone == phone && data.expires > Date.now()) {
            return cb(true);
        }

        return cb(false);
    });
};

handlers.ping = (data, cb) => {
    cb(200);
};

handlers.notFound = (data, cb) => {
    cb(404);
};


module.exports = handlers;

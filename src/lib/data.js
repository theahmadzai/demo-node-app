const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, cb) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fd) => {
        if (err) {
            cb('Could not create new file, it may already exist.');
            return;
        }

        fs.writeFile(fd, JSON.stringify(data), err => {
            if (err) {
                cb('Error writing to new file.');
                return;
            }

            fs.close(fd, err => {
                if (err) {
                    cb('Error closing new file');
                    return;
                }

                cb(false);
            });
        });
    });
};

lib.read = (dir, file, cb) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (err) {
            cb(err, data);
            return;
        }

        cb(err, helpers.parseJsonToObject(data));
    });
};

lib.update = (dir, file, data, cb) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fd) => {
        if (err) {
            cb('Could not open the file for updating.');
            return;
        }

        fs.ftruncate(fd, err => {
            if (err) {
                cb('Error truncating the file.');
                return;
            }

            fs.writeFile(fd, JSON.stringify(data), err => {
                if (err) {
                    cb('Error writing to existing file.');
                    return;
                }

                fs.close(fd, err => {
                    if (err) {
                        cb('Error closing the file.');
                        return;
                    }

                    cb(false);
                });
            });
        });
    });
};

lib.delete = (dir, file, cb) => {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
        if (err) {
            cb('Error deleting the file.');
            return;
        }

        cb(false);
    });
};

module.exports = lib;

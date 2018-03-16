const Ethash = require('node-ethash');
const levelup = require('levelup');
const memdown = require('memdown');
const events = require('events');
const ethUtil = require('ethereumjs-util');
var bignum = require('bignum');


Ethash.prototype.verifySubmit = function (block, difficulty, totalDiff, cb) {
  var self = this;
  var result = {
    share: false,
    block: false
  }

  var targetM = bignum(difficulty, 16);
  var target = bignum(totalDiff, 16);
  this.loadEpoc(block.height, function () {
    var a = self.run(new Buffer(block.header, 'hex'), new Buffer(block.nonce, 'hex'), self.fullSize);
    if(block.mixDigest.toString('hex') === a.mix.toString('hex')) {
      if(bignum(a.hash.toString('hex'), 16).cmp(targetM) === -1) {
        result.share = true; 
        if(bignum(a.hash.toString('hex'), 16).cmp(target) === -1){
          result.block = true;
        }
      }
    }
    return cb(result);
  });
}

var VerifySubmit = module.exports = function(){ 
  var _this = this;
  this.ready = false;
  this.init = function(height) {
    _this.ready = true;
    var cacheDB = levelup('', {
      db: memdown
    })

    _this.ethash = new Ethash(cacheDB);
    _this.ethash.loadEpoc(height, function () {
      _this.emit('DAG');
    });
  }

  this.updateEpoc = function(height) {
    _this.ready = false;
    _this.ethash.loadEpoc(height, function () {
      _this.ready = true;
      _this.emit('DAG');
    });
  }

  this.submitShare = function(block, diff, tg, callback){
    _this.ethash.verifySubmit(block, diff, tg, function(result){
      callback(result);
    });
  }
}

VerifySubmit.prototype.__proto__ = events.EventEmitter.prototype;
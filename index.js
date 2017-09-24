const Ethash = require('node-ethash');
const levelup = require('levelup');
const memdown = require('memdown');
const events = require('events');
const ethUtil = require('ethereumjs-util');
const BN = ethUtil.BN;


Ethash.prototype.verifySubmit = function (block, difficulty, totalDiff, cb) {
  var self = this;
  var result = {
    share: false,
    block: false
  }

  var targetM = (new BN(2).pow(new BN(256))).divRound(new BN(difficulty, 16));
  var target = (new BN(2).pow(new BN(256))).divRound(new BN(totalDiff, 16));
  this.loadEpoc(block.height, function () {
    var a = self.run(new Buffer(block.header, 'hex'), new Buffer(block.nonce, 'hex'));
    if(block.mixDigest.toString('hex') === a.mix.toString('hex')) {
      if(new BN(a.mix, 16) < new BN(targetM, 16)) {
        result.share = true; 
        if(new BN(a.mix, 16) < new BN(target, 16)){
          result.block = true;
        }
      }
    }
    return cb(result);
  });
}

var VerifySubmit = module.exports = function(){
  var _this = this;

  this.init = function(height) {
    var cacheDB = levelup('', {
      db: memdown
    })

    _this.ethash = new Ethash(cacheDB);
    _this.ethash.loadEpoc(height, function () {
      _this.emit('DAG');
    });
  }

  this.updateEpoc = function(height) {
    _this.ethash.loadEpoc(height, function () {
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
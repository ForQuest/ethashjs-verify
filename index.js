const Ethash = require('ethashjs')
const levelup = require('levelup')
const memdown = require('memdown')
const ethUtil = require('ethereumjs-util')
const xor = require('buffer-xor')
const BN = ethUtil.BN
const async = require('async')


Ethash.prototype.verifySubmit = function (block, difficulty, target) {
  var self = this
  var result = {
    share: false,
    block: false
  }
  //console.log(block);
  var targetM = (new BN(2).pow(new BN(256))).divRound(new BN(difficulty, 16));
  this.loadEpoc(block.height, function () {
    console.log("Epoc loaded!");
    var a = self.run(new Buffer(block.header, 'hex'), new Buffer(block.nonce, 'hex'));
      if(block.mixDigest.toString('hex') === a.mix.toString('hex')) {
        if(new BN(a.mix, 16) < new BN(targetM, 16)) {
          console.log("Share is valid");
          result.share = true; 
          if(new BN(a.mix, 16) < new BN(target, 16)){
            console.log("Block founded!");
            result.block = true;
          }
        }
        else {
          console.log("Hash is invalid");
        } 
      }
      else { 
        console.log("Error. Computed hash is not equal for the mixDigest");
      }
    console.log("mixDigest: " + block.mixDigest.toString('hex'));
    console.log("mix: " + a.mix.toString('hex'));
    return result;
  });
}

var cacheDB = levelup('', {
  db: memdown
})

var ethash = new Ethash(cacheDB)

var block = {
  height: 4292800,
  header: "4a7ef9c723dd8e855112c6d17908a8355746190734bbb13ee9d67ac340d8b68e",
  nonce: "886c9737600fe186af",
  mixDigest: "87893165f75662df9d3a0f73fdee06ea451b95c9c41bbad17df6e9175f5d3a1d"
}
var diff = "8a4f5443f6039";
var totalDiff = "34e6c82cf5d15464c8";
var tg = (new BN(2).pow(new BN(256))).divRound(new BN(totalDiff, 16));
ethash.verifySubmit(block, diff, tg);
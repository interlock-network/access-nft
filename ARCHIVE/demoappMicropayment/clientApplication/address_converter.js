const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const { hexToU8a, isHex } = require('@polkadot/util')




//const address_bytes = "000000000000000000000000000000000000000000000000"

const address = "0x0000000000000000000000000000000000000000000000000000000000000000";
console.log(hexToU8a(address))

console.log(encodeAddress(hexToU8a(address)))

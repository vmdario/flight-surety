#!/bin/bash

# (0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 (1000 ETH)
# (1) 0xf17f52151EbEF6C7334FAD080c5704D77216b732 (1000 ETH)
# (2) 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef (1000 ETH)
# (3) 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544 (1000 ETH)
# (4) 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2 (1000 ETH)
# (5) 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e (1000 ETH)
# (6) 0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5 (1000 ETH)
# (7) 0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5 (1000 ETH)
# (8) 0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc (1000 ETH)
# (9) 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE (1000 ETH)
ganache ethereum -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" \
	-a 50 \
	-l "0x98967F" \
	--miner.defaultTransactionGasLimit "0x7A120"

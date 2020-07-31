The GKC JavaScript library for Smart Contract development.

# Install

```
npm install git+https://github.com/gkcproject/gkc_js.git
```

This is a sample code snippet that transfer ERC20 tokens:

```js
import { GkcRPC } from "gkc_js"

const repoData = require("./solar.json")
const gkc = new Gkc("http://gkc:test@localhost:48803", repoData)

const myToken = gkc.contract(
  "contract_name",
)

async function transfer(fromAddr, toAddr, amount) {
  const tx = await myToken.send("transfer", [toAddr, amount], {
    senderAddress: fromAddr,
  })

  console.log("transfer tx:", tx.txid)
  console.log(tx)

  await tx.confirm(3)
  console.log("transfer confirmed")
}
```

Build and run tests:

```
npm build
```

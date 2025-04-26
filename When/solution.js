const { subtle } = require("crypto").webcrypto;
const axios = require("axios");

async function findLuckyNumber() {
    const date = new Date();
    let number = Math.floor(date.getTime() / 1000);
    while (true) {
        const data = Buffer.from(number.toString());
        const hash = await subtle.digest("SHA-256", data);
        const bytes = new Uint8Array(hash);
        if (bytes[0] === 255 && bytes[1] === 255) {
            try {
               const response=await axios.default.post(
                    "https://when.atreides.b01lersc.tf/gamble",
                    {},
                    {
                        headers: {
                            date:new Date(number*1000)
                        },
                    },
                );
                console.log(response.data)
            } catch (err) {
                console.log(err);
            }
            console.log(`Found: ${number}`);
            console.log(`Hash: ${Buffer.from(bytes).toString("hex")}`);
            break;
        }
        number++;
    }
}

findLuckyNumber();

# b01lersCTF — “When?” Write‑Up

> Sometimes all it takes to win is being in the *right place* at the *right time*… or just faking it.

---

## Why I Picked This One

The challenge name **“When?”** immediately sounded suspiciously time-based. A quick peek at the source code showed that a  timestamp is needed to satisfy a specific hash constraint. Combine that with a custom `Date` header in an HTTP request, and we’ve got ourselves a fairly easy exploit

---

## What You Need

- **Node.js** (v18+ with `WebCrypto` support)

- **Internet** connection to reach `when.atreides.b01lersc.tf`

- **Basic knowledge** of HTTP headers and SHA-256

```bash
node solution.js
```

---

## The Challenge in a Nutshell

You are given a link to a webpage `https://when.atreides.b01lersc.tf/`. Visiting this page shows following interface

![](/home/mh/.config/marktext/images/2025-04-26-09-36-37-image.png)

An attempt to gamble shows similar output to this 

![](/home/mh/.config/marktext/images/2025-04-26-09-37-49-image.png)

Now after taking a look that the client source i see this 

```js
await fetch("/gamble", { method: "POST"})
```

After inspecting the gamble route 

```js
if (bytes[0] == 255 && bytes[1] == 255) {
            res.send({
                success: true,
                result: "1111111111111111",
                flag: "bctf{redacted}"
            })
  } 


```

- The server checks that the **first two bytes** of the hash are `0xff`.

- If true, it returns a fake flag (in the live challenge, it would be real).
  
  ##### Key Points

- The server trusts the `Date` header — meaning **you can search for a valid timestamp offline**, then spoof it in your request.

- SHA-256 is computationally expensive but not impossible to brute-force for this use case.

- You only need to find a timestamp whose **SHA-256 hash starts with `0xffff`**.

Once found, it sends a POST request to:

```
https://when.atreides.b01lersc.tf/gamble
```

…with this timestamp set as the HTTP `Date` header.

If the server agrees the timestamp is “lucky,” it replies with a flag.

---

## Step 1: Find a Lucky Number

Here’s the relevant part of `solution.js` that does the heavy lifting:

```ts
let number = Math.floor(Date.now() / 1000);
while (true) {
    const hash = await subtle.digest("SHA-256", Buffer.from(number.toString()));
    if (hash[0] === 255 && hash[1] === 255) break;
    number++;
}
```

The loop brute-forces starting from “now,” trying one Unix timestamp after another.

Once a valid one is found (which is rare, but not *that* rare), it posts to `/gamble` with:

```ts
headers: {
    date: new Date(number * 1000)
}
```

---

## Step 2: Let It Run

Just run the script and watch the console:

```bash
$ npm install
$ node solution.js

{
  success: true,
  result: '1111111111111111',
  flag: 'bctf{ninety_nine_percent_of_gamblers_gamble_81dc9bdb}'
}
Found: 1745748971
Hash: ffff87b6b450c8c01b1425109f8d0b5f22d86e77028bbdbadf275c6a142d8c12
```

And there it is — the flag.



## Lessons Learned

1. **Time-based PoW** is neat — especially when it's just one extra HTTP header.

2. **Don’t trust client headers blindly** — this server lets anyone spoof any time.

3. **SHA-256 randomness** makes brute-forcing feasible but still a decent challenge.

4. **Rate limiting helps** — the server caps brute-force attempts to 60/min, which slows things down just enough.

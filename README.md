# lock.js

<img alt="lock.js" width="600" src="https://chalda-pnuzig.github.io/lock/src/images/logo.svg" alt="Lock" width="200" />

Lock.js is a javaScript library for generating numbers lock.

## Demo
[chalda.github.io/lock.js](https://chalda-pnuzig.github.io/lock.js)

## Installation and files

All pre-built files needed to use Lock can be found in the "dist" folder.

If you're looking to get started with minimal fuss, include `dist/lock.min.js`  and `dist/lock.css`.

- [**dist/**](dist)
    - [lock.min.js](dist/lock.min.js) — Minimized version
    - [lock.css](dist/lock.css) — Core style
- [**src/**](src)
    - [styles/](src)
        - [lock.scss](src/styles/lock.scss) — Core styles
    - [js/](src)
      - [lock.js](src/js/lock.js) — Full version



<!--
You can install this module as a component from NPM:

```bash
npm install --save chalda-pnuzig-log
```
You can also include this library in your HTML page directly from a CDN:
```html
<script src="https://cdn..net/npm/lock@1.0.0/dist/lock.min.js"></script>
```

_Note: you should use the latest version at the time that you include your project.
You can see all versions [on the releases page](https://github.com/chalda-pnuzig/lock)._
-->

### Usage

```js
new Lock(options);
```

#### `options`

The `lock` parameter is a single optional `options` object, which has the following properties:

| option     | type                                 | default  | description
|------------|--------------------------------------|----------|----------------
| `id`       | _String_                             | 'lock'   | The id of the div where insert the lock
| `wheels `  | _Integer_                            | 5        | The number of digit wheels. it can be left out if you specify a code
| `items`    | _Integer_ &#124; Array&lt;String&gt; | 10       | The number of digits that can be chosen or an array of elements 
| `code `    | _String_                             | '00000'  | The code to open the lock
| `timeout`  | _Integer_                            | 500      | The amount of time before the code can be changed again
| `diameter` | _Integer_                            | 0.9      | The diameter of the lock
| `onchange` | _Function_ <ul><li>_string_ code</li><li> _bool_ isOpen</li><li>_int_ moves</li></ul>| | This function is called upon every change to the lock
| `onopen`   | _Function_ <ul><li>moves</li></ul>   |          | This function is called when the lock is opened (i.e. the `code` parameter matches)
| `onclose`  | _Function_ <ul><li>moves</li></ul>   |          |This function is called when the lock is closes (only when the lock is open)

#### `methods`

| method     | return   | description                     | example
|------------|----------|---------------------------------|--------------
| `shuffle`  | _String_ | Set a random code and return it | `let lock = new Lock(); lock.shuffle();`
| `getCode`  | _String_ | Return the current code         | ```let lock = new Lock(); console.log(lock.getCode();```


## License
ISC License (ISC) - Copyright &copy;2021 [Chalda Pnuzig ](https://github.com/chalda-pnuzig/lock.js)

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
/**!
 * Lock.js
 * @version   v2.0.0
 * @author    Chalda Pnuzig <chalda＠chalda.it>
 * @copyright Chalda Pnuzig 2021
 * @see       {@link https://github.com/chalda-pnuzig/lock.js|GitHub}
 * @license   ISC
 */

class Lock {
	/**
	 * @callback OnChange
	 * @param {Array}   code
	 * @param {boolean} isOpen
	 * @param {number}  attempts
	 * @return {void}
	 */

	/**
	 * @callback OnOpenClose
	 * @param {number} attempts
	 * @return {void}
	 */

	/**
	 * @typedef {number|string|string[]} Code
	 */

	/**
	 * @typedef  {Object} Options
	 * @property {string}           [id=lock]       - The id of the div where insert the lock
	 * @property {number}           [wheels=5]      - The numbers of wheels. If not specified then take the length of `code` option (if specified)
	 * @property {number|string[]}  [items=10]      - The number of digits that can be chosen or an array of elements or an array of strings
	 * @property {Code}             [code=00000]    - The code to open the lock. If not specified then take the first element of `items` repeated `wheels` times
	 * @property {boolean}          [encoded=false] - If true the `code` option is considered obfuscated by the `encode` method
	 * @property {number}           [timeout=500]   - The amount of time before the code can be changed again
	 * @property {number}           [diameter=80]   - The diameter of the lock
	 * @property {OnChange}         [onChange]      - This function is called upon every change to the lock. Pass the current code (`code`), if the lock is open (`isOpen`) and the number of attempts made (`attempts`)
	 * @property {OnOpenClose}      [onOpen]        - This function is called when the lock opens (i.e. the `code` option matches)
	 * @property {OnOpenClose}      [onClose]       - This function is called when the lock closes (only when it's already open)
	 */

	constructor(options) {
		let defaults = {
			id       : 'lock',
			wheels   : 5,
			items    : 10,
			timeout  : 500,
			encoded  : false,
			diameter : 80,
			onChange : (code, isOpen, attempts) => {
			},
			onOpen   : (attempts) => {
			},
			onClose  : (attempts) => {
			}
		};

		this.options = Object.assign({}, defaults, options);

		if (typeof this.options.items === 'number') {
			this.items = Array.from(Array(this.options.items).keys());
		} else {
			this.items         = this.options.items;
			this.options.items = this.options.items.length;
		}

		this.options.code = this.options.code || new Array(this.options.wheels).fill('0');
		if (typeof this.options.code === 'string') this.options.code = this.options.code.split('');

		if (this.options.encoded) this.options.code = Lock.decode(this.options.code);

		this.options.wheels = this.options.code.length;
		this.actualCode     = Array(this.options.wheels).fill(0);
		this.rotate         = Array(this.options.wheels).fill(0);
		this.open           = false;

		this.id     = this.options.id;
		this.wheels = this.options.wheels;


		this.diameter      = this.options.diameter;
		this.radius        = this.options.diameter / 2;
		this.angle         = 360 / this.options.items;
		this.circumference = Math.PI * this.diameter;
		this.elementHeight = this.circumference / (this.options.items - 1);

		this.attempts = 0;
		this.open     = this._comp(this.options.code, this.actualCode);

		this.lock = document.createElement('div');
		this.lock.classList.add('lock');
		for (let i = 0; i < this.options.wheels; i++) this._addWheel(i);
		this.lock.style.setProperty('--elementHeight', this.elementHeight + 'px');
		this.lock.style.height     = (this.diameter) + 'px';
		this.lock.style.paddingTop = this.elementHeight + 'px';

		document.getElementById(this.options.id).appendChild(this.lock);

		this.onTimeout = false;

		this.lock.addEventListener('contextmenu', e => e.preventDefault());
		this.lock.addEventListener('mouseleave', e => this._onScroll(e));
		this.lock.addEventListener('mouseup', e => this._onScroll(e));
		this.lock.addEventListener('touchmove', e => this._onScroll(e));
	}

	/**
	 * Compare two array (equal, not identical)
	 * @name _comp
	 * @param {Array} a1
	 * @param {Array} a2
	 * @returns {boolean}
	 * @private
	 */
	_comp(a1, a2) {
		return a1.length === a2.length && a1.every((v, i) => v == a2[i])
	}

	/**
	 * Scroll wheel event
	 * @name _onScroll
	 * @param  e
	 * @private
	 */
	_onScroll(e) {
		if (e.cancelable) e.preventDefault();

		if (this.onTimeout || this.clickElement === false || !this.clickInner) return;

		this.onTimeout = true;
		let p          = e.clientY || e.touches[0].clientY;

		let d = this.clickPosition - p;
		if (Math.abs(d) > 2) d = this.clickPosition > p;
		else d = e.button !== 2;
		let direction = d ? 1 : -1;

		let n             = this.clickElement;
		this.clickElement = false;

		this.attempts++;
		this.rotate[n] += this.angle * direction;
		this.clickInner.style.transform = 'rotateX(' + this.rotate[n] + 'deg)';
		this.actualCode[n] -= direction;
		if (this.actualCode[n] >= this.options.items) this.actualCode[n] = 0;
		if (this.actualCode[n] < 0) this.actualCode[n] = this.options.items - 1;

		let code = this.getCode();

		setTimeout(() => {
			if (this._comp(this.options.code, code)) {
				this.open = true;
				this.options.onOpen(this.attempts);
			} else if (this.open) {
				this.open = false;
				this.options.onClose(this.attempts);
			}
			this.options.onChange(code, this.open, this.attempts);
			this.onTimeout = false;
		}, this.options.timeout);
		this.lock.style.setProperty('--rotationSpeed', this.options.timeout / 2 + 'ms');
	}

	/**
	 * Return the current code
	 * @name getCode
	 * @returns {string[]}
	 *
	 * @example
	 * let lock = new Lock();
	 * lock.getCode();
	 */
	getCode() {
		let code = [];
		this.actualCode.forEach(v => code.push(this.items[v]));
		return code;
	}

	/**
	 * Return the number of attempts
	 * @name getAttempts
	 * @returns {number}
	 *
	 * @example
	 * let lock = new Lock();
	 * lock.getAttempts();
	 */
	getAttempts() {
		return this.attempts;
	}

	/**
	 * Return true if the lock is open
	 * @name isOpen
	 * @returns {boolean}
	 *
	 * @example
	 * let lock = new Lock();
	 * lock.isOpen();
	 */
	isOpen() {
		return this.open;
	}

	/**
	 * Set the code of lock
	 * @name setCode
	 * @param {Code}    code             - The new code to set
	 * @param {boolean} [animation=true] - If true the code changes with an animation
	 * @returns {Lock}
	 *
	 * @example
	 * let lock = new Lock();
	 * lock.setCode('12345');
	 */
	setCode(code, animation = true) {
		if (!animation) {
			animation = this.lock.style.getPropertyValue('--rotationSpeed');
			setTimeout(() => {
				this.lock.style.setProperty('--rotationSpeed', animation);
			}, 50);
			this.lock.style.setProperty('--rotationSpeed', '0');
		}
		let array = typeof code === 'string' ? code.split('') : code;
		array     = array.map(x => isNaN(x) ? x : +x);

		array.forEach((el, n) => {
			let p = this.items.map(x => isNaN(x) ? x : +x).indexOf(el);
			if (p === -1) return;
			let direction = Math.random() > .5;

			this.rotate[n] = direction ? (this.angle * (this.items.length - p)) : -this.angle * p;

			this.lock.querySelector('.wheel:nth-child(' + (n + 1) + ') .wheel__inner').style.transform = 'rotateX(' + this.rotate[n] + 'deg)';

			this.actualCode[n] = p;
		});
		return this;
	}

	/**
	 * Add a wheel
	 * @name _addWheel
	 * @param {number} n Position
	 * @private
	 */
	_addWheel(n) {
		let wheel = document.createElement('div');
		wheel.classList.add('wheel');
		let inner = document.createElement('div');
		inner.classList.add('wheel__inner');

		const rotangle        = -20;
		let r                 = rotangle * n / (this.wheels - 1) - rotangle / 2;
		wheel.style.transform = 'rotateY(' + (-r) + 'deg) translateX(' + r + 'px)';
		wheel.style.zIndex    = rotangle > 0 ? Math.round(Math.abs(r)) : (r > 0 ? n : this.wheels - n);

		this.items.forEach((v, i) => {
			let div = document.createElement('div');
			div.classList.add('wheel__segment');
			div.style.transform = `rotateX(${this.angle * i}deg) translateZ(${this.radius}px)`;
			div.style.height    = this.elementHeight + 'px';
			if (typeof v === 'number' && v >= 10) {
				v = String.fromCharCode(55 + v);
			}
			div.innerHTML = `<span>${v}</span>`;
			inner.appendChild(div);
		})
		inner.style.transformOrigin = '50% calc(50% + ' + (this.elementHeight / 2) + 'px)';
		inner.style.marginTop       = '-' + this.elementHeight + 'px';

		inner.style.height = this.diameter + 'px';
		wheel.appendChild(inner);
		this.lock.appendChild(wheel);

		wheel.addEventListener('mousedown', e => {
			this.clickPosition = e.clientY;
			this.clickElement  = n;
			this.clickInner    = inner;
		});
		wheel.addEventListener('touchstart', e => {
			this.clickPosition = e.touches[0].clientY;
			this.clickElement  = n;
			this.clickInner    = inner;
		});

		wheel.addEventListener('wheel', e => {
			this.clickPosition = e.deltaY * -100;
			this.clickElement  = n;
			this.clickInner    = inner;
			this._onScroll(e);
		});
	}

	/**
	 * Shuffle the lock by turning each wheel between
	 * `min` and `max` times taking `time`  milliseconds.
	 * The method returns the new `code`
	 * @name shuffle
	 * @param {number} [min=10]    - Minimum number of rotations
	 * @param {number} [max=100]   - Max number of rotations
	 * @param {number} [time=2500] - Time of rotations in milliseconds
	 * @returns {string[]}
	 *
	 * @example
	 * let lock = new Lock();
	 * lock.shuffle(50,150,1000);
	 */
	shuffle(min = 10, max = 100, time = 2500) {
		if (this.onTimeout) return;
		this.onTimeout = true;
		let old        = getComputedStyle(this.lock).getPropertyValue('--rotationSpeed');
		this.lock.style.setProperty('--rotationSpeed', time + 'ms');


		for (let n = 0; n < this.options.wheels; n++) {
			let direction = Math.random() > .5 ? 1 : -1;
			let spin      = Math.floor(Math.random() * (max - min) + min);

			this.rotate[n] = this.angle * spin * direction;

			this.lock.querySelector('.wheel:nth-child(' + (n + 1) + ') .wheel__inner').style.transform = 'rotateX(' + this.rotate[n] + 'deg)';

			let t = spin % this.options.items;
			if (direction === 1) t = (this.options.items - t) % this.options.items;
			this.actualCode[n] = t;
		}

		setTimeout(() => {
			this.onTimeout = false;
			this.lock.style.setProperty('--rotationSpeed', old);
		}, time);

		return this.getCode();
	}

	/**
	 * Encode a string
	 * @name encode
	 * @param {Code} text The text to encode
	 * @returns {string}
	 * @see decode
	 *
	 * @example
	 * // Returns 'JD13TWo0bk1qNFhN'
	 * Lock.encode("123");
	 */
	static encode(text) {
		if (typeof text === 'string') text = text.split('');
		return btoa(btoa(unescape(encodeURIComponent(text.join('~#')))).split('').reverse().join('').replace('+', '#').replace('=', '$'));
	}

	/**
	 * Decode a string
	 * @name decode
	 * @param {Code} text The text to decode
	 * @returns {string[]}
	 * @see encode
	 *
	 * @example
	 * // Returns ['1','2','3']
	 * Lock.encode("JD13TWo0bk1qNFhN");
	 */
	static decode(text) {
		if (typeof text === 'string') text = text.split('');
		return decodeURIComponent(escape(atob(atob(text.join('')).replace('$', '=').replace('+', '#').split('').reverse().join('')))).split('~#');
	}
}

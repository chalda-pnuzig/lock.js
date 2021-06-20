/**
 * Lock.js v1.1.1
 * Copyright (c) 2021, Chalda Pnuzig
 *
 * This source code is licensed under the ISC License found in the
 * LICENSE file in the root directory of this source tree.
 */

class Lock {
	constructor(options) {
		let defaults = {
			id       : 'lock',
			wheels   : 5,
			items    : 10,
			timeout  : 500,
			diameter : 80,
			onchange : (code, isOpen, attempts) => {
			},
			onopen   : (attempts) => {
			},
			onclose  : (attempts) => {
			}
		};

		this.options = Object.assign({}, defaults, options);

		this.options.code   = this.options.code || '0'.repeat(this.options.wheels);
		this.options.wheels = [...this.options.code].length;
		this.actualCode     = Array(this.options.wheels).fill(0);
		this.rotate         = Array(this.options.wheels).fill(0);
		this.open           = false;

		this.id     = this.options.id;
		this.wheels = this.options.wheels;
		if (typeof this.options.items === 'number') {
			this.items = Array.from(Array(this.options.items).keys());
		} else {
			this.items         = this.options.items;
			this.options.items = this.options.items.length;
		}

		this.diameter      = this.options.diameter;
		this.radius        = this.options.diameter / 2;
		this.angle         = 360 / this.options.items;
		this.circumference = Math.PI * this.diameter;
		this.elementHeight = this.circumference / (this.options.items - 1);

		this.attempts = 0;
		this.open     = this.options.code === this.actualCode.join('');

		this.lock = document.createElement('div');
		this.lock.classList.add('lock');
		for (let i = 0; i < this.options.wheels; i++) this._addWheel(i);
		this.lock.style.setProperty('--elementHeight', this.elementHeight + 'px');
		this.lock.style.height     = (this.diameter) + 'px';
		this.lock.style.paddingTop = this.elementHeight + 'px';


		document.getElementById(this.options.id).appendChild(this.lock);

		this.onTimeout = false;

		this.lock.addEventListener('contextmenu', e => e.preventDefault());
		this.lock.addEventListener('mouseleave', e => this.onScroll(e));
		this.lock.addEventListener('mouseup', e => this.onScroll(e));
		this.lock.addEventListener('touchmove', e => this.onScroll(e));

	}

	onScroll(e) {
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
			if (code === this.options.code) {
				this.open = true;
				this.options.onopen(this.attempts);
			} else if (this.open) {
				this.open = false;
				this.options.onclose(this.attempts);
			}
			this.options.onchange(code, this.open, this.attempts);
			this.onTimeout = false;
		}, this.options.timeout);
		this.lock.style.setProperty('--rotationSpeed', this.options.timeout / 2 + 'ms');
	}

	getCode() {
		let code = '';
		this.actualCode.forEach(v => code += this.items[v])
		return code;
	}

	getAttempts() {
		return this.attempts;
	}

	isOpen() {
		return this.open;
	}

	setCode(code) {
		let array = code.split('');
		array     = array.map(x => isNaN(x) ? x : +x);

		array.forEach((el, n) => {
			let p = this.items.map(x => isNaN(x) ? x : +x).indexOf(el);
			if (p === -1) return;
			let direction = Math.random() > .5;

			this.rotate[n] = direction ? (this.angle * (this.items.length - p)) : -this.angle * p;

			this.lock.querySelector('.wheel:nth-child(' + (n + 1) + ') .wheel__inner').style.transform = 'rotateX(' + this.rotate[n] + 'deg)';

			this.actualCode[n] = p;
		});

	}

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
			this.onScroll(e);
		});
	}

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
}

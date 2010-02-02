// TODO: Scenes? Think about transitions. Do layers even make sense?
/* TODO: think about how I was using DGE.layers before, like doing this.stats and this.movesText
that's some ugliness, because Sprite is already such a packed Object. If you did your own this.add (for a sprite)
you'd overwrite an important method. Perhaps .children or something?
*/

// TODO - replace el.style calls to use DGE.css() instead (might not be a good idea, for performance's sake)
// TODO- take out constants like SPRITE_WIDTH and put them where they belong, on DGE.Sprite
// TODO - additionally, will need a .conf to work for anything like that to set the defaults elegantly ... right?
/**
 * Diggy (DGE): DHTML Game Engine.<br>
 * http://diggy.sistertrain.com/
 * @namespace
 * @module Diggy
 */
var DGE = (function() {

	/**
	 * Shortcut to set a Diggy configuration setting.
	 * @param {String} attr The attribute to set.
	 * @param {Object} value The value to apply to the setting.
	 * @return {Object} DGE (for chaining).
	 * @method set
	 * @static
	 */
	var set = function(attr, value) {

		if (typeof(attr) == 'object') {
			for (var i in attr) {
				arguments.callee.apply(DGE, [i, attr[i]]);
			}
			return DGE;
		}

		switch (attr) {

			case 'baseURL':
				DGE.conf.baseURL = value;
				break;

			case 'libsURL':
				DGE.conf.libsURL = value;
				break;

			case 'stage':
				DGE.stage = new DGE.Sprite({
					addTo : false,
					id : value.id,
					width : value.width,
					height : value.height
				}).setCSS({
					background : (value.background || '#000'),
					overflow : 'hidden',
					position : 'relative'
				});

				DGE.STAGE_WIDTH = value.width;
				DGE.STAGE_HEIGHT = value.height;

				DGE.stage;
				break;

			default:
				throw new Error(DGE.sprintf('Unknown setting "%s"', attr));
				break;

		}

		return DGE;

	}

	return {

		/**
		 * Initializes DGE.
		 * @param {Object} The key/value pair of configuration settings.
		 * @method init
		 * @static
		 */
		init : function(conf) {

			if (conf) set(conf);

		},

		set : set,

	};

})();

/**
 * Creates a custom attribute method.
 * @param {Object} that The scope to execute in.
 * @param {Function} change The function to fire when the attr changes.
 * @return {Function} The attribute method method (confused?).
 * @method attrMethod
 * @static
 */
DGE.attrMethod = function(that, change) {

  var attr;

  return function(a) {

    if (a === undefined) return attr;
    attr = a;
    if (change) change.apply(that, arguments);

    return that;

  };

};

/**
// TODO: maybe move this to a setCSS lambda. it might just be cluttering up the API
 * Converts dash-separation to camelCase.
 * @param {String} text The string to convert.
 * @return {String} The converted string.
 * @method dashToCamelCase
 * @static
 */
DGE.dashToCamelCase = function(text) {

	var camelCase = '';

	for (var i = 0; i < text.length; i++) {
		if (text[i] == '-') {
			camelCase += text[i + 1].toUpperCase();
			i++;
		} else {
			camelCase += text[i];
		}
	}

	return camelCase;

};

/**
 * Sends a debug message to the platform running Diggy. All parameters are passed through.
 * @method debug
 * @static
 */
DGE.debug = function(msg) {

	switch (DGE.platform.name) {
		case DGE.platform.BROWSER:
			try {
				console.log.apply(DGE, arguments);
			} catch(e) {
				console.log(Array.prototype.join.apply(arguments, [',']));
			}
			break;
		case DGE.platform.TITANIUM:
			Titanium.API.info.apply(DGE, arguments);
			break;
	}

};

/**
 * Execute a function immediately.
 * @param {Function} fn The function to call.
 * @param {Number} ms (optional) The number of milliseconds to wait (via setTimeout).
 * @param {Object} scope (optional) The scope within which to call the function.
 * @method execScript
 * @static
 * TODO might not need this anymore if we ditch SM2
 */
DGE.exec = function(fn, ms, scope) {

	var fire = function() {
		fn.apply(scope);
	};

	if (ms) {
		setTimeout(fire, ms);
	} else {
		fire();
	}

};

/**
 * Executes an external JavaScript file.
 * @param {String} src The URL of the file.
 * @method execScript
 * @static
 */
DGE.execScript = function(src) {
	var script = document.createElement('script');
	script.src = (DGE.conf.libsURL + src);
	document.getElementsByTagName('head')[0].appendChild(script);
};

/**
 * Extends an object.
 * @param {Function} P The parent object to extend.
 * @param {Function} F The object to extend with.
 * @return {Function} F, having extended P.
 * @method extend
 * @static
 */
DGE.extend = function(P, F) {
	F.prototype = new P();
	return F;
};

/**
 * Creates a custom event method.
 * @param {Object} that The scope to execute in.
 * @param {Function} change The function to fire when the attr changes.
 * @return {Function} An event method.
 * @method eventMethod
 * @static
 */
DGE.eventMethod = function(that, change) {

	var e;

	return function(fn) {

		if (fn === undefined) {
			if (e) e.apply(that);
		} else {
			e = fn;
			if (change) change.apply(that, arguments);
		}

		return that;

	};

};

/**
 * Formats a number to a human-readable format (eg, 1234 = 1,234).
 * @param {Number} n The number to format.
 * @return {String} The formatted number.
 * @method formatNumber
 * @static
 */
DGE.formatNumber = function(n) {

	if (!n && (n !== 0)) return '';

	var reverse = [];
	n = n.toString();

	for (var i = 1; i <= n.length; i++) {
		reverse.push(n[n.length - i]);
		if (!(i % 3) && (i < n.length)) reverse.push(',');
	}

	reverse = reverse.reverse();
	return reverse.join('');

};

/**
 * Gets a DOM element.
 * @param {Object | String} Element or String (id).
 * @return {Object} The DOM element (or undefined on failure).
 * @method getNode
 * @static
 */
DGE.getNode = function(el) {
	if (typeof(el) == 'object') {
		return el;
	} else {
		return document.getElementById(el);
	}
};

/**
 * Generates a random string of n characters.
 * @param {Number} length The length of the key (default: 10).
 * @return {Number} The random string.
 * @method makeId
 * @static
 */
DGE.makeId = function(length) {

	var str = '';
	length = (length || 10);

	for (var i = 0; i < length; i++) {
		str += String.fromCharCode(DGE.rand(97, 122)); // a-z
	}

	return str;

};

/**
 * Adds an event listener.
 * @param {Object} el The element to attach to.
 * @param {String} e The event to watch.
 * @param {Function} fn The function to attach.
 * @method on
 * @static
 */
DGE.on = (document.addEventListener ? function(el, e, fn) {
    el.addEventListener(e, fn, false);
  } : function(el, e, fn) {
    el.attachEvent('on' + e, fn);
  }
);

/**
 * Generate a random number based on the passed range.
 * @param {Number | Array} from The starting point (or an Array to return a random index).
 * @param {Number} to The ending point.
 * @return {Number} The random number.
 * @method rand
 * @static
 */
DGE.rand = function(from, to) {

  if (from.length === undefined) {
    return (from + Math.floor((to - from + 1) * (Math.random() % 1)));
  } else {
    return arguments.callee(0, (from.length - 1));
  }

};

/**
 * Sets a style on a DOM node, correcting for cross-browser support.
 * @param {Object} el The DOM node to work on.
 * @param {String} style The style to apply (also accepts a key/value object).
 * @param {Object} value The style value to apply.
 * @method setCSS
 * @static
 */
DGE.setCSS = function(el, style, value) {

	if (typeof(style) == 'object') {

		for (var k in style) {
			arguments.callee(el, k, style[k]);
		}

	}

	// Handle cross-platform issues here
	switch (style) {
		case 'float':
			el.style.cssFloat = value;
			el.style.styleFloat = value;
			return el;
		case 'opacity':
			el.style.filter = DGE.sprintf('alpha(opacity=%s)', (value * 100));
			el.style.opacity = value;
			return el;
	}

	style = DGE.dashToCamelCase(style);
	el.style[style] = value;

};

/**
 * Sort of emulates the sprintf() function in C (replaces %s with the next argument).
 * @param {String} str The string to replace, followed by any number of replacements.
 * @return {String} The replaced string.
 * @method sprintf
 * @static
 */
DGE.sprintf = function(str) {

  for (var i = 1; i < arguments.length; i++) {
    str = str.replace(/%s/, arguments[i]);
  }

  return str;

};

/**
 * Vibrates the platform (if supported, for mobile devices).
 * @method vibrate
 * @static
 * @FINAL
 */
DGE.vibrate = function() {

	if (DGE.platform.name == DGE.platform.TITANIUM) {
		Titanium.Media.vibrate();
	}

};
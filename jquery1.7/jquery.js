/*!
 * jQuery JavaScript Library v1.7.2
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Wed Mar 21 12:46:34 2012 -0700
 */
(function( window, undefined ) {

	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document,
		navigator = window.navigator,
		location = window.location;
	
	/*
	 * add by zhangjh     2016-2-16
	 * 构造jQuery对象，jQuery是一个工厂函数
	 * 通过 window。jQuery=window.$=jQuery 
	 * 作为window的一个属性，这样通过window。jQuery(),jQuery(),$()就可以调用jQuery构造函数，生成一个jQuery对象
	 * 例：$("#nsrmc")
	 */
	//jQuery是一个工厂函数，通过一个立即调用函数，返回一个函数
	var jQuery = (function() {
		
		// Define a local copy of jQuery
		/*
		 * 定义jQuery构造函数
		 * add by zhangjh   2016-2-16
		 */
		var jQuery = function( selector, context ) {
			// The jQuery object is actually just the init constructor 'enhanced'
			/*
			 * add by zhangjh   2016-2-16
			 * 将通过new 调用jQuery.prototype.init()，生成一个jQuery对象
			 */
			return new jQuery.fn.init( selector, context, rootjQuery );
		},
		
		/*
		 * add by zhangjh   2016-2-20
		 * 注意这里的_jQuery，_$并不是全局变量，而是var a=***,b=***,c=**的写法
		 * 不要错误的理解为没有用var定义变量自动升级为全局变量
		 */
		// Map over jQuery in case of overwrite
		/*
		 * add by zhangjh   2016-2-24
		 * _jQuery,_$用于备份window.jQuery和window.$,
		 * 加载jQuery之前，winodw的jQuery和$都是undefinde
		 * 加载完之后，_jQuery,_$为undefined，
		 * window。jQuery=window.$=jQuery
		 */
		_jQuery = window.jQuery,
	
		// Map over the $ in case of overwrite
		_$ = window.$,
	
		// A central reference to the root jQuery(document)
		rootjQuery,
	
		// A simple way to check for HTML strings or ID strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		/*
		 * add by zhangjh    2016-2-20
		 * 用于判断字符串是复杂的html代码还是#adfa
		 */
		quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
	
		// Check if a string has a non-whitespace character in it
		//查找非空白字符      /\s/的意思为查找空白字符
		rnotwhite = /\S/,
	
		// Used for trimming whitespace
		//开头为一个或者多个空格
		trimLeft = /^\s+/,
		//结尾为一个或者多个空格
		trimRight = /\s+$/,
	
		// Match a standalone tag
		//判断一个html标签是<b>,或者<b/>,或者<b></b>或者<b/></b>格式
		rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
	
		// JSON RegExp
		//
		rvalidchars = /^[\],:{}\s]*$/,
		rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
		rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
		rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	
		// Useragent RegExp
		rwebkit = /(webkit)[ \/]([\w.]+)/,
		ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
		rmsie = /(msie) ([\w.]+)/,
		rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
	
		// Matches dashed string for camelizing
		rdashAlpha = /-([a-z]|[0-9])/ig,
		rmsPrefix = /^-ms-/,
	
		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return ( letter + "" ).toUpperCase();
		},
	
		// Keep a UserAgent string for use with jQuery.browser
		userAgent = navigator.userAgent,
	
		// For matching the engine and version of the browser
		browserMatch,
	
		// The deferred used on DOM ready
		readyList,
	
		// The ready event handler
		DOMContentLoaded,
	
		// Save a reference to some core methods
		toString = Object.prototype.toString,
		/*
		 * add by zhangjh    2017-2-17
		 * hasOwnProperty用来判断属性是不是对象的属性，而不会去原型链上查找
		 * 一般使用for(a in b)遍历对象属性的时候，如果对象有原型，则原型属性也会遍历到，如果加了hasOwnProterty限制
		 * 则只会遍历对象本省自己的属性
		 */
		hasOwn = Object.prototype.hasOwnProperty,
		
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf,
	
		// [[Class]] -> type pairs
		class2type = {};
		
		/*
		 *add by zhangjh  2016-2-16
		 *覆盖jQuery构造函数的原型属性(每个函数定义以后，都有prototype属性)
		 *jQuery.fn 为jQuery.prototype 的别名，这样在接下来的代码编写中可以减少代码量 
		 */
		jQuery.fn = jQuery.prototype = {
				/*
				 *  add by zhangjh   2016-2-16
				 *  函数原型自带constructor属性，指向当前函数
				 *  constructor属性的作用：？？
				 */
				constructor: jQuery,
				/*
				 * add by zhangjh   2016-2-16
				 * 构造函数jQuery具体的执行函数,负责解析selector,context的类型
				 * selector:要转化为jQuery对象的目标对象，可以是任意的值，但只有undefined，DOM元素,字符串,函数,jQuery对象,普通的js对象这几种类型是有效的，
				 *          其他类型的值时没有意义的
				 * context:上下文，可以不传入，或者传入DOM元素，jQuery对象，普通的js对象
				 * rootjQuery：包含了document对象的jQuery对象  rootjQuery=$(document)
				 *            用于document.getElementById()查找失败、selector是选择器表达式且未指定context、selector是函数的情况(???)
				 */
				init: function( selector, context, rootjQuery ) {
					var match, elem, ret, doc;
					/*
					 * add by zhangjh   2016-2-16
					 * 函数init是作为构造函数被调用，所以this指向的是最后生成的jQuery对象，而不是调用init的对象jQuery。prototype
					 * selector为false，返回一个空的jQuery对象
					 * Handle $(""), $(null), or $(undefined)
					 */
					if ( !selector ) {
						return this;  //this 指代要生成的jQuery对象
					}
					/*
					 * add by zhangjh 2016-2-16
					 * selector有nodeType属性，则生成一个DOM元素的jQuery对象
					 * Handle $(DOMElement) 
					 */
					if ( selector.nodeType ) {
						this.context = this[0] = selector;
						this.length = 1;
						return this;
					}
	
					// The body element only exists once, optimize finding it
					if ( selector === "body" && !context && document.body ) {
						this.context = document;
						this[0] = document.body;
						this.selector = selector;
						this.length = 1;
						return this;
					}
	
					// 当selector是字符串
					if ( typeof selector === "string" ) {
						/*
						 * add by zhangjh 2016-2-16
						 * Are we dealing with HTML string or an ID?
						 * 判断字符串是html代码还是id
						 */
						if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
							/*
							 * add by zhangjh    2016-2-16
							 * Assume that strings that start and end with <> are HTML and skip the regex check
							 * 判断字符串是html片段，但不确定是合法的html片段
							 * match[0]为参数selector，肯定有值
							 * match[1]为匹配的html代码或者undefined
							 * match[2]为匹配的id或者undefinde
							 */
							match = [ null, selector, null ];
	
						} else {
							//判断字符串是一些复杂的html代码或者是#id
							//quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
							//以#开始的字符串，字符串中不能含有其他非字母和数字的字符  #1.2就不会被匹配
							match = quickExpr.exec( selector );
						}
	
						// Verify a match, and that no context was specified for #id
						/*
						 * add by zhangjh    2016-2-16
						 * match[0]肯定有值，所以只需判断match[1]||match[2]||!context,由于match[1],match[2]必有一个有值，所以只需判断一个就好
						 */
						
						if ( match && (match[1] || !context) ) {
	
							// HANDLE: $(html) -> $(array)
							//html代码
							if ( match[1] ) {
								/*
								 * add by zhangjh      2016-2-17
								 * 判断context是不是jQuery对象，生成的jQuery对象是一个类数组对象，如果是jQuery对象，则为context[0]
								 * 如果不是，则为context
								 */
								context = context instanceof jQuery ? context[0] : context;
								/*
								 * add by zhangjh   2016-2-17
								 * 取得document文档
								 */
								doc = ( context ? context.ownerDocument || context : document );
	
								// If a single string is passed in and it's a single tag
								// just do a createElement and skip the rest
								ret = rsingleTag.exec( selector );
								//判断selector是否是单独标签
								if ( ret ) {
									//如果ret不为null，则为单独标签
									if ( jQuery.isPlainObject( context ) ) {
										//判断context是不是普通对象
										selector = [ document.createElement( ret[1] ) ];
										//如果是普通对象，把普通对象的属性、事件设置到新创建的dom元素上
										jQuery.fn.attr.call( selector, context, true );
	
									} else {
										selector = [ doc.createElement( ret[1] ) ];
									}	
	
								} else {
									ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
									selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
								}
	
								return jQuery.merge( this, selector );

							}
							/*
							 * HANDLE: $("#id")
							 * 如果selector是"#id",且未指定参数context上下文
							 * 判断逻辑：match[1]为undefined时，默认match[2]有值，但此时要进入该if语句，需要match[1]||!context为真
							 *       即context为false，未指定上下文
							 */
							else {
								elem = document.getElementById( match[2] );
	
								// Check parentNode to catch when Blackberry 4.6 returns
								// nodes that are no longer in the document #6963
								if ( elem && elem.parentNode ) {
									// Handle the case where IE and Opera return items
									// by name instead of ID
									if ( elem.id !== match[2] ) {
										return rootjQuery.find( selector );
									}
	
									// Otherwise, we inject the element directly into the jQuery object
									this.length = 1;
									this[0] = elem;
								}
	
								this.context = document;
								this.selector = selector;
								return this;
							}
	
							// HANDLE: $(expr, $(...))
						}
						//不是html代码、id，是选择器
						else if ( !context || context.jquery ) {
							//如果没有上下文，则调用rootjQuery。find；如果指定上下文，且上下文是jQuery对象，则context.find()
							return ( context || rootjQuery ).find( selector );
	
							// HANDLE: $(expr, context)
							// (which is just equivalent to: $(context).find(expr)
						} 
						else {
							//指定上下文，但上下文不是jQuery对象，先创建一个包含context的jQuery对象，然后在该对象的中寻找selector指定的对象
							return this.constructor( context ).find( selector );
						}
						/*
						 * add by zhangjh   2016-2-16
						 * HANDLE: $(function)
						 * Shortcut for document ready
						 * selector为函数，则认为是绑定ready事件，界面加载完之后直接运行函数
						 * $(document).ready(function(){})
						 */
					} else if ( jQuery.isFunction( selector ) ) {
						return rootjQuery.ready( selector );
					}
	                /*
	                 * add by zhangjh   2016-2-22
	                 * selector属性存在，则认为selector是一个jQuery对象，
	                 * 将selector对象的selector属性和context属性赋值给生成的jQuery对象
	                 */  
					if ( selector.selector !== undefined ) {
						this.selector = selector.selector;
						this.context = selector.context;
					}
	
					return jQuery.makeArray( selector, this );
				},
	
				// Start with an empty selector
				selector: "",
	
				// The current version of jQuery being used
				jquery: "1.7.2",
	
				// The default length of a jQuery object is 0
				//表示当前jQuery对象中元素的个数？？？
				length: 0,
	
				// The number of elements contained in the matched element set
				size: function() {
					return this.length;
				},
	
				toArray: function() {
				//slice=Array.prototype.slice，，借用数组方法slice，将当前jQuery对象转换为真正的数组
					return slice.call( this, 0 );
				},
	
				// Get the Nth element in the matched element set OR
				// Get the whole matched element set as a clean array
				//获取jQuery对应位置的元素
				get: function( num ) {
					return num == null ?
	
							// Return a 'clean' array
							this.toArray() :
	
								// Return just the object
								//num为负数，从元素的末尾开始计算
								( num < 0 ? this[ this.length + num ] : this[ num ] );
				},
	
				// Take an array of elements and push it onto the stack
				// (returning the new matched element set)
				/*
				 * add by zhangjh   2016-2-23
				 * 新建一个jQuery对象，将elems的值赋给新的jQuery对象
				 * 新的jQuery对象的preObject指向当前的jQuery对象
				 * elems:将放入新jQuery对象的元素数组
				 * name:产生数组elems的jQuery方法名
				 * selector：传给jQuery方法的参数，用于修正原型属性.selector
				 */
				pushStack: function( elems, name, selector ) {
					// Build a new jQuery matched element set
					//this指代一个jQuery对象
					var ret = this.constructor();
	
					if ( jQuery.isArray( elems ) ) {
						push.apply( ret, elems );
	
					} else {
						jQuery.merge( ret, elems );
					}	
	
					// Add the old object onto the stack (as a reference)
					ret.prevObject = this;
	
					ret.context = this.context;
	
					if ( name === "find" ) {
						ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
					} else if ( name ) {
						ret.selector = this.selector + "." + name + "(" + selector + ")";
					}
	
				// Return the newly-formed element set
					return ret;
				},
	
				// Execute a callback for every element in the matched set.
				// (You can seed the arguments with an array of args, but this is
				// only used internally.)
				/*
				 * add by zhangjh   2016-2-23
				 * jQuery对象的每个属性执行函数callback，传入的参数是args，
				 * callback函数返回false时，停止遍历
				 */
				each: function( callback, args ) {
					return jQuery.each( this, callback, args );
				},
	            /**
	             * add by zhangjh  2016-5-12
	             * 用于在document对象上绑定一个ready事件监听函数，当DOM结构加载完成以后，监听函数被执行
	             * @param fn
	             * @returns 
	             */
				ready: function( fn ) {
					// Attach the listeners
					jQuery.bindReady();
	
					// Add the callback
					readyList.add( fn );
	
					return this;
				},
	
				eq: function( i ) {
					//如果i是类似于“1”的字符串，转化为1
					i = +i;
					//Array.slice(i) i若不为非负数，表示从左边起的第i+1的位置
					//若i为负数，表示从右边起的第i个位置
					return i === -1 ?
							this.slice( i ) :
								this.slice( i, i + 1 );
				},
	
				first: function() {
					return this.eq( 0 );
				},
	
				last: function() {
					return this.eq( -1 );
				},
	
				slice: function() {
					return this.pushStack( slice.apply( this, arguments ),
							"slice", slice.call(arguments).join(",") );
				},
			    /*
			     * add by zhangjh  2016-2-24
			     * 相当于map:fcuntion(callback){
			     *     var a=function(elem,i){return callback.call(elem,i,elem)}
			     *     return this.pushStack(jQuery.map(this,a))
			     * }
			     * callback:function(i,elem){}
			     */
				map: function( callback ) {
					return this.pushStack( jQuery.map(this, function( elem, i ) {
						return callback.call( elem, i, elem );
					}));
				},
	            /*
	             * add by zhangjh   2016-2-24
	             * .end()函数用于返回最近一次“破坏性操作”之前的jQuery对象
	             * var a=$("div")  var b=a.find("p")  这属于破坏性操作，b.end()返回a
	             * var b=a.css("","")没有造成新的jQuery对象，不是破坏性操作
	             */
				end: function() {
					return this.prevObject || this.constructor(null);
				},
	
				// For internal use only.
				// Behaves like an Array's method, not like a jQuery method.
				push: push,
				sort: [].sort,
				//在数组中插入和删除元素，会修改原来的数组
				splice: [].splice
			};
	
		// Give the init function the jQuery prototype for later instantiation
		//生成jQuery的核心是jQuery.fn.init函数，init函数的prototype属性等于jQuery.prototype属性，这样生成的jQuery对象都可以使用jQuery.fn的方法
		jQuery.fn.init.prototype = jQuery.fn;
		
		/*
		 * add by zhangjh   2016-2-22
		 * 用于合并两个对象或者多个对象的属性到第一个对象
		 */	
		jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
		    //arguments[0]为调用extend函数时候传入的第一个参数，target指向目标对象
			target = arguments[0] || {},
			//表示源对象的起始坐标，源对象的理解为：
			i = 1,
			//传入参数的个数
			length = arguments.length,
			//是否进行深度复制
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			//如果调用extend函数时传入的第一个参数为布尔值类型
			deep = target;
			//target指向传入函数的第二个参数
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		//如果传入的目标对象不是一个对象且不是一个函数，而是字符串或者其他的基本类型时，定义为{}，在基本类型上设置非原生属性是无效的
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}
	
		// extend jQuery itself if only one argument is passed
		/*
		 * add by zhangjh   2016-2-22
		 * 当传入一个参数（对象），缺少源对象；
		 * 传入两个参数，第一个参数为boolean，第二个参数为对象，缺少源对象；
		 * 传入两个以上的参数时源对象存在
		 * 当源对象不存在的时候，把jQuery或者jQuery.fn当做目标对象，源对象的位置向前进1
		 * 
		 */
		//length表示函数传入的参数的个数，i表示期望源对象开始的位置
		if ( length === i ) {
			target = this;
			--i;
		}
	
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			//options根据i的位置指向某个源对象
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					//防止出现$.extend(true,o,{n:o}),深度遍历的时候会出现死循环
					if ( target === copy ) {
						//continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					/*
					 * add by zhangjh   2016-2-22
					 * 当deep为true，copy的值存在的时候，表示需要深度复制
					 */
					if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							//复制的属性是数组
							copyIsArray = false;
							//目标对象的对应属性，如果也有值且为数组，则不变，若无值或者不是数组，则设置为空数组
							clone = src && jQuery.isArray(src) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	
	jQuery.extend({
		//用于释放全局变量、$对jQuery的控制权
		noConflict: function( deep ) {
			if ( window.$ === jQuery ) {
				window.$ = _$;
			}
	
			if ( deep && window.jQuery === jQuery ) {
				window.jQuery = _jQuery;
			}
	
			return jQuery;
		},
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,
	
		// Hold (or release) the ready event
		/**
		 * add by zhangjh  2016-5-12
		 * 用于延迟或者回复ready事件的触发
		 */
		holdReady: function( hold ) {
			if ( hold ) {
				//如果hold为true，表示期望延迟ready事件的触发
				jQuery.readyWait++;
			} else {
				//期望恢复ready事件的触发
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		/**
		 * add by zhangjh  2016-5-12
		 * 执行ready事件监听函数
		 */
		ready: function( wait ) {
			// Either a released hold or an DOMready/load event and not yet ready
			if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if ( !document.body ) {
					return setTimeout( jQuery.ready, 1 );
				}
	
				// Remember that the DOM is ready
				jQuery.isReady = true;
	
				// If a normal DOM Ready event fired, decrement, and wait if need be
				if ( wait !== true && --jQuery.readyWait > 0 ) {
					return;
				}
	
				// If there are functions bound, to execute
				readyList.fireWith( document, [ jQuery ] );
	
				// Trigger any bound ready events
				if ( jQuery.fn.trigger ) {
					jQuery( document ).trigger( "ready" ).off( "ready" );
				}
			}
		},
	    /**
	     * add by zhangjh  2016-5-12
	     * 负责初始化ready事件监听函数列表readyList，并为document对象绑定ready事件主监听函数DOMContentLoaded
	     * @returns
	     */
		bindReady: function() {
			//如果readyList不是undefinde，表示已经调用过bindReady已经被调用过，不需要再次执行后面的代码
//			if ( readyList ) {
//				return;
//			}
	        //初始化事件监听函数列表readyList
			//once      确保监听函数列表只能被触发一次
			//memory    记录上一次触发readyList时的参数，之后添加的任何监听函数都将用巨鹿的参数立即调用
			readyList = jQuery.Callbacks( "once memory" );
	
			// Catch cases where $(document).ready() is called after the
			// browser event has already occurred.
			// document.readyState 只是document对象的加载状态   
			// uninitialized:尚未开始加载,
			// loading:正在加载,
			// interactive:已经加载了必须的内容，此时用户可以操作
			// compelete:  全部加载完成
			if ( document.readyState === "complete" ) {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				return setTimeout( jQuery.ready, 1 );
			}
	
			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	
				// A fallback to window.onload, that will always work
				//把方法绑定到window对象的load事件上，已确保改方法总是会被执行
				window.addEventListener( "load", jQuery.ready, false );
	
			// If IE event model is used
			} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent( "onreadystatechange", DOMContentLoaded );
	
				// A fallback to window.onload, that will always work
				window.attachEvent( "onload", jQuery.ready );
	
				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;
	
				try {
					toplevel = window.frameElement == null;
				} catch(e) {}
	
				if ( document.documentElement.doScroll && toplevel ) {
					doScrollCheck();
				}
			}
		},
	
		// See test/unit/core.js for details concerning isFunction.
		// Since version 1.3, DOM methods and functions like alert
		// aren't supported. They return false on IE (#2968).
		//判断是不是函数
		isFunction: function( obj ) {
			return jQuery.type(obj) === "function";
		},
	    //判断是不是数组
		isArray: Array.isArray || function( obj ) {
			return jQuery.type(obj) === "array";
		},
	    //检测window对象的特征属性window
		isWindow: function( obj ) {
			return obj != null && obj == obj.window;
		},
	    /*
	     *  add by zhangjh   2016-2-24
	     *  判断obj是不是数字
	     *  isFinite判断obj是否是有限
	     */
		isNumeric: function( obj ) {
			return !isNaN( parseFloat(obj) ) && isFinite( obj );
		},
	    //判断类型
		type: function( obj ) {
			return obj == null ?
				String( obj ) :
					//toString=Object.prototype.toString
				class2type[ toString.call(obj) ] || "object";
		},
		
	    /*
	     * add by zhangjh   2016-2-17
	     * 判断对象是不是一个纯粹的对象，就是用对象字面量{}或者new Object()创建的对象
	     * 注意：是通过new Object()创建的对象，没有参数
	     */
		isPlainObject: function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			//必须是一个对象，但不能是Dom节点，window对象
			if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
	
			try {
				// Not own constructor property must be Object
				if ( obj.constructor &&
				    //判断obj对象本身是否有constructor属性，而不是通过继承得来
					!hasOwn.call(obj, "constructor") &&
					//判断obj对象的原型对象本身是否有isPrototype属性，只有Objecct构造函数有isPrototype属性，其他没有
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
					return false;
				}
			} catch ( e ) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}
	
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
	
			var key;
			for ( key in obj ) {}
	        /*
	         * add by zhangjh   2016-2-17
	         * for( p in obj) 一般用来枚举对象的可枚举属性，枚举顺序是属性定义的顺序，先枚举对象本身的属性，再枚举继承来的属性
	         * 由Js语言核心定义的内置方法就不是可枚举的，内置对象的属性也是“不可枚举的”。
	         * 我们通过自己编写代码定义的属性和方法是可枚举的，继承的自定义属性也是可以枚举的
	         * 最后一句代码的意思是：由于枚举顺序是先枚举自身的属性，然后再枚举继承来的属性，所以当对象为空或者枚举到的最后一个属性是滋生属性是返回true
	         */
			return key === undefined || hasOwn.call( obj, key );
		},
	    //判断对象是否为空
		isEmptyObject: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
	    //接受一个字符串，抛出包含改字符串的异常 
		error: function( msg ) {
			throw new Error( msg );
		},
	   /*
	    * 解析JSON数据格式的数据，返回一个js对象
	    */
		parseJSON: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}
	
			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );
	
			// Attempt to parse using the native JSON parser first
			//如果浏览器提供原生的JSON.parse方法
			if ( window.JSON && window.JSON.parse ) {
				return window.JSON.parse( data );
			}
	
			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			/*
			 * add by zhangjh    2016-2-24
			 * rvalidchars = /^[\],:{}\s]*$/,用意检查字符串是否含有特定的字符(']',',',':','{','}','\s')
			 * rvalidbrace = /(?:^|:|,)(?:\s*\[)+/g   匹配'['
			 * 
			 */
			if ( rvalidchars.test( data.replace( rvalidescape, "@" )
				.replace( rvalidtokens, "]" )
				.replace( rvalidbraces, "")) ) {
	
				return ( new Function( "return " + data ) )();
	
			}
			jQuery.error( "Invalid JSON: " + data );
		},
	
		// Cross-browser xml parsing
		parseXML: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}
			var xml, tmp;
			try {
				if ( window.DOMParser ) { // Standard
					tmp = new DOMParser();
					xml = tmp.parseFromString( data , "text/xml" );
				} else { // IE
					xml = new ActiveXObject( "Microsoft.XMLDOM" );
					xml.async = "false";
					xml.loadXML( data );
				}
			} catch( e ) {
				xml = undefined;
			}
			if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
				jQuery.error( "Invalid XML: " + data );
			}
			return xml;
		},
	    //空函数
		noop: function() {},
	
		// Evaluates a script in a global context
		// Workarounds based on findings by Jim Driscoll
		// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
		globalEval: function( data ) {
			if ( data && rnotwhite.test( data ) ) {
				// We use execScript on Internet Explorer
				// We use an anonymous function so that context is window
				// rather than jQuery in Firefox
				( window.execScript || function( data ) {
					window[ "eval" ].call( window, data );
				} )( data );
			}
		},
	
		// Convert dashed to camelCase; used by the css and data modules
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
		},
	
		// args is for internal usage only
		/*
		 * add by zhangjh   2016-2-23
		 * object:jQuery对象
		 * callback：jQuery对象属性要执行的函数
		 * args：传入callback函数的参数
		 */
		each: function( object, callback, args ) {
			var name, i = 0,
				length = object.length,
				//判断object是对象还是数组
				isObj = length === undefined || jQuery.isFunction( object );
	
			if ( args ) {
				if ( isObj ) {
					for ( name in object ) {
						if ( callback.apply( object[ name ], args ) === false ) {
							break;
						}
					}
				} else {
					for ( ; i < length; ) {
						if ( callback.apply( object[ i++ ], args ) === false ) {
							break;
						}
					}
				}
	
			// A special, fast, case for the most common use of each
			} else {
				//如果没有传入参数，则传入下标和下标对应的值
				if ( isObj ) {
					for ( name in object ) {
						if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
							break;
						}
					}
				} else {
					for ( ; i < length; ) {
						if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
							break;
						}
					}
				}
			}
	
			return object;
		},
	
		// Use native String.trim function wherever possible
		/*
		 * add by zhangjh   2016-2-24
		 * trim = String.prototype.trim,
		 * 去掉字符串左右两边的空格
		 * 有的浏览器木有String.prototype.trim
		 */
		trim: trim ?
			function( text ) {
				return text == null ?
					"" :
					trim.call( text );
			} :
	
			// Otherwise use our own trimming functionality
			function( text ) {
				return text == null ?
					"" :
					text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
			},
	
		// results is for internal usage only
		/*
		 * add by zhangjh    2016-2-24
		 * 将一个类数组对象转化为数组（如果不做内部使用）
		 * array:待转换的对象，可以是任何类型
		 * results: 仅在jQuery内部使用，如果传入参数results，则在results上添加元素
		 */
		makeArray: function( array, results ) {
			var ret = results || [];
	
			if ( array != null ) {
				// The window, strings (and functions) also have 'length'
				// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
				var type = jQuery.type( array );
	            
				if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
					//判断array不是数组或者类数组对象 ，有些有length属性的不一定是对象， string类型的值有length属性  function的length属性是形参的个数，regexp和window对象也有length属性
					push.call( ret, array );
					//ret不一定是数组，所以不能直接使用ret。push（array）
				} else {
					jQuery.merge( ret, array );
				}
			}
	
			return ret;
		},
	    /*
	     * add by zhangjh   2016-2-24
	     * 在数组中查找指定的元素并返回下标，未找到则返回-1
	     * elem：要在数组中查找的值
	     * array：遍历的数组
	     * i：指定开始查找的位置
	     */
		inArray: function( elem, array, i ) {
			var len;
	
			if ( array ) {
				//indexOf = Array.prototype.indexOf
				if ( indexOf ) {
					//如果浏览器支持indexOf方法
					return indexOf.call( array, elem, i );
				}
	
				len = array.length;
				//修正i的值，如果未传入i的值，i修正为0；如果传入的值是负数且大于数组的长度，修正为0
				i = i ? (i < 0 ? Math.max( 0, len + i ) : i) : 0;
	
				for ( ; i < len; i++ ) {
					// Skip accessing in sparse arrays
					//如果数组中的下标不是连续的，则返回false；使用“===”避免类型转黄
					if ( i in array && array[ i ] === elem ) {
						return i;
					}
				}
			}
	
			return -1;
		},
	    /*
	     * add by zhangjh   2016-2-25
	     * 合并两个数组的元素到第一个数组中
	     * first:数组或者类数组对象，必须含有整型（可转化为整型）的length属性
	     * second:数组、类数组对象或者包含连续整型属性的对象{0:'a',1:'b'}
	     * 
	     */
		merge: function( first, second ) {
			var i = first.length,
				j = 0;
	
			if ( typeof second.length === "number" ) {
				for ( var l = second.length; j < l; j++ ) {
					first[ i++ ] = second[ j ];
				}
	
			} else {
				while ( second[j] !== undefined ) {
					first[ i++ ] = second[ j++ ];
				}
			}
	
			first.length = i;
	
			return first;
		},
	    /*
	     * add by zhangjh   2016-2-25
	     * 用于查找数组中满足过滤函数的元素，原数组不会受到影响
	     * elems:待遍历的数组
	     * callback:过滤函数，参数为数组元素和对应下标
	     * inv:true,表示返回满足过滤条件的元素组成的数组；false,表示返回不满足过滤条件的元素组成的数组
	     */
		grep: function( elems, callback, inv ) {
			var ret = [], retVal;
			//将inv转换为boolean值
			inv = !!inv;
	
			// Go through the array, only saving the items
			// that pass the validator function
			for ( var i = 0, length = elems.length; i < length; i++ ) {
				retVal = !!callback( elems[ i ], i );
				if ( inv !== retVal ) {
					ret.push( elems[ i ] );
				}
			}
	
			return ret;
		},
	
		// arg is for internal usage only
		/*
		 * add by zhangjh   2016-2-23
		 * elems:待遍历的数组或对象
		 * callback：回调函数，在数组的每个元素或者对象的每个属性上执行，执行时传入参数，数组或对象的下标和下标对应的值
		 * arg：如果调用jQuery。map的时候传入了餐宿arg，则会传给callback
		 */
		map: function( elems, callback, arg ) {
			var value, key, ret = [],
				i = 0,
				length = elems.length,
				// jquery objects are treated as arrays
				//判断elems是不是数组或者是类数组对象（jQuery对象是类数组对象）
				isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;
	
			// Go through the array, translating each of the items to their
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}
	
			// Go through every key on the object,
			} else {
				for ( key in elems ) {
					value = callback( elems[ key ], key, arg );
	
					if ( value != null ) {
						ret[ ret.length ] = value;
					}
				}
			}
	
			// Flatten any nested arrays
			//相当于Array.concat.apply([],ret)  但是为什么要扁平化？？
			return ret.concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		//全局计数器
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		/*
		 * add by zhangjh   2016-2-25
		 * 接受一个函数，返回一个新函数，新函数总是持有特定的上下文
		 */
		proxy: function( fn, context ) {
			//如果fn是函数。则指定context为fn的上下文；如果context是字符串，则指定fn中属性为context对应的函数的上下文为fn
			if ( typeof context === "string" ) {
				//如果context是string，修正fn和context
				var tmp = fn[ context ];
				//修正context指向特殊上下文
				context = fn;
				//修正fn指向函数或者其他
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			//执行proxy可能会多传入参数，截取多余的参数
			var args = slice.call( arguments, 2 ),
				proxy = function() {
				    //这里巧妙的应用fn.apply(context,***),将fn的上下文指定为context，同时此处的argument与上面的arguments不一样，此处的arguments
				    //指向的是调用proxy生成的函数的时候传入的参数
					return fn.apply( context, args.concat( slice.call( arguments ) ) );
				};
	
			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
	
			return proxy;
		},
	
		// Mutifunctional method to get and set values to a collection
		// The value/s can optionally be executed if it's a function
		/*
		 * add by zhangjh   2016-2-25
		 * attr: function( name, value ) {
		 *    return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
		 * }
		 *    可以为集合中的元素设置一个或者多个属性，或者读取第一个元素的属性值
		 * elems:元素集合，通常为jQuery对象
		 * fn:回调函数，同时支持和设置属性
		 * key:属性名或含有键值对的对象
		 * value:属性值或函数。当参数key是对象，该参数为undefined
		 * chainable:false,get;true,set??
		 * emptyGet:jQuery没有选中元素的返回值
		 * 
		 */
		access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
			var exec,
				bulk = key == null,
				i = 0,
				length = elems.length;
	
			// Sets many values
			if ( key && typeof key === "object" ) {
				for ( i in key ) {
					//为每一个elems设置一个或者多个html属性
					jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
				}
				chainable = 1;
	
			// Sets one value
			} else if ( value !== undefined ) {
				// Optionally, function values get executed if exec is true
				exec = pass === undefined && jQuery.isFunction( value );
	
				if ( bulk ) {
					// Bulk operations only iterate when executing function values
					if ( exec ) {
						exec = fn;
						fn = function( elem, key, value ) {
							return exec.call( jQuery( elem ), value );
						};
	
					// Otherwise they run against the entire set
					} else {
						fn.call( elems, value );
						fn = null;
					}
				}
	
				if ( fn ) {
					for (; i < length; i++ ) {
						fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
					}
				}
	
				chainable = 1;
			}
	
			return chainable ?
				elems :
	
				// Gets
				bulk ?
					fn.call( elems ) :
					length ? fn( elems[0], key ) : emptyGet;
		},
	    //返回当前时间的毫秒表示
		now: function() {
			return ( new Date() ).getTime();
		},
	
		// Use of jQuery.browser is frowned upon.
		// More details: http://docs.jquery.com/Utilities/jQuery.browser
		uaMatch: function( ua ) {
			ua = ua.toLowerCase();
			//rwebkit = /(webkit)[ \/]([\w.]+)/,
			//ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
			//rmsie = /(msie) ([\w.]+)/,
			//rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
			var match = rwebkit.exec( ua ) ||
				ropera.exec( ua ) ||
				rmsie.exec( ua ) ||
				ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
				[];
	
			return { browser: match[1] || "", version: match[2] || "0" };
		},
	
		sub: function() {
			function jQuerySub( selector, context ) {
				return new jQuerySub.fn.init( selector, context );
			}
			jQuery.extend( true, jQuerySub, this );
			jQuerySub.superclass = this;
			jQuerySub.fn = jQuerySub.prototype = this();
			jQuerySub.fn.constructor = jQuerySub;
			jQuerySub.sub = this.sub;
			jQuerySub.fn.init = function init( selector, context ) {
				if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
					context = jQuerySub( context );
				}
	
				return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
			};
			jQuerySub.fn.init.prototype = jQuerySub.fn;
			var rootjQuerySub = jQuerySub(document);
			return jQuerySub;
		},
	
		browser: {}
	});
	
	// Populate the class2type map
	/*
	 * add by zhangjh   2016-2-24 
	 * 加载jQuery.js文件的时候，对class2Type进行复制
	 */
	jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});
	
	browserMatch = jQuery.uaMatch( userAgent );
	if ( browserMatch.browser ) {
		jQuery.browser[ browserMatch.browser ] = true;
		jQuery.browser.version = browserMatch.version;
	}
	
	// Deprecated, use jQuery.browser.webkit instead
	if ( jQuery.browser.webkit ) {
		jQuery.browser.safari = true;
	}
	
	// IE doesn't match non-breaking spaces with \s
	if ( rnotwhite.test( "\xA0" ) ) {
		trimLeft = /^[\s\xA0]+/;
		trimRight = /[\s\xA0]+$/;
	}
	
	// All jQuery objects should point back to these
	rootjQuery = jQuery(document);
	
	// Cleanup functions for the document ready method
	if ( document.addEventListener ) {
		DOMContentLoaded = function() {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		};
	
	} else if ( document.attachEvent ) {
		DOMContentLoaded = function() {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", DOMContentLoaded );
				jQuery.ready();
			}
		};
	}
	
	// The DOM ready check for Internet Explorer
	function doScrollCheck() {
		if ( jQuery.isReady ) {
			return;
		}
	
		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch(e) {
			setTimeout( doScrollCheck, 1 );
			return;
		}
	
		// and execute any waiting functions
		jQuery.ready();
	}
	
	return jQuery;
	})();
	
	
	// String to Object flags format cache
	//对象flagsCache用于存储转换后的标记对象，属性为标记字符串，属性值为true
	var flagsCache = {};
	
	// Convert String-formatted flags into Object-formatted ones and store in cache
	/**
	 *add by zhangjh  2016-3-18
	 *用于将字符串格式的标记（参数flags）转换为对象格式的标记，并把转换结果缓存起来 
	 */
	function createFlags( flags ) {
		//object和flagsCache[flags]同时引用一个对象，改变object，同时也会改变flagsCache[flags]
		var object = flagsCache[ flags ] = {},
			i, length;
		flags = flags.split( /\s+/ );
		for ( i = 0, length = flags.length; i < length; i++ ) {
			object[ flags[i] ] = true;
		}
		return object;
		//  如果flags为'once memory',返回{'once':true,'memory':true},   flagsCache={'once memory':{'once':true,'memory':true}}
	}
	
	/*
	 * Create a callback list using the following parameters:
	 *
	 *	flags:	an optional list of space-separated flags that will change how
	 *			the callback list behaves
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible flags:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
    /**---------------------------------------------   异步队列 Deferred Object   -----------------------------------------------------**/
	jQuery.Callbacks = function( flags ) {
		/*
		 * flags:
		 *     once:确保回调函数列表只能被触发一次，
		 *     memory:记录上一次出发回调函数列表时的参数，之后添加的任何回调函数都将用记录的参数值立即调用，
		 *     unique:确保一个回调函数只能被添加一次，回调函数列表中没有重复值
		 *     stopOnFalse:当某个回调函数返回false时中断执行
		 */
	
		// Convert flags from String-formatted to Object-formatted
		// (we check in cache first)
		
		flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};
	
		var // Actual callback list
		    //存放回调函数的数组
			list = [],
			// Stack of fire calls for repeatable lists
			//
			stack = [],
			// Last fire value (for non-forgettable lists)
			//
			memory,
			// Flag to know if list was already fired
			//回调函数列表是否已经执行完
			fired,
			// Flag to know if list is currently firing
			//回调函数列表是否正在执行
			firing,
			// First callback to fire (used internally by add and fireWith)
			//待执行的第一个回调函数的下标
			firingStart,
			// End of the loop when firing
			//待执行的最后一个回调函数的下标
			firingLength,
			// Index of currently firing callback (modified by remove if needed)
			//当前正在执行的回调函数的下标
			firingIndex,
			// Add one or several callbacks to the list
			//添加一个或者多个对调函数到数组list中
			add = function( args ) {
				var i,
					length,
					elem,
					type,
					actual;
				for ( i = 0, length = args.length; i < length; i++ ) {
					elem = args[ i ];
					type = jQuery.type( elem );
					if ( type === "array" ) {
						// Inspect recursively
						//如果元素还是数组，则继续调用add函数，添加回调函数到list数组
						add( elem );
					} else if ( type === "function" ) {
						// Add if not in unique mode and callback is not in
						if ( !flags.unique || !self.has( elem ) ) {
							//!(flags.unique&&self.has(elem))  如果是unique模式且已经添加的话，不添加
							list.push( elem );
						}
					}
				}
			},
			// Fire callbacks
			/**
			 * add by zhangjh   2016-3-18
			 * 使用指定的上下文context和参数args调用数组list中的回调函数
			 * @param context  用于指定执行fire的上下文
			 * @param args 用于指定调用回调函数时传入的参数
			 */
			fire = function( context, args ) {
				args = args || [];
				//如果当前回调函数列表不是memory模式，则变量memory为true；如果是memory模式，则被赋值为[context,args]，间接表示memory模式
				memory = !flags.memory || [ context, args ];
				fired = true;
				firing = true;
				firingIndex = firingStart || 0;
				firingStart = 0;
				firingLength = list.length;
				for ( ; list && firingIndex < firingLength; firingIndex++ ) {
					if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
						//执行回调函数list[firingIndex],如果返回false，且为stopOnFalse模式
						memory = true; // Mark as halted
						break;
					}
				}
				firing = false;
				if ( list ) {
					//once确保回调函数列表只能被触发一次
					if ( !flags.once ) {
						//如果不是once模式，即可以多次出发回调函数列表，则从变量stack中弹出存放的下文和参数，再次执行整个回调函数列表，知道stack为空
						if ( stack && stack.length ) {
							memory = stack.shift();
							self.fireWith( memory[ 0 ], memory[ 1 ] );
						}
					} else if ( memory === true ) {
						//如果变量memory完全等于true，则说明模式为非memory模式或者stop+某个回调寒素的返回值是false
					  //如果是once模式+非memory模式或者once模式+stopOnFalse模式，则禁止回调函数列表
						self.disable();
					} else {
						//如果是once+memory模式，则清空list数组，后续添加的回调函数还会立即执行
						list = [];
					}
				}
			},
			// Actual Callbacks object
			self = {
				// Add a callback or a collection of callbacks to the list
				//添加一个或一组回调函数到回调函数列表中
				add: function() {
					if ( list ) {
						var length = list.length;
						add( arguments );
						// Do we need to add the callbacks to the
						// current firing batch?
						//说明回调函数列表还在一个一个执行
						if ( firing ) {
							//如果是回调函数列表正在执行中，改变结束下标firingLength，使得新添加的函数也得以运行
							firingLength = list.length;
						// With memory, if we're not firing then
						// we should call right away, unless previous
						// firing was halted (stopOnFalse)
							//说明回调函数列表已经执行完了
						} else if ( memory && memory !== true ) {
							//在memory模式下并且当处于stopOnFalse模式下没有返回false的回调函数，修正firingStart，继续执行
							firingStart = length;
							fire( memory[ 0 ], memory[ 1 ] );
						}
					}
					return this;
				},
				// Remove a callback from the list
				//从回调函数列表中移除一个或一组回调函数
				remove: function() {
					if ( list ) {
						var args = arguments,
							argIndex = 0,
							argLength = args.length;
						for ( ; argIndex < argLength ; argIndex++ ) {
							for ( var i = 0; i < list.length; i++ ) {
								if ( args[ argIndex ] === list[ i ] ) {
									// Handle firingIndex and firingLength
									if ( firing ) {
										//说明回调函数列表正在执行过程中
										if ( i <= firingLength ) {
											//修正firingLength
											firingLength--;
											if ( i <= firingIndex ) {
												//修正firingIndex
												firingIndex--;
											}
										}
									}
									// Remove the element
									list.splice( i--, 1 );
									// If we have some unicity property then
									// we only need to do this once
									if ( flags.unique ) {
										//在unique模式下，list中不会有重复的回调函数，所以不用再在剩下的list中寻找
										break;
									}
								}
							}
						}
					}
					return this;
				},
				// Control if a given callback is in the list
				//检查指定的回调函数是有在回调函数列表中
				has: function( fn ) {
					if ( list ) {
						var i = 0,
							length = list.length;
						for ( ; i < length; i++ ) {
							if ( fn === list[ i ] ) {
								return true;
							}
						}
					}
					return false;
				},
				// Remove all callbacks from the list
				//移除回调函数列表中所有的回调函数
				empty: function() {
					list = [];
					return this;
				},
				// Have the list do nothing anymore
				//禁用回调函数，不再做任何事情
				disable: function() {
					list = stack = memory = undefined;
					return this;
				},
				// Is it disabled?
				//判断回调函数列表是否已经被禁用
				disabled: function() {
					//如果没有被禁用，至少为[]
					return !list;
				},
				// Lock the list in its current state
				//锁定回调函数列表，在memory模式下，仍可以添加和删除回调函数，也不会停止形象余下的其他的回调函数，新添加的回调函数也会立即执行，仅仅是无法触发
				lock: function() {
					//无法再次触发回调函数列表
					stack = undefined;
					if ( !memory || memory === true ) {
						//如果是非memory模式或者memory+stopOnFalse模式且有回调函数返回false，禁用回调函数列表
						self.disable();
					}
					return this;
				},
				// Is it locked?
				//判断回调函数列表是否已经被锁定
				locked: function() {
					//判断回调函数列表是否已经无法再次触发
					return !stack;
				},
				// Call all callbacks with the given context and arguments
				//使用指定的上下文和参数触发回调函数列表中的所有回调函数
				fireWith: function( context, args ) {
					if ( stack ) {
						if ( firing ) {
							//正在执行回调函数列表中
							if ( !flags.once ) {
								//如果不是once模式，先把参数给储存起来
								stack.push( [ context, args ] );
							}
						} else if ( !( flags.once && memory ) ) {
							//回调函数列表不是出于执行状态，如果不是已经出发过的一次模式，就继续执行
							fire( context, args );
						}
					}
					return this;
				},
				// Call all the callbacks with the given arguments
				//使用指定的参数触发回调函数列表中的所有回调函数
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
				// To know if the callbacks have already been called at least once
				//判断回调函数是否被触发过
				fired: function() {
					return !!fired;
				}
			};
	    //返回回调函数列表
		return self;
	};
	
	
	
	
	var // Static reference to slice
		sliceDeferred = [].slice;
	
	jQuery.extend({
	    //异步队列
		Deferred: function( func ) {
			     //成功回调函数列表
			var doneList = jQuery.Callbacks( "once memory" ),
			    //失败回调函数列表
				failList = jQuery.Callbacks( "once memory" ),
				//消息回调函数列表
				progressList = jQuery.Callbacks( "memory" ),
				//状态：待定->pending,成功->resolved,失败->rejected
				state = "pending",
				lists = {
					resolve: doneList,
					reject: failList,
					notify: progressList
				},
				//异步队列的只读副本
				promise = {
				    //添加成功回调函数
					done: doneList.add,
					//添加失败回调函数
					fail: failList.add,
					//添加消息回调函数
					progress: progressList.add,
	                //返回异步队列的状态
					state: function() {
						return state;
					},
	
					// Deprecated
					//返回成功回到函数列表的转态
					isResolved: doneList.fired,
					//返回失败回调函数列表的转态
					isRejected: failList.fired,
	                //同时添加成功回调函数、失败回调函数、消息回调函数到对应的回调函数列表中
					then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
						//done返回的this指向deferred
						deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
						return this;
					},
					//将回调函数同时添加到成功回调函数列表和失败回调函数列表
					always: function() {
						//apply的机制，done对应的函数一般返回的this为回调函数列表，但鱼油apply的使用，this指定为deferred
						//这里不用apply机制也可以
						deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
						return this;
					},
					//接受三个可选的过滤函数作为参数，用于过滤当前异步队列的状态和参数，并返回一个新的异步队列的只读副本??
					pipe: function( fnDone, fnFail, fnProgress ) {
						//创建新的异步队列的时候，传入一个函数参数 function(newDefer),在新的异步队列返回前调用
						return jQuery.Deferred(function( newDefer ) {
							//each（）在每个属性或者值上执行function(handler,data)
							jQuery.each( {
								done: [ fnDone, "resolve" ],
								fail: [ fnFail, "reject" ],
								progress: [ fnProgress, "notify" ]
							}, function( handler, data ) {
								var fn = data[ 0 ],
									action = data[ 1 ],
									returned;
								if ( jQuery.isFunction( fn ) ) {
									deferred[ handler ](function() {
										returned = fn.apply( this, arguments );
										if ( returned && jQuery.isFunction( returned.promise ) ) {
											returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
										} else {
											newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
										}
									});
								} else {
									deferred[ handler ]( newDefer[ action ] );
								}
							});
						}).promise();
					},
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					//返回异步队列的只读副本
					promise: function( obj ) {
						if ( obj == null ) {
							obj = promise;
						} else {
							for ( var key in promise ) {
								obj[ key ] = promise[ key ];
							}
						}
						return obj;
					}
				},
				//定义异步队列
				deferred = promise.promise({}),
				key;
	        //为异步队列添加resolve()(对应fire方法)、resolveWith()(对应firewith方法)、reject()等
			for ( key in lists ) {
				deferred[ key ] = lists[ key ].fire;
				deferred[ key + "With" ] = lists[ key ].fireWith;
			}
	
			// Handle state
			//添加三个成功回调函数
			deferred.done( function() {
				state = "resolved";
			}, failList.disable, progressList.lock )
			//添加三个失败回调函数
			.fail( function() {
				state = "rejected";
			}, doneList.disable, progressList.lock );
	
			// Call given func if any
			//如果传入func，执行func，deferred作为函数参数
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		//提供了一个或多个对象的状态来执行回调函数的功能
		when: function( firstParam ) {
			//把类数组对象转化为数组
			var args = sliceDeferred.call( arguments, 0 ),
				i = 0,
				length = args.length,
				pValues = new Array( length ),
				count = length,
				pCount = length,
				deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
					firstParam :
					jQuery.Deferred(),
				promise = deferred.promise();
			function resolveFunc( i ) {
				return function( value ) {
					args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
					if ( !( --count ) ) {
						deferred.resolveWith( deferred, args );
					}
				};
			}
			function progressFunc( i ) {
				return function( value ) {
					pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
					deferred.notifyWith( promise, pValues );
				};
			}
			if ( length > 1 ) {
				for ( ; i < length; i++ ) {
					if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
						args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
					} else {
						--count;
					}
				}
				if ( !count ) {
					deferred.resolveWith( deferred, args );
				}
			} else if ( deferred !== firstParam ) {
				deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
			}
			return promise;
		}
	});
	
	
	
/*********************************************************   浏览器功能测试模块Support   ******************************************************************/	
	/**
	 * 一般解决浏览器不兼容问题有两种方法，一种是浏览器嗅探，通过判断当前浏览器的类型和版本，然后编写兼容性代码；一种是
	 * 浏览器功能测试，通过检测某县功能在当前浏览器中是否被支持，然后编写相应的兼容性代码
	 */
	
	jQuery.support = (function() {  //自调用匿名函数
	      
		var support,   //用于存放测试项和测试结果
			all,
			a,
			select,
			opt,
			input,
			fragment,
			tds,
			events,
			eventName,
			i,
			isSupported,
			//创建一个div元素，作为后续测试的容器
			div = document.createElement( "div" ), 
			//documentElement：html文件中的html元素
			documentElement = document.documentElement;
	
		// Preliminary tests
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
	    //获取div中所有的元素
		all = div.getElementsByTagName( "*" );
		//获取div中的一个a
		a = div.getElementsByTagName( "a" )[ 0 ];
	
		// Can't get basic test support
		if ( !all || !all.length || !a ) {
			return {};
		}
	
		// First batch of supports tests
		//创建一个select元素
		select = document.createElement( "select" );
		//创建select的子元素option
		opt = select.appendChild( document.createElement("option") );
		//获取一个input元素
		input = div.getElementsByTagName( "input" )[ 0 ];
	
		support = {
			// IE strips leading whitespace when .innerHTML is used
	        //如果浏览器使用innerHtml属性插入HTML代码时保留前导空白符，则leadingWhitespace为true
			leadingWhitespace: ( div.firstChild.nodeType === 3 ),   //nodeType是文本节点
	
			// Make sure that tbody elements aren't automatically inserted
			// IE will insert them into empty tables
			
			//确保浏览器创建tables元素的时候不会自动加入tbody元素，IE6，IE7会在table中自动插入tbody元素
			tbody: !div.getElementsByTagName("tbody").length,
	
			// Make sure that link elements get serialized correctly by innerHTML
			// This requires a wrapper element in IE
			//如果浏览器可以正确序列化link标签，则htmlSerialize为true，IE6/IE7不能正确序列话link标签
			htmlSerialize: !!div.getElementsByTagName("link").length,
	
			// Get the style information from getAttribute
			// (IE uses .cssText instead)
			//如果DOM元素的内联样式可以通过DOM属性style直接访问，则为true
			// IE6/IE7不能通过getAttribute("style")来获取内联样式
			style: /top/.test( a.getAttribute("style") ),
	
			// Make sure that URLs aren't manipulated
			// (IE normalizes it by default)
			//检查getAttribute("href")的返回值与设置的相对路径是否相等，如没有改变，则为true
			//IE6,IE7会格式化为全路径
			hrefNormalized: ( a.getAttribute("href") === "/a" ),
	
			// Make sure that element opacity exists
			// (IE uses filter instead)
			// Use a regex to work around a WebKit issue. See #5145
			//如果浏览器支持样式opacity，则为true，IE6，IE7不支持opacity样式
			//style返回一个包含元素所有样式的对象
			opacity: /^0.55/.test( a.style.opacity ),  //opacity设置元素的不透明级别
	
			// Verify style float existence
			// (IE uses styleFloat instead of cssFloat)
			//如果浏览器支持通过cssFloat访问样式float，则为true
			//IE使用styleFloat访问float样式
			cssFloat: !!a.style.cssFloat,
	
			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			//如果复选框的属性value默认是on，返回true，Safari默认为空字符串
			checkOn: ( input.value === "on" ),
	
			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			//select元素中添加的option元素，默认为选中状态为true，IE6/IE7 默认不选中
			optSelected: opt.selected,
	
			// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
			//如果原生方法getAttribute，setAttribute，removeAttribute可以正确的设置、读取、移除HTML属性，则为true
			//IE6/IE7利用setAttribute设置标签的class属性时，需要传入DOM属性名className，而谷歌。ff则不需要，直接传入HTMl属性class就可以
			//IE6/IE7返回false
			getSetAttribute: div.className !== "t",
	
			// Tests for enctype support on a form(#6743)
			//如果表单元素支持属性enctype，则为true，和encode属性等价，除一些老版本的浏览器，其他浏览器基本支持
			enctype: !!document.createElement("form").enctype,  //enctype规定将表单元素发送到服务器之前应该如何对其进行编码
	
			// Makes sure cloning an html5 element does not cause problems
			// Where outerHTML is undefined, this still works
			//如果浏览器能正确的复制HTML5元素，则为true，IE6/IE7为false
			html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",
	
			// Will be defined later
			//如果submit时间沿着DOM树向上冒泡，则为true
			submitBubbles: true,
			//如果change事件沿着DOM树向上冒泡，则为true
			changeBubbles: true,
			//如果支持focusin事件，则为true
			focusinBubbles: false,
			//如果浏览器允许删除DOM元素上的属性，则为true，IE6/IE7/IE8不允许删除DOM元素上的属性
			deleteExpando: true,
			//如果浏览器在复制DOM元素时不复制事件监听函数，则为true
			noCloneEvent: true,
			//如果为DOM元素设置了样式“display:inline;zoom:1”之后，如果该元素按照inline-block显示，则为true
			inlineBlockNeedsLayout: false,
			//一个子元素拥有hasLayout属性和固定的width或者height时，如果该元素会被子元素撑大，则为true
			shrinkWrapBlocks: false,
			//如果浏览器返回正确的计算样式marginRight，则测试项为true
			reliableMarginRight: true,
			
			pixelMargin: true
		};
	
		// jQuery.boxModel DEPRECATED in 1.3, use jQuery.support.boxModel instead
		//浏览器按照标准盒模型解析元素内容大小，则为true
		//document.compatMode用来判断当前浏览器的渲染模式，CSS1Compat，标准兼容模式开启；BackCompat标准兼容模式关闭
		jQuery.boxModel = support.boxModel = (document.compatMode === "CSS1Compat");
	
		// Make sure checked status is properly cloned
		//设置选中状态
		input.checked = true;
		//复制一个已选中的复选框，然后检查副本元素的选中状态，IE6/IE7为false
		support.noCloneChecked = input.cloneNode( true ).checked;
	
		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		//设置select元素禁用
		select.disabled = true;
		//如果已禁用的select元素中的option元素未被自动禁用，则optDisabled为true
		//IE6,谷歌都未被禁用
		support.optDisabled = !opt.disabled;
	
		// Test to see if it's possible to delete an expando from an element
		// Fails in Internet Explorer
		//IE浏览器不支持使用 delete删除属性
		try {
			delete div.test;
		} catch( e ) {
			support.deleteExpando = false;
		}
	
		if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
			div.attachEvent( "onclick", function() {
				// Cloning a node shouldn't copy over any
				// bound event handlers (IE does this)
				support.noCloneEvent = false;
			});
			div.cloneNode( true ).fireEvent( "onclick" );
		}
	
		// Check if a radio maintains its value
		// after being appended to the DOM
		//如果设置input元素的属性type为“radio”不会导致属性value的值丢失，则为true
		//IE6/IE7设置input的type属性为radio的时候，会丢失name值
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";
	
		input.setAttribute("checked", "checked");
	
		// #11217 - WebKit loses check when the name is after the checked attribute
		//文档片段能正确复制单选按钮和复选框的选中状态，则为true
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
		fragment = document.createDocumentFragment();
		fragment.appendChild( div.lastChild );
	
		// WebKit doesn't clone checked state correctly in fragments
		//IE6/IE7复制的时候会丢失选中状态
		support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		//已选中的单选按钮和复选框添加到DOM树中后，如果仍然为选中状态，则为true
		//IE6/IE7中把选中的单选按钮和复选框添加到DOM树中后，会丢失选中状态
		support.appendChecked = input.checked;
	
		fragment.removeChild( input );
		fragment.appendChild( div );
	
		// Technique from Juriy Zaytsev
		// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
		// We only care about the case where non-standard event systems
		// are used, namely in IE. Short-circuiting here helps us to
		// avoid an eval call (in setAttribute) which can cause CSP
		// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
		if ( div.attachEvent ) {
			for ( i in {
				submit: 1,
				change: 1,
				focusin: 1
			}) {
				eventName = "on" + i;
				isSupported = ( eventName in div );
				if ( !isSupported ) {
					div.setAttribute( eventName, "return;" );
					isSupported = ( typeof div[ eventName ] === "function" );
				}
				support[ i + "Bubbles" ] = isSupported;
			}
		}
	
		fragment.removeChild( div );
	
		// Null elements to avoid leaks in IE
		fragment = select = opt = div = input = null;
	
		// Run tests that need a body at doc ready
		
		jQuery(function() {
			
			var container, outer, inner, table, td, offsetSupport,
				marginDiv, conMarginTop, style, html, positionTopLeftWidthHeight,
				paddingMarginBorderVisibility, paddingMarginBorder,
				body = document.getElementsByTagName("body")[0];
	
			if ( !body ) {
				// Return for frameset docs that don't have a body
				return;
			}
	
			conMarginTop = 1;
			paddingMarginBorder = "padding:0;margin:0;border:";
			positionTopLeftWidthHeight = "position:absolute;top:0;left:0;width:1px;height:1px;";
			paddingMarginBorderVisibility = paddingMarginBorder + "0;visibility:hidden;";
			style = "style='" + positionTopLeftWidthHeight + paddingMarginBorder + "5px solid #000;";
			html = "<div " + style + "display:block;'><div style='" + paddingMarginBorder + "0;display:block;overflow:hidden;'></div></div>" +
				"<table " + style + "' cellpadding='0' cellspacing='0'>" +
				"<tr><td></td></tr></table>";
			
	        //container为一个div元素
			container = document.createElement("div");
			//设置container的内联样式
			container.style.cssText = paddingMarginBorderVisibility + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
			body.insertBefore( container, body.firstChild );
	
			// Construct the test element
			div = document.createElement("div");
			container.appendChild( div );
	
			// Check if table cells still have offsetWidth/Height when they are set
			// to display:none and there are still other visible table cells in a
			// table row; if so, offsetWidth/Height are not reliable for use when
			// determining if an element has been hidden directly using
			// display:none (it is still safe to use offsets if a parent element is
			// hidden; don safety goggles and see bug #4512 for more information).
			// (only IE 8 fails this test)
			div.innerHTML = "<table><tr><td style='" + paddingMarginBorder + "0;display:none'></td><td>t</td></tr></table>";
			tds = div.getElementsByTagName( "td" );
			//clientHeight:可见区域的高度，不包含border，滚动条；offsetHeight：一般为容器本身的style中的height属性（谷歌加border，IE不加）
			//scrollHeight:区域内内容的实际高度
			isSupported = ( tds[ 0 ].offsetHeight === 0 );
	
			tds[ 0 ].style.display = "";
			tds[ 1 ].style.display = "none";
	
			// Check if empty table cells still have offsetWidth/Height
			// (IE <= 8 fail this test)
			//如果空单元格的可见高度offsetHeight为0，则为true
			support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			if ( window.getComputedStyle ) {
				//原生方法getComputerdStyle返回DOM元素的计算样式？
				div.innerHTML = "";
				marginDiv = document.createElement( "div" );
				marginDiv.style.width = "0";
				//margin 外边距； padding 内边距
				marginDiv.style.marginRight = "0";
				div.style.width = "2px";
				div.appendChild( marginDiv );
				support.reliableMarginRight =
					( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
			}
	        //zoom属性？
			if ( typeof div.style.zoom !== "undefined" ) {
				// Check if natively block-level elements act like inline-block
				// elements when setting their display to 'inline' and giving
				// them layout
				// (IE < 8 does this)
				div.innerHTML = "";
				div.style.width = div.style.padding = "1px";
				div.style.border = 0;
				div.style.overflow = "hidden";
				div.style.display = "inline";
				div.style.zoom = 1;
				support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );
	
				// Check if elements with layout shrink-wrap their children
				// (IE 6 does this)
				div.style.display = "block";
				div.style.overflow = "visible";
				div.innerHTML = "<div style='width:5px;'></div>";
				support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );
			}
	
			div.style.cssText = positionTopLeftWidthHeight + paddingMarginBorderVisibility;
			div.innerHTML = html;
	
			outer = div.firstChild;
			inner = outer.firstChild;
			td = outer.nextSibling.firstChild.firstChild;
	
			offsetSupport = {
				//如果子元素距其父元素上边界的距离不包含父元素的上边框厚度，则为true
				doesNotAddBorder: ( inner.offsetTop !== 5 ),
				//如果td元素距其父元素tr上边界的距离包含table元素的上边框厚度，则为true
				doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
			};
	
			inner.style.position = "fixed";
			inner.style.top = "20px";
	
			// safari subtracts parent border width here which is 5px
			//如果浏览器能正确返回fixed元素的窗口坐标，则为true
			offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
			inner.style.position = inner.style.top = "";
	
			outer.style.overflow = "hidden";
			outer.style.position = "relative";
	        //如果父元素的样式overflow为“hidden”，子元素距父元素边界的距离会减去父元素的边框厚度，则为true
			offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
			//如果body元素距html元素边框的距离不包括body元素的外边距margin，则为true
			offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );
	
			if ( window.getComputedStyle ) {
				div.style.marginTop = "1%";
				support.pixelMargin = ( window.getComputedStyle( div, null ) || { marginTop: 0 } ).marginTop !== "1%";
			}
	
			if ( typeof container.style.zoom !== "undefined" ) {
				container.style.zoom = 1;
			}
	
			body.removeChild( container );
			marginDiv = div = container = null;
	
			jQuery.extend( support, offsetSupport );
		});
	
		return support;
	})();
	
	
	
	
	var rbrace = /^(?:\{.*\}|\[.*\])$/,
		rmultiDash = /([A-Z])/g;
	
	/*************************************************  数据缓存模块   ***********************************************************/
	jQuery.extend({
		//全局缓存对象
		cache: {},
	
		// Please use with caution
		//唯一种子ID
		uuid: 0,
	
		// Unique for each copy of jQuery on the page
		// Non-digits removed to match rinlinejQuery
		//页面中每个jQuery副本的唯一标识
		expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),
	
		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData: {
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},
	    //是否有关联的数据
		hasData: function( elem ) {
			elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},
	    //设置、读取自定义数据或内部数据
		/**
		 * add by zhangjh   2016-3-21
		 * @param elem 表示与数据关联的DOM元素
		 * @param name 表示要设置或读取的数据名，或者是含有键值对的对象
		 * @param data 表示要设置的数据值，可以是任意类型
		 * @param pvt 指示读取或这只的数据是内部数据还是自定义的数据，如果true表示读取或设置的是内部数据；false则表示读取或设置的是自定义数据
		 */
		data: function( elem, name, data, pvt /* Internal Use Only */ ) {
			//判断elem是不是可以设置数据
			if ( !jQuery.acceptData( elem ) ) {
				return;
			}
	
			var privateCache, thisCache, ret,
				internalKey = jQuery.expando,
				getByName = typeof name === "string",
	
				// We have to handle DOM nodes and JS objects differently because IE6-7
				// can't GC object references properly across the DOM-JS boundary
				isNode = elem.nodeType,
	
				// Only DOM nodes need the global jQuery cache; JS object data is
				// attached directly to the object so GC can occur automatically
				//如果是DOM元素，则把数据添加到jQuery.cache中，否则直接添加到对象中
				cache = isNode ? jQuery.cache : elem,
	
				// Only defining an ID for JS objects if its cache already exists allows
				// the code to shortcut on the same path as a DOM node with no cache
				//取出关联ID，对于DOM元素，elem[internalKey]存储的是关联ID；对于js对象，elem[internalKey]存储的是数据对象，internalkey是关联ID
				id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
				//isEvent表示是否读取私有数据events
				isEvents = name === "events";
	
			// Avoid doing any more work than we need to when trying to get data on an
			// object that has no data at all
			//当尝试在一个没有任何数据的对象上读取数据时，直接返回    getByName&&data===undefined表示读取数据
			if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
				return;
			}
	        //如果关联ID不存在，则分配一个
			if ( !id ) {
				// Only DOM nodes need a new unique ID for each element since their data
				// ends up in the global cache
				if ( isNode ) {
					elem[ internalKey ] = id = ++jQuery.uuid;
				} else {
					id = internalKey;
				}
			}
	        
			if ( !cache[ id ] ) {
				//如果数据缓存对象不存在，则设置为空
				cache[ id ] = {};
	
				// Avoids exposing jQuery metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					//如果是js对象，设置toJSON为空函数，已避免在执行JSON.stringify()是暴露缓存数据？？？？
					cache[ id ].toJSON = jQuery.noop;
				}
			}
	
			// An object can be passed to jQuery.data instead of a key/value pair; this gets
			// shallow copied over onto the existing cache
			if ( typeof name === "object" || typeof name === "function" ) {
				//如果参数name是对象或者函数，则批量设置数据
				if ( pvt ) {
					//对于内部数据，吧参数name对应的值整合到cache[id]中
					cache[ id ] = jQuery.extend( cache[ id ], name );
				} else {
					//如果是自定义数据，将参数name对应的值整合到cache[id].data中
					cache[ id ].data = jQuery.extend( cache[ id ].data, name );
				}
			}
	        
			privateCache = thisCache = cache[ id ];
	
			// jQuery data() is stored in a separate object inside the object's internal data
			// cache in order to avoid key collisions between internal data and user-defined
			// data.
			if ( !pvt ) {
				if ( !thisCache.data ) {
					thisCache.data = {};
				}
	
				thisCache = thisCache.data;
			}
	
			if ( data !== undefined ) {
				thisCache[ jQuery.camelCase( name ) ] = data;
			}
	
			// Users should not attempt to inspect the internal events object using jQuery.data,
			// it is undocumented and subject to change. But does anyone listen? No.
			if ( isEvents && !thisCache[ name ] ) {
				return privateCache.events;
			}
	
			// Check for both converted-to-camel and non-converted data property names
			// If a data property was specified
			//如果那么参数是字符串，则读取单个数据
			if ( getByName ) {
	
				// First Try to find as-is property data
				ret = thisCache[ name ];
	
				// Test for null|undefined property data
				if ( ret == null ) {
	
					// Try to find the camelCased property
					ret = thisCache[ jQuery.camelCase( name ) ];
				}
			} else {
				ret = thisCache;
			}
	
			return ret;
		},
	    /**
	     * add by zhangjh  2016-3-22
	     * 移除通过jQuery.data()设置的数据
	     * @param elem  待移除数据的DOM元素或者js对象
	     * @param name  待移除的数据名，可以是单个数据名、数据名数组、用空格风格的多个数据名
	     * @param pvt  指定移除的数据是内部数据还是自定义数据
	     */
		removeData: function( elem, name, pvt /* Internal Use Only */ ) {
			//检查elem是否可以设置参数
			if ( !jQuery.acceptData( elem ) ) {
				return;
			}
	
			var thisCache, i, l,
	
				// Reference to internal data cache key
				internalKey = jQuery.expando,
	
				isNode = elem.nodeType,
	
				// See jQuery.data for more information
				//cache指向存储数据的对象
				cache = isNode ? jQuery.cache : elem,
	
				// See jQuery.data for more information
			    //关联ID
				id = isNode ? elem[ internalKey ] : internalKey;
	
			// If there is already no cache entry for this object, there is no
			// purpose in continuing
			//如果数据缓存对象不存在，则返回
			if ( !cache[ id ] ) {
				return;
			}
	
			if ( name ) {
	            //pvt是true，为内部数据；为false，是自定义数据
				thisCache = pvt ? cache[ id ] : cache[ id ].data;
	
				if ( thisCache ) {
	
					// Support array or space separated string names for data keys
					if ( !jQuery.isArray( name ) ) {
	                    //name不是数组，将name封装成数组
						// try the string as a key before any manipulation
						if ( name in thisCache ) {
							name = [ name ];
						} else {
	
							// split the camel cased version by spaces unless a key with the spaces exists
							name = jQuery.camelCase( name );
							if ( name in thisCache ) {
								name = [ name ];
							} else {
								//风格数组
								name = name.split( " " );
							}
						}
					}
	
					for ( i = 0, l = name.length; i < l; i++ ) {
						delete thisCache[ name[i] ];
					}
	
					// If there is no data left in the cache, we want to continue
					// and let the cache object itself get destroyed
					if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
						return;
					}
				}
			}
	        //如果没有name参数，则移除DOM元素或者js对象所有关联的数据
			// See jQuery.data for more information
			if ( !pvt ) {
				//删除自定义数据
				delete cache[ id ].data;
	
				// Don't destroy the parent cache unless the internal data object
				// had been the only thing left in it
				//检查是否有内部数据，如果有，则返回？？
				if ( !isEmptyDataObject(cache[ id ]) ) {
					return;
				}
			}
	
			// Browsers that fail expando deletion also refuse to delete expandos on
			// the window, but it will allow it on all other JS objects; other browsers
			// don't care
			// Ensure that `cache` is not a window object #10080
			
			if ( jQuery.support.deleteExpando || !cache.setInterval ) {
				//如果支持删除DOM元素上的扩展属性或者cache不是window对象
				delete cache[ id ];
			} else {
				cache[ id ] = null;
			}
	
			// We destroyed the cache and need to eliminate the expando on the node to avoid
			// false lookups in the cache for entries that no longer exist
			if ( isNode ) {
				// IE does not allow us to delete expando properties from nodes,
				// nor does it have a removeAttribute function on Document nodes;
				// we must handle all of these cases
				if ( jQuery.support.deleteExpando ) {
					delete elem[ internalKey ];
				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( internalKey );
				} else {
					elem[ internalKey ] = null;
				}
			}
		},
	
		// For internal use only.
		//用于为DOM元素或者javascript对象设置或者读取内部数据，第四个参数pvt设置为true
		//用于队列模块、动画模块、样式操作模块、事件系统提供基础功能，或者设置或者读取这些模块运行时的内部数据
		_data: function( elem, name, data ) {
			return jQuery.data( elem, name, data, true );
		},
	
		// A method for determining if a DOM node can handle the data expando
		//判断elem是否可以设置数据
		acceptData: function( elem ) {
			if ( elem.nodeName ) {
				//embed、object、applet元素不支持设置数据，所以要进行判断
				var match = jQuery.noData[ elem.nodeName.toLowerCase() ];
	
				if ( match ) {
					//判断elem是不是flash，flash可以设置数据
					return !(match === true || elem.getAttribute("classid") !== match);
				}
			}
	
			return true;
		}
	});
	
	jQuery.fn.extend({
		//设置、读取自定义数据，解析HTML5属性，用于jQuery对象调用
		data: function( key, value ) {
			var parts, part, attr, name, l,
			    //jQuery对象的第一个元素
				elem = this[0],
				i = 0,
				data = null;
	
			// Gets all values
			if ( key === undefined ) {
				//如果没有参入参数key，相当于$("***").data();
				if ( this.length ) {
					//获取jQuery对象第一个元素的自定义数据缓存对象
					data = jQuery.data( elem );
	                //如果elem是Element且是html5元素？？
					if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
						
						
						attr = elem.attributes;
						for ( l = attr.length; i < l; i++ ) {
							name = attr[i].name;
	
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.substring(5) );
	
								dataAttr( elem, name, data[ name ] );
							}
						}
						jQuery._data( elem, "parsedAttrs", true );
					}
				}
	
				return data;
			}
	
			// Sets multiple values
			//如果key是object
			if ( typeof key === "object" ) {
				//如果object是对象，则遍历匹配元素集合，为每一个匹配元素调用jQuery.data方法设置数据
				return this.each(function() {
					jQuery.data( this, key );
				});
			}
	        //如果只参入参数key
			//取出命名空间？？
			parts = key.split( ".", 2 );
			parts[1] = parts[1] ? "." + parts[1] : "";
			part = parts[1] + "!";
	
			return jQuery.access( this, function( value ) {
	
				if ( value === undefined ) {
					data = this.triggerHandler( "getData" + part, [ parts[0] ] );
	
					// Try to fetch any internally stored data first
					if ( data === undefined && elem ) {
						data = jQuery.data( elem, key );
						data = dataAttr( elem, key, data );
					}
	
					return data === undefined && parts[1] ?
						this.data( parts[0] ) :
						data;
				}
	
				parts[1] = value;
				this.each(function() {
					var self = jQuery( this );
	
					self.triggerHandler( "setData" + part, parts );
					jQuery.data( this, key, value );
					self.triggerHandler( "changeData" + part, parts );
				});
			}, null, value, arguments.length > 1, null, false );
		},
       //移除自定义数据	
		removeData: function( key ) {
			return this.each(function() {
				jQuery.removeData( this, key );
			});
		}
	});
	
	
	/**
	 * add by zhangjh   2016-3-22
	 * 用于解析HTML5属性data-中含有的数据，并把解析结果放入DOM元素关联的自定义数据缓存对象中
	 * @param elem 表示待解析HTML5属性data-的DOM元素
	 * @param key 表示待解析的数据名
	 * @param data 表示从DOM元素关联的自定义数据缓存对象中取到的数据，只有data为undefied时，才会解析html5属性
	 */
	function dataAttr( elem, key, data ) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
	        //rmultiDash = /([A-Z])/g;
			//把key转化为html5元素相应的属性名，data-****
			var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
	        //获取属性值
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					jQuery.isNumeric( data ) ? +data :
						//	var rbrace = /^(?:\{.*\}|\[.*\])$/,
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch( e ) {}
	
				// Make sure we set the data so it isn't changed later
				//把解析结果放入关联的自定义数据缓存对象jQuery.cache[id].data中
				jQuery.data( elem, key, data );
	
			} else {
				data = undefined;
			}
		}
	
		return data;
	}
	
	// checks a cache object for emptiness
	function isEmptyDataObject( obj ) {
		for ( var name in obj ) {
	
			// if the public data object is empty, the private is still empty
			if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
				//有data属性，但是data属性对应的值为空
				continue;
			}
			if ( name !== "toJSON" ) {
				//不是toJSON属性，则返回false
				return false;
			}
		}
	
		return true;
	}
	
	
/******************************************************   队列模块   **************************************************************/
	/**
	 * add by zhangjh   2016-3-26
	 * 负责检测匹配元素关联的队列和计数器是否完成，如果完成，触发promise的计数器-1
	 * @param elem   dom元素或者js对象
	 * @parm type    关联的队列或者计数器名称
	 * @param src    
	 */
	function handleQueueMarkDefer( elem, type, src ) {
		var deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			defer = jQuery._data( elem, deferDataKey );
		if ( defer &&
			( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
			( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
			// Give room for hard-coded callbacks to fire first
			// and eventually mark/queue something else on the element
			//使用setTimeout(function(){},0)是为了函数优先执行
			setTimeout( function() {
				if ( !jQuery._data( elem, queueDataKey ) &&
					!jQuery._data( elem, markDataKey ) ) {
					jQuery.removeData( elem, deferDataKey, true );
					defer.fire();
				}
			}, 0 );
		}
	}
	
	jQuery.extend({
	    /**
	     * add by zhangjh   2016-3-26
	     * @param elem  每个DOM元素或者js对象
	     * @param type  计数器名称，默认为非阻塞动画计数器fx
	     * 使elem的计数器+1
	     */
		_mark: function( elem, type ) {
			if ( elem ) {
				//用于维护一个elem元素的计数器
				type = ( type || "fx" ) + "mark";
				//计数器+1
				jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
			}
		},
	    /**
	     * add by zhangjh
	     * @param force   表示是否强制计数器归0
	     * @param elem    表示DOM元素或者js对象
	     * @param type    计数器名称
	     * 
	     */
		_unmark: function( force, elem, type ) {
			//修正force，elem，type
			//表明force默认我false，false时不用传false的参数
			if ( force !== true ) {
				type = elem;
				elem = force;
				force = false;
			}
			if ( elem ) {
				type = type || "fx";
				var key = type + "mark",
					count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
				if ( count ) {
					jQuery._data( elem, key, count );
				} else {
					//true表示移除内部数据
					jQuery.removeData( elem, key, true );
					handleQueueMarkDefer( elem, type, "mark" );
				}
			}
		},
	    /**
	     * add by zhangjh  2016-3-26
	     * 用于返回或修改匹配元素关联的函数队列,data不存在，返回elem中type对应的元素；data存在且为数组，则替换elem中type对应的元素；
	     * data存在且为函数，则插入elem中type对应的值
	     * elem中fxqueue对应的是一个函数数组
	     * @param elem  DOM元素或者Js对象，在其上查找或者修改对象
	     * @param type  字符串，表示队列名称，默认为标准动画fx
	     * @param data  可选的函数或者函数数组
	     * @returns {Boolean}
	     */
		queue: function( elem, type, data ) {
			var q;
			if ( elem ) {
				//type默认为fx
				type = ( type || "fx" ) + "queue";
				//读取elem中type对应的内部内容
				q = jQuery._data( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !q || jQuery.isArray(data) ) {
						//如果elem中type+queue对应的内容不存在或者data是数组，这设置elem中type对应的值为data
						q = jQuery._data( elem, type, jQuery.makeArray(data) );
					} else {
						//如果data值不是数组，则插入
						q.push( data );
					}
				}
				//如果data不存在，elem的type对应的值存在，返回q；不存在，则返回[]
				return q || [];
			}
		},
	    /**
	     * add by zhangjh   2016-3-26
	     * 用于出队并执行匹配元素关联的函数队列中的下一个函数
	     * @param elem
	     * @param type
	     */
		dequeue: function( elem, type ) {
			type = type || "fx";
	        //获取匹配元素关联的函数队列
			var queue = jQuery.queue( elem, type ),
			    //出队第一个函数
				fn = queue.shift(),
				//存放出队的函数在执行时的数据
				hooks = {};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			//如果出队的是一个占位符“inprogress”，则重新出队一个函数
			if ( fn === "inprogress" ) {
				fn = queue.shift();
			}
	        //fn应该是一个接受一个回调函数参数的函数
			if ( fn ) {
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				//只有动画队列会设置占位符，即type为“fx”
				if ( type === "fx" ) {
					//数组头部插入占位符inprogress，表明动画函数正在执行中
					queue.unshift( "inprogress" );
				}
	            //设置内部数据type+“.run”，对应的值为hooks
				jQuery._data( elem, type + ".run", hooks );
				fn.call( elem, function() {
					//执行fn函数的上下文是elem，传入fn的是两个参数，f()和hooks
					jQuery.dequeue( elem, type );
				}, hooks );
			}
	
			if ( !queue.length ) {
				//如果type对应的队列为空，则移除参数type相关的数据对象 ，remove接受的参数可以是用空格隔开的字符串
				jQuery.removeData( elem, type + "queue " + type + ".run", true );
				handleQueueMarkDefer( elem, type, "queue" );
			}
		}
	});

	jQuery.fn.extend({
		/**
		 * add by zhangjh   2016-3-26
		 * 用于返回第一个匹配元素关联的函数队列或者修改所有匹配元素关联的函数队列
		 * @param type 字符串，表示队列名称，默认是动画队列fx
		 * @param data 可选的爱函数或者函数数组
		 * @returns
		 */
		queue: function( type, data ) {
			var setter = 2;
	        //修正type
			if ( typeof type !== "string" ) {
				//当为$("a").queue()或者$("a").queue(data)时，修正type为fx，data为type
				data = type;
				type = "fx";
				setter--;
			}
	        //如果是$("a").queue()，，表示是获取操作，取第一个匹配元素上参数type队形的函数队列
			if ( arguments.length < setter ) {
				return jQuery.queue( this[0], type );
			}
	        //设置操作
			return data === undefined ?
				this :
				this.each(function() {
					//this指代匹配的jQuery对象中的每一个元素
					var queue = jQuery.queue( this, type, data );
	
					if ( type === "fx" && queue[0] !== "inprogress" ) {
						//动画函数入队之后，如果当前没有动画函数在执行，则立即执行动画函数
						jQuery.dequeue( this, type );
					}
				});
		},
		//用于出队并执行匹配元素关联的函数队列中的下一个函数
		dequeue: function( type ) {
			return this.each(function() {
				jQuery.dequeue( this, type );
			});
		},
		// Based off of the plugin by Clint Helfers, with permission.
		// http://blindsignals.com/index.php/2009/07/jquery-delay/
		/**
		 *  add by zhangjh   2016-3-26
		 *  @param time  表示延迟时间
		 *  @param type  表示队列名称
		 *  用于设置一个定时器，以使匹配元素关联的函数队列中后续的函数延迟出队和执行
		 */
		delay: function( time, type ) {
			time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
			type = type || "fx";
	        //调用$("a").queue方法，next操作可能是function(){jQuery.dequeue( elem, type );}
			//通过setTimeout(next,time)设置下一个函数出队执行的时间
			return this.queue( type, function( next, hooks ) {
				var timeout = setTimeout( next, time );
				//取消定时器？？
				hooks.stop = function() {
					clearTimeout( timeout );
				};
			});
		},
		//设置jQuery对象每一个匹配元素的type的函数队列为[]
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		/**
		 * add by zhangjh   2016-3-26
		 * 返回一个异步队列的只读副本，观察每个匹配元素关联的某个类型的队列和计数器是否完成
		 * @param type  表示需要观察的队列名称和计数器名称，默认为fx
		 * @param object  可选的对象，指向异步队列的只读方法附加的对象
		 */
		promise: function( type, object ) {
			//当为$("a").promise(object)时修正type和object
			if ( typeof type !== "string" ) {
				object = type;
				type = undefined;
			}
			//修正type
			type = type || "fx";
			//建立一个异步队列
			var defer = jQuery.Deferred(),
			    //元素集合
				elements = this,
				//匹配元素的个数
				i = elements.length,
				count = 1,
				//匹配元素关联的回调函数列表的名称
				deferDataKey = type + "defer",
				//匹配元素关联的队列名称
				queueDataKey = type + "queue",
				//匹配元素关联的计数器的名称
				markDataKey = type + "mark",
				//临时变量，指向匹配元素关联的回调函数列表
				tmp;
			//特殊回调函数
			function resolve() {
				if ( !( --count ) ) {
					//当count变为0的时候，触发异步队列的成功回调函数
					defer.resolveWith( elements, [ elements ] );
				}
			}
			while( i-- ) {
				if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
						( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
							jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
						jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
					//存在回到函数列表，则把resolve添加到异步队列中，不存在，则建一个回调函数列表
					count++;
					tmp.add( resolve );
				}
			}
			//调用特殊回调函数，如果没有需要观察的元素，立即触发异步队列的成功回调函数
			resolve();
			//返回异步队列的只读副本
			return defer.promise( object );
		}
	});
	
	
	
	
	var rclass = /[\n\t\r]/g,
		rspace = /\s+/,
		rreturn = /\r/g,
		rtype = /^(?:button|input)$/i,
		rfocusable = /^(?:button|input|object|select|textarea)$/i,
		rclickable = /^a(?:rea)?$/i,
		rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
		getSetAttribute = jQuery.support.getSetAttribute,
		nodeHook, boolHook, fixSpecified;

/*********************************************************   属性操作模块  ********************************************************************/	
	//jquery属性操作模块有四部分组成:HTML属性操作、DOM属性操作、类样式操作、值操作
	jQuery.fn.extend({
		//
		attr: function( name, value ) {
			return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * @param name  html属性
	     * @returns
	     * 用于从匹配元素集中的每个元素上移除一个或者多个HTML属性
	     */
		removeAttr: function( name ) {
			return this.each(function() {
				jQuery.removeAttr( this, name );
			});
		},
        /**
         * add by zhangjh  2016-4-14
         * @param name  DOM属性
         * @param value 属性值
         * @returns
         * 用于为匹配元素集合中的灭个元素设置一个或者多个DOM属性
         */
		prop: function( name, value ) {
			return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * @param name  DOM属性名
	     * @returns
	     * 用于从匹配元素集中的每个元素上移除一个DOM属性
	     */
		removeProp: function( name ) {
			name = jQuery.propFix[ name ] || name;
			return this.each(function() {
				// try/catch handles cases where IE balks (such as removing a property on window)
				//IE6/7不允许删除DOM元素上的属性，用try-catch包裹，捕获异常
				try {
					this[ name ] = undefined;
					delete this[ name ];
				} catch( e ) {}
			});
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * 为匹配元素集合中的每个元素添加一个或者多个样式
	     * @param value   
	     * @returns
	     */
		addClass: function( value ) {
			var classNames, i, l, elem,
				setClass, c, cl;
	        //如果value是函数
			if ( jQuery.isFunction( value ) ) {
				return this.each(function( j ) {
					jQuery( this ).addClass( value.call(this, j, this.className) );
				});
			}
	
			if ( value && typeof value === "string" ) {
				//分隔value
				classNames = value.split( rspace );
	
				for ( i = 0, l = this.length; i < l; i++ ) {
					elem = this[ i ];
	
					if ( elem.nodeType === 1 ) {
						if ( !elem.className && classNames.length === 1 ) {
							//如果DOM元素没有className，则直接添加
							elem.className = value;
	
						} else {
							setClass = " " + elem.className + " ";
	
							for ( c = 0, cl = classNames.length; c < cl; c++ ) {
								if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
									//判断setClass中是否以存在要添加的className
									setClass += classNames[ c ] + " ";
								}
							}
							// 去掉className前后的空格
							elem.className = jQuery.trim( setClass );
						}
					}
				}
			}
	
			return this;
		},
	   /**
	    * add by zhangjh   2016-4-14
	    * 移除样式
	    * @param value
	    * @returns
	    */
		removeClass: function( value ) {
			var classNames, i, l, elem, className, c, cl;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each(function( j ) {
					jQuery( this ).removeClass( value.call(this, j, this.className) );
				});
			}
	
			if ( (value && typeof value === "string") || value === undefined ) {
				classNames = ( value || "" ).split( rspace );
	
				for ( i = 0, l = this.length; i < l; i++ ) {
					elem = this[ i ];
	
					if ( elem.nodeType === 1 && elem.className ) {
						if ( value ) {
							className = (" " + elem.className + " ").replace( rclass, " " );
							for ( c = 0, cl = classNames.length; c < cl; c++ ) {
								className = className.replace(" " + classNames[ c ] + " ", " ");
							}
							elem.className = jQuery.trim( className );
	
						} else {
							//未传入参数，则移除DOM元素的所有样式
							elem.className = "";
						}
					}
				}
			}
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * 为每一个DOM元素添加或者删除一个或者多个样式
	     * @param value   
	     * @param stateVal
	     * @returns
	     */
		toggleClass: function( value, stateVal ) {
			var type = typeof value,
				isBool = typeof stateVal === "boolean";
	
			if ( jQuery.isFunction( value ) ) {
				return this.each(function( i ) {
					jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
				});
			}
	
			return this.each(function() {
				if ( type === "string" ) {
					// toggle individual class names
					var className,
						i = 0,
						self = jQuery( this ),
						state = stateVal,
						classNames = value.split( rspace );
	
					while ( (className = classNames[ i++ ]) ) {
						// check each className given, space seperated list
						state = isBool ? state : !self.hasClass( className );
						self[ state ? "addClass" : "removeClass" ]( className );
					}
	
				} else if ( type === "undefined" || type === "boolean" ) {
					if ( this.className ) {
						// store className if set
						//先把自己的样式缓存起来
						jQuery._data( this, "__className__", this.className );
					}
	
					// toggle whole className
					this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
				}
			});
		},
	    /**
	     * add by zhangjh    2016-4-14
	     * 用于检测匹配元素集合中是否有指定的类样式，只要有其中的一个元素就返回true
	     * @param selector
	     * @returns {Boolean}
	     */
		hasClass: function( selector ) {
			var className = " " + selector + " ",
				i = 0,
				l = this.length;
			for ( ; i < l; i++ ) {
				if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
					return true;
				}
			}
	
			return false;
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * 用于获取或者设置DOM元素的value值
	     * @param value
	     * @returns
	     */
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[0];
			if ( !arguments.length ) {
				//如果没有传入参数
				if ( elem ) {
					//查找节点名称或属性type对应的修正对象
					hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];
	
					if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
						return ret;
					}
	
					ret = elem.value;
	
					return typeof ret === "string" ?
						// handle most common string cases
						ret.replace(rreturn, "") :
						// handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}
	
				return;
			}
	
			isFunction = jQuery.isFunction( value );
	        //如果传入了参数，则设置每个元素的value值
			return this.each(function( i ) {
				var self = jQuery(this), val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, self.val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
				} else if ( typeof val === "number" ) {
					val += "";
				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map(val, function ( value ) {
						return value == null ? "" : value + "";
					});
				}
	
				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			});
		}
	});
	
	jQuery.extend({
		valHooks: {
			option: {
				get: function( elem ) {
					// attributes.value is undefined in Blackberry 4.7 but
					// uses .value. See #6932
					var val = elem.attributes.value;
					return !val || val.specified ? elem.value : elem.text;
				}
			},
			select: {
				get: function( elem ) {
					var value, i, max, option,
						index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type === "select-one";
	
					// Nothing was selected
					if ( index < 0 ) {
						return null;
					}
	
					// Loop through all the selected options
					i = one ? index : 0;
					max = one ? index + 1 : options.length;
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// Don't return options that are disabled or in a disabled optgroup
						if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
								(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {
	
							// Get the specific value for the option
							value = jQuery( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
					if ( one && !values.length && options.length ) {
						return jQuery( options[ index ] ).val();
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var values = jQuery.makeArray( value );
	
					jQuery(elem).find("option").each(function() {
						this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
					});
	
					if ( !values.length ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		},
	
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
	    /**
	     * add by zhangjh   2016-3-26
	     * 用于获取或设置HTML属性。
	     * @param elem    DOM元素
	     * @param name    属性名
	     * @param value   要设置的属性值
	     * @param pass    如果HTML属性与jQuery方法同名，是否调用同名的jQuery方法，true则调用；false则不调用
	     * @returns
	     */
		attr: function( elem, name, value, pass ) {
			var ret, hooks, notxml,
			    //elem元素的类型
				nType = elem.nodeType;
	
			// don't get/set attributes on text, comment and attribute nodes
			//不能在文本节点、注释节点、属性节点上设置html属性
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	        
			if ( pass && name in jQuery.attrFn ) {
				//执行jQuery的同名方法
				return jQuery( elem )[ name ]( value );
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
			    //如果浏览器不支持getAttribute，则调用jQuery.prop
				return jQuery.prop( elem, name, value );
			}
	        //判断是否为xml节点
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
	
			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( notxml ) {
				name = name.toLowerCase();
				//获取对应的修正对象,修正对象包含get和set方法
				//获取HTML属性修正对象jQuery.attrHooks/布尔属性修正对象boolHook/针对IE6、7的通用HTML属性修正对象nodeHook
				//只有在不支持get/setAttribute的时候，nodeHook对象才会存在
				hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
			}
	
			if ( value !== undefined ) {
	            //设置属性
				if ( value === null ) {
					//如果传入属性值是null，则移除属性
					jQuery.removeAttr( elem, name );
					return;
	
				} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
					//优先调用修正对象的修正方法
					return ret;
	
				} else {
					//调用原生态的setAttribute方法设置属性
					elem.setAttribute( name, "" + value );
					return value;
				}
	
			} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
				//优先调用修正对象的get方法
				return ret;
	
			} else {
	            //调用原生态的getAttribute方法
				ret = elem.getAttribute( name );
	
				// Non-existent attributes return null, we normalize to undefined
				return ret === null ?
					undefined :
					ret;
			}
		},
	    /**
	     * add by zhangjh   2016-4-10
	     * 用于从DOM元素上移除一个或者多个HTML属性，多个HTML属性之间用空格分隔
	     * @param elem    DOM元素
	     * @param value   HTML属性或者HTML属性字符串	
	     */
		removeAttr: function( elem, value ) {
			var propName, attrNames, name, l, isBool,
				i = 0;
	
			if ( value && elem.nodeType === 1 ) {
				//rspace = /\s+/, 如果value是多个用空格分开的值，则分隔成数组
				attrNames = value.toLowerCase().split( rspace );
				l = attrNames.length;
	
				for ( ; i < l; i++ ) {
					name = attrNames[ i ];
	
					if ( name ) {
						//判断属性名是不是修正属性名，取出对应的DOM属性名
						propName = jQuery.propFix[ name ] || name;
						//判断属性名是不是值为布尔值的属性名
						isBool = rboolean.test( name );
	
						// See #9699 for explanation of this approach (setting first, then removal)
						// Do not do this for boolean attributes (see #10870)
						if ( !isBool ) {
							jQuery.attr( elem, name, "" );
						}
						//判断当前浏览器操作属性的时候是使用HTML属性还是必须使用DOM属性
						elem.removeAttribute( getSetAttribute ? name : propName );
	
						// Set corresponding property to false for boolean attributes
						//如果是值为bool类型的属性，则将对应的DOM属性置为false
						if ( isBool && propName in elem ) {
							elem[ propName ] = false;
						}
					}
				}
			}
		},
	    /**
	     * add by zhangjh   2016-4-10
	     * 用于修正特殊html属性的读取和设置方法
	     */
		attrHooks: {
			//需要修正的属性type
			type: {
				set: function( elem, value ) {
					// We can't allow the type property to be changed (since it causes problems in IE)
					//rtype = /^(?:button|input)$/i,
					if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
						//在IE9下修改有父元素的button、input元素的属性type属性会抛出异常
						jQuery.error( "type property can't be changed" );
					} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
						//radioValue=true,修改input的type为radio时不会改变value值
						// Setting the type on a radio button after the value resets the value in IE6-9
						// Reset value to it's default in case type is set after value
						// This is for element creation
						var val = elem.value;
						//由于修改type的值会使value的值改变，所以得先保存原来的value的值
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			},
			// Use the value property for back compat
			// Use the nodeHook for button elements in IE6/7 (#1954)
			value: {
				get: function( elem, name ) {
					//如果support。getSetAttribute为false的时候，nodeHook才存在
					if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
						//IE6/7通过value获取的值是innerHtml值，所以得通过DOM元素的属性节点获取
						return nodeHook.get( elem, name );
					}
					return name in elem ?
						elem.value :
						null;
				},
				set: function( elem, value, name ) {
					if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
						return nodeHook.set( elem, value, name );
					}
					// Does not return so that setAttribute is also used
					elem.value = value;
				}
			}
		},
	    //修正属性名
		propFix: {
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		},
	    /**
	     * add by zhangjh   2016-4-10
	     * 通过HTML属性名获取DOM元素对应的DOM属性或者设置DOM属性
	     * @param elem   DOM元素
	     * @param name   HTML属性名
	     * @param value  属性值
	     * @returns
	     */
		prop: function( elem, name, value ) {
			var ret, hooks, notxml,
				nType = elem.nodeType;
	
			// don't get/set properties on text, comment and attribute nodes
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
	
			if ( notxml ) {
				// Fix name and attach hooks
				//获取DOM属性名
				name = jQuery.propFix[ name ] || name;
				//获取队形的修正对象
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				//如果传入了value值，则操作为set，最后返回value值
				if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
					return ret;
	
				} else {
					return ( elem[ name ] = value );
				}
	
			} else {
				if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
					return ret;
	
				} else {
					return elem[ name ];
				}
			}
		},
	    /**
	     * 特殊修正对象集propHooks存放了需要修正的DOM属性和对应的修正对象
	     */
		propHooks: {
			//如果文档中未明确指定HTML属性tabindex，则DOM属性tabIndex并不总是返回正确的值
			tabIndex: {
				get: function( elem ) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabindex");
	
					return attributeNode && attributeNode.specified ?
						parseInt( attributeNode.value, 10 ) :
						//rfocusable = /^(?:button|input|object|select|textarea)$/i,
						rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
							//对于可以获得焦点或者可以点击的元素，一律返回0
							0 :
							undefined;
				}
			}
		}
	});
	
	// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
	
	jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
	
	// Hook for boolean attributes
	//注：html属性是指我们html元素中的各种属性，比如说class，style，title；
	//  DOM属性是指DOM元素的各种属性
	/**
	 * add by zhangjh   2016-3-26
	 * bool类型的属性，html属性是小写的属性名，对应的DOM属性是bool值
	 * 如果某个HTML属性对应的DOM属性的值是bool类型，则成该HTML属性为布尔型HTML属性，属性值为小写的html属性
	 * 注：类似于checkbox的checked的html属性，不管checked属性是什么值，对应的checkbox都未选中状态
	 */
	boolHook = {
		/**
		 * add by zhangjh   2016-3-26
		 * 修正布尔型HTML属性的读取方式，借助对应的DOM属性值返回最新的HTML属性值；
		 * @param elem  DOM元素
		 * @param name  属性名
		 * 
		 * @returns  返回的html属性值
		 */
		get: function( elem, name ) {
			// Align boolean attributes with corresponding properties
			// Fall back to attribute presence where some booleans are not supported
			var attrNode,
			    //取出对应的DOM属性值
				property = jQuery.prop( elem, name );
			//getAttributeNode返回name对应的属性节点；nodeValue返回属性节点的属性名
			return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
				//由于需要返回的是html属性，所以需要返回属性名的小写
				name.toLowerCase() :
				undefined;
		},
		/**
		 * add by zhangjh  2016-3-26
		 * 
		 * @param elem  DOM元素
		 * @param value 属性值
		 * @param name  HTML属性名
		 * @returns
		 */
		set: function( elem, value, name ) {
			var propName;
			if ( value === false ) {
				// Remove boolean attributes when set to false
				//如果要把属性设为false，则移除属性
				jQuery.removeAttr( elem, name );
			} else {
				// value is true since we know at this point it's type boolean and not false
				// Set boolean attributes to the same name and set the DOM property
				//取出HTML属性名对应的DOM属性名
				propName = jQuery.propFix[ name ] || name;
				if ( propName in elem ) {
					// Only set the IDL specifically if it already exists on the element
					//如果修正的属性名在DOM元素中存在，则设置为true
					elem[ propName ] = true;
				}
	            //设置elem html属性为小写的属性名
				elem.setAttribute( name, name.toLowerCase() );
			}
			//返回属性名
			return name;
		}
	};
	
	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !getSetAttribute ) {
		
	    //表明方法getAttribute、setAttribute、removeAttribute不能正确的设置、读取、移除html属性
		//IE6/IE7必须通过DOM属性名来操作属性，而不能通过HTML属性名来操作属性
	
		fixSpecified = {
			name: true,
			id: true,
			coords: true
		};
	
		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		/**
		 * add by zhangjh   2016-4-9
		 * 如果原生方法不能getAttribute、setAttribute、removeAttribute不能正确的设置、读取、移除html属性的时候
		 * 则创建通用HTML属性修正对象
		 */
		nodeHook = jQuery.valHooks.button = {
			
			get: function( elem, name ) {
				var ret;
				//为什么通过getAttributeNode来获取属性节点
				//通过getAttributeNode获取属性节点的时候不输入的都是HTML属性
				ret = elem.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
					//ret.soecified为false表示文档中为设置过该html属性
					ret.nodeValue :
					undefined;
			},
			set: function( elem, value, name ) {
				// Set the existing or create a new attribute node
				var ret = elem.getAttributeNode( name );
				if ( !ret ) {
					ret = document.createAttribute( name );
					elem.setAttributeNode( ret );
				}
				return ( ret.nodeValue = value + "" );
			}
		};
	
		// Apply the nodeHook to tabindex
		jQuery.attrHooks.tabindex.set = nodeHook.set;
	
		// Set width and height to auto instead of 0 on empty string( Bug #8150 )
		// This is for removals
		jQuery.each([ "width", "height" ], function( i, name ) {
			jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
				set: function( elem, value ) {
					if ( value === "" ) {
						elem.setAttribute( name, "auto" );
						return value;
					}
				}
			});
		});
	
		// Set contenteditable to false on removals(#10429)
		// Setting to empty string throws an error as an invalid value
		jQuery.attrHooks.contenteditable = {
			get: nodeHook.get,
			set: function( elem, value, name ) {
				if ( value === "" ) {
					value = "false";
				}
				nodeHook.set( elem, value, name );
			}
		};
	}
	
	
	// Some attributes require a special call on IE
	if ( !jQuery.support.hrefNormalized ) {
		jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
			jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
				get: function( elem ) {
					var ret = elem.getAttribute( name, 2 );
					return ret === null ? undefined : ret;
				}
			});
		});
	}
	//IE6/IE7不能通过style直接获取内联属性
	if ( !jQuery.support.style ) {
		jQuery.attrHooks.style = {
			get: function( elem ) {
				// Return undefined in the case of empty string
				// Normalize to lowercase since IE uppercases css property names
				return elem.style.cssText.toLowerCase() || undefined;
			},
			set: function( elem, value ) {
				return ( elem.style.cssText = "" + value );
			}
		};
	}
	
	// Safari mis-reports the default selected property of an option
	// Accessing the parent's selectedIndex property fixes it
	if ( !jQuery.support.optSelected ) {
		jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
			get: function( elem ) {
				var parent = elem.parentNode;
	
				if ( parent ) {
					parent.selectedIndex;
	
					// Make sure that it also works with optgroups, see #5701
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
				return null;
			}
		});
	}
	
	// IE6/7 call enctype encoding
	if ( !jQuery.support.enctype ) {
		jQuery.propFix.enctype = "encoding";
	}
	
	// Radios and checkboxes getter/setter
	if ( !jQuery.support.checkOn ) {
		jQuery.each([ "radio", "checkbox" ], function() {
			jQuery.valHooks[ this ] = {
				get: function( elem ) {
					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
					return elem.getAttribute("value") === null ? "on" : elem.value;
				}
			};
		});
	}
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
				}
			}
		});
	});
	
	
	
/************************************************************   事件系统模块   *****************************************************************/	
	var rformElems = /^(?:textarea|input|select)$/i,
		rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
		rhoverHack = /(?:^|\s)hover(\.\S+)?\b/,
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|contextmenu)|click/,
		rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
		rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
		quickParse = function( selector ) {
			var quick = rquickIs.exec( selector );
			if ( quick ) {
				//   0  1    2   3
				// [ _, tag, id, class ]
				quick[1] = ( quick[1] || "" ).toLowerCase();
				quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
			}
			return quick;
		},
		quickIs = function( elem, m ) {
			var attrs = elem.attributes || {};
			return (
				(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
				(!m[2] || (attrs.id || {}).value === m[2]) &&
				(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
			);
		},
		hoverHack = function( events ) {
			return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
		};
	
	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	//jQuery事件系统
	jQuery.event = {
        /**
         * add by zhangjh  2016-4-21
         * 用于为DOM元素绑定一个或者多个类型的事件监听函数
         * @param elem     待绑定事件的DOM元素
         * @param types    事件类型
         * @param handler  待绑定的事件监听函数
         * @param data     自定义数据，可以是任何类型
         * @param selector 一个选择器表达式字符串，用于绑定代理事件(例如<ul><li>a</li><li>b</li></ul>其中elem相当于elem，li相当于selector)
         */
		add: function( elem, types, handler, data, selector ) {
	        /*
	         * elemData:     指向DOM元素关联的缓存对象
	         * eventHandle:  指向主监听函数
	         * events: DOM元素对应的事件监听函数
	         * 
	         * handleObj:封装了事件函数的监听对象
	         * handleObjIn:传入的监听对象
	         * handlers:监听对象数组
	         * special:特殊事件类型对应的修正对象
	         */
			var elemData, eventHandle, events,
				t, tns, type, namespaces, handleObj,
				handleObjIn, quick, handlers, special;
	
			// Don't attach events to noData or text/comment nodes (allow plain objects tho)
			/**
			 * nodeType===3 不在文本节点上绑定事件
			 * nodeType===8 不在注释节点上绑定事件
			 * !type||!handler 如果没有传入事件类型或者监听函数，忽略本次调用
			 * !elemData=jQuery.data(elem) 如果获取不到elem对应的数据缓存对象即不支持附加扩展属性， 忽略本次调用
			 */
			if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			//handler是一个自定义的监听对象？
			if ( handler.handler ) {
				//如果handler是监听对象
				handleObjIn = handler;
				//修正handler，handler为待绑定的事件监听函数
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			//为监听函数分配一个唯一标识guid，移除监听函数时，将通过这个唯一标识来匹配监听函数
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			//取出事件缓存对象events，events用于存放当前元素关联的所有监听函数
			events = elemData.events;
			if ( !events ) {
				//表示从未在当前元素上绑定过事件，把events初始化为一个空对象
				elemData.events = events = {};
			}
			//取出主监听函数
			eventHandle = elemData.handle;
			if ( !eventHandle ) {
				//初始化主监听函数
				elemData.handle = eventHandle = function( e ) {
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
						jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
						undefined;
				};
				// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
				eventHandle.elem = elem;
			}
	
			// Handle multiple events separated by a space
			// jQuery(...).bind("mouseover mouseout", fn);
			//把参数types转换为数组，以支持一次绑定多个事件
			types = jQuery.trim( hoverHack(types) ).split( " " );
			//遍历事件类型数组，逐个绑定事件
			for ( t = 0; t < types.length; t++ ) {
	            //rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
				//解析数据类型
				tns = rtypenamespace.exec( types[t] ) || [];
				type = tns[1];
				//命名空间.a.b.c，分隔成数组[a,b,c]
				namespaces = ( tns[2] || "" ).split( "." ).sort();
	
				// If event changes its type, use the special event handlers for the changed type
				//获取当前事件类型对应的修正对象
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				//修正变量type为实际使用的事件类型
				//如果传入了selector参数，表明绑定的是代理事件，可能需要把当前事件类型修正为可冒泡的事件类型  special.delegateType
				//如果未传入selector参数，表明是普通事件绑定，但是由于浏览器对某些特殊事件不支持或者支持的不是很完整，需要修正为支持度 更好的事件类型 special.bindType
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				//事件类型可能已经发生改变，需要再次尝试获取对应的修正对象
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				//封装监听函数为监听对象
				handleObj = jQuery.extend({
					type: type,                                     //实际使用的事件类型，不包含命名空间，可能已经被修正过
					origType: tns[1],                               //原始事件类型，不包含命名空间，未经过修正
					data: data,                                     //自定义的事件数据？？
					handler: handler,                               //待绑定的事件监听函数
					guid: handler.guid,                             //监听函数的唯一标识guid
					selector: selector,                             //传入的选择器表达式，用于事件代理
					quick: selector && quickParse( selector ),      //缓存剪短选择器表达式的解析结果，用于加快对后代元素的过滤速度
					namespace: namespaces.join(".")                 //排序后的命名空间
					//handleObjIn是传入的监听对象，如果含有更多的扩展属性，则一并把这些扩展属性添加到监听对象中
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				//初始化监听对象数组，绑定主监听函数
				handlers = events[ type ];
				if ( !handlers ) {
					//如果是第一次绑定改类型的事件，则把监听对象数组handlers初始化为一个空数组
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener/attachEvent if the special events handler returns false
					//如果是第一次绑定该类型的事件，则绑定主监听函数
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						// Bind the global event handler to the element
						if ( elem.addEventListener ) {
							//IE9+和其他浏览器
							elem.addEventListener( type, eventHandle, false );
	
						} else if ( elem.attachEvent ) {
							//IE9以下的浏览器
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}
	            //将监听对象插入监听对象数组
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					//如果传入了参数selector，则绑定的是代理事件，把代理经停对象插入属性handlers.delegateCount所指定的位置
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				//记录绑定过的事件类型
				jQuery.event.global[ type ] = true;
			}
	
			// Nullify elem to prevent memory leaks in IE
			//接触参数elem对DOM元素的引用，避免内存泄露
			elem = null;
		},
	
		global: {},
	
		// Detach an event or set of events from an element
		/**
		 * add by zhangjh   2016-4-23
		 * 用于移除DOM元素绑定的一个或者多个类型的事件监听函数
		 * @elem                 待移除事件的DOM元素
		 * @types                事件类型字符串
		 * @handler              待移除的事件监听函数
		 * @selector             一个选择器表达式，用于移除代理事件
		 * @mappedTypes          指示移除事件时是否严格检测事件的类型
		 */
		remove: function( elem, types, handler, selector, mappedTypes ) {
	       /**
	        * elemData:                  指向当前DOM元素关联的缓存对象
	        * origType:
	        * namespaces:                命名空间
	        * origCount:                 type对应的监听对象的个数
	        * 
	        * events:                    指向DOM元素关联的数据缓存对象的事件缓存对象
	        * handle:
	        * eventType:
	        * handleobj:                 监听对象
	        */
			var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
				t, tns, type, origType, namespaces, origCount,
				j, events, special, handle, eventType, handleObj;
	       
			if ( !elemData || !(events = elemData.events) ) {
				//如果DOM元素关联的数据缓存对象或者数据缓存对象中不存在事件缓存对象，则直接返回
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			//转换事件类型types为类型数组  ，hoverHack用来把组合事件分解？？？
			types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
			
			for ( t = 0; t < types.length; t++ ) {
				//解析事件类型和命名空间
				tns = rtypenamespace.exec( types[t] ) || [];
				//事件类型
				type = origType = tns[1];
				//命名空间
				namespaces = tns[2];
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					//如果type是空字符串，没有指定类型，但可能指定了命名空间
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	            //尝试从事件修正对象集jQuery.event.special中获取当前事件类型对应的修正对象，如果未取到，则默认为一个空对象
				special = jQuery.event.special[ type ] || {};
				//修正变量type为实际使用的事件类型，如果传入了selector，则移除的是代理事件，可能需要把当前事件类型修正为可冒泡的事件类型
				//如果未传入参数selector，则是普通移除，由于浏览器对某些特殊事件不支持或支持的不完整，需要修正为支持度更好的事件类型(special.bindType)
				type = ( selector? special.delegateType : special.bindType ) || type;
				//从事件缓存对象events中取出单前事件类型对应的监听函数数组
				eventType = events[ type ] || [];
				//监听对象的个数
				origCount = eventType.length;
				//如果存在命名空间，则把命名空间转化为一个正则表达式，用于检测已绑定事件的命名空间时候与参数types中的命名空间匹配
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
	
				// Remove matching events
				//遍历监听对象数组，从中移除匹配的监听对象
				for ( j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];
	                     //不需要检测原始事件类型或者监听对象的原始事件类型与传入的相等
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						 //没有指定监听函数或者监听对象与指定的监听函数具有相同的唯一标识guid
						 ( !handler || handler.guid === handleObj.guid ) &&
						 //没有命名空间或者监听对象的命名空间含有指定的命名空间
						 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
						 //没有传入选择器表达式，或者监听对象的选择器表达式与传入的相等
						 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						//删除监听对象
						eventType.splice( j--, 1 );
	                    //如果被移除的监听对象含有属性selector，则相当于一个代理监听对象
						if ( handleObj.selector ) {
							eventType.delegateCount--;
						}
						//如果有修正方法remove，则调用它执行特殊的移除行为
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				//如果监听对象数组为空，则移除主监听函数
				if ( eventType.length === 0 && origCount !== eventType.length ) {
					if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove the expando if it's no longer used
			//如果事件缓存对象为空对象，则从缓存对象上删除属性events、handle
			if ( jQuery.isEmptyObject( events ) ) {
				handle = elemData.handle;
				if ( handle ) {
					handle.elem = null;
				}
	
				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				jQuery.removeData( elem, [ "events", "handle" ], true );
			}
		},
	
		// Events that are safe to short-circuit if no handlers are attached.
		// Native DOM events should not be added, they may have inline handlers.
		customEvent: {
			"getData": true,
			"setData": true,
			"changeData": true
		},
	    /**
	     * add by zhangjh   2016-5-10
	     * 负责手动触发事件，执行绑定的事件监听函数和默认行为，并且会模拟冒泡过程
	     * @param event    待触发的事件，可以是事件类型或者事件对象
	     * @param data     将被传给主监听函数的数据
	     * @param elem     DOM元素
	     * @param onlyHandlers  boolean值，只是是否只执行监听函数，而不会触发默认行为
	     * @returns
	     */
		trigger: function( event, data, elem, onlyHandlers ) {
			// Don't do events on text and comment nodes
			//如果是文本节点或者注释节点，返回
			if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
				return;
			}
	
			// Event object or event type
			/**
			 * type             监听事件类型
			 * namespace        命名空间数组
			 * cache            全局缓存对象
			 * exclusive        指示是否只触发没有命名空间的事件
			 * special          事件类型的修正对象
			 * handle           监听事件？？
			 * eventPath        冒泡路径数组
			 * bubbleType       冒泡事件类型
			 */
			var type = event.type || event,
				namespaces = [],
				cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			//rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
			//jQuery.event.triggered???   指示了正在触发默认行为的事件类型，该属性在触发行为前被设置为事件类型，触发后被设置为undefined
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	        //检查是否只触发没有命名空间的监听函数
			if ( type.indexOf( "!" ) >= 0 ) {
				//如果事件类型以“!”结束，表示只会触发没有命名空间的监听函数
				// Exclusive events trigger only for the exact event (no namespaces)
				//去掉末尾的！
				type = type.slice(0, -1);
				exclusive = true;
			}
	        //解析事件类型和命名空间
			if ( type.indexOf( "." ) >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}
	
			if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
				//未传入elem，表示要触发的是该类型的所有事件，但是不会触发行内监听函数和默认行为？？？
				// No jQuery handlers for this event type, and it can't have inline handlers
				return;
			}
	
			// Caller can pass in an Event, Object, or just an event type string
			//event为jQuery事件对象
			event = typeof event === "object" ?
				// jQuery.Event object
				event[ jQuery.expando ] ? event :
				// Object literal
				new jQuery.Event( type, event ) :
				// Just the event type (string)
				new jQuery.Event( type );
	        
			event.type = type;
			//isTrigger表示正在触发这个事件
			event.isTrigger = true;
			//exclusive指示是否只触发没有命名空间的监听函数
			event.exclusive = exclusive;
			//命名空间
			event.namespace = namespaces.join( "." );
			//命名空间正则，用于检测已绑定事件的命名空间是否和参数event中的命名空间匹配
			event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			//构造含有前缀“on”的事件类型“ontype”,用于调用对应的行内监听函数
			ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";
	
			// Handle a global trigger
			//如果没有传入参数elem，即没有指定DOM元素，则在所有绑定过该类型的元素上手动触发对应类型的监听函数
			if ( !elem ) {
	            
				// TODO: Stop taunting the data cache; remove global events and always attach to document
				cache = jQuery.cache;
				for ( i in cache ) {
					if ( cache[ i ].events && cache[ i ].events[ type ] ) {
						jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
					}
				}
				return;
			}
	
			// Clean up the event in case it is being reused
			//重置事件属性result，用于存放事件监听函数的返回值
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			//把event、data封装为数组
			data = data != null ? jQuery.makeArray( data ) : [];
			data.unshift( event );
	
			// Allow special events to draw outside the lines
			//修正的事件类型对象
			special = jQuery.event.special[ type ] || {};
			if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			
			
			//从当前元素出发，沿着DOM树向上冒泡，构造一条冒泡路径
			//elem 当前元素    type  事件类型
			eventPath = [[ elem, special.bindType || type ]];
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	            //onlyHandlers为true时，表示只触发当前元素上的监听函数，不会触发默认行为，不会模拟冒泡行为
				//noBubble为true时，表示不允许冒泡行为
				//如果当前元素是window，已经是最外层元素，不允许冒泡行为
				
				//优先使用修正对象的delegateType属性，该属性制指定了当前事件类型所对应的冒泡事件类型
				bubbleType = special.delegateType || type;
				//
				cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
				old = null;
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push([ cur, bubbleType ]);
					old = cur;
				}
	
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( old && old === elem.ownerDocument ) {
					eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
				}
			}
	
			// Fire handlers on the event path
			//触发冒泡路径上元素的主监听函数和行内监听函数
			for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {
	
				cur = eventPath[i][0];
				event.type = eventPath[i][1];
	
				handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}
				// Note that this is a bare JS function and not a jQuery handler
				handle = ontype && cur[ ontype ];
				if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
					event.preventDefault();
				}
			}
			event.type = type;
	
			// If nobody prevented the default action, do it now
			//触发默认行为
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {
	
				if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
					!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {
	
					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					// IE<9 dies on focus/blur to hidden element (#1486)
					if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {
	
						// Don't re-trigger an onFOO event when we call its FOO() method
						old = elem[ ontype ];
	
						if ( old ) {
							elem[ ontype ] = null;
						}
	
						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;
	
						if ( old ) {
							elem[ ontype ] = old;
						}
					}
				}
			}
	
			return event.result;
		},
	    /**
	     * add by zhangjh   2016-4-23
	     * 负责分发和执行监听函数，为执行监听函数提供底层支持
	     * @param event    事件对象
	     *   如果事件由浏览器触发，则参数event是原生事件对象，后面的代码会把它封装成jQuery事件对象；
	     *   如果事件是手动触发的，则参数event是jQuery事件对象
	     *   IE9一下的浏览器在触发事件是不会把原生事件对象传递给监听函数，必须通过window.event来获取
	     * @returns
	     */
		dispatch: function( event ) {
	
			// Make a writable jQuery.Event from the native event object
			//调用方法jQuery.event。fix把原生事件封装为jQuery事件对象
			//IE9以下的浏览器在触发事件时不会把原生事件对象传递给监听函数，需要通过访问window.event
			event = jQuery.event.fix( event || window.event );
	        //handlers指向当前事件类型对应的监听对象数组
			var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			    //代理监听对象的位置计数器，指示了下一个代理监听对象的插入位置和普通监听对象的起始插入位置，也表示了已绑定的代理监听对象个数
				delegateCount = handlers.delegateCount,
				//把类数组对象arguments转换为真正的数组
				args = [].slice.call( arguments, 0 ),
				//指示是否执行当前事件类型的所有监听函数，true表示执行当前事件类型的所欲监听函数；false表示执行与当前事件类型和命名空间匹配的监听函数
				//exclusive???
				run_all = !event.exclusive && !event.namespace,
				//修正type
				special = jQuery.event.special[ event.type ] || {},
				//待执行队列，包含了后代元素匹配的代理监听对象数组以及当前元素上绑定的普通监听对象数组
				handlerQueue = [],
				i, j,
				//代理事件时指向某个后代元素
				cur,
				//含有某个后代元素的jQuery对象
				jqcur, 
				//
				ret,
				selMatch, 
				matched, 
				matches, 
				handleObj, 
				sel, 
				related;
	
			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			//????
			args[0] = event;
			//this指向的是绑定事件的当前元素，事件可能是普通事件，也可能是监听事件
			//event.delegateTarget??
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			//preDispatch ???
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers that should run if there are delegated events
			// Avoid non-left-click bubbling in Firefox (#3861)
			//如果为当前元素绑定了代理事件，则提取后代元素匹配的代理监听对象数组
			if ( delegateCount && !(event.button && event.type === "click") ) {
	
				// Pregenerate a single jQuery object for reuse with .is()
				//用当前元素构造一个jQuery对象
				//由于jQuery.event.dispatch一般是.call(elem,...)使用，所以this应该指向的是elem元素
				//this->代理元素
				jqcur = jQuery(this);
				//
				jqcur.context = this.ownerDocument || this;
	            //用两层for循环提取后代元素匹配的代理监听对象数组
				for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
	                //第一层循环遍历重触发事件的元素到代理元素这条路径上的所有后代元素
					// Don't process events on disabled elements (#6911, #8165)
					//cur是触发事件的元素
					if ( cur.disabled !== true ) {
						//selMatch用于存储后代元素与代理监听对象的选择器表达式的所有匹配结果
						selMatch = {};
						//matches用于存储后代元素匹配的所有代理监听对象
						matches = [];
						jqcur[0] = cur;
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
							sel = handleObj.selector;
	                        //检查后代元素与代理监听对象的选择器表达式是否匹配
							if ( selMatch[ sel ] === undefined ) {
								selMatch[ sel ] = (
									handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
								);
							}
							if ( selMatch[ sel ] ) {
								matches.push( handleObj );
							}
						}
						
						if ( matches.length ) {
							handlerQueue.push({ elem: cur, matches: matches });
						}
					}
				}
			}
	
			// Add the remaining (directly-bound) handlers
			//提取代理元素上绑定的普通监听对象数组
			if ( handlers.length > delegateCount ) {
				handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
			}
	
			// Run delegates first; they may want to stop propagation beneath us
			//执行后代元素匹配的代理监听对象数组和代理元素上绑定的普通监听对象数组
			for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
				matched = handlerQueue[ i ];
				//把当前正在执行监听函数的元素赋值给event.currentTarget
				event.currentTarget = matched.elem;
	
				for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
					//获取监听对象
					handleObj = matched.matches[ j ];
	
					// Triggered event must either 1) be non-exclusive and have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {
	                    
						event.data = handleObj.data;
						event.handleObj = handleObj;
	
						ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
								.apply( matched.elem, args );
	
						if ( ret !== undefined ) {
							event.result = ret;
							if ( ret === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
	
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}
	
			return event.result;
		},
	
		// Includes some event props shared by KeyEvent and MouseEvent
		// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
		//事件对象的公共属性
		/**
		 * attrChange   ??
		 * attrName     ??
		 * relatedNode  ??
		 * srcElement           生成事件的对象的引用
		 * altKey、ctrlKey       事件发生是alt、ctrl键是否被按下
		 * bubbles              指示事件是否是可冒泡的类型
		 * cancelable           指示事件是否可以被取消
		 * currentTarget        触发事件的对象的引用，和sreElement不一样
		 * eventPhase           事件传播的当前阶段 1表示事件在捕获阶段运行；2表示事件在派发阶段运行；3表示事件在冒泡阶段运行
		 * relatedTarget        返回与事件的目标节点相关的节点 
		 * target               生成事件的对应的引用，IE浏览器用的是srcElement
		 * timeStap             返回事件生成的日期和时间。
		 * button               那个鼠标按钮被按下
		 * view                 与事件关联的抽象视图。等同于发生事件的window对象
		 * which                指示鼠标、键盘操作的时候键
		 */
		props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
	    //事件属性修正对象集
		/**
		 * fixHooks:{
		 *     key:keyHooks,
		 *     mouse/click...:mouseHooks
		 * }
		 */
		fixHooks: {},
		//事件，无外乎是键盘事件和鼠标事件
	    //键盘事件对象的属性和修正方法
		keyHooks: {
			//键盘事件的专属属性
			// char       表示一个按键产生的可打印字符码，字符型   ？？
			// charCode   表示一个按键产生的可打印字符码，数值型？？
			// key        表示一个按键产生的较低层次的“虚拟按键码”，字符串型
			// keyCode    表示一个按键产生的较低层次的“虚拟按键码”，数值型
			props: "char charCode key keyCode".split(" "),
			/**
			 * add by zhangjh   2016-4-21
			 * 用于修正键盘事件的专属属性
			 * @param event    jQuery事件对象
			 * @param original   原生事件对象
			 * @returns
			 */
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					//如果which属性不存在
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
	    //鼠标事件对象的属性和修正方法
		mouseHooks: {
			/**
			 * add by zhangjh  2016-4-21
			 * 鼠标事件的专属属性
			 * button:指示事件被触发时哪个鼠标按键被点击  DOM2
			 * buttons: 当事件被触发时哪个鼠标按键被点击  DOM3
			 * clientX, clientY: 分别表示鼠标指针相对于窗口做上角的X坐标和Y坐标
			 * offsetX, offsetY: 分别表示鼠标指针相对于事件原元素左上角的X坐标和Y坐标
			 * pageX，pageY: 分别表示鼠标指针相对于整个文档左上角的X坐标和Y坐标
			 * screenX、screenY: 分别表示鼠标指针相对于显示器左上角的X坐标和Y坐标
			 * formElemnt: 表示mouseover事件中鼠标离开的文档元素
			 * toElement: 表示mouseout事件中鼠标进入的文档元素(mouseover、mouseout一般配合使用)
			 */
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			/**
			 * add by zhangjh   2016-4-21
			 * 用于修正鼠标事件的专属属性
			 * @param event     jQuery事件对象
			 * @param original  原生的事件对象
			 * @returns
			 */
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button,
					//mouseover、mouseout事件发生时fromElement才会有值
					fromElement = original.fromElement;
	
				// Calculate pageX/Y if missing and clientX/Y available
				//有的浏览器可能不支持pageX、pageY
				if ( event.pageX == null && original.clientX != null ) {
					//如果浏览器不支持文档坐标pageX，pageY,则手动计算他们
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	                //文档左坐标 = 窗口左坐标+左滚动条的宽度按-文档左边框厚度
					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					//文档上坐标 = 窗口上坐标+上滚动条的宽度-文档上边框厚度
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add relatedTarget, if necessary
			    //如果浏览器事件属性relatedTarget不存在，但是事件属性fromElement存在，说明在IE9一下
				//触发了mouseenter、mouseleave、mouseover、mouseout中的一种
				if ( !event.relatedTarget && fromElement ) {
					//修正事件属性relatedTarger为fromElement或者toElement
					//mouseover、mouseenter动作发生的时候，target=toElement，relatedTarget修正为fromElement
					//mouseout、mouseleave动作发生的时候，target=fromElement，relatedTarget修正为toElement
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					//如果事件属性witch不存在，当事件对象button的值为:左键1、中键4、右键2
					//如果鼠标按下的是左键，which修正为1；
					//如果鼠标按下的右件，which修正为3；
					//如果鼠标安县的是中间的键，which修正为2
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		},
	    /**
	     * add by zhangjh   2016-4-21
	     * 用于修正jQuery事件对象event
	     * @param event  可以是原生事件对象，也可以是jQuery事件对象
	     * @returns
	     */
		fix: function( event ) {
			//判断是否是jQuery事件对象，如果是直接返回event
			if ( event[ jQuery.expando ] ) {
				return event;
			}
	
			// Create a writable copy of the event object and normalize some properties
			var i, prop,
			    //用originalEvent保存原生事件对象
				originalEvent = event,
				//获取对应的修正对象,fixHooks为事件属性修正对象集
				//如果type是key事件，则fixHook此时相当于keyHook，如果type是鼠标事件，则fixHook此时相当于mouseHook
				fixHook = jQuery.event.fixHooks[ event.type ] || {},
				//合并公共事件属性和专属事件属性      这个this指代jQuery.enents???(fix是事件系统对象jQuery.event的一个方法，this指向jQuery.events)
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
	        //调用jQuery.Event把原生事件对象封装为jQuery事件对象
			event = jQuery.Event( originalEvent );
	        //用一个for循环把合并后的事件属性从原生事件对象复制到jQuery事件对象上
			//copy属性是一个数组
			for ( i = copy.length; i; ) {
				//避免重复读取
				prop = copy[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
			//target表示触发当前事件的元素，由于执行了上面的复制属性操作，所以jQuery事件对象也会有target属性，如果没有的话，则重新赋值
			//事件对象的target属性是很重要的，一般情况下事件对象都会有target属性(IE6/7/8为sreElement属性)，如果event没有target属性也没有srcElement属性，修正event.target为document
			if ( !event.target ) {
				//srcElement也表示触发当前事件的元素，不过是IE事件对象的属性
				event.target = originalEvent.srcElement || document;
			}
	
			// Target should not be a text node (#504, Safari)
			if ( event.target.nodeType === 3 ) {
				//不应该在文本节点上触发事件，如果target是一个文本节点，则修正为它的父元素
				event.target = event.target.parentNode;
			}
	
			// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
			//事件属性metaKey指示Meta键是否被按下
			if ( event.metaKey === undefined ) {
				//如果没有，用Ctrl仿真
				event.metaKey = event.ctrlKey;
			}
	        //调用事件属性对象的修正方法filter修正特殊的事件属性。并返回当前jQuery事件对象
			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
		},
	    //用于修正事件的绑定、代理、触发和移除行为，该对象集中存放了时间类型和修正对应的映射
		special: {
			//修正special方法，只含有一个修正方法setup，指向jQuery.bindReady,用于确保在绑定ready事件之前，相关的初始化操作已经完成
			ready: {
				// Make sure the ready event is setup
				//用于执行特殊的主监听函数绑定行为，或者执行必须的初始化操作，在第一次绑定当前类型的事件时被调用
				setup: jQuery.bindReady
			},
	        //修正load只含有一个noBubble属性，表示不允许load事件冒泡
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				//表示当前事件类型不支持或者不允许冒泡行为
				noBubble: true
			},
	        //
			focus: {
				//delegateType   指示绑定代理事件时使用的事件类型 
				delegateType: "focusin"
			},
			blur: {
				delegateType: "focusout"
			},
	
			beforeunload: {
				setup: function( data, namespaces, eventHandle ) {
					// We only want to do this special case on windows
					if ( jQuery.isWindow( this ) ) {
						this.onbeforeunload = eventHandle;
					}
				},
	            //用于执行特殊的主监听函数移除行为，在当前类型的事件移除后被调用
				teardown: function( namespaces, eventHandle ) {
					if ( this.onbeforeunload === eventHandle ) {
						this.onbeforeunload = null;
					}
				}
			}
			//focusin
			//focusout
			//mouseenter
			//mouseleave
		},
	    //模拟事件
		/**
		 * add by zhangjh  2016-5-12 
		 * @type           要模拟的事件类型
		 * @elem           待模拟事件的元素
		 * @event          指向一个原生事件对象获一个已分发的jQuery事件对象
		 * @bubble         布尔值，指示是否模拟冒泡过程
		 */
		simulate: function( type, elem, event, bubble ) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{ type: type,
					isSimulated: true,
					originalEvent: {}
				}
			);
			if ( bubble ) {
				//调用trigger方法手动触发事件，并模拟冒泡过程
				jQuery.event.trigger( e, null, elem );
			} else {
				//在当前元素上分发和执行事件
				jQuery.event.dispatch.call( elem, e );
			}
			if ( e.isDefaultPrevented() ) {
				//如果某个监听函数阻止了默认行为，则同步禁用原生事件对象的默认行为
				event.preventDefault();
			}
		}
	};
	
	// Some plugins are using, but it's undocumented/deprecated and will be removed.
	// The 1.7 special event interface should provide all the hooks needed now.
	jQuery.event.handle = jQuery.event.dispatch;
	//移除主监听函数
	jQuery.removeEvent = document.removeEventListener ?
		function( elem, type, handle ) {
			if ( elem.removeEventListener ) {
				elem.removeEventListener( type, handle, false );
			}
		} :
		function( elem, type, handle ) {
			if ( elem.detachEvent ) {
				elem.detachEvent( "on" + type, handle );
			}
		};
		
	/****************************************   定义事件对象构造函数和构造函数的原型prototype***************************************************************/
	/**
	 * add by zhangjh   2016-4-19
	 * 构造函数，用于创建一个jQuery事件对象，该函数会备份原生事件对象，然后修正事件属性type、isDefaultPrevented、timeStamp，
	 * 并设置标记jQuery.expando
	 * @param src    可以是原生事件类型、自定义事件类型、原生事件对象或者jQuery事件对象
	 * @param props  可选的js对象，其中的属性被设置到新创建的jQuery事件对象
	 * @returns {jQuery.Event}
	 */
	jQuery.Event = function( src, props ) {
		// Allow instantiation without the 'new' keyword
		//一个函数，如果通过 new 调用，this指向这个函数要生成的对象；如果不通过new 调用，一般情况下是谁调用它，this指向谁
		if ( !(this instanceof jQuery.Event) ) {
			//当构造函数不是通过new调用的时候，自动加上new
			return new jQuery.Event( src, props );
		}
	
		// Event object
		//备份原生事件对象，修正事件属性type、isDefaultPrevented
		if ( src && src.type ) {
			//通过src.type来判断src是不是原生的事件对象
			//备份原生事件对象
			this.originalEvent = src;
			//备份原生事件的type属性
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			//如果当前时间再冒泡过程中已经被另一个更低层的时间坚挺函数阻止了默认行为，则修正为returnTure，否则为returnFalse？？？？
			this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
				src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;
	
		// Event type
		} else {
			//如果参数src是事件类型
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			//把props的属性都添加到生成的jQuery事件对象中
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		//指示浏览器创建事件的时间，单位为毫秒，IE9一下的浏览器，原生事件对象没有timeStamp属性
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		//为当前jQuery事件对象设置标记
		this[ jQuery.expando ] = true;
	};
	//返回false
	function returnFalse() {
		return false;
	}
	//返回true
	function returnTrue() {
		return true;
	}
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		/**
		 * add by zhangjh  2016-4-19
		 * jQuery时间对象的方法，用于阻止当前事件的默认行为
		 */
		preventDefault: function() {
			//isDefaultPrevented()用来判断是否在当前jQuery事件对象上调用过方法preventDefault
			//returnTrue是一个函数，返回true
			this.isDefaultPrevented = returnTrue;
	        //originalEvent表示jQuery事件对象的原生对象
			var e = this.originalEvent;
			if ( !e ) {
				//说明是一个自定义的事件对象，不会有默认行为
				return;
			}
	
			// if preventDefault exists run it on the original event
			/**
	         *preventDefault 通知 Web 浏览器不要执行与事件关联的默认动作（如果存在这样的动作）
	         *例子  <a href="http://www.baidu.com" id="test1">baidu</a>
	         *    var test1 = document.getElementById("test1");
	         *    test1.onclick = function(e){alert("123");e.preventDefault();}
	         *    通过e.preventDefault()可以组织a的默认动作，也就是链接
			 */
			if ( e.preventDefault ) {
				e.preventDefault();
	
			// otherwise set the returnValue property of the original event to false (IE)
			} else {
				e.returnValue = false;
			}
		},
		/**
		 * add by zhangjh   2016-4-19
		 * 用于停止事件传播，阻止任何祖先元素收到这个事件
		 */
		stopPropagation: function() {
			this.isPropagationStopped = returnTrue;
	
			var e = this.originalEvent;
			if ( !e ) {
				//说明是一个自定义的事件对象，不会又时间传播行为
				return;
			}
			// if stopPropagation exists run it on the original event
			/**
			 * stopPropagation的作用:阻止事件冒泡，但是绑定在当前元素上的事件仍会执行
			 */
			if ( e.stopPropagation ) {
				e.stopPropagation();
			}
			// otherwise set the cancelBubble property of the original event to true (IE)
			e.cancelBubble = true;
		},
		/**
		 * add by zhangjh   2016-4-19
		 * 立即停止当前元素上的事件和停止事件传播
		 */
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		},
		//这三个方法有什么用？？？
		isDefaultPrevented: returnFalse,
		//????
		isPropagationStopped: returnFalse,
		//???
		isImmediatePropagationStopped: returnFalse
	};
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	//初始化事件mouseenter、mouseleave、submit、change、focus、blur对应的修正对象
	jQuery.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
	
			handle: function( event ) {
				var target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj,
					selector = handleObj.selector,
					ret;
	
				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	});
	
	// IE submit delegation
	/**
	 * add by zhangjh   2016-5-11
	 * 如果submit事件沿着DOM树向上冒泡，则测试项submitBubble为true
	 * IE6/7/8submit事件不会冒泡，所以为false，出现这种情况的话，需要修正
	 */
	if ( !jQuery.support.submitBubbles ) {
	
		jQuery.event.special.submit = {
			setup: function() {
				// Only need this for delegated form submit events
				if ( jQuery.nodeName( this, "form" ) ) {
					return false;
				}
	
				// Lazy-add a submit handler when a descendant form may potentially be submitted
				jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
					// Node name check avoids a VML-related crash in IE (#9807)
					var elem = e.target,
						form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
					if ( form && !form._submit_attached ) {
						jQuery.event.add( form, "submit._submit", function( event ) {
							event._submit_bubble = true;
						});
						form._submit_attached = true;
					}
				});
				// return undefined since we don't need an event listener
			},
			
			postDispatch: function( event ) {
				// If form was submitted by the user, bubble the event up the tree
				if ( event._submit_bubble ) {
					delete event._submit_bubble;
					if ( this.parentNode && !event.isTrigger ) {
						jQuery.event.simulate( "submit", this.parentNode, event, true );
					}
				}
			},
	
			teardown: function() {
				// Only need this for delegated form submit events
				if ( jQuery.nodeName( this, "form" ) ) {
					return false;
				}
	
				// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
				jQuery.event.remove( this, "._submit" );
			}
		};
	}
	
	// IE change delegation and checkbox/radio fix
	/**
	 * add by zhangjh  2016-5-11
	 * 如果change事件沿着DOM树向上冒泡，则changeBubbles为true
	 */
	if ( !jQuery.support.changeBubbles ) {
	
		jQuery.event.special.change = {
	
			setup: function() {
	
				if ( rformElems.test( this.nodeName ) ) {
					// IE doesn't fire change on a check/radio until blur; trigger it on click
					// after a propertychange. Eat the blur-change in special.change.handle.
					// This still fires onchange a second time for check/radio after blur.
					if ( this.type === "checkbox" || this.type === "radio" ) {
						jQuery.event.add( this, "propertychange._change", function( event ) {
							if ( event.originalEvent.propertyName === "checked" ) {
								this._just_changed = true;
							}
						});
						jQuery.event.add( this, "click._change", function( event ) {
							if ( this._just_changed && !event.isTrigger ) {
								this._just_changed = false;
								jQuery.event.simulate( "change", this, event, true );
							}
						});
					}
					return false;
				}
				// Delegated event; lazy-add a change handler on descendant inputs
				jQuery.event.add( this, "beforeactivate._change", function( e ) {
					var elem = e.target;
	
					if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
						jQuery.event.add( elem, "change._change", function( event ) {
							if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
								jQuery.event.simulate( "change", this.parentNode, event, true );
							}
						});
						elem._change_attached = true;
					}
				});
			},
	
			handle: function( event ) {
				var elem = event.target;
	
				// Swallow native change events from checkbox/radio, we already triggered them above
				if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
					return event.handleObj.handler.apply( this, arguments );
				}
			},
	
			teardown: function() {
				jQuery.event.remove( this, "._change" );
	
				return rformElems.test( this.nodeName );
			}
		};
	}
	
	// Create "bubbling" focus and blur events
	if ( !jQuery.support.focusinBubbles ) {
		jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
	
			// Attach a single capturing handler while someone wants focusin/focusout
			var attaches = 0,
				handler = function( event ) {
					jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
				};
	
			jQuery.event.special[ fix ] = {
				setup: function() {
					if ( attaches++ === 0 ) {
						document.addEventListener( orig, handler, true );
					}
				},
				teardown: function() {
					if ( --attaches === 0 ) {
						document.removeEventListener( orig, handler, true );
					}
				}
			};
		});
	}
	//为jQuery构造函数的原型prototype添加方法
	jQuery.fn.extend({
	    /**
	     * add by zhangjh  2016-4-21
	     * 为匹配元素集合中的每个元素绑定一个或多个类型的事件监听函数
	     * @param types         事件类型字符串，多个事件类型之间用空格隔开
	     * @param selector      一个选择器表达式字符串，用于绑定代理事件,指代代理元素的子元素
	     * @param data          传递给事件监听函数的自定义数据，可以是任何类型
	     * @param fn            待绑定的监听函数。当对应类型的事件被触发时，该监听函数将被执行
	     * @param one           尽在内部使用
	     * @returns
	     */
		on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
			var origFn, type;
	
			// Types can be a map of types/handlers
			//如果参数types是对象，则递归调用方法on
			if ( typeof types === "object" ) {
				//如果参数types是对象，此时type可能是这样一个对象{type1:fn1,type2:fn2,type3:fn3...}
				// ( types-Object, selector, data )
				if ( typeof selector !== "string" ) { // && selector != null
					// ( types-Object, data )
					//如果selector不是字符串，则将data修正为data||selector
					data = data || selector;
					selector = undefined;
				}
				//遍历参数types，递归调用方法.on(types，selector，data，fn，one)绑定事件
				for ( type in types ) {
					this.on( type, selector, data, types[ type ], one );
				}
				//用于支持链式调用
				return this;
			}
	        //根据传入参数的不同，对fn进行修正
			if ( data == null && fn == null ) {
				// ( types, fn ),$("#id").on("click",function(){});
				//修正fn
				fn = selector;
				data = selector = undefined;
			} else if ( fn == null ) {
				if ( typeof selector === "string" ) {
					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {
					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			//如果参数fn是布尔值false，则把它修正为总返回false的函数
			if ( fn === false ) {
				fn = returnFalse;
			} else if ( !fn ) {
				//没有监听函数，则返回当前jQuery对象
				return this;
			}
	
			if ( one === 1 ) {
				//参数one为1的时候，需要把参数fn封装为一个只会执行一次的新监听函数
				origFn = fn;
				fn = function( event ) {
					// Can use an empty set, since event contains the info
					//先移除事件
					jQuery().off( event );
					//再触发监听函数
					return origFn.apply( this, arguments );
				};
				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
			}
			return this.each( function() {
				jQuery.event.add( this, types, fn, data, selector );
			});
		},
		/**
		 * add by zhangjh  2016-4-21
		 * 用于为匹配元素集合中的每个元素绑定一个或者多个类型的事件监听函数，每个监听函数在每个匹配元素上最多执行一次
		 */
		one: function( types, selector, data, fn ) {
			return this.on( types, selector, data, fn, 1 );
		},
		/**
		 * add by zhangjh   2016-4-23
		 * 用于移除匹配元素集合中每个元素上绑定的一个或多个类型的监听函数
		 * @param types     一个或多个空格分隔的时间类型和可选的命名空间
		 * @param selector  一个选择器表达式字符串，用于移除代理事件
		 * @param fn        待移除的监听函数
		 * @returns
		 */
		off: function( types, selector, fn ) {
			//如果types是被分发的jQuery事件对象
			if ( types && types.preventDefault && types.handleObj ) {
				//如果type.preventDefault存在，说明该参数是一个事件对象  ？？？
				//如果type.handleObj存在，说明该参数是一个分发的jQuery事件对象？？？
				// ( event )  dispatched jQuery.Event
				//取出jQuery事件对象引用的监听对象
				var handleObj = types.handleObj;
				//types.delegateTarget表示监听函数被绑定的元素
				//事件监听函数：addEventListener， attachEvent？？？
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			//如果参数types是对象
			if ( typeof types === "object" ) {
				// ( types-object [, selector] )
				for ( var type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			//根据参数类型修正参数？？？
			if ( selector === false || typeof selector === "function" ) {
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each(function() {
				jQuery.event.remove( this, types, fn, selector );
			});
		},
	    /**
	     * add by zhangjh   2016-5-10
	     * 给指定的元素绑定一个或者多个事件监听函数
	     * @param types    事件类型
	     * @param data     自定义数据
	     * @param fn       事件监听函数
	     * @returns
	     */
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		/**
		 * add by zhangjh   2016-5-10
		 * 给指定的元素解除绑定的事件监听函数
		 * @param types
		 * @param fn
		 * @returns
		 */
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	    /**
	     * add by zhangjh 
	     * 给与指定元素相同的所有元素绑定相同的事件监听函数，用指定元素的context做代理
	     * @param types
	     * @param data
	     * @param fn
	     * @returns {___anonymous149833_156484}
	     */
		live: function( types, data, fn ) {
			jQuery( this.context ).on( types, this.selector, data, fn );
			return this;
		},
		/**
		 * add by zhangjh 
		 * 给指定的元素解除绑定的事件监听函数
		 * @param types
		 * @param fn
		 * @returns {___anonymous149833_156682}
		 */
		die: function( types, fn ) {
			jQuery( this.context ).off( types, this.selector || "**", fn );
			return this;
		},
	    /**
	     * add by zhangjh   2016-5-10 
	     * 为指定的元素添加一个或者多个事件处理程序，指定的元素当做事件代理，指定元素的子元素可以触发添加的事件处理程序
	     * 用法:$(selector).delegate(childSelector,type,function(){})
	     * @param selector  指定元素的子元素
	     * @param types     事件类型
	     * @param data      自定义数据
	     * @param fn        监听函数
	     * @returns
	     */
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		/**
		 * add by zhangjh   2016-5-10
		 * 删除由方法delegate方法添加的一个或者多个事件处理程序
		 * @param selector  可选，规定需要删除事件处理程序的选择器
		 * @param types     可选，事件处理程序的类型
		 * @param fn        可选，事件处理程序
		 * @returns
		 */
		undelegate: function( selector, types, fn ) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
		},
	    /**
	     * add by zhangjh  2016-5-11
	     * 手动触发DOM元素绑定的监听事件
	     * @param type    监听事件类型，click，select，change
	     * @param data    自定义数据
	     * @returns
	     */
		trigger: function( type, data ) {
			return this.each(function() {
				jQuery.event.trigger( type, data, this );
			});
		},
		/**
		 * add by zhangjh   2016-5-12
		 * 手动触发满足条件的第一个DOM元素绑定的监听事件，并且取消默认操作 
		 * @param type
		 * @param data
		 * @returns
		 */
		triggerHandler: function( type, data ) {
			if ( this[0] ) {
				return jQuery.event.trigger( type, data, this[0], true );
			}
		},
	    /**
	     * add by zhangjh   2016-5-12
	     * 当一个DOM元素绑定多个事件时，轮流执行
	     * @param fn
	     * @returns
	     */
		toggle: function( fn ) {
			// Save reference to arguments for access in closure
			var args = arguments,
				guid = fn.guid || jQuery.guid++,
				i = 0,
				toggler = function( event ) {
					// Figure out which function to execute
					var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
					jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );
	
					// Make sure that clicks stop
					event.preventDefault();
	
					// and execute the function
					return args[ lastToggle ].apply( this, arguments ) || false;
				};
	
			// link all the functions, so any of them can unbind this click handler
			toggler.guid = guid;
			while ( i < args.length ) {
				args[ i++ ].guid = guid;
			}
	
			return this.click( toggler );
		},
	    /**
	     * add by zhangjh   2016-5-12
	     * 规定当鼠标指针悬停在被选元素上时要运行的两个函数
	     * @param fnOver  进入元素时触发的事件监听函数
	     * @param fnOut   离开元素时触发的事件监听函数
	     * @returns
	     */
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	});
	//事件便捷方法
	jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			//例如$("#id").click(fn);
			if ( fn == null ) {
				fn = data;
				data = null;
			}
	
			return arguments.length > 0 ?
				//如果参数个数大于0，则相当于给对应元素绑定监听函数
				this.on( name, null, data, fn ) :
				//没有参数，手动执行监听函数
				this.trigger( name );
		};
	    //????
		if ( jQuery.attrFn ) {
			jQuery.attrFn[ name ] = true;
		}
	    //初始化键盘事件的属性修正对象
		if ( rkeyEvent.test( name ) ) {
			jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
		}
	    //初始化鼠标事件的属性修正对象
		if ( rmouseEvent.test( name ) ) {
			jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
		}
	});
	
	
	
	/*!
	 * Sizzle CSS Selector Engine
	 *  Copyright 2011, The Dojo Foundation
	 *  Released under the MIT, BSD, and GPL Licenses.
	 *  More information: http://sizzlejs.com/
	 */
	
	//CSS选择器引擎
	(function(){
	
	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		expando = "sizcache" + (Math.random() + '').replace('.', ''),
		done = 0,
		toString = Object.prototype.toString,
		//判断是否有重复的
		hasDuplicate = false,
		baseHasDuplicate = true,
		//查找'\'
		rBackslash = /\\/g,
		rReturn = /\r\n/g,
		//查找非字符
		rNonWord = /\W/;
	
	// Here we check if the JavaScript engine is using some sort of
	// optimization where it does not always call our comparision
	// function. If that is the case, discard the hasDuplicate value.
	//   Thus far that includes Google Chrome.
	[0, 0].sort(function() {
		baseHasDuplicate = false;
		return 0;
	});
/**----------------------------------------   Sizzle:CSS选择器引擎入口，用于查找与选择表达式selector匹配的元素   -------------------------------------**/
	/*
	 * add by zhangjh 2016-2-27
	 * @param selector:css选择器表达式
	 * @param context:DOM元素或者文档对象，作为查找元素的上下文，用于限定查找范围，默认为当前文档对象
	 * @param results:可选的数组或者类数组对象，将查找到的元素插入results中
	 * @param seed:可选的元素集合，Sizzle将从改元素集合中过滤出匹配选择器表达式的元素集合
	 */
	//当querySelector，querySelectorAll都不起作用的时候才能跳到这里
	var Sizzle = function( selector, context, results, seed ) {
		results = results || [];
		//修正context
		context = context || document;
	    //备份context,存在$("#id1,#id2,#id3")的时候，保存上下文
		var origContext = context;
	    //如果context不是元素，也不是document对象，忽略本次查找  '1'->element  '9'->document
		if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
			return [];
		}
	    //如果传入的selector是空字符串，或则不是字符串，忽略本次查询，如果传入的是jQuery对象，已经做过处理了
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}
	
		var m, set, checkSet, extra, ret, cur, pop, i,
			prune = true,
			contextXML = Sizzle.isXML( context ),
			//存放了正则表达式chunker从选择器表达式中提起的块表达式和块间关系符
			parts = [],
			soFar = selector;
	
		// Reset the position of the chunker regexp (start from head)
        /**---------------------------------------利用正则表达式chunker解析块表达式和块间关系符-----------------------------------**/
		do {
			//chunker = /( (?: \((?:\([^()]+\)|[^()]+)+\) | \[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\] | \\. | [^ >+~,(\[\\]+ )+|[>+~])  (\s*,\s*)?   ((?:.|\r|\n)*)/g, 
			 //               --------------------------   -----------------------------------------------   ----   -------------  ---------    ---------   --------------
			 //                   ((******))或者(*****)              [[*****]]或者['******']或者[******]         \****   不包含 >+~,([\      块间关系符                     ,             任意字符 
			//             ---------------------------------------------------------------------------------------------------------  
			 //          ------------------------------------------------------------------------------------------------------------------- 
			//正则表达式多次匹配同一个字符串时，会从上一次匹配的位置开始，exec("")设置匹配位置重头开始，与lastIndex=0一样
			chunker.exec( "" );
			//m是一个包含四个元素的数组[0,1,2,3],1代表块表达式或者块间关系符，2表示','如果存在逗号，3表示','后面的并列表达式，否则表示表达式剩余部分
			m = chunker.exec( soFar );
	       
			if ( m ) {
				//只要selector中存在逗号，m[2]为逗号，m[3]为逗号后面的字符串，否则m[2]为undefinded，m[3]为剩余字符串
				soFar = m[3];
	
				parts.push( m[1] );
	
				if ( m[2] ) {
					//m2=',',如果存在，表示存在并列选择器，将并列部分保存在extra中，继续调用Sizzle
					extra = m[3];
					break;
				}
			}
		} while ( m );
        /**---------------------------------------判断是否存在位置伪类，如果存在，从左到右查找----------------------------------------**/
	    // parts.length>1 表示选择表达器中存在块间关系符     orisPos。exec(selector)表明存在位置伪类 ，存在位置伪类，则从左往右查找
		if ( parts.length > 1 && origPOS.exec( selector ) ) {
			//如果第一个是块间关系符  A B:从A的子孙元素总匹配B; A>B:从A的子元素中匹配B; A+B:A的下一个兄弟元素中,匹配B; A~B:A的所有兄弟元素中匹配B
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				//直接调用函数posProcess
				set = posProcess( parts[0] + parts[1], context, seed );
	 
			} else {
				//[].pop,[].push;在数组的尾部删除和添加;[].unshift,[].shift 在数组的头部插入和删除
				set = Expr.relative[ parts[0] ] ?
				    //如果数组的第一个元素是块间关系符，直接把参数context作为第一个上下文元素集合
					[ context ] :
					//如果数组的第一个元素不是块间关系符，从数组抛出，然后执行Sizzle
					Sizzle( parts.shift(), context );
	            //此时数组的元素已经减少一个 
				while ( parts.length ) {
					//继续抛出
					selector = parts.shift();
	                //如果抛出的块间关系符，继续抛出
					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
                    //执行Sizzle   	
					set = posProcess( selector, set, seed );
				}
			}
	
		} 
        /**----------------------------------------------不存在伪类，则从右到左开始查找---------------------------------------------**/
		else {
			// Take a shortcut and set the context if the root selector is an ID
			// (but not if it'll be faster if the inner selector is an ID)
			/**----------------------------------       缩小查找范围      ---------------------------**/
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					//如果第一个块选择器是ID类型且最后一个块选择器不是ID类型，则修正context为第一个块选择器匹配的元素
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
	
				ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ?
				    //如果有剩余部分，调用filter方法进行过滤
					Sizzle.filter( ret.expr, ret.set )[0] :
					ret.set[0];
			}
	        
			if ( context ) {
				/**-----------------   查找最后一个块表达式匹配的元素集合，得到候选集set，映射集checkSet   ---**/
				ret = seed ?
				    //如果参数seed，直接调用Sizzle.filter过滤
					{ expr: parts.pop(), set: makeArray(seed) } :
					//因为要从右向左查找，所以要用[].pop()    '~','+'查找兄弟元素
					Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
	            //find函数返回一个对象{ set: set, expr: expr }.set
				set = ret.expr ?
					//如果存在剩余部分，则过滤
					Sizzle.filter( ret.expr, ret.set ) :
					ret.set;
	
				if ( parts.length > 0 ) {
					//如果数组中还有其他元素，则将当前的set集生成一个副本
					checkSet = makeArray( set );
	
				} else {
					prune = false;
				}
	           /**---------------------   遍历剩余的块表达式和块间关系符，对映射集checkSet过滤   ------------**/
				while ( parts.length ) {
					//cur表示块间关系符
					cur = parts.pop();
					//pop表示块关系符左边的块选择表达式
					pop = cur;
	
					if ( !Expr.relative[ cur ] ) {
						cur = "";
					} else {
						pop = parts.pop();
					}
	
					if ( pop == null ) {
						pop = context;
					}
	
					Expr.relative[ cur ]( checkSet, pop, contextXML );
				}
	
			} else {
				checkSet = parts = [];
			}
		}
		/**--------------------------------------------------------------------------------------------------------**/
	    //根据映射集checkSet筛选候选集set，将最终的匹配元素放入结果集results
		if ( !checkSet ) {
			checkSet = set;
		}
	
		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}
	
		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				//prune为false，表示不需要筛选候选集set
				results.push.apply( results, checkSet );
	
			} else if ( context && context.nodeType === 1 ) {
				//如果上下文是元素，而不是文档对象，则遍历映射集，选择满足条件的元素
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
						results.push( set[i] );
					}
				}
	
			} else {
				//如果上下文是文档对象，遍历映射集
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}
	
		} else {
			//如果候选集不是数组，
			makeArray( checkSet, results );
		}
        /**--------------------------------------  如果存在并列选择器表达式，递归调用Sizzle  ---------------------------------------**/
		if ( extra ) {
			Sizzle( extra, origContext, results, seed );
			Sizzle.uniqueSort( results );
		}
	    /**------------------------------------------------  返回结果集  ------------------------------------------------ --**/
		return results;
	};
	/**
	 * add by zhangjh    2016-3-15
	 * 将元素集合中的元素按照出现在文档中的顺序进行排序，并删除重复元素
	 */
	Sizzle.uniqueSort = function( results ) {
		if ( sortOrder ) {
			hasDuplicate = baseHasDuplicate;
			results.sort( sortOrder );
	
			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[ i - 1 ] ) {
						results.splice( i--, 1 );
					}
				}
			}
		}
	
		return results;
	};
	//使用指定的选择表达式 expr 对元素集合set进行过滤
	Sizzle.matches = function( expr, set ) {
		return Sizzle( expr, null, null, set );
	};
	//检查某个元素node是否匹配选择表达式  expr
	Sizzle.matchesSelector = function( node, expr ) {
		return Sizzle( expr, null, null, [node] ).length > 0;
	};
	/*
	 * add by zhangjh   2016-2-29
	 * 查找与块表达式匹配的元素集合，没有找到的话，则查找上下文的所有后代元素；找到的话，返回查找结果和块块表达式的剩余部分（用于过滤）
	 * @param expr:块表达式
	 * @param context:上下文
	 * @param isXML:context是否是XML文档
	 */
	Sizzle.find = function( expr, context, isXML ) {
		var set, i, len, match, type, left;
	
		if ( !expr ) {
			return [];
		}
	    //order: [ "ID", "NAME", "TAG","CLASS" ]
		for ( i = 0, len = Expr.order.length; i < len; i++ ) {
			type = Expr.order[i];
			//判断块表达式是ID、NAME、TAG、CLASS中的一类
			if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
				
				left = match[1];
				//应为leftMatch是加了前缀的正则表达式，用slice(1,1),match['a','b','c']变为m['a','c']
				match.splice( 1, 1 );
				//如果匹配正则的内容以'\\'开始，表明'\\'之后的字符被转义了，不是期望的类型
				if ( left.substr( left.length - 1 ) !== "\\" ) {
					//rBackslash=/\\/ 去掉转义符   如$('#a\\.b')   id=a.b
					match[1] = (match[1] || "").replace( rBackslash, "" );
					//通过原生态的getElementBy。。。查找元素
					set = Expr.find[ type ]( match, context, isXML );
	
					if ( set != null ) {
						//如果set不是null和undefined，将expr中已经查找过的部分删除
						expr = expr.replace( Expr.match[ type ], "" );
						break;
					}
				}
			}
		}
	    //如果没有找到对应类型的查找函数，则读取上下文的所有后代元素
		if ( !set ) {
			set = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( "*" ) :
				[];
		}
	
		return { set: set, expr: expr };
	};
	/*
	 * add by zhangjh  2016-2-29
	 * 用块表达式过滤元素集合
	 * @param expr:块表达式
	 * @param set:过滤的元素集合
	 * @param inplace: true，将原set集中不匹配的元素置为false；false，重新构造一个元素数组，只保留匹配元素
	 * @param not: true,去除匹配元素，保留不匹配元素；false，去除不匹配元素，保留匹配元素
	 */
	Sizzle.filter = function( expr, set, inplace, not ) {
		var match, anyFound,
			type, found, item, filter, left,
			i, pass,
			old = expr,
			result = [],
			curLoop = set,
			isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );
	    //如果set元素集为空，则不必要执行过滤操作
		while ( expr && set.length ) {
			// filter的type：PSEUDO、CHILD、ID、TAG、CLASS、ATTR、POS
			for ( type in Expr.filter ) {
				
				if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
					//filter为对应的过滤函数
					filter = Expr.filter[ type ];
					//left为通过正则表达式匹配到的expr的前缀部分
					left = match[1];
	
					anyFound = false;
	                //删掉match中的第二个元素
					match.splice(1,1);
	                //如果匹配的字符串的前缀以'\'结束，表明'\'之后的字符被转义了，不是期望的类型，比如'\\#id',$('\\#id'),#被转义
					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}
	
					if ( curLoop === result ) {
						result = [];
					}
	                //如果存在预过滤函数，执行过滤前的修正操作
					if ( Expr.preFilter[ type ] ) {
						/*
						 * add by zhangjh   2016-3-12
						 * 1.若属于伪类，先看是不是not，如果是，把参数部分置换成符合参数的元素集合；如果不是，判断是不是位置伪类或者孩子伪类，是的话返回true，不是返回false；
						 * 2.如属于ID，去掉'\'
						 * 3.如果属于tag 去掉'\'并小写
						 * 4。如果是位置伪类，在match头部插入true
						 * 5。如果是孩子伪类，如果参数是odd，转化为2n+1;如果参数是even，转化为2n；如果参数是3，转化为0*n+3
						 * 6.如果是class，缩小过滤集合
						 * 7.如果是属性，class->className;for->htmlfor;如果是单词匹配，前后加空格
						 */
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
	                    //预过滤函数有3中返回值
						if ( !match ) {
							//如果返回值为false，表示已经执行了过滤
							anyFound = found = true;
	
						} else if ( match === true ) {
							//返回true，表示需要继续执行预过滤
							//由于filter中属性PSEUDO在CHILD、POS之前，遍历filter属性的时候，首先遍历PSEUDO，满足；执行预顾虑，满足CHILD，POS，则跳出本次循环
							//继续执行，知道遍历到属性CHILD、POS
							continue;
						}
						
					}
					//若返回字符串，表示修正后的过滤参数，对其调用过滤函数
					if ( match ) {
						for ( i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								//执行过滤函数，判断元素item是不是匹配match条件，true表示匹配；false表示不匹配
								found = filter( item, match, i, curLoop );
								//pass表示当前元素item是否可以通过过滤表达式的过滤
								pass = not ^ found;
								if ( inplace && found != null ) {
									//如果inplace为true，将与块表达式不匹配的元素设置为false
									if ( pass ) {
										anyFound = true;
	
									} else {
										//not为true，去除匹配元素，保留不匹配元素
										curLoop[i] = false;
									}
	
								} else if ( pass ) {
									//inplace不为true，重新构造一个元素数组
									result.push( item );
									anyFound = true;
								}
							}
						}
					}
	                //删除块表达式expr中已过滤的部分
					if ( found !== undefined ) {
						if ( !inplace ) {
							curLoop = result;
						}
	
						expr = expr.replace( Expr.match[ type ], "" );
	
						if ( !anyFound ) {
							return [];
						}
	
						break;
					}
				}
			}
	
			// Improper expression
			//如果块表达式没有发生变化，则认为不 合法
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );
	
				} else {
					break;
				}
			}
	
			old = expr;
		}
	    //返回过滤后的元素集合，或缩减范围后的元素集合
		return curLoop;
	};
	//抛出一个含有选择器语法错误信息的异常
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Utility function for retreiving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 * 用于获取元素集合中所有元素合并后的文本内容
	 */
	var getText = Sizzle.getText = function( elem ) {
	    var i, node,
			nodeType = elem.nodeType,
			ret = "";
	
		if ( nodeType ) {
			//1->element;9->document;11->documentFragment
			if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
				// Use textContent || innerText for elements
				if ( typeof elem.textContent === 'string' ) {
					return elem.textContent;
				} else if ( typeof elem.innerText === 'string' ) {
					// Replace IE's carriage returns
					//rReturn = /\r\n/g,
					return elem.innerText.replace( rReturn, '' );
				} else {
					// Traverse it's children
					for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += getText( elem );
					}
				}
				//3->text,4->CDATASection,不会由解析器解析的文本
			} else if ( nodeType === 3 || nodeType === 4 ) {
				return elem.nodeValue;
			}
		} else {
	         //认为是元素集合，递归调用getText方法
			// If no nodeType, this is expected to be an array
			for ( i = 0; (node = elem[i]); i++ ) {
				// Do not traverse comment nodes
				if ( node.nodeType !== 8 ) {
					ret += getText( node );
				}
			}
		}
		return ret;
	};
	
	var Expr = Sizzle.selectors = {
		//如果浏览器支持getElementByClassName，则会添加'CLASS'入order
		order: [ "ID", "NAME", "TAG" ],
	
		match: {
			//用于匹配简单表达式“#id”，并解析“#”之后的id  #****或者#\****
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			//用于匹配简单表达式“.class”,并解析"."之后的class  .*****或者.\*****
			CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			//用于匹配简单表达式[name=“value”]，并解析属性name的值    [name='****']或者[name='\****']
			NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
			//用于匹配属性表达式[attribute = "value"],并解析属性名和属性值    [***='***']或者[#]
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			//用于匹配加单表达式“tag”    ****或者/*** 只把标签给过滤出来，像p:has(a),只拿到p
			TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
			//用于匹配子元素伪类表达式:nth-child(index/even/odd/equation)、:first-child、:last:child,并解析子元素伪类和伪类参数
			CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
			//匹配位置伪类表达式:eq(indxe)、gt(index)、:lt(index)、:first、:last、:odd、:even,并解析位置伪类和伪类参数,不包含连字符
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
			//匹配伪类表达式  :*******('(****)')
			PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},
	    /*
	     * add by zhangjh   2016-2-29
	     * leftMatch在jQuery文件加载的时候就会被初始化
	     * leftMatch:{
	     *      ID: /(^(?:.|\r|\n)*?)#((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?![^\[]*\])(?![^\(]*\))/,
	     *      CLASS: /(^(?:.|\r|\n)*?)\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?![^\[]*\])(?![^\(]*\))/,
	     *      NAME: /(^(?:.|\r|\n)*?)\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\](?![^\[]*\])(?![^\(]*\))/,
	     *      ATTR: /(^(?:.|\r|\n)*?)\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\4|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\](?![^\[]*\])(?![^\(]*\))/,
	     *      TAG: /(^(?:.|\r|\n)*?)^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)(?![^\[]*\])(?![^\(]*\))/,
	     *      CHILD: /(^(?:.|\r|\n)*?):(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?(?![^\[]*\])(?![^\(]*\))/,
	     *      POS: /(^(?:.|\r|\n)*?):(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)(?![^\[]*\])(?![^\(]*\))/,
	     *      PSEUDO: /(^(?:.|\r|\n)*?):((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\3\))?(?![^\[]*\])(?![^\(]*\))/
	     * }
	     */
		leftMatch: {},
	
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
	
		attrHandle: {
			href: function( elem ) {
				return elem.getAttribute( "href" );
			},
			type: function( elem ) {
				return elem.getAttribute( "type" );
			}
		},
	    //块间过滤函数集
		relative: {
			//A+B 在A的下一个兄弟元素中寻找B
			//@param  checkSet 映射集，对该元素集合执行过滤操作,是满足B条件的集合
			//@param  part 块表达式，也可能是DOM元素，对应A
			"+": function(checkSet, part){
				//判断是否为字符串
				var isPartStr = typeof part === "string",
				    //	rNonWord = /\W/;判断是是不是标签  /\W/.test('div')为false
				    //逻辑上认为'abc','123'也和'div'一样，属于标签；'@#$234',{}不是标签
					isTag = isPartStr && !rNonWord.test( part ), 
					//判断是不是非标签字符串
					isPartStrNotTag = isPartStr && !isTag;  //true表示part不是一个标签
				                                            //false：1，part不是一个字符串；
				                                            //      2.div是一个标签
	            //标签小写
				if ( isTag ) {
					part = part.toLowerCase();
				}
	
				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						//previousSibling返回元素之前紧随的节点，遍历兄弟节点，并过滤掉非元素节点
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
	                    /*
	                     * add by zhangjh   2016-3-1
	                     * 如果未找到兄弟元素，elem为null，则返回false
	                     * 如果找到了兄弟元素，并且参数part是标签，则检查兄弟元素的节点名称nodeName是否与之相等，相等的话置换为兄弟元素，否则置换为空；
	                     * 如果找到了兄弟元素，并且参数part是DOM元素，则检查二者是否相等，如果相等则替换为true，不相等则替换为false
	                     * 
	                     */
						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
								
							elem || false :
							elem === part;
					}
				}
	            //如果参数是非标签字符串，则调用方法fillter
				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},
			
	        // A>B 在A的子元素中寻找B
			">": function( checkSet, part ) {
				var elem,
					isPartStr = typeof part === "string",
					i = 0,
					l = checkSet.length;
	
				if ( isPartStr && !rNonWord.test( part ) ) {
					//part是有ASCII字符组成的字符串
					part = part.toLowerCase();
	
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
	
				} else {
					//part为非标签字符串或者DOM元素
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								//如果part不是字符串，则判断elem的parentNode与part相等
								elem.parentNode === part;
						}
					}
	
					if ( isPartStr ) {
						//非标签字符串，则过滤
						Sizzle.filter( part, checkSet, true );
					}
				}
			},
	        //从A的子孙元素中寻找B
			"": function(checkSet, part, isXML){
				var nodeCheck,
				    //done=0;
					doneName = done++,
					checkFn = dirCheck;
	            //rNonWord = /\W/;  等价于[^a-z0-9A-Z]
				//如果part是标签，调用dirNodeCheck过滤；如果不是，调用dirCheck过滤
				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part; 
					checkFn = dirNodeCheck;
				}
	
				checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
			},
	        //从A的所有兄弟元素中寻找B
			"~": function( checkSet, part, isXML ) {
				var nodeCheck,
					doneName = done++,
					checkFn = dirCheck;
	
				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}
	
				checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
			}
		},
	    /*
	     * add by zhangjh  2016-3-1
	     * 通过ID,NAME,TAG来查找元素，调用原生态的getElementBy...
	     */
		find: {
			ID: function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			},
	
			NAME: function( match, context ) {
				if ( typeof context.getElementsByName !== "undefined" ) {
					var ret = [],
						results = context.getElementsByName( match[1] );
	
					for ( var i = 0, l = results.length; i < l; i++ ) {
						if ( results[i].getAttribute("name") === match[1] ) {
							ret.push( results[i] );
						}
					}
	
					return ret.length === 0 ? null : ret;
				}
			},
	
			TAG: function( match, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( match[1] );
				}
			}
		},
		// 预过滤函数集
		preFilter: {

		   /***********************************   过滤不匹配元素，或缩小元素集合   ******************************************/
			/*
			 * add by zhangjh   2016-3-1
			 * @param match 匹配对应类型正则表达式的结果
			 * @param curloop  待处理的结果集
			 * @param inplace  true，不匹配的元素职位false；false，重新构造一个数组，返回匹配的元素
			 * @param result  
			 * @param not     true，保留不匹配元素；false，保留匹配元素
			 * @param isXML
			 */
			CLASS: function( match, curLoop, inplace, result, not, isXML ) {
				// .*****或者.\*****
				//  CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				//class类型的正则表达式匹配块表达式后，生成一个a[2],a[1]为解析后的字符串
				//去掉解析后的字符串中的'\'   class="1\.2",实际class为1.2
				match = " " + match[1].replace( rBackslash, "" ) + " ";
	
				if ( isXML ) {
					return match;
				}
	
				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
							//当elem符合条件且not为false的时候，result保存的是匹配元素；当elem不符合条件not为true是，result保存的是不匹配的元素
							if ( !inplace ) {
								//inplace为false，重新构造一个数组
								result.push( elem );
							}
							//当inplace为true时
	
						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}
	            //CLASS预过滤函数总是返回false，表示已经执行过滤，或者已经缩小了过滤集合
				return false;
			},
	        //负责过滤'\'
			ID: function( match ) {
				return match[1].replace( rBackslash, "" );
			},
	        //过滤'\'并小写
			TAG: function( match, curLoop ) {
				return match[1].replace( rBackslash, "" ).toLowerCase();
			},
			
	       //CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/
			//负责将伪类的参数转化为a*n+b的格式
			CHILD: function( match ) {
				//match[1]伪类，match[2]是伪类参数
				if ( match[1] === "nth" ) {
					if ( !match[2] ) {
						Sizzle.error( match[0] );
					}
	                //将伪类参数前面的空格、‘+’置为空
					match[2] = match[2].replace(/^\+|\s*/g, '');
	
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					//把伪类参数统一格式化为first*n+last
					//even->偶数  odd->基数    a*n+b
					// match[2] 为even，转化为2n；为odd，转化为2n+1；为整数，转化为0n+d
					var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
	
					// calculate the numbers (first)n+(last) including if they are negative
					//字符串-0，将字符串强制转化为数字，得到first部分
					//这里有巧妙的进行了字符和数字之间的转换
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
					
				}
				//如果子类伪类是only，last，first，有伪类参数，抛出错误
				else if ( match[2] ) {
					Sizzle.error( match[0] );
				}
	
				// TODO: Move to normal caching system
				//为本次过滤添加一个唯一标识符
				match[0] = done++;
	
				return match;
			},
	        //ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			//负责修正属性名和属性值
			ATTR: function( match, curLoop, inplace, result, not, isXML ) {
				//match是一个长度为6的数组，match[1]->name,match[2]->'=',match[3]->'"'
				//match[4]或者match[5]为属性值
				var name = match[1] = match[1].replace( rBackslash, "" );
	            //attrMap: {"class": "className","for": "htmlFor"},
				if ( !isXML && Expr.attrMap[name] ) {
					match[1] = Expr.attrMap[name];
				}
	
				// Handle if an un-quoted value was used
				match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );
	
				if ( match[2] === "~=" ) {
					//'~='表示是单词匹配，需要在属性上加空格？
					match[4] = " " + match[4] + " ";
				}
	
				return match;
			},
	        //  /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			//
			PSEUDO: function( match, curLoop, inplace, result, not ) {
				//match是一个长度为4的数组，match[1]为伪类元素，match[3]为伪类参数
				if ( match[1] === "not" ) {
					//如果match[1]是not，则更具math[3]参数，先找出curloop中满足参数的元素，然后替换match[3],该参数最后会在Sizzle.selector.filter函数中使用
					// If we're dealing with a complex expression, or a simple one
					if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
						match[3] = Sizzle(match[3], null, null, curLoop);
	
					} else {
						var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
	
						if ( !inplace ) {
							result.push.apply( result, ret );
						}
	
						return false;
					}
	
				} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
					return true;
				}
	
				return match;
			},
	        //
			POS: function( match ) {
				//负责在匹配结果match的头部插入一个新元素true，使得匹配结果match中位置伪类参数的下标变成了3，从而与伪类的匹配结果保持一致
				match.unshift( true );
	
				return match;
			}
		},
	
		filters: {
			//匹配所有可用元素(未禁用的、可见的)
			enabled: function( elem ) {
				return elem.disabled === false && elem.type !== "hidden";
			},
	        //匹配所有不可用的元素
			disabled: function( elem ) {
				return elem.disabled === true;
			},
	        //匹配所有选中的被选中元素(只用于单选和复选框)
			checked: function( elem ) {
				return elem.checked === true;
			},
	        //匹配所有被选中的option元素
			selected: function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	        //匹配所有含有子元素的元素
			parent: function( elem ) {
				return !!elem.firstChild;
			},
	        //匹配不包含子元素的元素
			empty: function( elem ) {
				return !elem.firstChild;
			},
	        //$('has[selector]')匹配含有满足selector条件的元素的元素
			has: function( elem, i, match ) {
				return !!Sizzle( match[3], elem ).length;
			},
	        //匹配标题
			header: function( elem ) {
				return (/h\d/i).test( elem.nodeName );
			},
	        //匹配单行文本框
			text: function( elem ) {
				var attr = elem.getAttribute( "type" ), type = elem.type;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
			},
	        //匹配单选按钮
			radio: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
			},
	        //匹配复选框
			checkbox: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
			},
	        //匹配文件域
			file: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
			},
	        //匹配密码框
			password: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
			},
	        //匹配提交按钮
			submit: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "submit" === elem.type;
			},
	        //匹配图片域
			image: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
			},
	        //匹配重置按钮
			reset: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "reset" === elem.type;
			},
	        //匹配按钮
			button: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && "button" === elem.type || name === "button";
			},
	        //匹配输入框
			input: function( elem ) {
				return (/input|select|textarea|button/i).test( elem.nodeName );
			},
	        //匹配当前焦点元素 elem.ownerDocument.activeElement
			focus: function( elem ) {
				return elem === elem.ownerDocument.activeElement;
			}
		},
		//位置伪类和对应的伪类过滤函数
		setFilters: {
			//$(":first") 找到第一个元素
			first: function( elem, i ) {
				return i === 0;
			},
	        //$(":last")找到最后一个元素
			last: function( elem, i, match, array ) {
				return i === array.length - 1;
			},
	        //$(":even")匹配下标为偶数的元素，从0开始 
			even: function( elem, i ) {
				return i % 2 === 0;
			},
	        //$(":odd")匹配下标为基数的元素，从0开始
			odd: function( elem, i ) {
				return i % 2 === 1;
			},
	        //$(":lt(index)")匹配所有小于指定下标的元素
			lt: function( elem, i, match ) {
				return i < match[3] - 0;
			},
	        //$(":gt(index)")匹配所有大于指定下标的元素
			gt: function( elem, i, match ) {
				return i > match[3] - 0;
			},
	        //$(":nth(index)")匹配一个指定下标的元素，从0开始
			nth: function( elem, i, match ) {
				return match[3] - 0 === i;
			},
	        //$(":eq(index)")匹配一个指定下标的元素，从0开始
			eq: function( elem, i, match ) {
				return match[3] - 0 === i;
			}
		},
		/*
		 * add by zhangjh  2016-3-2
		 * 检查元素是否匹配伪类
		 */
		filter: {
			PSEUDO: function( elem, match, i, array ) {
				//name：伪类
				var name = match[1],
				    //伪类对应的函数
					filter = Expr.filters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
	
				} else if ( name === "contains" ) {
					//$(":contains(test)")  match[3]为伪类参数，匹配包含test文本的元素
					return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
	
				} else if ( name === "not" ) {
					//当伪类为not的时候，$(":not(selector)"),匹配不是selector的元素，此时match[3]经过预处理，变为selector的元素集合
					var not = match[3];
	
					for ( var j = 0, l = not.length; j < l; j++ ) {
						if ( not[j] === elem ) {
							return false;
						}
					}
	
					return true;
	
				} else {
					Sizzle.error( name );
				}
			},
	        //判断元素elem是不是满足match
			CHILD: function( elem, match ) {
				var first, last,
					doneName, parent, cache,
					count, diff,
					type = match[1],
					node = elem;
	
				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							//如果elem前面还有element，则表明单前元素不是first，也不是only，则返回false
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	
						if ( type === "first" ) {
							//说明该元素是first
							return true;
						}
	
						node = elem;
	
						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							//如果elem后面还有element，则表明当前元素不是last，也不是only，返回false
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	                    //说明该元素是only
						return true;
	
					case "nth":
						first = match[2];
						last = match[3];
	
						if ( first === 1 && last === 0 ) {
							//相当于nth(n)，肯定返回true
							return true;
						}
	
						doneName = match[0];
						parent = elem.parentNode;
	
						if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
							count = 0;
	
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									//找到element元素
									node.nodeIndex = ++count;
								}
							}
	
							parent[ expando ] = doneName;
						}
	
						diff = elem.nodeIndex - last;
	
						if ( first === 0 ) {
							return diff === 0;
	
						} else {
							return ( diff % first === 0 && diff / first >= 0 );
						}
				}
			},
	        //检查元素的id是否与指定的id即match相等
			ID: function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},
	        //指定元素是否属于某个标签
			TAG: function( elem, match ) {
				return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
			},
	        //指定元素是否属于某个类
			CLASS: function( elem, match ) {
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf( match ) > -1;
			},
	
			ATTR: function( elem, match ) {
				//name是指定的属性名
				var name = match[1],
				//拿到elem对应属性名的属性
					result = Sizzle.attr ?
						Sizzle.attr( elem, name ) :
						Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					//属性的对应属性值		
					value = result + "",
					//属性表达式的等号部分=,!=
					type = match[2],
					//指定的属性值
					check = match[4];
	                   
				return result == null ?
					//不包含次属性，type='!=',返回true；否则返回false
					type === "!=" :
					//包含此属性
					!type && Sizzle.attr ?
					result != null :
					//包含指定属性且属性值等于指定值
					type === "=" ?
				    //等于指定值，指定值可以为空
					value === check :
					type === "*=" ?
					//包含指定值，指定值可以为空
					value.indexOf(check) >= 0 :
					type === "~=" ?
					//含有指定单词
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					//没有指定值，需要属性和属性值不为空
					value && result !== false :
					type === "!=" ?
					//不等于指定值
					value !== check :
					type === "^=" ?
					//以指定值开始
					value.indexOf(check) === 0 :
					type === "$=" ?
					//以指定值结束
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					//等于当前指定值或者已单前指定值开头且后跟一个'-'		
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},
	       
			POS: function( elem, match, i, array ) {
				//检查元素的位置是否符合位置
				var name = match[2],
					filter = Expr.setFilters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
				}
			}
		}
	};
	
	var origPOS = Expr.match.POS,
		fescape = function(all, num){
			return "\\" + (num - 0 + 1);
		};
	
	for ( var type in Expr.match ) {
		Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
		/*
		 * add by zhangjh  2016-2-29
		 * string.replace(a,b),当b是一个函数的时候，传入该函数的第一个参数是匹配a的字符串，第二个参数是a中某个括号中的字符串，后面的参数是匹配结果的位置，最后一个参数是string本身
		 */
		Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
	}
	// Expose origPOS
	// "global" as in regardless of relation to brackets/parens
	Expr.match.globalPOS = origPOS;
	
	var makeArray = function( array, results ) {
		//array 是类数组对象，需要将之转化为数组 注意：DOM方法获取到的结果有可能是类数组对象，但不能使用数组的方法
		array = Array.prototype.slice.call( array, 0 );
	
		if ( results ) {
			//这是一个小技巧，可以将数组array中的元素添加到results中
			//Array.prototype.push.apply(results,array)
			results.push.apply( results, array );
			return results;
		}
	
		return array;
	};
	
	// Perform a simple check to determine if the browser is capable of
	// converting a NodeList to an array using builtin methods.
	// Also verifies that the returned array holds DOM nodes
	// (which is not the case in the Blackberry browser)
	try {
		Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;
	
	// Provide a fallback method if it does not work
	} catch( e ) {
		makeArray = function( array, results ) {
			var i = 0,
				ret = results || [];
	
			if ( toString.call(array) === "[object Array]" ) {
				Array.prototype.push.apply( ret, array );
	
			} else {
				if ( typeof array.length === "number" ) {
					for ( var l = array.length; i < l; i++ ) {
						ret.push( array[i] );
					}
	
				} else {
					for ( ; array[i]; i++ ) {
						ret.push( array[i] );
					}
				}
			}
	
			return ret;
		};
	}
	/**
	 * add by zhangjh   2016-3-14
	 * 负责比较元素a和元素b在文档中的位置。如果a在b之前，返回-1；如果a在b之后，返回1；如果相等，返回0
	 */
	var sortOrder, siblingCheck;
	//如果浏览器支持原生方法compareDocumentPosition，则调用该方法比较元素位置
	if ( document.documentElement.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( a === b ) {
				//判断是否有重复，如果a==b，表示有重复
				hasDuplicate = true;
				return 0;
			}
	        // 如果a有compareDocumentPosition方法且b没有的话，返回-1；如果a没有，返回1？？？
			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				return a.compareDocumentPosition ? -1 : 1;
			}
	        //如果a和b都有compareDocumentPosition方法
			/**
			 * 1：没有关系，这两个节点不属于同一个文档。
			 * 2： 第一节点（P1）位于第二个节点后（P2）。
			 * 4：第一节点（P1）定位在第二节点（P2）前。
			 * 8： 第一节点（P1）位于第二节点内（P2）。
			 * 16： 第二节点（P2）位于第一节点内（P1）。
			 * 32:没有关系的，或是两个节点在同一元素的两个属性
			 */
			//结果为4，表示a在b的前面，返回-1；否则返回1
			return a.compareDocumentPosition(b) & 4 ? -1 : 1;
		};
	
	} else {
		//如果浏览器不支持原生方法compareDocumentPosition
		sortOrder = function( a, b ) {
			// The nodes are identical, we can exit early
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
	
			// Fallback to using sourceIndex (in IE) if it's available on both nodes
		    //浏览器支持sourceIndex属性
			} else if ( a.sourceIndex && b.sourceIndex ) {
				return a.sourceIndex - b.sourceIndex;
			}
	        //浏览器不支持sourceIndex属性
			var al, bl,
				ap = [],
				bp = [],
				//a的父节点
				aup = a.parentNode,
				//b的父节点
				bup = b.parentNode,
				cur = aup;
	
			// If the nodes are siblings (or identical) we can do a quick check
			if ( aup === bup ) {
				//说明a，b是兄弟元素
				return siblingCheck( a, b );
	
			// If no parents were found then the nodes are disconnected
			} else if ( !aup ) {
				//如果a的父节点不存在，表示a和b不在同一个文件中，a在b之前
				return -1;
	
			} else if ( !bup ) {
				//如果b的父节点不存在，表示b不在a的文件中，b在a之前
				return 1;
			}
	
			// Otherwise they're somewhere else in the tree so we need
			// to build up a full list of the parentNodes for comparison
			//a,b的父节点都存在，但不相等，找到a节点的最上层
			while ( cur ) {
				ap.unshift( cur );
				cur = cur.parentNode;
			}
	
			cur = bup;
	        //找到b节点的最上层节点
			while ( cur ) {
				//插入数组bp的头部
				bp.unshift( cur );
				cur = cur.parentNode;
			}
	
			al = ap.length;
			bl = bp.length;
	
			// Start walking down the tree looking for a discrepancy
			for ( var i = 0; i < al && i < bl; i++ ) {
				//a，b的最上层节点肯定一样，从最上层节点开始比较，当出现不相等是比较
				if ( ap[i] !== bp[i] ) {
					return siblingCheck( ap[i], bp[i] );
				}
			}
	
			// We ended someplace up the tree so do a sibling check
			return i === al ?
				siblingCheck( a, bp[i], -1 ) :
				siblingCheck( ap[i], b, 1 );
		};
	    
		siblingCheck = function( a, b, ret ) {
			if ( a === b ) {
				return ret;
			}
	
			var cur = a.nextSibling;
	        //如果a的下一个直到结束为止，都没有b，那肯定b在a的前面，返回1
			while ( cur ) {
				if ( cur === b ) {
					return -1;
				}
	
				cur = cur.nextSibling;
			}
	
			return 1;
		};
	}
	
	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	(function(){
		// We're going to inject a fake input element with a specified name
		var form = document.createElement("div"),
			id = "script" + (new Date()).getTime(),
			root = document.documentElement;
	
		form.innerHTML = "<a name='" + id + "'/>";
	
		// Inject it into the root element, check its status, and remove it quickly
		root.insertBefore( form, root.firstChild );
	
		// The workaround has to do additional checks after a getElementById
		// Which slows things down for other browsers (hence the branching)
		if ( document.getElementById( id ) ) {
			Expr.find.ID = function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
	
					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
						[];
				}
			};
	
			Expr.filter.ID = function( elem, match ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
	
				return elem.nodeType === 1 && node && node.nodeValue === match;
			};
		}
	
		root.removeChild( form );
	
		// release memory in IE
		root = form = null;
	})();
	
	(function(){
		// Check to see if the browser returns only elements
		// when doing getElementsByTagName("*")
	
		// Create a fake element
		var div = document.createElement("div");
		div.appendChild( document.createComment("") );
	
		// Make sure no comments are found
		if ( div.getElementsByTagName("*").length > 0 ) {
			Expr.find.TAG = function( match, context ) {
				var results = context.getElementsByTagName( match[1] );
	
				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [];
	
					for ( var i = 0; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}
	
					results = tmp;
				}
	
				return results;
			};
		}
	
		// Check to see if an attribute returns normalized href attributes
		div.innerHTML = "<a href='#'></a>";
	
		if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#" ) {
	
			Expr.attrHandle.href = function( elem ) {
				return elem.getAttribute( "href", 2 );
			};
		}
	
		// release memory in IE
		div = null;
	})();
	/**
	 * add by zhangjh   2016-3-9
	 * 如果浏览器有querySelectorAll方法
	 */
	if ( document.querySelectorAll ) {
		(function(){
			var oldSizzle = Sizzle,
				div = document.createElement("div"),
				id = "__sizzle__";
	
			div.innerHTML = "<p class='TEST'></p>";
	
			// Safari can't handle uppercase or unicode characters when
			// in quirks mode.
			if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
				return;
			}
	        
			Sizzle = function( query, context, extra, seed ) {
				context = context || document;
	
				// Only use querySelectorAll on non-XML documents
				// (ID selectors don't work in non-HTML documents)
				if ( !seed && !Sizzle.isXML(context) ) {
					// See if we find a selector to speed up
					//检查是tag、类、id
					var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
	
					if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
						// Speed-up: Sizzle("TAG")
						if ( match[1] ) {
							return makeArray( context.getElementsByTagName( query ), extra );
	
						// Speed-up: Sizzle(".CLASS")
						} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
							return makeArray( context.getElementsByClassName( match[2] ), extra );
						}
					}
	                //注意：只有Document对象才有getElementById方法
					if ( context.nodeType === 9 ) {
						// Speed-up: Sizzle("body")
						// The body element only exists once, optimize finding it
						if ( query === "body" && context.body ) {
							return makeArray( [ context.body ], extra );
	
						// Speed-up: Sizzle("#ID")
						} else if ( match && match[3] ) {
							var elem = context.getElementById( match[3] );
	
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							if ( elem && elem.parentNode ) {
								// Handle the case where IE and Opera return items
								// by name instead of ID
								if ( elem.id === match[3] ) {
									return makeArray( [ elem ], extra );
								}
	
							} else {
								return makeArray( [], extra );
							}
						}
	
						try {
							return makeArray( context.querySelectorAll(query), extra );
						} catch(qsaError) {}
	
					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
						/**
						 * add by zhangjh   2016-3-10
						 * querySelector,querySelectorAll方法存在一个bug
						 * <div id="1">
						 * 	  <p>123</p>         
						 * </div>
						 * var a=document.getElementById("1");
						 * var b=a.querySelectorAll("#1 p")应该返回null，但返回的却是<p>,相当于执行了document。querySelectorAll("#1 p")
						 *      解决办法是a.querySelectorAll([id=1] #1 p);
						 */
						var oldContext = context,
							old = context.getAttribute( "id" ),
							nid = old || id,
							//
							hasParent = context.parentNode,
							//判断是选择器是否存在兄弟关系,如果要找上下文的兄弟节点，肯定得找到上下文的父节点
							relativeHierarchySelector = /^\s*[+~]/.test( query );
	
						if ( !old ) {
							context.setAttribute( "id", nid );
						} else {
							nid = nid.replace( /'/g, "\\$&" );
						}
						//选择器存在兄弟关系且上下文有父节点
						if ( relativeHierarchySelector && hasParent ) {
							context = context.parentNode;
						}
	
						try {
							if ( !relativeHierarchySelector || hasParent ) {
								return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
							}
	
						} catch(pseudoError) {
						} finally {
							if ( !old ) {
								//当old不存在的时候，前面已经添加old，得移除
								oldContext.removeAttribute( "id" );
							}
						}
					}
				}
	
				return oldSizzle(query, context, extra, seed);
			};
	
			for ( var prop in oldSizzle ) {
				Sizzle[ prop ] = oldSizzle[ prop ];
			}
	
			// release memory in IE
			div = null;
		})();
	}
	
	(function(){
		//documnet.documentElement,整个文档元素<html>***</html>
		var html = document.documentElement,
		    /**
		     * 不同的浏览器实心matchesSelector的方法不同
		     * 谷歌，opera浏览器：webkitMatchesSelector
		     * 火狐浏览器：mozMatchesSelector
		     * IE9+:msMatchesSelector
		     */
			matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;
	
		if ( matches ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9 fails this)
			var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
				pseudoWorks = false;
	
			try {
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( document.documentElement, "[test!='']:sizzle" );
	
			} catch( pseudoError ) {
				pseudoWorks = true;
			}
	        //如果浏览器存在matchesSelector方法，则调用浏览器的matchesSelector方法
			Sizzle.matchesSelector = function( node, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
	
				if ( !Sizzle.isXML( node ) ) {
					try {
						if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
							var ret = matches.call( node, expr );
	
							// IE 9's matchesSelector returns false on disconnected nodes
							if ( ret || !disconnectedMatch ||
									// As well, disconnected nodes are said to be in a document
									// fragment in IE 9, so check for that
									node.document && node.document.nodeType !== 11 ) {
								return ret;
							}
						}
					} catch(e) {}
				}
	
				return Sizzle(expr, null, null, [node]).length > 0;
			};
		}
	})();
	/*
	 * add by zhangjh   2016-3-1
	 * 检验浏览器是否支持getElementByClassName
	 */
	(function(){
		var div = document.createElement("div");
	
		div.innerHTML = "<div class='test e'></div><div class='test'></div>";
	
		// Opera can't find a second classname (in 9.6)
		// Also, make sure that getElementsByClassName actually exists
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			return;
		}
	
		// Safari caches class attributes, doesn't catch changes (in 3.2)
		div.lastChild.className = "e";
	
		if ( div.getElementsByClassName("e").length === 1 ) {
			return;
		}
	    //注意是splice，不是slice
		Expr.order.splice(1, 0, "CLASS");  //order添加class
		Expr.find.CLASS = function( match, context, isXML ) {
			if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
				return context.getElementsByClassName(match[1]);
			}
		};
	
		// release memory in IE
		div = null;
	})();
	/*
	 * add by zhangjh   2016-3-1
	 *     负责遍历候选集checkSet，检查其中的每个元素在某个方向dir上是否有参与cur参数匹配的元素。如果找到，
	 * 则将候选集checkSet中对应位置的元素替换为找到的元素；如果未找到，则置换为false
	 * @param dir 表示查找方向的字符串，例如“parentNode”，“previousSibling”
	 * @param cur 标签字符串
	 * @param doneName  数值，本次查找的唯一标识
	 * @param checkSet  候选集
	 * @param nodeCheck 标签字符串
	 * @param isXML
	 */
	function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
	
			if ( elem ) {
				var match = false;
	
				elem = elem[dir];
	            //找到elem最上层节点
				while ( elem ) {
					// var expando="sizcache" + (Math.random() + '').replace('.', ''),
					if ( elem[ expando ] === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}
	
					if ( elem.nodeType === 1 && !isXML ){
						elem[ expando ] = doneName;
						elem.sizset = i;
					}
	
					if ( elem.nodeName.toLowerCase() === cur ) {
						match = elem;
						break;
					}
	
					elem = elem[dir];
				}
	
				checkSet[i] = match;
			}
		}
	}
	/*
	 * add by zhangjh   2016-3-1
	 *   负责遍历候选集checkSet,检查其中每个元素在某个方向dir上是否有与参数cur匹配或者相等的元素。如果找到，
	 * 则将候选集checkSet中对应位置的元素指定为找到的元素或者true，否则置替换为false
	 * @param dir  表示查找方向，例如parentNode，previousSibling
	 * @param cur  大部分情况下为非标签字符串格式的块表达式，也有可能是DOM元素
	 * @param doneName  本次查找的唯一标识，用于优化查找过程
	 * @checkSet  候选集
	 * @nodeCheck undefined，没有用到
	 * @isXML   检查是否在一个XML文件中运行
	 */
	function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
	
			if ( elem ) {
				var match = false;
	
				elem = elem[dir];
	
				while ( elem ) {
					// var expando="sizcache" + (Math.random() + '').replace('.', ''),
					if ( elem[ expando ] === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}
	
					if ( elem.nodeType === 1 ) {
						if ( !isXML ) {
							elem[ expando ] = doneName;
							elem.sizset = i;
						}
	
						if ( typeof cur !== "string" ) {
							if ( elem === cur ) {
								match = true;
								break;
							}
	
						} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
							match = elem;
							break;
						}
					}
	
					elem = elem[dir];
				}
	
				checkSet[i] = match;
			}
		}
	}
	//检查元素a是否包含元素b
	if ( document.documentElement.contains ) {
		Sizzle.contains = function( a, b ) {
			return a !== b && (a.contains ? a.contains(b) : true);
		};
	
	} else if ( document.documentElement.compareDocumentPosition ) {
		Sizzle.contains = function( a, b ) {
			return !!(a.compareDocumentPosition(b) & 16);
		};
	
	} else {
		//为什么是false？？
		Sizzle.contains = function() {
			return false;
		};
	}
	
	Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	/*
	 * add by zhangjh    2012-2-29
	 * 在指定的上下文数组context下，查找与选择器表达式selector匹配的元素集合，并且支持伪类
	 */
	var posProcess = function( selector, context, seed ) {
		var match,
			tmpSet = [],
			later = "",
			root = context.nodeType ? [context] : context;
	
		// Position selectors must be done after the filter
		// And so must :not(positional) so we move all PSEUDOs to the end
		//将选择器中的伪类过滤出来
		while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
			later += match[0];
			selector = selector.replace( Expr.match.PSEUDO, "" );
		}
	    //如果过滤后的选择器中只剩下块间关系符，则在块间关系符后面添加一个*
		selector = Expr.relative[selector] ? selector + "*" : selector;
	    //查找满足selector的元素保存在temset中
		for ( var i = 0, l = root.length; i < l; i++ ) {
			Sizzle( selector, root[i], tmpSet, seed );
		}
	    //将temSet集中满足伪类选择器的结果过滤出来
		return Sizzle.filter( later, tmpSet );
	};
	
	// EXPOSE
	// Override sizzle attribute retrieval
	//暴露Sizzle给jQuery
	Sizzle.attr = jQuery.attr;
	Sizzle.selectors.attrMap = {};
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[":"] = jQuery.expr.filters;
	jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	
	
	})();
	
	
	var runtil = /Until$/,
		rparentsprev = /^(?:parents|prevUntil|prevAll)/,
		// Note: This RegExp should be improved, or likely pulled from Sizzle
		rmultiselector = /,/,
		isSimple = /^.[^:#\[\.,]*$/,
		slice = Array.prototype.slice,
		POS = jQuery.expr.match.globalPOS,
		// methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
    //继续给jQuery的prototype添加方法，这些方法都可以被jQuery对象使用
	jQuery.fn.extend({
		/*
		 *add by zhangjh   2016-3-8
		 *@param selector可以是字符串，也可以使jQuery对象或者Dom元素
		 */
		find: function( selector ) {
			//调用find是jQuery对象，所以this指定jQuery对象，该jQuery对象是查找元素时生成的jQuery对象(可能是jQuery对象，也可能是DOM元素)
			var self = this,
				i, l;
	       
			if ( typeof selector !== "string" ) {
				//如果selector不是字符串，认为该参数是jQuery对象或者是DOM元素，调用构造函数，生成一个jQuery对象
				return jQuery( selector ).filter(function() {
					for ( i = 0, l = self.length; i < l; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				});
			}
	        //调用pushStack方法，构造一个新的空jQuery对象，并将其作为返回值，后面找到的元素都添加到该jQuery对象中
			var ret = this.pushStack( "", "find", selector ),
				length, n, r;
	        //jQuery对象是一个类数组
			for ( i = 0, l = this.length; i < l; i++ ) {
				//length为上一次查找到元素的个数
				length = ret.length;
				//jQuery.find-> Sizzle,满足条件的结果存入ret中
				jQuery.find( selector, this[i], ret );
	
				if ( i > 0 ) {
					// Make sure that the results are unique
					//从length开始，到ret的length结束，循环范围为本次find的找到的结果
					for ( n = length; n < ret.length; n++ ) {
						//0-length为本次find之前的所有结果
						for ( r = 0; r < length; r++ ) {
							if ( ret[r] === ret[n] ) {
								//找到的元素重复，删除，由于删除改变了ret，n需要-1
								ret.splice(n--, 1);
								break;
							}
						}
					}
				}
			}
	
			return ret;
		},
	    /**
	     * add by zhangjh   2016-3-16
	     * 用当前jQuery对象的子集构造一个新的jQuery对象
	     * @param target 可以是选择器表达式、jQuery对象或者DOM元素
	     */
		has: function( target ) {
			//构造匹配参数的jQuery对象
			var targets = jQuery( target );
			return this.filter(function() {
				for ( var i = 0, l = targets.length; i < l; i++ ) {
					if ( jQuery.contains( this, targets[i] ) ) {
						return true;
					}
				}
			});
		},
	    //找到jQuery对象中不满足selector条件的元素
		not: function( selector ) {
			return this.pushStack( winnow(this, selector, false), "not", selector);
		},
	    //过滤jQuery对象中满足selector条件的元素 
		filter: function( selector ) {
			return this.pushStack( winnow(this, selector, true), "filter", selector );
		},
	    //selector可以是选择器表达式、DOM元素、jQuery对象、或者函数，用来检查当前的元素集合是否匹配selector，只要有一个匹配就返回true
		is: function( selector ) {
			return !!selector && (
				typeof selector === "string" ?
					// If this is a positional selector, check membership in the returned set
					// so $("p:first").is("p:last") won't return true for a doc with two "p".
					POS.test( selector ) ?
						//位置伪类 
						jQuery( selector, this.context ).index( this[0] ) >= 0 :
						//不是位置伪类，调用jQuery的filter
						jQuery.filter( selector, this ).length > 0 :
					//调用jQuery对象的filter
					this.filter( selector ).length > 0 );
		},
	    /**
	     * add by zhangjh   2016-3-17
	     * 用于在当前匹配元素集合中和他们的祖先元素中查找与参数selectors匹配的最近元素，并用查找结构构造一个新的jQuery对象
	     * @param selectors
	     * @param context
	     * @returns
	     */
		closest: function( selectors, context ) {
			var ret = [], i, l, cur = this[0];
	
			// Array (deprecated as of jQuery 1.7)
			if ( jQuery.isArray( selectors ) ) {
				//如果selectors是数组
				var level = 1;
				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( i = 0; i < selectors.length; i++ ) {
	
						if ( jQuery( cur ).is( selectors[ i ] ) ) {
							ret.push({ selector: selectors[ i ], elem: cur, level: level });
						}
					}
	
					cur = cur.parentNode;
					level++;
				}
	
				return ret;
			}
	
			// String
			var pos = POS.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;
	
			for ( i = 0, l = this.length; i < l; i++ ) {
				cur = this[i];
	
				while ( cur ) {
					if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
						ret.push( cur );
						break;
	
					} else {
						cur = cur.parentNode;
						if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
							break;
						}
					}
				}
			}
	
			ret = ret.length > 1 ? jQuery.unique( ret ) : ret;
	
			return this.pushStack( ret, "closest", selectors );
		},
	
		// Determine the position of an element within
		// the matched set of elements
		/**
		 * add by zhangjh    2016-3-17 
		 * 根据参数elem的不同，来进行位置的判断
		 * 如果参数elem为空或者为字符串(选择器表达式)，则返回当前jQuery对象在elem中的位置；
		 * 如果参数elem为DOM元素或者jQuery对象，则返回elem在当前jQuery对象中的位置
		 */
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				//没有传入参数，找到jQuery对象中第一个元素前面的所有兄弟节点
				return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
			}
	
			// index in selector
			if ( typeof elem === "string" ) {
				//选择器表达式，先找到满足elem的元素集合，然后判断jQuery对象的第一个元素是不是在这个元素集合中
				return jQuery.inArray( this[0], jQuery( elem ) );
			}
	
			// Locate the position of the desired element
			return jQuery.inArray(
					//如果elem是jQuery对象，则看jQuery对象的第一个元素是不是在当前jQuery对象中
				// If it receives a jQuery object, the first element is used
				//通过jquery属性来判断一个elem是不是jQuery对象
				elem.jquery ? elem[0] : elem, this );
		},
	
		add: function( selector, context ) {
			var set = typeof selector === "string" ?
					jQuery( selector, context ) :
					jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
				all = jQuery.merge( this.get(), set );
	
			return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
				all :
				jQuery.unique( all ) );
		},
	
		andSelf: function() {
			return this.add( this.prevObject );
		}
	});
	
	// A painfully simple check to see if an element is disconnected
	// from a document (should be improved, where feasible).
	function isDisconnected( node ) {
		return !node || !node.parentNode || node.parentNode.nodeType === 11;
	}
	
/*********************************************   DOM遍历 Traversing(使用了模板模式？？)   ***********************************/
	
	jQuery.each({
		/**
		 * add by zhangjh  2016-5-28
		 * 返回指定DOM元素的父元素，过滤掉文本节点
		 * @param elem  DOM元素
		 * @returns
		 */
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		/**
		 * add by zhangjh   2016-5-28
		 * 返回指定DOM元素的所有父节点
		 * @param elem
		 * @returns
		 */
		parents: function( elem ) {
			return jQuery.dir( elem, "parentNode" );
		},
		/**
		 * add by zhangjh
		 * 返回指定DOM元素的祖先元素，直到遇到匹配until的元素为止
		 */
		parentsUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "parentNode", until );
		},
		//返回执行DOM元素之后紧挨着的兄弟元素
		next: function( elem ) {
			return jQuery.nth( elem, 2, "nextSibling" );
		},
		//返回指定DOM元素之前紧挨着的兄弟元素
		prev: function( elem ) {
			return jQuery.nth( elem, 2, "previousSibling" );
		},
		//返回指定DOM元素之后的所有兄弟元素
		nextAll: function( elem ) {
			return jQuery.dir( elem, "nextSibling" );
		},
		//返回指定DOM元素之前的所有兄弟元素
		prevAll: function( elem ) {
			return jQuery.dir( elem, "previousSibling" );
		},
		//返回指定DOM元素之后的兄弟元素，知道until为止
		nextUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "nextSibling", until );
		},
		//返回指定DOM元素之前的兄弟元素，知道until为止
		prevUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "previousSibling", until );
		},
		//返回DOM元素的所有兄弟元素
		siblings: function( elem ) {
			return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
		},
		//返回DOM元素的子元素，不包括文本节点和注释节点
		children: function( elem ) {
			return jQuery.sibling( elem.firstChild );
		},
		//返回DOM元素的子元素，包括文本节点和注释节点
		contents: function( elem ) {
			return jQuery.nodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				jQuery.makeArray( elem.childNodes );
		}
		
	}, function( name, fn ) {
		/**
		 * add by zhangjh  2016-5-28
		 * 
		 * @param until      选择器表达式，用于指示查找停止的位置
		 * @paramselector    选择器表达式，用于过滤找到的元素
		 */
		jQuery.fn[ name ] = function( until, selector ) {
			//对当前匹配元素调用函数fn，并将返回值放入一个新的数组中
			var ret = jQuery.map( this, fn, until );
	        //修正selector
			if ( !runtil.test( name ) ) {
				//如果遍历函数不以Until结尾，则为jQuery.fn[name]([seletor])
				//如果遍历函数以Until结尾，则为jQuery.fn[name]([until,selector])
				selector = until;
			}
	        //过滤元素，只保留匹配选择器表达式selector的元素
			if ( selector && typeof selector === "string" ) {
				ret = jQuery.filter( selector, ret );
			}
	        //排序和去重
			ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;
	        //倒序排序
			if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
	        //用找到的元素数组ret构造新的jQuery对象，并返回
			return this.pushStack( ret, name, slice.call( arguments ).join(",") );
		};
	});
	
	jQuery.extend({
		/**
		 * add by zhangjh  2016-5-28
		 *  过滤元素
		 * @param expr
		 * @param elems
		 * @param not
		 * @returns
		 */
		filter: function( expr, elems, not ) {
			if ( not ) {
				expr = ":not(" + expr + ")";
			}
	
			return elems.length === 1 ?
				jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
				jQuery.find.matches(expr, elems);
		},
	    /**
	     * add by zhangjh  2016-5-28
	     * 从一个元素出发，查找某个方向上的所有元素，知道遇到某个元素为止
	     * @param elem   DOM元素
	     * @param dir    方向  parentNode、nextSibling等
	     * @param until  截至元素
	     * @returns {Array}
	     */
		dir: function( elem, dir, until ) {
			var matched = [],
				cur = elem[ dir ];
	
			while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[dir];
			}
			return matched;
		},
	    /**
	     * add by zhangjh   2016-5-28
	     * 从一个元素出发，查找某个方向上的第n个元素
	     * @param cur      表示查找的起始元素
	     * @param result   表示要查找的元素的序号，从1开始
	     * @param dir      表示查找的方向
	     * @param elem     
	     * @returns
	     */
		nth: function( cur, result, dir, elem ) {
			result = result || 1;
			var num = 0;
	
			for ( ; cur; cur = cur[dir] ) {
				if ( cur.nodeType === 1 && ++num === result ) {
					break;
				}
			}
	
			return cur;
		},
	    /**
	     * add by zhangjh   2016-5-28
	     * 负责查找一个元素之后的所有兄弟元素，包括起始元素，但不包括参数elem
	     * @param n     表示查找的起始元素
	     * @param elem  可选的DOM元素
	     * @returns {Array}
	     */
		sibling: function( n, elem ) {
			var r = [];
	
			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}
	
			return r;
		}
	});
	
	// Implement the identical functionality for filter and not
	/**
	 * add by zhangjh   2016-3-16
	 * 负责过滤元素集合
	 * @param elements 待过滤的元素集合
	 * @param qualifier 函数、DOM元素、选择器表达式、DOM元素数组、jQuery对象，用于过滤elements元素集合
	 * @param keep  true，保留匹配元素；false，保留不匹配元素
	 */
	function winnow( elements, qualifier, keep ) {
	
		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		qualifier = qualifier || 0;
	    //qualifer是函数
		if ( jQuery.isFunction( qualifier ) ) {
			//找到满足function(elem,i)条件的元素,grep接受三个参数，现在第三个参数为undefied，则grep返回满足function的值
			return jQuery.grep(elements, function( elem, i ) {
				//keep为false，返回不满足qualifer的elem；true相反
				var retVal = !!qualifier.call( elem, i, elem );
				return retVal === keep;
			});
	    //qualofer是dom元素
		} else if ( qualifier.nodeType ) {
			return jQuery.grep(elements, function( elem, i ) {
				return ( elem === qualifier ) === keep;
			});
	    //qualfier是选择器表达式
		} else if ( typeof qualifier === "string" ) {
			//返回elements中的element元素集合
			var filtered = jQuery.grep(elements, function( elem ) {
				return elem.nodeType === 1;
			});
	        //isSimple = /^.[^:#\[\.,]*$/,简单选择器，能在能在:not(***)的选择器
			if ( isSimple.test( qualifier ) ) {
				return jQuery.filter(qualifier, filtered, !keep);
			} else {
				//默认filter第三个参数是false，不能的话先找到满足qualifier条件的元素，再利用grep来过滤元素
				qualifier = jQuery.filter( qualifier, filtered );
			}
		}
	   //如果参数qualifier是DOM元素数组或者jQuery对象
		return jQuery.grep(elements, function( elem, i ) {
			//inArray，找到elem在qualifer中的下标
			return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
		});
	}
	
	
	
	/*
	 *add by zhangjh   2016-2-20 
	 *var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|
	 *                 header|hgroup|mark|meter|nav|output|progress|section|summary|time|video"	
	 * nodeNames包含所有的html5标签
	 * IE9一下的浏览器不支持html5，对于html5标签，不能正确的构建Dom树，我们可以手动对html标签创建一个对应的DOM元素
	 */
	function createSafeFragment( document ) {
		var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();
	
		if ( safeFrag.createElement ) {
			while ( list.length ) {
				safeFrag.createElement(
					list.pop()
				);
			}
		}
		return safeFrag;
	}
	
	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
			"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
		rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
		rleadingWhitespace = /^\s+/,
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		rtagName = /<([\w:]+)/,
		rtbody = /<tbody/i,
		rhtml = /<|&#?\w+;/,
		rnoInnerhtml = /<(?:script|style)/i,
		rnocache = /<(?:script|object|embed|option|style)/i,
		rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptType = /\/(java|ecma)script/i,
		rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
		/*
		 * add by zhangjh    2016-2-20
		 * wrapMap定义了需要包裹的标签，对象的值是一个数组，包含他的深度和他的父标签
		 */
		wrapMap = {
			option: [ 1, "<select multiple='multiple'>", "</select>" ],
			legend: [ 1, "<fieldset>", "</fieldset>" ],
			thead: [ 1, "<table>", "</table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
			col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
			area: [ 1, "<map>", "</map>" ],
			_default: [ 0, "", "" ]
		},
		safeFragment = createSafeFragment( document );
	
	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	// IE can't serialize <link> and <script> tags normally
	if ( !jQuery.support.htmlSerialize ) {
		wrapMap._default = [ 1, "div<div>", "</div>" ];
	}
	
/*****************************************************   DOM操作模块 Manipulation   *****************************************************/
	jQuery.fn.extend({
		/**
		 * add by zhangjh 2016-5-31
		 * 用于获取匹配元素集合中所有元素合并后的文本内容，或者设置每个元素的文本内容
		 * @param value   可选函数，可以是文本内容或者是返回文本内容的函数
		 * @returns
		 */
		text: function( value ) {
			return jQuery.access( this, function( value ) {
				return value === undefined ?
					//获取匹配元素集合中所有元素合并后的文本内容
					jQuery.text( this ) :
					//为每一个元素设置文本节点
					this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
			}, null, value, arguments.length );
		},
	
		wrapAll: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each(function(i) {
					jQuery(this).wrapAll( html.call(this, i) );
				});
			}
	
			if ( this[0] ) {
				// The elements to wrap the target around
				var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);
	
				if ( this[0].parentNode ) {
					wrap.insertBefore( this[0] );
				}
	
				wrap.map(function() {
					var elem = this;
	
					while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
						elem = elem.firstChild;
					}
	
					return elem;
				}).append( this );
			}
	
			return this;
		},
	
		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each(function(i) {
					jQuery(this).wrapInner( html.call(this, i) );
				});
			}
	
			return this.each(function() {
				var self = jQuery( this ),
					contents = self.contents();
	
				if ( contents.length ) {
					contents.wrapAll( html );
	
				} else {
					self.append( html );
				}
			});
		},
	
		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );
	
			return this.each(function(i) {
				jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
			});
		},
	
		unwrap: function() {
			return this.parent().each(function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			}).end();
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 用于在匹配元素集合中每个元素的末尾插入参数指定的内容,是在元素的内部插入
	     * @returns
	     */
		append: function() {
			return this.domManip(arguments, true, function( elem ) {
				//在回调函数中调用原生方法appendchild来插入元素
				if ( this.nodeType === 1 ) {
					//elem为要插入的DOM元素
					this.appendChild( elem );
				}
			});
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 用于在匹配元素集合中每个元素的头部插入参数指定的内容，是在元素的内部插入
	     * @returns
	     */
		prepend: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					//在回调函数中调用原生方法insertBefore插入元素
					//在匹配元素的第一个子元素之前插入DOM元素啊
					this.insertBefore( elem, this.firstChild );
				}
			});
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 用于在匹配元素集合的每个元素之前插入参数指定的内容，是在元素的外面插入
	     * @returns
	     */
		before: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					//在回调函数中通过父节点调用原生方法insertBefor来插入元素，在elem前面插入this
					//匹配 元素的父节点调用insertBefore方法，在当前元素面前插入DOM元素
					this.parentNode.insertBefore( elem, this );
				});//如果没有父节点
			} else if ( arguments.length ) {
				//通过clean方法将html片段转化为DOm元素
				var set = jQuery.clean( arguments );
				//将匹配元素插入转化后的DOM元素之后
				set.push.apply( set, this.toArray() );
				//用合并后的DOM元素数组构造新的jQuery对象并返回
				return this.pushStack( set, "before", arguments );
			}
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 用于在匹配元素集合的每个元素的后面插入参数指定的内容，是在元素的外面插入
	     * @returns
	     */
		after: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					//匹配元素的父节点调用insertBefore方法，在当前元素的后面也就是this.nextSibling插入DOM元素
					this.parentNode.insertBefore( elem, this.nextSibling );
				});
			} else if ( arguments.length ) {
				//先用当前匹配元素集合中的元素构造一个新的jQuery对象
				var set = this.pushStack( this, "after", arguments );
				//将通过HTML代码转换为的DOM元素插入新的jQuery对象的后面
				set.push.apply( set, jQuery.clean(arguments) );
				return set;
			}
		},
	
		// keepData is for internal use only--do not document
		/**
		 * add by zhangjh   2016-5-30
		 * 从文档中移除匹配元素集合
		 * @param selector   可选的选择器表达式，用于过滤待移除的匹配元素
		 * @param keepData   可选的布尔值，指示是否保留匹配元素以及后代元素所光亮的数据和事件
		 */
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						//移除关联的数据和事件
						jQuery.cleanData( elem.getElementsByTagName("*") );
						jQuery.cleanData( [ elem ] );
					}
	
					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				}
			}
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 用于移除文档中匹配元素的所有子元素
	     */
		empty: function() {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				// Remove element nodes and prevent memory leaks
				if ( elem.nodeType === 1 ) {
					//移除后代元素关联的数据和事件
					jQuery.cleanData( elem.getElementsByTagName("*") );
				}
	
				// Remove any remaining nodes
				while ( elem.firstChild ) {
					//调用原生方法，重复移除第一个元素，直到所有的子元素都被移除掉
					elem.removeChild( elem.firstChild );
				}
			}
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-5-31
	     * 用于创建匹配元素集合的深度复制副本
	     * @param dataAndEvents        可选的布尔值，指示是否复制数据和事件
	     * @param deepDataAndEvents    可选的布尔值，指示是否深度复制数据和事件
	     * @returns
	     */
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function () {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			});
		},
	    /**
	     * add by zhangjh   2016-5-31
	     * 用于获取匹配元素集合中第一个元素的HTML内容或者设置每个元素的HTML内容
	     * @param value   HTML代码或者是返回HTML代码的函数
	     * @returns
	     */
		html: function( value ) {
			// this->调用html方法的当前jQuery对象
			//access为匹配的每个元素设置值或者读取第一个元素的值
			return jQuery.access( this, function( value ) {
				//elem当前jQuery对象的第一个元素
				var elem = this[0] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined ) {
					//如果value的值为空，读取elem的innerHtml属性
					return elem.nodeType === 1 ?
						elem.innerHTML.replace( rinlinejQuery, "" ) :
						null;
				}
	
	            //如果value的值存在，表示为选定元素设置html内容
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
					!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {
	                //修正value
					value = value.replace( rxhtmlTag, "<$1></$2>" );
	
					try {
						for (; i < l; i++ ) {
							// Remove element nodes and prevent memory leaks
							elem = this[i] || {};
							if ( elem.nodeType === 1 ) {
								//移除所有后代元素关联的数据和事件
								jQuery.cleanData( elem.getElementsByTagName( "*" ) );
								elem.innerHTML = value;
							}
						}
	                    //正常执行完的时候，elem会等于0
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch(e) {}
				}
	
				if ( elem ) {
					//如果elem为true，说明不等于0，没有正常执行完毕，调用append方法添加元素
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},
	
		replaceWith: function( value ) {
			if ( this[0] && this[0].parentNode ) {
				// Make sure that the elements are removed from the DOM before they are inserted
				// this can help fix replacing a parent with child elements
				if ( jQuery.isFunction( value ) ) {
					return this.each(function(i) {
						var self = jQuery(this), old = self.html();
						self.replaceWith( value.call( this, i, old ) );
					});
				}
	
				if ( typeof value !== "string" ) {
					value = jQuery( value ).detach();
				}
	
				return this.each(function() {
					var next = this.nextSibling,
						parent = this.parentNode;
	
					jQuery( this ).remove();
	
					if ( next ) {
						jQuery(next).before( value );
					} else {
						jQuery(parent).append( value );
					}
				});
			} else {
				return this.length ?
					this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
					this;
			}
		},
	    /**
	     * add by zhangjh   2016-5-31
	     * 用于从文档中移除匹配元素集合，但是会保留后代元素和匹配元素关联的数据和事件，常用于移除的元素稍后再次插入文档的场景
	     * @param selector
	     * @returns
	     */
		detach: function( selector ) {
			return this.remove( selector, true );
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 
	     * @param args        含有待插入内容的数组 使用$("#aaa").append("aaa","bbb","ccc")的时候，调用domManip，args为arguments
	     * @param table       布尔值，只是是否修正tbody元素
	     * @param callback    实际执行插入操作的回调函数
	     * @returns
	     */
		domManip: function( args, table, callback ) {
			var results, first, fragment, parent,
				value = args[0],
				scripts = [];
	
			// We can't cloneNode fragments that contain checked, in WebKit
			if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
				return this.each(function() {
					jQuery(this).domManip( args, table, callback, true );
				});
			}
	        //如果args中的元素是函数，则遍历匹配元素集合，在每个元素上执行该函数，取返回值作为带插入的值，迭代调用方法domManip
			if ( jQuery.isFunction(value) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					//在每个匹配元素上执行函数
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip( args, table, callback );
				});
			}
	        //this指代当前调用domManip的jQuery对象
			if ( this[0] ) {
				//如果当前节点有父节点，返回父节点
				parent = value && value.parentNode;
	
				// If we're in a fragment, just use that instead of building a new one
				if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
					results = { fragment: parent };
	
				} else {
					results = jQuery.buildFragment( args, this, scripts );
				}
	
				fragment = results.fragment;
	
				if ( fragment.childNodes.length === 1 ) {
					first = fragment = fragment.firstChild;
				} else {
					first = fragment.firstChild;
				}
	
				if ( first ) {
					table = table && jQuery.nodeName( first, "tr" );
	
					for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
						callback.call(
							table ?
								root(this[i], first) :
								this[i],
							// Make sure that we do not leak memory by inadvertently discarding
							// the original fragment (which might have attached data) instead of
							// using it; in addition, use the original fragment object for the last
							// item instead of first because it can end up being emptied incorrectly
							// in certain situations (Bug #8070).
							// Fragments from the fragment cache must always be cloned and never used
							// in place.
							results.cacheable || ( l > 1 && i < lastIndex ) ?
								jQuery.clone( fragment, true, true ) :
								fragment
						);
					}
				}
	
				if ( scripts.length ) {
					jQuery.each( scripts, function( i, elem ) {
						if ( elem.src ) {
							jQuery.ajax({
								type: "GET",
								global: false,
								url: elem.src,
								async: false,
								dataType: "script"
							});
						} else {
							jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
						}
	
						if ( elem.parentNode ) {
							elem.parentNode.removeChild( elem );
						}
					});
				}
			}
	
			return this;
		}
	});
	
	function root( elem, cur ) {
		return jQuery.nodeName(elem, "table") ?
			(elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
			elem;
	}
	
	function cloneCopyEvent( src, dest ) {
	
		if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
			return;
		}
	
		var type, i, l,
			oldData = jQuery._data( src ),
			curData = jQuery._data( dest, oldData ),
			events = oldData.events;
	
		if ( events ) {
			delete curData.handle;
			curData.events = {};
	
			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	
		// make the cloned public data object a copy from the original
		if ( curData.data ) {
			curData.data = jQuery.extend( {}, curData.data );
		}
	}
	
	function cloneFixAttributes( src, dest ) {
		var nodeName;
	
		// We do not need to do anything for non-Elements
		if ( dest.nodeType !== 1 ) {
			return;
		}
	
		// clearAttributes removes the attributes, which we don't want,
		// but also removes the attachEvent events, which we *do* want
		if ( dest.clearAttributes ) {
			dest.clearAttributes();
		}
	
		// mergeAttributes, in contrast, only merges back on the
		// original attributes, not the events
		if ( dest.mergeAttributes ) {
			dest.mergeAttributes( src );
		}
	
		nodeName = dest.nodeName.toLowerCase();
	
		// IE6-8 fail to clone children inside object elements that use
		// the proprietary classid attribute value (rather than the type
		// attribute) to identify the type of content to display
		if ( nodeName === "object" ) {
			dest.outerHTML = src.outerHTML;
	
		} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set
			if ( src.checked ) {
				dest.defaultChecked = dest.checked = src.checked;
			}
	
			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if ( dest.value !== src.value ) {
				dest.value = src.value;
			}
	
		// IE6-8 fails to return the selected option to the default selected
		// state when cloning options
		} else if ( nodeName === "option" ) {
			dest.selected = src.defaultSelected;
	
		// IE6-8 fails to set the defaultValue to the correct value when
		// cloning other types of input fields
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
	
		// IE blanks contents when cloning scripts
		} else if ( nodeName === "script" && dest.text !== src.text ) {
			dest.text = src.text;
		}
	
		// Event data gets referenced instead of copied if the expando
		// gets copied too
		dest.removeAttribute( jQuery.expando );
	
		// Clear flags for bubbling special change/submit events, they must
		// be reattached when the newly cloned events are first activated
		dest.removeAttribute( "_submit_attached" );
		dest.removeAttribute( "_change_attached" );
	}
	
	/*
	 * add by zhangjh   2016-2-16
	 * 创建一个文档片段DocumentFragment，然后调用jQuery。clean(elems,context,fragment,script)将html代码转化为DOM元素，并存储在创建的文档片段中
	 * args:数组，含有待转换为DOM元素的HTML代码
	 * nodes:数组，含有文档对象、jQuery对象或者DOM元素，用于修正创建文档片段DocumentFragment
	 * scripts:数组，用于存放html代码中的script元素
	 */
	jQuery.buildFragment = function( args, nodes, scripts ) {
		var fragment,       //指向稍后可能创建的文档片段DocumentFragment 
		    cacheable,      //表示html代码是否符合缓存条件
		    cacheresults,   //指向从缓存对象jQuery。fragments中取到的文档片段，其中包含了缓存的DOM元素
		    doc,            //表示创建文档片段的文档对象
		    first = args[ 0 ];   //HTML代码片段
		// nodes may contain either an explicit document object,
		// a jQuery collection or context object.
		// If nodes[0] contains a valid object to assign to doc
		
	    /*
	     * add by zhangjh   2016-2-17
	     * 修正文档对象doc
	     * nodes[0] 可能是一个Dom元素或者是一个Jquery对象，ownerDocument表示Dom元素所在的文档对象
	     * 如node[0].ownerDocument存在的时候，doc赋值为node[0].ownerDocument即document
	     * 如果node[0].ownerDocument不存在的时候，doc赋值为nodes[0]
	     * 但此时nodes[0]不一定为document，有可能是普通的js对象
	     */

		if ( nodes && nodes[0] ) {
			doc = nodes[0].ownerDocument || nodes[0];
		}
	
		// Ensure that an attr object doesn't incorrectly stand in as a document object
		// Chrome and Firefox seem to allow this to occur and will throw exception
		// Fixes #8950
		/*
		 * add by zhangjh   2016-2-16
		 * document.createDocumentFragment用于生成一个文档片段
		 * 当doc不为document的时候，将doc赋值为document
		 */
		if ( !doc.createDocumentFragment ) {
			doc = document;
		}
	
		// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
		// Cloning options loses the selected state, so don't cache them
		// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
		// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
		// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
		
		/*
		 * add by zhangjh     2015-2-17
		 * 如果HTML代码片段符合缓存条件，则尝试从缓存对象jQuery。fragments中读取缓存的DOM元素
		 * args.length===1&&typeof first ==="string"   要求HTML代码片段只有一段
		 * first。length<512(1/2 KB)                    防止缓存占用的内存过大
		 * doc===documnet    只缓存单前文档创建的DOM元素，不能缓存其他框架的
		 * first。charAt(0) === "<"  只缓存DOM元素，不缓存文本节点
		 * ！roncache.test(first)  HTML代码片段中不能含有<script>、<object>、<embed>、<option>、<style> 标签（why？？）
		 * 
		 *
		 */
		if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
			first.charAt(0) === "<" && !rnocache.test( first ) &&
			//当前浏览器支持复制单选按钮和复选框的选中状态或者HTML代码片段中的单选按钮和复选框按钮没有被选中
			(jQuery.support.checkClone || !rchecked.test( first )) &&
			//当前浏览器支持复制HTML5元素或者HTML代码片段中不包含HTML5元素
			(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {
			
	        //符合缓存条件
			cacheable = true;
	
			cacheresults = jQuery.fragments[ first ];
			if ( cacheresults && cacheresults !== 1 ) {
				fragment = cacheresults;
			}
		}
	
		if ( !fragment ) {
			fragment = doc.createDocumentFragment();
			jQuery.clean( args, doc, fragment, scripts );
		}
	
		if ( cacheable ) {
			jQuery.fragments[ first ] = cacheresults ? fragment : 1;
		}
	
		return { fragment: fragment, cacheable: cacheable };
	};
	
	jQuery.fragments = {};
	
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [],
				insert = jQuery( selector ),
				parent = this.length === 1 && this[0].parentNode;
	
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				return this;
	
			} else {
				for ( var i = 0, l = insert.length; i < l; i++ ) {
					var elems = ( i > 0 ? this.clone(true) : this ).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
	
				return this.pushStack( ret, name, insert.selector );
			}
		};
	});
	
	function getAll( elem ) {
		if ( typeof elem.getElementsByTagName !== "undefined" ) {
			return elem.getElementsByTagName( "*" );
	
		} else if ( typeof elem.querySelectorAll !== "undefined" ) {
			return elem.querySelectorAll( "*" );
	
		} else {
			return [];
		}
	}
	
	// Used in clean, fixes the defaultChecked property
	function fixDefaultChecked( elem ) {
		if ( elem.type === "checkbox" || elem.type === "radio" ) {
			elem.defaultChecked = elem.checked;
		}
	}
	// Finds all inputs and passes them to fixDefaultChecked
	function findInputs( elem ) {
		var nodeName = ( elem.nodeName || "" ).toLowerCase();
		if ( nodeName === "input" ) {
			fixDefaultChecked( elem );
		// Skip scripts, get other children
		} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
			jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
		}
	}
	
	// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
	function shimCloneNode( elem ) {
		var div = document.createElement( "div" );
		safeFragment.appendChild( div );
	
		div.innerHTML = elem.outerHTML;
		return div.firstChild;
	}
	
	jQuery.extend({
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var srcElements,
				destElements,
				i,
				// IE<=8 does not properly clone detached, unknown element nodes
				clone = jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ?
					elem.cloneNode( true ) :
					shimCloneNode( elem );
	
			if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
					(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
				// IE copies events bound via attachEvent when using cloneNode.
				// Calling detachEvent on the clone will also remove the events
				// from the original. In order to get around this, we use some
				// proprietary methods to clear the events. Thanks to MooTools
				// guys for this hotness.
	
				cloneFixAttributes( elem, clone );
	
				// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
				srcElements = getAll( elem );
				destElements = getAll( clone );
	
				// Weird iteration because IE will replace the length property
				// with an element if you are cloning the body and one of the
				// elements on the page has a name or id of "length"
				for ( i = 0; srcElements[i]; ++i ) {
					// Ensure that the destination node is not null; Fixes #9587
					if ( destElements[i] ) {
						cloneFixAttributes( srcElements[i], destElements[i] );
					}
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				cloneCopyEvent( elem, clone );
	
				if ( deepDataAndEvents ) {
					srcElements = getAll( elem );
					destElements = getAll( clone );
	
					for ( i = 0; srcElements[i]; ++i ) {
						cloneCopyEvent( srcElements[i], destElements[i] );
					}
				}
			}
	
			srcElements = destElements = null;
	
			// Return the cloned set
			return clone;
		},
	    
		/*
		 * add by zhangjh    2016-2-17
		 * 功能：负责把HTML代码转换成DOM元素，并提取其中的script元素
		 * elems:HTML代码片段
		 * context:document
		 * fragment:文档对象片段
		 * scripts:script代码
		 */
		clean: function( elems, context, fragment, scripts ) {
			var checkScriptType, script, j,
					ret = [];
	
			context = context || document;
	
			// !context.createElement fails in IE with an error but returns typeof 'object'
			//保证context===document
			if ( typeof context.createElement === "undefined" ) {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
			}
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( typeof elem === "number" ) {
					//把数字转换为字符串的一种简便写法
					elem += "";
				}
	
				if ( !elem ) {
					continue;
				}
	
				// Convert html string into DOM nodes
				if ( typeof elem === "string" ) {
					// rhtml = /<|&#?\w+;/,检测html代码片段中是否有标签，数字代码或者字符代码，例  <afe>,&copy,&#123
					if ( !rhtml.test( elem ) ) {
						//若没有，创建文本节点
						elem = context.createTextNode( elem );
					} else {
						// Fix "XHTML"-style tags in all browsers
						/*
						 * add by zhangjh   2016-2-20
						 * rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
						 * 该正则表达式的作用是匹配自关闭标签，然后替换长城成对的标签，例如<div/>修改为<div></div>
						 * area,br,embed,hr,img,input,link,meta,param是自关闭标签，可以使用(?!  )过滤掉，<areadiv/>也不匹配
						 * <$1>指代([\w:]+)[^>]* 
						 * <$2>指代[\w:]+
						 */
						elem = elem.replace(rxhtmlTag, "<$1></$2>");
	
						// Trim whitespace, otherwise indexOf won't work as expected
						//rtagName = /<([\w:]+)/,取标签内的名称并小写
						var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						    //标签的父标签
							wrap = wrapMap[ tag ] || wrapMap._default,
							depth = wrap[0],
							div = context.createElement("div"),
							safeChildNodes = safeFragment.childNodes,
							remove;
	
						// Append wrapper element to unknown element safe doc fragment
						if ( context === document ) {
							// Use the fragment we've already created for this document
							safeFragment.appendChild( div );
						} else {
							// Use a fragment created with the owner document
							createSafeFragment( context ).appendChild( div );
						}
	
						// Go to html and back, then peel off extra wrappers
						div.innerHTML = wrap[1] + elem + wrap[2];
	
						// Move to the right depth
						while ( depth-- ) {
							div = div.lastChild;
						}
	
						// Remove IE's autoinserted <tbody> from table fragments
						//tbody: !div.getElementsByTagName("tbody").length
						//此时的div指代div元素，而不是上面的div=div。lastChild
						//意思就是当前这个div中存在tbody
						//如果html片段中没有tbody片段的话，创建的又是table
						if ( !jQuery.support.tbody ) {
	                         //table中包含tbody
							// String was a <table>, *may* have spurious <tbody>
							// rtbody = /<tbody/i,
							var hasBody = rtbody.test(elem),
							    //!hasBody  hasBody true表明有tbody  false表明没有tbody
								tbody = tag === "table" && !hasBody ?
						    //？？为什么这一块儿div指向的是div元素   
										//tag是table的时候，wrap是空的，深度为0，所以div是div元素
									div.firstChild && div.firstChild.childNodes :
	
									// String was a bare <thead> or <tfoot>
								    //wrap[1]==="<table>",深度为1，div指向table
									wrap[1] === "<table>" && !hasBody ?
										div.childNodes :
										[];
	                        //移除浏览器自动插入的空tbody元素
							for ( j = tbody.length - 1; j >= 0 ; --j ) {
								if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
									tbody[ j ].parentNode.removeChild( tbody[ j ] );
								}
							}
						}
	
						// IE completely kills leading whitespace when innerHTML is used
						// rleadingWhitespace = /^\s+/  判断字符串是否以空格开始
						if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
							//如果浏览器不保留前导空白符，则将前导空白符生成的文本节点插入第一个子节点的前面
							div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
						}
	
						elem = div.childNodes;
	
						// Clear elements from DocumentFragment (safeFragment or otherwise)
						// to avoid hoarding elements. Fixes #11356
						if ( div ) {
							div.parentNode.removeChild( div );
	
							// Guard against -1 index exceptions in FF3.6
							if ( safeChildNodes.length > 0 ) {
								remove = safeChildNodes[ safeChildNodes.length - 1 ];
	
								if ( remove && remove.parentNode ) {
									remove.parentNode.removeChild( remove );
								}
							}
						}
					}
				}
	
				// Resets defaultChecked for any radios and checkboxes
				// about to be appended to the DOM in IE 6/7 (#8060)
				var len;
				if ( !jQuery.support.appendChecked ) {
					if ( elem[0] && typeof (len = elem.length) === "number" ) {
						for ( j = 0; j < len; j++ ) {
							findInputs( elem[j] );
						}
					} else {
						findInputs( elem );
					}
				}
	
				if ( elem.nodeType ) {
					ret.push( elem );
				} else {
					ret = jQuery.merge( ret, elem );
				}
			}
	
			if ( fragment ) {
				checkScriptType = function( elem ) {
					return !elem.type || rscriptType.test( elem.type );
				};
				for ( i = 0; ret[i]; i++ ) {
					script = ret[i];
					if ( scripts && jQuery.nodeName( script, "script" ) && (!script.type || rscriptType.test( script.type )) ) {
						scripts.push( script.parentNode ? script.parentNode.removeChild( script ) : script );
	
					} else {
						if ( script.nodeType === 1 ) {
							var jsTags = jQuery.grep( script.getElementsByTagName( "script" ), checkScriptType );
	
							ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						}
						fragment.appendChild( script );
					}
				}
			}
	
			return ret;
		},
	    /**
	     * add by zhangjh  2016-3-22
	     * 用于移除多个DOM元素关联的全部数据和时间
	     * @param elems 待移除的元素
	     */
		cleanData: function( elems ) {
			var data, id,
				cache = jQuery.cache,
				special = jQuery.event.special,
				deleteExpando = jQuery.support.deleteExpando;
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				//判断elem是不是可以设置的
				if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
					continue;
				}
	            //获取关联ID
				id = elem[ jQuery.expando ];
	
				if ( id ) {
					//获取关联ID对应的数据
					data = cache[ id ];
	
					if ( data && data.events ) {
						for ( var type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );
	
							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
	
						// Null the DOM reference to avoid IE6/7/8 leak (#7054)
						if ( data.handle ) {
							data.handle.elem = null;
						}
					}
	
					if ( deleteExpando ) {
						delete elem[ jQuery.expando ];
	
					} else if ( elem.removeAttribute ) {
						elem.removeAttribute( jQuery.expando );
					}
	
					delete cache[ id ];
				}
			}
		}
	});
	
	
	
	
	var ralpha = /alpha\([^)]*\)/i,
		ropacity = /opacity=([^)]*)/,
		// fixed for IE9, see #8346
		rupper = /([A-Z]|^ms)/g,
		rnum = /^[\-+]?(?:\d*\.)?\d+$/i,
		rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rrelNum = /^([\-+])=([\-+.\de]+)/,
		rmargin = /^margin/,
	
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	
		// order is important!
		cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	
		curCSS,
	
		getComputedStyle,
		currentStyle;

/*************************************************************   样式操作模块 CSS   ******************************************************************/
	jQuery.fn.css = function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	};
	
	jQuery.extend({
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {
						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
	
					} else {
						return elem.style.opacity;
					}
				}
			}
		},
	
		// Exclude the following css properties to add px
		cssNumber: {
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
	
		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			// normalize float css property
			"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
		},
	
		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {
			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}
	
			// Make sure that we're working with the right name
			var ret, type, origName = jQuery.camelCase( name ),
				style = elem.style, hooks = jQuery.cssHooks[ origName ];
	
			name = jQuery.cssProps[ origName ] || origName;
	
			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;
	
				// convert relative number strings (+= or -=) to relative numbers. #7345
				if ( type === "string" && (ret = rrelNum.exec( value )) ) {
					value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
					// Fixes bug #9237
					type = "number";
				}
	
				// Make sure that NaN and null values aren't set. See: #7116
				if ( value == null || type === "number" && isNaN( value ) ) {
					return;
				}
	
				// If a number was passed in, add 'px' to the (except for certain CSS properties)
				if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
					value += "px";
				}
	
				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
					// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
					// Fixes bug #5509
					try {
						style[ name ] = value;
					} catch(e) {}
				}
	
			} else {
				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
					return ret;
				}
	
				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},
	
		css: function( elem, name, extra ) {
			var ret, hooks;
	
			// Make sure that we're working with the right name
			name = jQuery.camelCase( name );
			hooks = jQuery.cssHooks[ name ];
			name = jQuery.cssProps[ name ] || name;
	
			// cssFloat needs a special treatment
			if ( name === "cssFloat" ) {
				name = "float";
			}
	
			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
				return ret;
	
			// Otherwise, if a way to get the computed value exists, use that
			} else if ( curCSS ) {
				return curCSS( elem, name );
			}
		},
	
		// A method for quickly swapping in/out CSS properties to get correct calculations
		swap: function( elem, options, callback ) {
			var old = {},
				ret, name;
	
			// Remember the old values, and insert the new ones
			for ( name in options ) {
				old[ name ] = elem.style[ name ];
				elem.style[ name ] = options[ name ];
			}
	
			ret = callback.call( elem );
	
			// Revert the old values
			for ( name in options ) {
				elem.style[ name ] = old[ name ];
			}
	
			return ret;
		}
	});
	
	// DEPRECATED in 1.3, Use jQuery.css() instead
	jQuery.curCSS = jQuery.css;
	
	if ( document.defaultView && document.defaultView.getComputedStyle ) {
		getComputedStyle = function( elem, name ) {
			var ret, defaultView, computedStyle, width,
				style = elem.style;
	
			name = name.replace( rupper, "-$1" ).toLowerCase();
	
			if ( (defaultView = elem.ownerDocument.defaultView) &&
					(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
	
				ret = computedStyle.getPropertyValue( name );
				if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
					ret = jQuery.style( elem, name );
				}
			}
	
			// A tribute to the "awesome hack by Dean Edwards"
			// WebKit uses "computed value (percentage if specified)" instead of "used value" for margins
			// which is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !jQuery.support.pixelMargin && computedStyle && rmargin.test( name ) && rnumnonpx.test( ret ) ) {
				width = style.width;
				style.width = ret;
				ret = computedStyle.width;
				style.width = width;
			}
	
			return ret;
		};
	}
	
	if ( document.documentElement.currentStyle ) {
		currentStyle = function( elem, name ) {
			var left, rsLeft, uncomputed,
				ret = elem.currentStyle && elem.currentStyle[ name ],
				style = elem.style;
	
			// Avoid setting ret to empty string here
			// so we don't default to auto
			if ( ret == null && style && (uncomputed = style[ name ]) ) {
				ret = uncomputed;
			}
	
			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	
			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( rnumnonpx.test( ret ) ) {
	
				// Remember the original values
				left = style.left;
				rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;
	
				// Put in the new values to get a computed value out
				if ( rsLeft ) {
					elem.runtimeStyle.left = elem.currentStyle.left;
				}
				style.left = name === "fontSize" ? "1em" : ret;
				ret = style.pixelLeft + "px";
	
				// Revert the changed values
				style.left = left;
				if ( rsLeft ) {
					elem.runtimeStyle.left = rsLeft;
				}
			}
	
			return ret === "" ? "auto" : ret;
		};
	}
	
	curCSS = getComputedStyle || currentStyle;
	
	function getWidthOrHeight( elem, name, extra ) {
	
		// Start with offset property
		var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			i = name === "width" ? 1 : 0,
			len = 4;
	
		if ( val > 0 ) {
			if ( extra !== "border" ) {
				for ( ; i < len; i += 2 ) {
					if ( !extra ) {
						val -= parseFloat( jQuery.css( elem, "padding" + cssExpand[ i ] ) ) || 0;
					}
					if ( extra === "margin" ) {
						val += parseFloat( jQuery.css( elem, extra + cssExpand[ i ] ) ) || 0;
					} else {
						val -= parseFloat( jQuery.css( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
					}
				}
			}
	
			return val + "px";
		}
	
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}
	
		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}
	
		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	
		// Add padding, border, margin
		if ( extra ) {
			for ( ; i < len; i += 2 ) {
				val += parseFloat( jQuery.css( elem, "padding" + cssExpand[ i ] ) ) || 0;
				if ( extra !== "padding" ) {
					val += parseFloat( jQuery.css( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + cssExpand[ i ]) ) || 0;
				}
			}
		}
	
		return val + "px";
	}
	
	jQuery.each([ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {
					if ( elem.offsetWidth !== 0 ) {
						return getWidthOrHeight( elem, name, extra );
					} else {
						return jQuery.swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						});
					}
				}
			},
	
			set: function( elem, value ) {
				return rnum.test( value ) ?
					value + "px" :
					value;
			}
		};
	});
	
	if ( !jQuery.support.opacity ) {
		jQuery.cssHooks.opacity = {
			get: function( elem, computed ) {
				// IE uses filters for opacity
				return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
					( parseFloat( RegExp.$1 ) / 100 ) + "" :
					computed ? "1" : "";
			},
	
			set: function( elem, value ) {
				var style = elem.style,
					currentStyle = elem.currentStyle,
					opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
					filter = currentStyle && currentStyle.filter || style.filter || "";
	
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;
	
				// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
				if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {
	
					// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
					// if "filter:" is present at all, clearType is disabled, we want to avoid this
					// style.removeAttribute is IE Only, but so apparently is this code path...
					style.removeAttribute( "filter" );
	
					// if there there is no filter style applied in a css rule, we are done
					if ( currentStyle && !currentStyle.filter ) {
						return;
					}
				}
	
				// otherwise, set new filter values
				style.filter = ralpha.test( filter ) ?
					filter.replace( ralpha, opacity ) :
					filter + " " + opacity;
			}
		};
	}
	
	jQuery(function() {
		// This hook cannot be added until DOM ready because the support test
		// for it is not run until after DOM ready
		if ( !jQuery.support.reliableMarginRight ) {
			jQuery.cssHooks.marginRight = {
				get: function( elem, computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" }, function() {
						if ( computed ) {
							return curCSS( elem, "margin-right" );
						} else {
							return elem.style.marginRight;
						}
					});
				}
			};
		}
	});
	
	if ( jQuery.expr && jQuery.expr.filters ) {
		jQuery.expr.filters.hidden = function( elem ) {
			var width = elem.offsetWidth,
				height = elem.offsetHeight;
	
			return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
		};
	
		jQuery.expr.filters.visible = function( elem ) {
			return !jQuery.expr.filters.hidden( elem );
		};
	}
	
	// These hooks are used by animate to expand properties
	jQuery.each({
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
	
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i,
	
					// assumes a single number if not a string
					parts = typeof value === "string" ? value.split(" ") : [ value ],
					expanded = {};
	
				for ( i = 0; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}
	
				return expanded;
			}
		};
	});
	
	
	
/***************************************************************   异步请求Ajax   ***************************************************************/	
	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rhash = /#.*$/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
		rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
		rquery = /\?/,
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		rselectTextarea = /^(?:select|textarea)/i,
		rspacesAjax = /\s+/,
		rts = /([?&])_=[^&]*/,
		rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
	
		// Keep a copy of the old load method
		_load = jQuery.fn.load,
	
		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		//前置过滤器集,结构为数据类型与前置过滤器数组的映射
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		//请求发送器集，结构为数据类型与请求发送器工厂函数的映射
		transports = {},
	
		// Document location
		ajaxLocation,
	
		// Document location segments
		ajaxLocParts,
	
		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = ["*/"] + ["*"];
	
	// #8138, IE may throw an exception when accessing
	// a field from window.location if document.domain has been set
	try {
		//ajaxLocation记录当前页面的url
		ajaxLocation = location.href;
	} catch( e ) {
		// Use the href attribute of an A element
		// since IE will modify it given document.location
		ajaxLocation = document.createElement( "a" );
		ajaxLocation.href = "";
		ajaxLocation = ajaxLocation.href;
	}
	
	// Segment location into parts
	//rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/
	//提起url的头部信息，协议、服务器、端口号
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	/**
	 * add by zhangjh  2016-5-21
	 * 为对象prefilters添加前置过滤器；为对象transports添加请求过滤器
	 * 使用方法是
	 *     jQuery.ajaxPrefilter=addToPrefiltersOrTransports( prefilters )
	 *     jQuery.ajaxTransport= addToPrefiltersOrTransports( transports )
	 * 返回一个函数，在后面的程序中，调用这个函数，为前置过滤器和请求发生器添加对应类型的处理函数
	 * @param structure    对象prefilters或者transports
	 */
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		/**
		 * add by zhangjh  2016-5-21
		 * @param  dataTypeExpression
		 *      字符串，可选的，表示一个或者多个空格风格的数据类型，例如“json，jsonp”
		 * @param  func
		 *      表示数据类型对应的前置过滤器或者请求发送器工厂函数
		 */
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				//修正dataTypeExpression，func
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			if ( jQuery.isFunction( func ) ) {
				// rspacesAjax = /\s+/   将数据类型按照空格分隔
				var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
					i = 0,
					length = dataTypes.length,
					dataType,
					list,
					placeBefore;
	
				// For each dataType in the dataTypeExpression
				for ( ; i < length; i++ ) {
					dataType = dataTypes[ i ];
					// We control if we're asked to add before
					// any existing element
					//如果数据类型以+开始
					placeBefore = /^\+/.test( dataType );
					if ( placeBefore ) {
						//“+***”修正为“***”
						dataType = dataType.substr( 1 ) || "*";
					}
					//利用了闭包原理
					list = structure[ dataType ] = structure[ dataType ] || [];
					// then we add to the structure accordingly
					//如果数据类型以“+”开头，则插入数组的头部，否则插入数组的尾部
					list[ placeBefore ? "unshift" : "push" ]( func );
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	/**
	 * add by zhangjh   2016-5-24
	 * 负责应用前置过滤器或者请求发送器
	 * @param structure
	 *           前置过滤器或者请求发送器
	 * @param options
	 *           当前请求的完整选项集
	 * @param originalOption
	 *           传给方法jQuery.ajax的原始选项集
	 * @param jqXHR
	 *           当前请求的jqXHR对象
	 * @param dataType
	 *           表示数据类型的字符串
	 * @param inspected
	 *           存放已经执行过的数据类型的对象，尽在递归调用该函数时被传入
	 */
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
			dataType /* internal */, inspected /* internal */ ) {
	
		dataType = dataType || options.dataTypes[ 0 ];
		inspected = inspected || {};
	
		inspected[ dataType ] = true;
	        //取出数据类型对应的前置过滤器数组或者请求发送器工厂函数数组
		var list = structure[ dataType ],
			i = 0,
			length = list ? list.length : 0,
			//如果structure是前置过滤器prefilters，executeOnly为true，表示执行，没有返回值；否则为false，表示不只是执行，还会有返回值
			executeOnly = ( structure === prefilters ),
			selection;
	
		for ( ; i < length && ( executeOnly || !selection ); i++ ) {
			//执行数组list中的函数
			selection = list[ i ]( options, originalOptions, jqXHR );
			// If we got redirected to another dataType
			// we try there if executing only and not done already
			if ( typeof selection === "string" ) {
				//如果函数返回值的类型是字符串，即当前请求被重定向到了另一个数据类型
				if ( !executeOnly || inspected[ selection ] ) {
					//如果是获取请求发送器，则设置selection为undefined，继续遍历执行数组list中的函数
					//或者如果是前置过滤器，并且重定向的数据类型已经处理过，则设置selection为undefined，继续遍历执行数组list中的函数 
					selection = undefined;
				} else {
					//如果是前置过滤器，并且重定向的数据类型没有处理过
					options.dataTypes.unshift( selection );
					selection = inspectPrefiltersOrTransports(
							structure, options, originalOptions, jqXHR, selection, inspected );
				}
			}
		}
		// If we're only executing or nothing was selected
		// we try the catchall dataType if not done already
		if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
			selection = inspectPrefiltersOrTransports(
					structure, options, originalOptions, jqXHR, "*", inspected );
		}
		// unnecessary when only executing (prefilters)
		// but it'll be ignored by the caller in that case
		return selection;
	}
	
	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	/**
	 * add by zhangjh   2016-5-21
	 * 将源对象src中的属性深度合并到目标对象target对象中
	 * @param target    合并的目标对象
	 * @param src       合并的源对象
	 */
	function ajaxExtend( target, src ) {
		var key, deep,
		    //flatOptions中含有不做深度合并的属性，包含context、ur
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				//如果是属性是context、url，则直接写入target中，如果不是，先将值保存在临时对象deep中
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			//将临时对象deep中的属性深度复制到对象target中
			jQuery.extend( true, target, deep );
		}
	}
	
	jQuery.fn.extend({
		/**
		 * add by zhangjh   2016-5-26
		 * 负责从服务器加载数据，并将返回的HTML插入匹配元素中
		 * @param url        请求地址
		 * @param params     可选的对象者字符串，随着请求被发送到服务器，对应的是jQuery.ajax()中的data
		 * @param callback   回调函数
		 * @returns
		 */
		load: function( url, params, callback ) {
			if ( typeof url !== "string" && _load ) {
				//如果url不是字符串，则调用同名的事件便捷方法.load(data,fn)??
				return _load.apply( this, arguments );
	
			// Don't do a request if no elements are being requested
			} else if ( !this.length ) {
				return this;
			}
	
			var off = url.indexOf( " " );
			if ( off >= 0 ) {
				//如果url中含有空格
				var selector = url.slice( off, url.length );
				//修正url
				url = url.slice( 0, off );
			}
	
			// Default to a GET request
			//默认为get请求   get、post请求有什么区别？？
			var type = "GET";
	
			// If the second parameter was provided
			if ( params ) {
				// If it's a function
				if ( jQuery.isFunction( params ) ) {
					// We assume that it's the callback
					//如果params是函数，修正callback
					callback = params;
					params = undefined;
	
				// Otherwise, build a param string
				} else if ( typeof params === "object" ) {
					//如果params是对象，序列化为字符串
					params = jQuery.param( params, jQuery.ajaxSettings.traditional );
					type = "POST";
				}
			}
	
			var self = this;
	
			// Request the remote document
			jQuery.ajax({
				url: url,
				type: type,
				dataType: "html",
				data: params,
				// Complete callback (responseText is used internally)
				//为什么是complete？？？
				complete: function( jqXHR, status, responseText ) {
					// Store the response as specified by the jqXHR object
					//读取原始响应数据
					responseText = jqXHR.responseText;
					// If successful, inject the HTML into all the matched elements
					if ( jqXHR.isResolved() ) {
						// #4825: Get the actual response in case
						// a dataFilter is present in ajaxSettings
						jqXHR.done(function( r ) {
							responseText = r;
						});
						// See if a selector was specified
						self.html( selector ?
							// Create a dummy div to hold the results
							jQuery("<div>")
								// inject the contents of the document in, removing the scripts
								// to avoid any 'Permission Denied' errors in IE
								.append(responseText.replace(rscript, ""))
	
								// Locate the specified elements
								.find(selector) :
	
							// If not, just inject the full result
							responseText );
					}
	
					if ( callback ) {
						self.each( callback, [ responseText, status, jqXHR ] );
					}
				}
			});
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-5-26 
	     * 负责把一组表单元素序列化为一段url查询串
	     * @returns
	     */
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
	    /**
	     * add by zhangjh   2016-5-26
	     * 负责把一组表单元素编码为一个对象数组
	     * @returns
	     */
		serializeArray: function() {
			return this.map(function(){
				return this.elements ? jQuery.makeArray( this.elements ) : this;
			})
			.filter(function(){
				return this.name && !this.disabled &&
					( this.checked || rselectTextarea.test( this.nodeName ) ||
						rinput.test( this.type ) );
			})
			.map(function( i, elem ){
				var val = jQuery( this ).val();
	
				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val, i ){
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						}) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			}).get();
		}
	});
	
	// Attach a bunch of functions for handling common AJAX events
	/**
	 * add by zhangjh   2016-5-28
	 * ajaxStart(): 用于为全局事件ajaxStart绑定处理函数
	 *     无论什么时候，当一个AJAX请求将要被发送时，jQuery会检查当前是否还有其他活跃的(未完成的)AJAX请求。
	 *     如果在进程中没有找到其他活跃的AJAX请求，jQuery就会触发ajaxStart事件。
	 *     此时，通过ajaxStart()函数绑定的所有事件处理函数都将被执行。      
	 * ajaxStop(): 用于为全局事件ajaxStop绑定处理函数
	 *     无论Ajax请求在何时完成，jQuery都会检查是否存在其他Ajax请求。
	 *     如果不存在，则jQuery会触发该ajaxStop事件。在此时由.ajaxStop() 方法注册的任何函数都会被执行。
	 * ajaxComplete():用于为全局事件ajaxComplete绑定处理函数
	 *     在ajax请求完成时，不管有没有返回成功，都会触发ajaxComplete事件？？
	 * ajaxError(): 用于为全局事件ajaxError绑定处理函数
	 *     在ajax请求完成并且发生错误的时候，触发ajaxError事件
	 * ajaxSuccess(): 用于为全局事件ajaxSuccess绑定处理函数
	 *     在ajax请求完成并且成功时，触发ajaxSuccess事件
	 * ajaxSend(): 用于为全局事件ajaxSend绑定处理函数
	 *     在ajax请求开始时触发处理函数
	 */
	jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
		jQuery.fn[ o ] = function( f ){
			return this.on( o, f );
		};
	});
	/**
	 * add by zhangjh  2016-5-26
	 * 定义便捷的方法
	 * jQuery.get(url,data,callback,type)    调用方法jQuery.ajax({type:"get",data:data,success:callback,dataType:type})
	 * jQuery.post(url,data,callback,type)   调用方法jQuery.ajax({type:"post",data:data,success:callback,dataType:type})
	 */
	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {
			// shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			return jQuery.ajax({
				type: method,
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		};
	});
	
	jQuery.extend({
	    /**
	     * add by zhangjh   2016-5-26
	     * 使用http get请求从服务器端加载一个js文件并执行
	     * @param url         请求地址
	     * @param callback    回调函数
	     * @returns
	     */
		getScript: function( url, callback ) {
			//相当于$.ajax({url:...,type:'get',success:function(){},dataType:script})
			return jQuery.get( url, undefined, callback, "script" );
		},
	    /**
	     * add by zhangjh   2016-5-26
	     * @param url         请求地址
	     * @param data        请求数据项
	     * @param callback    回调函数
	     * @returns
	     */
		getJSON: function( url, data, callback ) {
			////相当于$.ajax({url:...,type:'get',success:function(){},dataType:json})
			return jQuery.get( url, data, callback, "json" );
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		/**
		 * add by zhangjh   2016-5-21
		 * 为当前请求构造完整的请求选项集
		 * 将ajax默认选项集ajaxSettrings和自定义选项集settrings的属性深度合并一个对象，并返回
		 * @param target      目标对象       
		 * @param settings    需要处理的对象  
		 */
		ajaxSetup: function( target, settings ) {
			if ( settings ) {
				//ajaxSetup(a,b)
				// Building a settings object
				ajaxExtend( target, jQuery.ajaxSettings );
			} else {
				// Extending ajaxSettings
				//ajaxSetup(a)
				//为jQuery.ajaxSetting对象添加属性
				settings = target;
				target = jQuery.ajaxSettings;
			}
			ajaxExtend( target, settings );
			return target;
		},
	    /**
	     * add by zhangjh   2016-5-21
	     * ajax默认选项集
	     */
		ajaxSettings: {
			url: ajaxLocation,
			isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
			global: true,
			type: "GET",  
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			processData: true,
			async: true,
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			traditional: false,
			headers: {},
			*/
	
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				text: "text/plain",
				json: "application/json, text/javascript",
				"*": allTypes
			},
	
			contents: {
				xml: /xml/,
				html: /html/,
				json: /json/
			},
	
			responseFields: {
				xml: "responseXML",
				text: "responseText"
			},
	
			// List of data converters
			// 1) key format is "source_type destination_type" (a single space in-between)
			// 2) the catchall symbol "*" can be used for source_type
			//转换类型和对应的转化方法
			converters: {
	
				// Convert anything to text
				//将任意类型的数据转换为字符串，通过构造函数window.String()转换
				"* text": window.String,
	
				// Text to html (true = no transformation)
				//将字符串转换为HTML代码，值为true表示不需要转换
				"text html": true,
	
				// Evaluate text as a json expression
				//将字符串转换为JSON对象
				"text json": jQuery.parseJSON,
	
				// Parse text as xml
				//将字符串转换为XML文档
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			//不需要深度copy的属性
			flatOptions: {
				context: true,
				url: true
			}
		},
	    //为prefilters添加前置过滤器，addToPrefiltersOrTransports(prefilters)返回一个函数，该函数传入两个参数，一个是类型，另一个是对应的回调函数，
		//由于使用了闭包，因此使用ajaxPrefilter的时候，可以对前置过滤器prefilters进行操作
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		//使用方法和ajaxPrefilter相同
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		/**
		 * add by zhangjh  2016-5-17
		 * 负责执行一个异步HTTP(Ajax请求)
		 * @url       请求URL字符串  
		 * @options   一组选项键值对，用于配置Ajax请求
		 */
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			//如果传入的url是对象，则修正url，option
			//支持$.ajax(url,options)??
			//   $.ajax(options) ??  其中option是一个对象，里面有各种属性，包括url、data、success
			//我们一般的使用是$.ajax({url:"***",data:{},type:"POST",success:function(){}}),得对url，option进行修正
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			//修正options
			options = options || {};
	
			var // Create the final options object
			    //为当前请求构造完整的请求选项集，s中的属性包含ajax默认选项集+自定义选项集options
				s = jQuery.ajaxSetup( {}, options ),
				// Callbacks context
				//回调函数上下文
				callbackContext = s.context || s,
				// Context for global events
				// It's the callbackContext if one was provided in the options
				// and if it's a DOM node or a jQuery collection
				//Ajax全局事件的上下文
				globalEventContext = callbackContext !== s &&
					( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
							jQuery( callbackContext ) : jQuery.event,
				// Deferreds
				//构造一个异步队列，用于存放和触发成功回调函数、失败回调函数
				deferred = jQuery.Deferred(),
				//创建一个回调函数列表，用于存放和触发完成回调函数？？
				completeDeferred = jQuery.Callbacks( "once memory" ),
				// Status-dependent callbacks
				//存放依赖于状态码的回调函数，当服务器返回响应时，状态码对应的回调函数将被执行
				statusCode = s.statusCode || {},
				// ifModified key
				/**
				 * 被赋值为选项url，即当前请求的地址
				 * 当前请求响应完成以后，如果ifModified为true，将当前请求的请求的地址作为属性名存储在对象jQuery.lastModified(响应头Last-Modified的值，表示请求资源的最后修改时间)
				 *     和对象jQuery.etag中(响应头Etag的值，表示请求标识)
				 * 发送请求时，如果ifModified为true，会设置请求头if-modified-since和if-None-Match的值，值为最后一个响应头中相应的值
				 * 
				 * 服务器会将请求头if-modified-since的值与请求资源的最后修改时间进行比较，如果一致则返回304，不会返回数据；如果不一致，返回200和新的数据；
				 * 服务器将请求头if-None-Match的值与服务器计算的请求标识进行比较，如果一致这返回304，不会返回数据；如果不一致，则返回200的新的数据
				 * 这样的做法是可以充分利用浏览器缓存
				 */
				ifModifiedKey,
				// Headers (they are sent all at once)
				//存储请求头的属性名和对应的属性值    ？？
				requestHeaders = {},
				//存储请求头的属性名？？
				requestHeadersNames = {},
				// Response headers
				//用于存储响应头字符串？？
				responseHeadersString,
				//用于存储解析后的响应头和值？？
				responseHeaders,
				// transport
				//指向为当前请求分配的请求发送器，含有send()和abort()方法
				transport,
				// timeout handle
				//超时计时器
				timeoutTimer,
				// Cross-domain detection vars
				//数组，存放解析当前请求的地址得到的协议。域名或者IP、端口，用于判断当前请求是否跨域
				parts,
				// The jqXHR state
				//表示当前请求jqXHR对象的状态，可选值有0、1、2，分别表示初始状态、处理中、响应成功
				state = 0,
				// To know if global events are to be dispatched
				//是否触发全局的Ajax事件
				fireGlobals,
				// Loop variable
				i,
				// Fake xhr
				//jqXHR是浏览器原生XMLHttpRequest对象的超集，当请求发送器不是XMLHttpRequest时，jqXHR对象会尽可能的模拟XMLHttpRequest的功能
				//XMLHttpRequest??
				jqXHR = {
	                /**
	                 * 表示当前jqXHR对象的状态
	                 * readyState属性对应XMLHttpRequest对象的同名属性，有0-4 5个状态
	                 * 0:Uninitialized,初始化状态，XMLHTTPRequest对象已经被创建或者被abort方法重置
	                 * 1:Open,open()方法已经调用，当send()方法还没有调用，请求还没有被发送
	                 * 2:Sent,send()方法已经调用，HTTP请求已经送到了Web服务器,未接收到响应
	                 * 3:Receiving,所有响应头部都已经接收到，响应体开始接收但未完成
	                 * 4:Loaded HTTP响应已经完全接收
	                 * readyState的值不会递减，除非当一个请求在处理过程中的时候调用了abort或者open方法
	                 * 每次这个属性的值增加的时候，都会触发onreadystatechange 事件
	                 */
					readyState: 0,
					
					//status        //响应的HTTP状态码，200表示成功，404表示Not Found
					//statusText    //响应的HTTP状态描述  成功 or Not Found
					//目前为止为服务器接收到的响应体？？？，如果readyState小于3，为空；如果为3，表示已经接收的响应部分；
					//如果为4，为完整的响应体
					//reponseText   
					// 对请求的响应，解析为XML并作为Document对象返回
	                //reponseXML    //响应的XML文档
					// Caches the header
					
				    /**
				     * add by zhangjh   2016-5-19
				     * 设置请求头，对应XMLHTTPRequest对象的同名方法,将name保存在requestHeaderNames中，
				     * 将value保存在requestHeaders中，供XMLHTTPRequest对象的同名方法使用？？？
				     * XMLHTTPRequest对象的同名方法setRequestHeader方法：指定了一个HTTP请求的头部
				     * @param name      头部属性名
				     * @param value     头部属性值
				     */
					setRequestHeader: function( name, value ) {
						if ( !state ) {
							//表示请求处理中
							var lname = name.toLowerCase();
							//requestHeadersNames用于记录http请求头部属性名，对象中的内容为{lname:name},lname为全部小写
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							//requestHeaders用于记录http请求头部，name对应属性名，value对应属性值
							requestHeaders[ name ] = value;
						}
						//返回jqXHR对象
						return this;
					},
	
					// Raw string
					/**
					 * add by zhangjh   2016-5-19
					 * 获取响应头字符串，对应XMLHTTPRequest对象的同名方法
					 * 把HTTP响应头部作为未解析的字符串返回
					 * 如果readyState<3，放回null，否则返回服务器发送的HTTP响应的头部
					 */
					getAllResponseHeaders: function() {
						//state，jqXHR对象的状态，0表示初始化状态；1表示请求处理中；2表示请求已完成
						//在响应完成时，会调用XMLHTTPRequest对象的getALLResponseHeaders方法获取响应头信息，并储存在responseHeadersString中
						//responseHeadersString的值？？
						return state === 2 ? responseHeadersString : null;
					},
	
					// Builds headers hashtable if needed
					/**
					 * add by zhangjh   2016-5-19
					 * 获取指定名称的响应头的值，是XMLHTTPRequest对象的getALLResponseHeaders的增强版
					 * 返回指定的HTTP响应头部的值
					 */
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								//rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,全局匹配模式+多行匹配模式
								while( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match === undefined ? null : match;
					},
	
					// Overrides response content-type header
					//用于覆盖MIME类型
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},
	                /**
	                 * add by zhangjh   2016-5-19
	                 * XMLHTTPRequest同名方法 abort
	                 *    取消当前响应，关闭连接并且结束任何未决的网络活动，把readyState重新置为0
	                 * @param statusText
	                 * @returns {___anonymous280884_283821}
	                 */
					// Cancel the request
					abort: function( statusText ) {
						statusText = statusText || "abort";
						//指向为当前请求分配的请求发送器
						if ( transport ) {
							transport.abort( statusText );
						}
						//调用回调函数done触发失败回调函数
						done( 0, statusText );
						return this;
					}
				};
	
			// Callback for when everything is done
			// It is defined here because jslint complains if it is declared
			// at the end of the function (which would be more logical and readable)
			/**
			 * add by zhangjh   2016-5-19
			 * 将善后事宜封装起来，在服务器端响应完成后被调用，其执行的动作：清理本次请求用到的变量、读取响应数据、转换数据类型、执行回调函数、触发全局事件
			 * @param states              //对应XMLHTTPRequest对象的同名属性，表示响应的HTTP状态码
			 * @param nativeStatusText    //对应XMLHTTPRequest对象的statusText,表示响应的http状态描述
			 * @param resonses            //对象，含有属性text或者xml，分别对应XMLHTTPRequest对象的responseText和responseXM属性
			 * @param headers             //响应头字符串，响应完成后通过调用XMLHTTPRequest对象的方法getALLResponseHeaders()取得
			 */
			function done( status, nativeStatusText, responses, headers ) {
	
				// Called once
				//state:0,初始状态；1,处理中;2,已完成
				if ( state === 2 ) {
					//如果响应已完成，直接返回
					return;
				}
	
				// State is "done" now
				//设置响应状态，当执行done的时候，表示响应已经完成
				state = 2;
	
				// Clear timeout if it exists
				//如果设置了请求超时定时器，取消它
				if ( timeoutTimer ) {
					clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				//解除请求发送器的引用，使得垃圾回收尽可能早的发生？？？
				transport = undefined;
	
				// Cache response headers
				//将响应头字符串缓存到变量responseHeadersString中
				//？？？
				responseHeadersString = headers || "";
	
				// Set readyState
				//设置jxXHR对象的readyState状态，4表示响应完成
				jqXHR.readyState = status > 0 ? 4 : 0;
	            //isSuccess 指示此次请求是否响应成功并正确解析数据
				var isSuccess,
				    //用于存放转换后的数据
					success,
					//表示错误状态描述或者指向可能抛出的异常对象
					error,
					//表示当前请求的状态 ？？
					statusText = nativeStatusText,
					//调用ajaxHandlerResponses修正数据类型，并读取响应数据
					response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
					//用于存放响应头Last-Modified的值，该值表示请求资源的最后修改时间
					lastModified,
					//用于存放响应头Etag的值，表示请求标识
					etag;
	
				// If successful, handle type chaining
					/*
					 * 状态码:
					 * 1XX-表示临时响应，并且需要请求者继续执行操作的状态码
					 *   100(继续)：服务器返回次代码表示已经收到请求的一部分，正在等待其余部分；
					 *   101(切换协议)：请求者已要求服务器切换协议，服务器已确认并准备切换
					 * 2XX-表示成功处理了请求的状态码
					 *   200(成功): 服务器已成功处理了请求，表示服务器提供了请求的网页
					 *   201(已创建):请求成功并且服务器创建了新的资源
					 *   202(已接受):服务器已接受请求，但是尚未处理
					 *   203(非授权信息):服务器已成功处理了请求，但返回的信息可能来自另一来源
					 *   204(无内容):服务器成功处理了请求，但没有返回任何内容
					 *   205(重置内容):服务器成功处理了请求，但没有返回任何内容，次响应要求请求者重置文档？？
					 *   206(部分内容):服务器成功处理了部分GET请求
					 * 3XX-要完成请求，需要进一步操作，通常用来重定向
					 *   300(多种选择):针对请求，服务器可执行多种操作？？
					 *   301(永久移动):请求的网页已经移动到了新位置？？
					 *   302(临时移动):服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来响应以后的请求
					 *   303(查看其它位置):请求者应当对不同的位置使用单独的GET请求来检索响应时，服务器返回此代码
					 *   304(未修改):自从上次请求后，请求的网页未修改过
					 *   305(使用代理):请求者只能使用代理访问请求的网页
					 *   307(临时重定向):服务器目前从不同位置的网页响应请求，但请求者应继续使用原来的位置响应以后的请求？？
					 * 4XX-请求出错，妨碍了服务器的处理
					 *   400(错误请求):服务器不理解请求的语法
					 *   401(未授权):请求要求身份验证
					 *   403(禁止):服务器拒绝请求
					 *   404(未找到):服务器找不到请求的网页
					 *   405(方法禁用):禁用请求中指定的方法  
					 *   406(不接受):无法使用请求的内容特性响应请求的网页
					 *   407(需要代理授权):表示请求者应当使用代理
					 *   408(请求超时):服务器等候请求时超时
					 *   409(冲突):服务器在完成请求时发生冲突
					 *   410(已删除):如果请求的资源已永久的删除，服务器会返回次响应
					 *   411(需要有效长度):服务器不接受不含有有效内容长度标头字段的请求
					 *   412(未满足前提条件):服务器未满足请求者在庆祝中设置的其中的一个前提条件
					 *   413(请求实体过大):服务器无法处理请求，因为请求实体过大，超出服务器的处理能力
					 *   414(请求url过长):请求的url过长，服务器无法处理
					 *   415(不支持的媒体类型):请求的格式不受请求页面的支持
					 *   416(请求范围不符合要求):如果页面无法提供请求的范围，则服务器返回次状态吗
					 *   417(未满足期望值):服务器未满足期望请求标头字段的要求
					 * 5XX-服务器错误，表示服务器在处理请求时发生内部错误，这些错误可能是服务器本身的错误，而不是请求出错
					 *   500(服务器内部错误):服务器遇到错误，无法完成请求
					 *   501(尚未实施):服务器不具备完成请求的功能
					 *   502(错误网关):服务器作为网关或代理，从上游服务器收到无效响应
					 *   503(服务不可用):服务器目前无法使用(由于超载或停机维护)，通常只是暂时
					 *   504(网关超时):服务器作为网关或代理，没有及时从上游服务器收到请求
					 *   505(HTTP版本不受支持):服务器不支持请求中所用的HTTP协议版本
					 */
				if ( status >= 200 && status < 300 || status === 304 ) {
	                //表示响应成功
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
	                    //如果设置了选项ifModified，则记录响应头Last-Modified和Etag，用于下一次对同一地址的请求
						if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
							//last-Modified  最后修改时间
							jQuery.lastModified[ ifModifiedKey ] = lastModified;
						}
						if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
							//Etag请求标识
							jQuery.etag[ ifModifiedKey ] = etag;
						}
					}
	
					// If not modified
					if ( status === 304 ) {
	                    //如果状态码为304，表示请求的资源没有变化
						statusText = "notmodified";
						isSuccess = true;
	
					// If we have data
					} else {
	                    //如果状态码是200-300，表示本次请求成功，并且有响应数据
						try {
							//调用ajaxConvert将响应的数据转换为期望的类型
							//s:完整的请求选项集,response:响应数据
							//success用于存放转化成功后的数据
							success = ajaxConvert( s, response );
							statusText = "success";
							isSuccess = true;
						} catch(e) {
							// We have a parsererror
							statusText = "parsererror";
							error = e;
						}
					}
				} else {
					// We extract error from statusText
					// then normalize statusText and status for non-aborts
					//如果响应失败，
					error = statusText;    //响应失败后的状态描述
					if ( !statusText || status ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				//设置jqXHR对象的status，响应状态(200,304...)
				jqXHR.status = status;
				//设置jqXHR对象的statusText，响应状态描述
				jqXHR.statusText = "" + ( nativeStatusText || statusText );
	
				// Success/Error
				if ( isSuccess ) {
					//如果响应成功，并且数据转换成功，则调用方法触发成功回调函数
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					//如果响应失败，则调用方法触发失败回到函数
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				//调用方法statusCode执行状态码对应的回调函数
				//status存放状态码对应的回调函数
				jqXHR.statusCode( statusCode );
				
				statusCode = undefined;
	            
				if ( fireGlobals ) {
					//如果选项global为true，即为禁用全局事件，则根据响应是否成功和数据类型转换是否成功，决定触发全局事件ajaxSuccess或者ajaxError
					globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
							[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				//调用completeDeferred触发完成回到函数
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					//触发全局事件
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			// Attach deferreds
			//为jqXHR对象增加异步队列只读副本中的方法，使得jqXHR对象具有异步队列的行为？？
			deferred.promise( jqXHR );
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
			jqXHR.complete = completeDeferred.add;
	
			// Status-dependent callbacks
			//构造  执行状态码回到函数的方法
			jqXHR.statusCode = function( map ) {
				if ( map ) {
					var tmp;
					if ( state < 2 ) {
						//如果请求未发送，或者正在处理中，则向变量statusCode中添加状态码对应的回调函数
						for ( tmp in map ) {
							statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
						}
					} else {
						//如果请求已完成，将状态码对应的回调函数同时添加到异步队列的成功和失败回调函数列表中
						//获取状态码对应的回调函数
						tmp = map[ jqXHR.status ];
						jqXHR.then( tmp, tmp );
					}
				}
				//返回jqXHR对象
				return this;
			};
	
			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
			// We also use the url parameter if available
			
			//修正url，获取当前请求的url，即$.ajax({url:***....})中的url
			s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );
	
			// Extract dataTypes list
			//将dataType用空白符分隔成数组，并赋值给选项dataTypes。选项dataType表示期望从服务器返回的数据是何类型，有效类型有:xml、html、script、json、jsonp、text
			//如果未指定dataType，则默认为“*”
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );
	
			// Determine if a cross-domain request is in order
			//crossDomain表示是否跨域
			//判断当前请求时否跨域
			if ( s.crossDomain == null ) {
				//如果未指定当前请求是否跨域
				parts = rurl.exec( s.url.toLowerCase() );
				//从请求url中解析出协议、IP、端口，然后与当前页面的url进行比较，只要有一项不符合，就认为是跨域
				s.crossDomain = !!( parts &&
					( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
						( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
							( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
				);
			}
	
			// Convert data if not already a string
			//如果选项processData为true且data不是字符串，则调用jQuery.param将其序列化为字符串
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				//组织完整请求集中的参数 data:{hy_id:"aaa",jt_id:"123"}->hy_id=aaa&jt_id=123
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			//应用前置过滤器，继续修正选项？？
			
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			//如果在选项datatype对应的过滤器中调用jqXHR.abort()取消了本次请求，则直接返回？？
			if ( state === 2 ) {
				return false;
			}
	
			// We can fire global events as of now if asked to
			fireGlobals = s.global;
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			//判断当前请求是否包含内容
			s.hasContent = !rnoContent.test( s.type );
	
			// Watch for a new set of requests
			//如果为禁用全局事件并且没有其他Ajax请求正在执行，则手动触发全局上事件ajaxStart？？
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// More options handling for requests with no content
			//如果没有请求内容，则修正选项url
			if ( !s.hasContent ) {
	
				// If data is available, append data to url
				if ( s.data ) {
					//如果设置了选项data，则将选项data附加到选项url之后
					s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Get ifModifiedKey before adding the anti-cache parameter
				ifModifiedKey = s.url;
	
				// Add anti-cache in url if needed
				if ( s.cache === false ) {
	                //如果禁用缓存
					var ts = jQuery.now(),
						// try replacing _= if it is there
					    //在选项url上替换或者最佳时间戳jQuery.now()
						ret = s.url.replace( rts, "$1_=" + ts );
	
					// if nothing was replaced, add timestamp to the end
					s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				//设置请求头Content-Type
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}
	
			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				ifModifiedKey = ifModifiedKey || s.url;
				if ( jQuery.lastModified[ ifModifiedKey ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
				}
				if ( jQuery.etag[ ifModifiedKey ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
				}
			}
	
			// Set the Accepts header for the server, depending on the dataType
			//设置请求头Accept,用于指定浏览器可接受的响应类型
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
					s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			//设置其他请求头信息
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			//发送之前调用回调函数beforeSend，如果返回false，取消本次请求
			if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
					// Abort if not done already
					jqXHR.abort();
					return false;
	
			}
	
			// Install callbacks on deferreds
			//添加成功、失败、完成回调函数
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}
	
			// Get transport
			//获取请求dataType队形的请求发送器
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				//如果没有找到对应的发送请求器，则调用回调函数done，触发失败回调函数，结束本次请求
				done( -1, "No Transport" );
			} else {
				//
				jqXHR.readyState = 1;
				// Send global event
				if ( fireGlobals ) {
					//触发全局事件ajaxSend
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
				// Timeout
				//异步发送请求时，如果设置了选项timeout，则为当前请求设置一个超时定时器
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = setTimeout( function(){
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					state = 1;
					//调用请求发送器的send方法发送请求，传入表头和回调函数
					transport.send( requestHeaders, done );
				} catch (e) {
					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );
					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}
	        
			return jqXHR;
		},
	
		// Serialize an array of form elements or a set of
		// key/values into a query string
		/**
		 * add by zhangjh   2016-5-25
		 * 把异步请求传入的数据参数序列化为一段url查询串
		 * @param a              传入的数据参数，可以是对象也可以是一个数组（必须是一个对象数组）
		 * @param traditional    布尔值，指示是否执行传统的浅序列化
		 */
		param: function( a, traditional ) {
			var s = [],
			    //把key值和value值用“=”连接起来
				add = function( key, value ) {
					// If value is a function, invoke it and return its value
					value = jQuery.isFunction( value ) ? value() : value;
					s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
				};
	
			// Set traditional to true for jQuery <= 1.3.2 behavior.
			if ( traditional === undefined ) {
				traditional = jQuery.ajaxSettings.traditional;
			}
	
			// If an array was passed in, assume that it is an array of form elements.
			if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
				//如果是数组或者jQuery对象
				// Serialize the form elements
				jQuery.each( a, function() {
					add( this.name, this.value );
				});
	
			} else {
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for ( var prefix in a ) {
					buildParams( prefix, a[ prefix ], traditional, add );
				}
			}
	
			// Return the resulting serialization
			//用“&”连接数组s中的参数对，并将空格替换为"+"??
			return s.join( "&" ).replace( r20, "+" );
		}
	});
	/**
	 * add by zhangjh   2016-5-25
	 * 深度序列化数组和对象
	 * @param prefix         属性名
	 * @param obj            属性值
	 * @param traditional    指示是否执行传统的浅序列化
	 * @param add            
	 */
	function buildParams( prefix, obj, traditional, add ) {
		if ( jQuery.isArray( obj ) ) {
			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} else {
					// If array item is non-scalar (array or object), encode its
					// numeric index to resolve deserialization ambiguity issues.
					// Note that rack (as of 1.0.0) can't currently deserialize
					// nested arrays properly, and attempting to do so may cause
					// a server error. Possible fixes are to modify rack's
					// deserialization algorithm or to provide an option or flag
					// to force array serialization to be shallow.
					buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
				}
			});
	
		} else if ( !traditional && jQuery.type( obj ) === "object" ) {
			// Serialize object item.
			for ( var name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
	
		} else {
			// Serialize scalar item.
			add( prefix, obj );
		}
	}
	
	// This is still on the jQuery object... for now
	// Want to move this to jQuery.ajax some day
	jQuery.extend({
	
		// Counter for holding the number of active queries
		active: 0,
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {}
	
	});
	
	/* Handles responses to an ajax request:
	 * - sets all responseXXX fields accordingly
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	/**
	 * add by zhangjh   2016-5-21
	 * 
	 * @param s
	 * @param jqXHR
	 * @param responses
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {
	
		var contents = s.contents,
			dataTypes = s.dataTypes,
			responseFields = s.responseFields,
			ct,
			type,
			finalDataType,
			firstDataType;
	
		// Fill responseXXX fields
		for ( type in responseFields ) {
			if ( type in responses ) {
				jqXHR[ responseFields[type] ] = responses[ type ];
			}
		}
	
		// Remove auto dataType and get content-type in the process
		while( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
			}
		}
	
		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}
	
		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {
			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}
	
		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}
	
	// Chain conversions given the request and the original response
	/**
	 * add by zhangjh   2016-5-25
	 * 负责从ajaxSettring.converters中查找类型转换表达式对应的数据转换器，并执行，当无法直接转换时会查找可过渡的数据类型
	 * @param s           当前请求的完整选项集
	 * @param response    原始响应数据
	 */
	function ajaxConvert( s, response ) {
	
		// Apply the dataFilter if provided
		if ( s.dataFilter ) {
			//如果设置了选项dataFilter，则执行该选项？？
			response = s.dataFilter( response, s.dataType );
		}
	
		var dataTypes = s.dataTypes,
		    //是选项ajaxSettings.converters的副本，属性都是小写的
			converters = {},
			i,
			key,
			length = dataTypes.length,
			tmp,
			// Current and previous dataTypes
			//从变量dataTypes中取出第一个元素作为起始类型，目标类型
			current = dataTypes[ 0 ],
			//变量pre表示目标类型的前一个类型，被转换类型
			prev,
			// Conversion expression
			conversion,
			// Conversion function
			conv,
			// Conversion functions (transitive conversion)
			conv1,
			conv2;
	
		// For each dataType in the chain
		for ( i = 1; i < length; i++ ) {
	
			// Create converters map
			// with lowercased keys
			if ( i === 1 ) {
				for ( key in s.converters ) {
					if ( typeof key === "string" ) {
						converters[ key.toLowerCase() ] = s.converters[ key ];
					}
				}
			}
	
			// Get the dataTypes
			prev = current;
			current = dataTypes[ i ];
	
			// If current is auto dataType, update it to prev
			if ( current === "*" ) {
				current = prev;
			// If no auto and dataTypes are actually different
			} else if ( prev !== "*" && prev !== current ) {
	
				// Get the converter
				//拼接转换表达式，被转换类型-> 转换类型
				conversion = prev + " " + current;
				//查找对应的数据转换器func
				conv = converters[ conversion ] || converters[ "* " + current ];
	
				// If there is no direct converter, search transitively
				if ( !conv ) {
					//如果未找到，查找可过渡的数据类型
					conv2 = undefined;
					for ( conv1 in converters ) {
						tmp = conv1.split( " " );
						if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
							conv2 = converters[ tmp[1] + " " + current ];
							if ( conv2 ) {
								conv1 = converters[ conv1 ];
								if ( conv1 === true ) {
									conv = conv2;
								} else if ( conv2 === true ) {
									conv = conv1;
								}
								break;
							}
						}
					}
				}
				// If we found no converter, dispatch an error
				if ( !( conv || conv2 ) ) {
					jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
				}
				// If found converter is not an equivalence
				if ( conv !== true ) {
					// Convert with 1 or 2 converters accordingly
					response = conv ? conv( response ) : conv2( conv1(response) );
				}
			}
		}
		return response;
	}
	
	
	
	
	var jsc = jQuery.now(),
		jsre = /(\=)\?(&|$)|\?\?/i;
	
	// Default jsonp settings
	/**
	 * add by zhangjh  2016-5-25
	 * 为jQuery.ajaxSettings添加jsonp、jsonpCallbck属性
	 */
	jQuery.ajaxSetup({
		jsonp: "callback",
		jsonpCallback: function() {
			return jQuery.expando + "_" + ( jsc++ );
		}
	});
	
	// Detect, normalize options and install callbacks for jsonp requests
	/**
	 * add by zhangjh   2016-5-25
	 * 为前置过滤器添加json、jsonp类型对应的处理函数
	 */
	jQuery.ajaxPrefilter( "json jsonp", 
			/**
			 * add by zhangjh   2016-5-25
			 * @param s                     完整的请求集
			 * @param originalSettings      调用$.ajax({....})出入的请求集
			 * @param jqXHR                 对象，模拟XMLHTTPRequest
			 */
			function( s, originalSettings, jqXHR ) {
	
		var inspectData = ( typeof s.data === "string" ) && /^application\/x\-www\-form\-urlencoded/.test( s.contentType );
		    //如果数据类型是jsonp
		if ( s.dataTypes[ 0 ] === "jsonp" ||
			//数据类型是json，并且未禁止jsonp请求，并且选项url中含有触发jsonp请求的特征字符“=？&” 或者“=？$” 或则"??"  ???什么意思？ 
			s.jsonp !== false && ( jsre.test( s.url ) ||
			       ////数据类型是json，并且未禁止jsonp请求，并且数据项data中含有触发jsonp请求的特征字符“=？&” 或者“=？$” 或则"??"  ???什么意思？      
					inspectData && jsre.test( s.data ) ) ) {
			
	            //用于存放响应数据
			var responseContainer,
			    //表示jsonp回调函数名
				jsonpCallback = s.jsonpCallback =
					jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			    //用于备份可能曾经在window对象上注册过的同名jsonp回调函数？？
				previous = window[ jsonpCallback ],
				url = s.url,
				data = s.data,
				//用于替换选项url或data中触发jsonp请求的特征字符
				replace = "$1" + jsonpCallback + "$2";
	        //修正url或者data？？？
			if ( s.jsonp !== false ) {
				//修正url？？
				url = url.replace( jsre, replace );
				if ( s.url === url ) {
					if ( inspectData ) {
						data = data.replace( jsre, replace );
					}
					if ( s.data === data ) {
						// Add callback manually
						url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
					}
				}
			}
	
			s.url = url;
			s.data = data;
	
			// Install callback
			//在window对象上注册一个同名回调函数，用于获取响应的json数据
			window[ jsonpCallback ] = function( response ) {
				responseContainer = [ response ];
			};
	
			// Clean-up function
			//调用方法jqXHR.always()添加一个回调函数，注销在window对象上注册的同名回调函数
			jqXHR.always(function() {
				// Set callback back to previous value
				window[ jsonpCallback ] = previous;
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( previous ) ) {
					window[ jsonpCallback ]( responseContainer[ 0 ] );
				}
			});
	
			// Use data converter to retrieve json after script execution
			//为本次请求添加“script json” 对应的数据转换器
			s.converters["script json"] = function() {
				if ( !responseContainer ) {
					jQuery.error( jsonpCallback + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// force json dataType
			//强制设置本次请求的数据类型为json，以期望服务器返回json数据
			s.dataTypes[ 0 ] = "json";
	                             
			// Delegate to script
			//通过返回"script",将当前请求的数据类型重定向为script，从而使得当前请求被当做script请求，并且为当前请求应用script对应的前置过滤器？？？
			return "script";
		}
	});
	
	
	
	
	// Install script dataType
	/**
	 * add by zhangjh   2016-5-25
	 * 为jQuery.ajaxSettings的accepts、contents、converters添加相应的属性
	 */
	jQuery.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /javascript|ecmascript/
		},
		converters: {
			//将文本转换为js代码
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	});
	
	// Handle cache's special case and global
	//为前置过滤器添加script 对应的处理函数
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
			s.global = false;
		}
	});
	
	// Bind script tag hack transport
	//数据类型script对应的请求发送器工厂函数返回一个请求发送器？？
	jQuery.ajaxTransport( "script", function(s) {
	
		// This transport only deals with cross domain requests
		//判断当前请求跨域或者明确设置选项crossDomain为true，script对应的请求发送器工厂才会返回一个请求发送器？？
		if ( s.crossDomain ) {
	
			var script,
				head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
	
			return {
	            /**
	             * add by zhangjh  2016-5-24
	             *  用于通过script发送本次请求
	             * @param _   表示不关心或者不会用到该参数
	             * @param callback  回到函数
	             * @returns
	             */
				send: function( _, callback ) {
	                //创建script  
					script = document.createElement( "script" );
	
					script.async = "async";
	
					if ( s.scriptCharset ) {
						script.charset = s.scriptCharset;
					}
	
					script.src = s.url;
	
					// Attach handlers for all browsers
					script.onload = script.onreadystatechange = function( _, isAbort ) {
	
						if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {
	
							// Handle memory leak in IE
							script.onload = script.onreadystatechange = null;
	
							// Remove the script
							if ( head && script.parentNode ) {
								head.removeChild( script );
							}
	
							// Dereference the script
							script = undefined;
	
							// Callback if not abort
							if ( !isAbort ) {
								callback( 200, "success" );
							}
						}
					};
					// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
					// This arises when a base node is used (#2709 and #4378).
					head.insertBefore( script, head.firstChild );
				},
	
				abort: function() {
					if ( script ) {
						script.onload( 0, 1 );
					}
				}
			};
		}
	});
	
	
	
	
	var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	    //如果当前浏览器是IE，初始化变量xhrOnUnloadAbort为一个函数，该函数绑定到window对象的unload事件上
		xhrOnUnloadAbort = window.ActiveXObject ? function() {
			// Abort all pending requests
			for ( var key in xhrCallbacks ) {
				xhrCallbacks[ key ]( 0, 1 );
			}
		} : false,
		xhrId = 0,
		xhrCallbacks;
	
	// Functions to create xhrs
	function createStandardXHR() {
		try {
			return new window.XMLHttpRequest();
		} catch( e ) {}
	}
	
	function createActiveXHR() {
		try {
			return new window.ActiveXObject( "Microsoft.XMLHTTP" );
		} catch( e ) {}
	}
	
	// Create the request object
	// (This is still attached to ajaxSettings for backward compatibility)
	jQuery.ajaxSettings.xhr = window.ActiveXObject ?
		/* Microsoft failed to properly
		 * implement the XMLHttpRequest in IE7 (can't request local files),
		 * so we use the ActiveXObject when it is available
		 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
		 * we need a fallback.
		 */
		function() {
			return !this.isLocal && createStandardXHR() || createActiveXHR();
		} :
		// For all other browsers, use the standard XMLHttpRequest object
		createStandardXHR;
	
	// Determine support properties
	(function( xhr ) {
		jQuery.extend( jQuery.support, {
			ajax: !!xhr,
			cors: !!xhr && ( "withCredentials" in xhr )
		});
	})( jQuery.ajaxSettings.xhr() );
	
	// Create transport if the browser can provide an xhr
	if ( jQuery.support.ajax ) {
	    /**
	     * add by zhangjh   2016-5-25
	     * function(s)想当于是请求发送器中type为"*"对应的处理函数
	     * 通配符*对应的请求发送器工厂会返回一个请求发送器，其中含有两个方法send、abort，分别用于发送和取消请求，
	     * 方法内部通过XMLHttpRequest对象发送请求
	     */
		jQuery.ajaxTransport(function( s ) {
			// Cross domain only allowed if supported through XMLHttpRequest
			if ( !s.crossDomain || jQuery.support.cors ) {
	            //如果当前请求不跨域或者支持跨域资源共享
				var callback;
	            //返回一个请求发送器
				return {
					/**
					 * add by zhangjh   2016-5-25
					 * 通过XMLHttpRequest对象发送请求
					 * @param headers   请求头集合
					 * @param complete  对应的处理函数
					 * @returns
					 */
					send: function( headers, complete ) {
	
						// Get a new xhr
						//调用xhr方法创建XMLHttpRequest对象
						var xhr = s.xhr(),
							handle,
							i;
	
						// Open the socket
						// Passing null username, generates a login popup on Opera (#2865)
						//打开socket连接
						if ( s.username ) {
							//如果需要身份验证，则传入选项username、password
							xhr.open( s.type, s.url, s.async, s.username, s.password );
						} else {
							xhr.open( s.type, s.url, s.async );
						}
	
						// Apply custom fields if provided
						//如果设置了xhrFields，则遍历该选项，并将其中的属性和属性值做个设置到XMLHttpRequest对象上
						if ( s.xhrFields ) {
							for ( i in s.xhrFields ) {
								xhr[ i ] = s.xhrFields[ i ];
							}
						}
	
						// Override mime type if needed
						if ( s.mimeType && xhr.overrideMimeType ) {
							xhr.overrideMimeType( s.mimeType );
						}
	
						// X-Requested-With header
						// For cross-domain requests, seeing as conditions for a preflight are
						// akin to a jigsaw puzzle, we simply never set it to be sure.
						// (it can always be set on a per-request basis or even using ajaxSetup)
						// For same-domain requests, won't change header if already provided.
						//设置请求头X-Requested-With为“XMLHttpRequest”，标记本次请求时Ajax请求
						if ( !s.crossDomain && !headers["X-Requested-With"] ) {
							headers[ "X-Requested-With" ] = "XMLHttpRequest";
						}
	
						// Need an extra try/catch for cross domain requests in Firefox 3
						//遍历请求头集headers，调用XMLHttpRequest对象的方法setRequestHeader逐个设置
						try {
							for ( i in headers ) {
								//setRequestHeader方法在方法open之后，send方法之前调用
								xhr.setRequestHeader( i, headers[ i ] );
							}
						} catch( _ ) {}
	
						// Do send the request
						// This may raise an exception which is actually
						// handled in jQuery.ajax (so no try/catch here)
						xhr.send( ( s.hasContent && s.data ) || null );
	
						// Listener
						//定义onreadystatechange事件监听函数
						callback = function( _, isAbort ) {
							
							//负责提取响应头和响应数据、修正状态码、调用回到函数done
	
							var status,
								statusText,
								responseHeaders,
								responses,
								xml;
	
							// Firefox throws exceptions when accessing properties
							// of an xhr when a network error occured
							// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
							try {
	
								// Was never called and is aborted or complete
								if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
	                                //如果是取消请求或者请求完成，则继续执行后续代码
									// Only called once
									callback = undefined;
	
									// Do not keep as active anymore
									if ( handle ) {
										//如果请求计数器可以转换为true，表示绑定了时间句柄onreadystatechange，则重新将其设置为空函数
										xhr.onreadystatechange = jQuery.noop;
										if ( xhrOnUnloadAbort ) {
											delete xhrCallbacks[ handle ];
										}
									}
	
									// If it's an abort
									if ( isAbort ) {
										//如果参数isAbort可以转换为true，并且当前请求未完成，则调用XMLHttpRequest对象的方法abort取消本次请求
										// Abort it manually if needed
										if ( xhr.readyState !== 4 ) {
											xhr.abort();
										}  //读取状态码、响应头字符串、响应内容、状态描述
									} else {
										//读取状态码
										status = xhr.status;
										//读取响应头字符串
										responseHeaders = xhr.getAllResponseHeaders();
										
										responses = {};
										xml = xhr.responseXML;
	
										// Construct response list
										if ( xml && xml.documentElement /* #4958 */ ) {
											//尝试读取responseXML
											responses.xml = xml;
										}
	
										// When requesting binary data, IE6-9 will throw an exception
										// on any attempt to access responseText (#11426)
										try {
											//尝试读取responseText
											responses.text = xhr.responseText;
										} catch( _ ) {
										}
	
										// Firefox throws an exception when accessing
										// statusText for faulty cross-domain requests
										try {
											//尝试读取statusText响应状态描述
											statusText = xhr.statusText;
										} catch( e ) {
											// We normalize with Webkit giving an empty statusText
											statusText = "";
										}
	
										// Filter status for non standard behaviors
	
										// If the request is local and we have data: assume a success
										// (success with no data won't get notified, that's the best we
										// can do given current implementations)
										if ( !status && s.isLocal && !s.crossDomain ) {
											status = responses.text ? 200 : 404;
										// IE - #1450: sometimes returns 1223 when it should be 204
										} else if ( status === 1223 ) {
											status = 204;
										}
									}
								}
							} catch( firefoxAccessException ) {
								if ( !isAbort ) {
									complete( -1, firefoxAccessException );
								}
							}
	
							// Call complete if needed
							if ( responses ) {
								//如果响应完成并且成功，则调用回调函数done，触发成功回调函数
								complete( status, statusText, responses, responseHeaders );
							}
						};
	
						// if we're in sync mode or it's in cache
						// and has been retrieved directly (IE6 & IE7)
						// we need to manually fire the callback
						if ( !s.async || xhr.readyState === 4 ) {
							//如果选项async为false，表示处于同步模式，或者当前请求已经完成，需要手动触发回调函数？？
							callback();
						} else {
							handle = ++xhrId;
							if ( xhrOnUnloadAbort ) {
								// Create the active xhrs callbacks list if needed
								// and attach the unload handler
								if ( !xhrCallbacks ) {
									xhrCallbacks = {};
									jQuery( window ).unload( xhrOnUnloadAbort );
								}
								// Add to list of active xhrs callbacks
								xhrCallbacks[ handle ] = callback;
							}
							//XMLHTTPRequest对象的readyState状态改变的时候，触发onreadystatechange事件
							xhr.onreadystatechange = callback;
						}
					},
	
					abort: function() {
						if ( callback ) {
							callback(0,1);
						}
					}
				};
			}
		});
	}
	
	
	
/**********************************************************动画 Effects****************************************************************************/	
	var elemdisplay = {},
		iframe, iframeDoc,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
		timerId,
		fxAttrs = [
			// height animations
			[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
			// width animations
			[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
			// opacity animations
			[ "opacity" ]
		],
		fxNow;
	
	jQuery.fn.extend({
		show: function( speed, easing, callback ) {
			var elem, display;
	
			if ( speed || speed === 0 ) {
				return this.animate( genFx("show", 3), speed, easing, callback );
	
			} else {
				for ( var i = 0, j = this.length; i < j; i++ ) {
					elem = this[ i ];
	
					if ( elem.style ) {
						display = elem.style.display;
	
						// Reset the inline display of this element to learn if it is
						// being hidden by cascaded rules or not
						if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
							display = elem.style.display = "";
						}
	
						// Set elements which have been overridden with display: none
						// in a stylesheet to whatever the default browser style is
						// for such an element
						if ( (display === "" && jQuery.css(elem, "display") === "none") ||
							!jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
							jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
						}
					}
				}
	
				// Set the display of most of the elements in a second loop
				// to avoid the constant reflow
				for ( i = 0; i < j; i++ ) {
					elem = this[ i ];
	
					if ( elem.style ) {
						display = elem.style.display;
	
						if ( display === "" || display === "none" ) {
							elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
						}
					}
				}
	
				return this;
			}
		},
	
		hide: function( speed, easing, callback ) {
			if ( speed || speed === 0 ) {
				return this.animate( genFx("hide", 3), speed, easing, callback);
	
			} else {
				var elem, display,
					i = 0,
					j = this.length;
	
				for ( ; i < j; i++ ) {
					elem = this[i];
					if ( elem.style ) {
						display = jQuery.css( elem, "display" );
	
						if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
							jQuery._data( elem, "olddisplay", display );
						}
					}
				}
	
				// Set the display of the elements in a second loop
				// to avoid the constant reflow
				for ( i = 0; i < j; i++ ) {
					if ( this[i].style ) {
						this[i].style.display = "none";
					}
				}
	
				return this;
			}
		},
	
		// Save the old toggle function
		_toggle: jQuery.fn.toggle,
	
		toggle: function( fn, fn2, callback ) {
			var bool = typeof fn === "boolean";
	
			if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
				this._toggle.apply( this, arguments );
	
			} else if ( fn == null || bool ) {
				this.each(function() {
					var state = bool ? fn : jQuery(this).is(":hidden");
					jQuery(this)[ state ? "show" : "hide" ]();
				});
	
			} else {
				this.animate(genFx("toggle", 3), fn, fn2, callback);
			}
	
			return this;
		},
	
		fadeTo: function( speed, to, easing, callback ) {
			return this.filter(":hidden").css("opacity", 0).show().end()
						.animate({opacity: to}, speed, easing, callback);
		},
	
		animate: function( prop, speed, easing, callback ) {
			var optall = jQuery.speed( speed, easing, callback );
	
			if ( jQuery.isEmptyObject( prop ) ) {
				return this.each( optall.complete, [ false ] );
			}
	
			// Do not change referenced properties as per-property easing will be lost
			prop = jQuery.extend( {}, prop );
	
			function doAnimation() {
				// XXX 'this' does not always have a nodeName when running the
				// test suite
	
				if ( optall.queue === false ) {
					jQuery._mark( this );
				}
	
				var opt = jQuery.extend( {}, optall ),
					isElement = this.nodeType === 1,
					hidden = isElement && jQuery(this).is(":hidden"),
					name, val, p, e, hooks, replace,
					parts, start, end, unit,
					method;
	
				// will store per property easing and be used to determine when an animation is complete
				opt.animatedProperties = {};
	
				// first pass over propertys to expand / normalize
				for ( p in prop ) {
					name = jQuery.camelCase( p );
					if ( p !== name ) {
						prop[ name ] = prop[ p ];
						delete prop[ p ];
					}
	
					if ( ( hooks = jQuery.cssHooks[ name ] ) && "expand" in hooks ) {
						replace = hooks.expand( prop[ name ] );
						delete prop[ name ];
	
						// not quite $.extend, this wont overwrite keys already present.
						// also - reusing 'p' from above because we have the correct "name"
						for ( p in replace ) {
							if ( ! ( p in prop ) ) {
								prop[ p ] = replace[ p ];
							}
						}
					}
				}
	
				for ( name in prop ) {
					val = prop[ name ];
					// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
					if ( jQuery.isArray( val ) ) {
						opt.animatedProperties[ name ] = val[ 1 ];
						val = prop[ name ] = val[ 0 ];
					} else {
						opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
					}
	
					if ( val === "hide" && hidden || val === "show" && !hidden ) {
						return opt.complete.call( this );
					}
	
					if ( isElement && ( name === "height" || name === "width" ) ) {
						// Make sure that nothing sneaks out
						// Record all 3 overflow attributes because IE does not
						// change the overflow attribute when overflowX and
						// overflowY are set to the same value
						opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];
	
						// Set display property to inline-block for height/width
						// animations on inline elements that are having width/height animated
						if ( jQuery.css( this, "display" ) === "inline" &&
								jQuery.css( this, "float" ) === "none" ) {
	
							// inline-level elements accept inline-block;
							// block-level elements need to be inline with layout
							if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
								this.style.display = "inline-block";
	
							} else {
								this.style.zoom = 1;
							}
						}
					}
				}
	
				if ( opt.overflow != null ) {
					this.style.overflow = "hidden";
				}
	
				for ( p in prop ) {
					e = new jQuery.fx( this, opt, p );
					val = prop[ p ];
	
					if ( rfxtypes.test( val ) ) {
	
						// Tracks whether to show or hide based on private
						// data attached to the element
						method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
						if ( method ) {
							jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
							e[ method ]();
						} else {
							e[ val ]();
						}
	
					} else {
						parts = rfxnum.exec( val );
						start = e.cur();
	
						if ( parts ) {
							end = parseFloat( parts[2] );
							unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );
	
							// We need to compute starting value
							if ( unit !== "px" ) {
								jQuery.style( this, p, (end || 1) + unit);
								start = ( (end || 1) / e.cur() ) * start;
								jQuery.style( this, p, start + unit);
							}
	
							// If a +=/-= token was provided, we're doing a relative animation
							if ( parts[1] ) {
								end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
							}
	
							e.custom( start, end, unit );
	
						} else {
							e.custom( start, val, "" );
						}
					}
				}
	
				// For JS strict compliance
				return true;
			}
	
			return optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
	
		stop: function( type, clearQueue, gotoEnd ) {
			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}
	
			return this.each(function() {
				var index,
					hadTimers = false,
					timers = jQuery.timers,
					data = jQuery._data( this );
	
				// clear marker counters if we know they won't be
				if ( !gotoEnd ) {
					jQuery._unmark( true, this );
				}
	
				function stopQueue( elem, data, index ) {
					var hooks = data[ index ];
					jQuery.removeData( elem, index, true );
					hooks.stop( gotoEnd );
				}
	
				if ( type == null ) {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
							stopQueue( this, data, index );
						}
					}
				} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
					stopQueue( this, data, index );
				}
	
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
						if ( gotoEnd ) {
	
							// force the next step to be the last
							timers[ index ]( true );
						} else {
							timers[ index ].saveState();
						}
						hadTimers = true;
						timers.splice( index, 1 );
					}
				}
	
				// start the next in the queue if the last step wasn't forced
				// timers currently will call their complete callbacks, which will dequeue
				// but only if they were gotoEnd
				if ( !( gotoEnd && hadTimers ) ) {
					jQuery.dequeue( this, type );
				}
			});
		}
	
	});
	
	// Animations created synchronously will run synchronously
	function createFxNow() {
		setTimeout( clearFxNow, 0 );
		return ( fxNow = jQuery.now() );
	}
	
	function clearFxNow() {
		fxNow = undefined;
	}
	
	// Generate parameters to create a standard animation
	function genFx( type, num ) {
		var obj = {};
	
		jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
			obj[ this ] = type;
		});
	
		return obj;
	}
	
	// Generate shortcuts for custom animations
	jQuery.each({
		slideDown: genFx( "show", 1 ),
		slideUp: genFx( "hide", 1 ),
		slideToggle: genFx( "toggle", 1 ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	});
	
	jQuery.extend({
		speed: function( speed, easing, fn ) {
			var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
				complete: fn || !fn && easing ||
					jQuery.isFunction( speed ) && speed,
				duration: speed,
				easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
			};
	
			opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
				opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
	
			// normalize opt.queue - true/undefined/null -> "fx"
			if ( opt.queue == null || opt.queue === true ) {
				opt.queue = "fx";
			}
	
			// Queueing
			opt.old = opt.complete;
	
			opt.complete = function( noUnmark ) {
				if ( jQuery.isFunction( opt.old ) ) {
					opt.old.call( this );
				}
	
				if ( opt.queue ) {
					jQuery.dequeue( this, opt.queue );
				} else if ( noUnmark !== false ) {
					jQuery._unmark( this );
				}
			};
	
			return opt;
		},
	
		easing: {
			linear: function( p ) {
				return p;
			},
			swing: function( p ) {
				return ( -Math.cos( p*Math.PI ) / 2 ) + 0.5;
			}
		},
	
		timers: [],
	
		fx: function( elem, options, prop ) {
			this.options = options;
			this.elem = elem;
			this.prop = prop;
	
			options.orig = options.orig || {};
		}
	
	});
	
	jQuery.fx.prototype = {
		// Simple function for setting a style value
		update: function() {
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}
	
			( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
		},
	
		// Get the current size
		cur: function() {
			if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
				return this.elem[ this.prop ];
			}
	
			var parsed,
				r = jQuery.css( this.elem, this.prop );
			// Empty strings, null, undefined and "auto" are converted to 0,
			// complex values such as "rotate(1rad)" are returned as is,
			// simple values such as "10px" are parsed to Float.
			return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
		},
	
		// Start an animation from one number to another
		custom: function( from, to, unit ) {
			var self = this,
				fx = jQuery.fx;
	
			this.startTime = fxNow || createFxNow();
			this.end = to;
			this.now = this.start = from;
			this.pos = this.state = 0;
			this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );
	
			function t( gotoEnd ) {
				return self.step( gotoEnd );
			}
	
			t.queue = this.options.queue;
			t.elem = this.elem;
			t.saveState = function() {
				if ( jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
					if ( self.options.hide ) {
						jQuery._data( self.elem, "fxshow" + self.prop, self.start );
					} else if ( self.options.show ) {
						jQuery._data( self.elem, "fxshow" + self.prop, self.end );
					}
				}
			};
	
			if ( t() && jQuery.timers.push(t) && !timerId ) {
				timerId = setInterval( fx.tick, fx.interval );
			}
		},
	
		// Simple 'show' function
		show: function() {
			var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );
	
			// Remember where we started, so that we can go back to it later
			this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
			this.options.show = true;
	
			// Begin the animation
			// Make sure that we start at a small width/height to avoid any flash of content
			if ( dataShow !== undefined ) {
				// This show is picking up where a previous hide or show left off
				this.custom( this.cur(), dataShow );
			} else {
				this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
			}
	
			// Start by showing the element
			jQuery( this.elem ).show();
		},
	
		// Simple 'hide' function
		hide: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
			this.options.hide = true;
	
			// Begin the animation
			this.custom( this.cur(), 0 );
		},
	
		// Each step of an animation
		step: function( gotoEnd ) {
			var p, n, complete,
				t = fxNow || createFxNow(),
				done = true,
				elem = this.elem,
				options = this.options;
	
			if ( gotoEnd || t >= options.duration + this.startTime ) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();
	
				options.animatedProperties[ this.prop ] = true;
	
				for ( p in options.animatedProperties ) {
					if ( options.animatedProperties[ p ] !== true ) {
						done = false;
					}
				}
	
				if ( done ) {
					// Reset the overflow
					if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {
	
						jQuery.each( [ "", "X", "Y" ], function( index, value ) {
							elem.style[ "overflow" + value ] = options.overflow[ index ];
						});
					}
	
					// Hide the element if the "hide" operation was done
					if ( options.hide ) {
						jQuery( elem ).hide();
					}
	
					// Reset the properties, if the item has been hidden or shown
					if ( options.hide || options.show ) {
						for ( p in options.animatedProperties ) {
							jQuery.style( elem, p, options.orig[ p ] );
							jQuery.removeData( elem, "fxshow" + p, true );
							// Toggle data is no longer needed
							jQuery.removeData( elem, "toggle" + p, true );
						}
					}
	
					// Execute the complete function
					// in the event that the complete function throws an exception
					// we must ensure it won't be called twice. #5684
	
					complete = options.complete;
					if ( complete ) {
	
						options.complete = false;
						complete.call( elem );
					}
				}
	
				return false;
	
			} else {
				// classical easing cannot be used with an Infinity duration
				if ( options.duration == Infinity ) {
					this.now = t;
				} else {
					n = t - this.startTime;
					this.state = n / options.duration;
	
					// Perform the easing function, defaults to swing
					this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
					this.now = this.start + ( (this.end - this.start) * this.pos );
				}
				// Perform the next step of the animation
				this.update();
			}
	
			return true;
		}
	};
	
	jQuery.extend( jQuery.fx, {
		tick: function() {
			var timer,
				timers = jQuery.timers,
				i = 0;
	
			for ( ; i < timers.length; i++ ) {
				timer = timers[ i ];
				// Checks the timer has not already been removed
				if ( !timer() && timers[ i ] === timer ) {
					timers.splice( i--, 1 );
				}
			}
	
			if ( !timers.length ) {
				jQuery.fx.stop();
			}
		},
	
		interval: 13,
	
		stop: function() {
			clearInterval( timerId );
			timerId = null;
		},
	
		speeds: {
			slow: 600,
			fast: 200,
			// Default speed
			_default: 400
		},
	
		step: {
			opacity: function( fx ) {
				jQuery.style( fx.elem, "opacity", fx.now );
			},
	
			_default: function( fx ) {
				if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
					fx.elem.style[ fx.prop ] = fx.now + fx.unit;
				} else {
					fx.elem[ fx.prop ] = fx.now;
				}
			}
		}
	});
	
	// Ensure props that can't be negative don't go there on undershoot easing
	jQuery.each( fxAttrs.concat.apply( [], fxAttrs ), function( i, prop ) {
		// exclude marginTop, marginLeft, marginBottom and marginRight from this list
		if ( prop.indexOf( "margin" ) ) {
			jQuery.fx.step[ prop ] = function( fx ) {
				jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
			};
		}
	});
	
	if ( jQuery.expr && jQuery.expr.filters ) {
		jQuery.expr.filters.animated = function( elem ) {
			return jQuery.grep(jQuery.timers, function( fn ) {
				return elem === fn.elem;
			}).length;
		};
	}
	
	// Try to restore the default display value of an element
	function defaultDisplay( nodeName ) {
	
		if ( !elemdisplay[ nodeName ] ) {
	
			var body = document.body,
				elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
				display = elem.css( "display" );
			elem.remove();
	
			// If the simple way fails,
			// get element's real default display by attaching it to a temp iframe
			if ( display === "none" || display === "" ) {
				// No iframe to use yet, so create it
				if ( !iframe ) {
					iframe = document.createElement( "iframe" );
					iframe.frameBorder = iframe.width = iframe.height = 0;
				}
	
				body.appendChild( iframe );
	
				// Create a cacheable copy of the iframe document on first call.
				// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
				// document to it; WebKit & Firefox won't allow reusing the iframe document.
				if ( !iframeDoc || !iframe.createElement ) {
					iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
					iframeDoc.write( ( jQuery.support.boxModel ? "<!doctype html>" : "" ) + "<html><body>" );
					iframeDoc.close();
				}
	
				elem = iframeDoc.createElement( nodeName );
	
				iframeDoc.body.appendChild( elem );
	
				display = jQuery.css( elem, "display" );
				body.removeChild( iframe );
			}
	
			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}
	
		return elemdisplay[ nodeName ];
	}
	
	
	
	
	var getOffset,
		rtable = /^t(?:able|d|h)$/i,
		rroot = /^(?:body|html)$/i;
	
	if ( "getBoundingClientRect" in document.documentElement ) {
		getOffset = function( elem, doc, docElem, box ) {
			try {
				box = elem.getBoundingClientRect();
			} catch(e) {}
	
			// Make sure we're not dealing with a disconnected DOM node
			if ( !box || !jQuery.contains( docElem, elem ) ) {
				return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
			}
	
			var body = doc.body,
				win = getWindow( doc ),
				clientTop  = docElem.clientTop  || body.clientTop  || 0,
				clientLeft = docElem.clientLeft || body.clientLeft || 0,
				scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
				scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
				top  = box.top  + scrollTop  - clientTop,
				left = box.left + scrollLeft - clientLeft;
	
			return { top: top, left: left };
		};
	
	} else {
		getOffset = function( elem, doc, docElem ) {
			var computedStyle,
				offsetParent = elem.offsetParent,
				prevOffsetParent = elem,
				body = doc.body,
				defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
				top = elem.offsetTop,
				left = elem.offsetLeft;
	
			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
					break;
				}
	
				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;
	
				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;
	
					if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}
	
					prevOffsetParent = offsetParent;
					offsetParent = elem.offsetParent;
				}
	
				if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}
	
				prevComputedStyle = computedStyle;
			}
	
			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}
	
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}
	
			return { top: top, left: left };
		};
	}
	
	jQuery.fn.offset = function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}
	
		var elem = this[0],
			doc = elem && elem.ownerDocument;
	
		if ( !doc ) {
			return null;
		}
	
		if ( elem === doc.body ) {
			return jQuery.offset.bodyOffset( elem );
		}
	
		return getOffset( elem, doc, doc.documentElement );
	};
	
	jQuery.offset = {
	
		bodyOffset: function( body ) {
			var top = body.offsetTop,
				left = body.offsetLeft;
	
			if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
				top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
				left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
			}
	
			return { top: top, left: left };
		},
	
		setOffset: function( elem, options, i ) {
			var position = jQuery.css( elem, "position" );
	
			// set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}
	
			var curElem = jQuery( elem ),
				curOffset = curElem.offset(),
				curCSSTop = jQuery.css( elem, "top" ),
				curCSSLeft = jQuery.css( elem, "left" ),
				calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
				props = {}, curPosition = {}, curTop, curLeft;
	
			// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}
	
			if ( jQuery.isFunction( options ) ) {
				options = options.call( elem, i, curOffset );
			}
	
			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}
	
			if ( "using" in options ) {
				options.using.call( elem, props );
			} else {
				curElem.css( props );
			}
		}
	};
	
	
	jQuery.fn.extend({
	
		position: function() {
			if ( !this[0] ) {
				return null;
			}
	
			var elem = this[0],
	
			// Get *real* offsetParent
			offsetParent = this.offsetParent(),
	
			// Get correct offsets
			offset       = this.offset(),
			parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();
	
			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
			offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;
	
			// Add offsetParent borders
			parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
			parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;
	
			// Subtract the two offsets
			return {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		},
	
		offsetParent: function() {
			return this.map(function() {
				var offsetParent = this.offsetParent || document.body;
				while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent;
			});
		}
	});
	
	
	// Create scrollLeft and scrollTop methods
	jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
		var top = /Y/.test( prop );
	
		jQuery.fn[ method ] = function( val ) {
			return jQuery.access( this, function( elem, method, val ) {
				var win = getWindow( elem );
	
				if ( val === undefined ) {
					return win ? (prop in win) ? win[ prop ] :
						jQuery.support.boxModel && win.document.documentElement[ method ] ||
							win.document.body[ method ] :
						elem[ method ];
				}
	
				if ( win ) {
					win.scrollTo(
						!top ? val : jQuery( win ).scrollLeft(),
						 top ? val : jQuery( win ).scrollTop()
					);
	
				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length, null );
		};
	});
	
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ?
			elem :
			elem.nodeType === 9 ?
				elem.defaultView || elem.parentWindow :
				false;
	}
	
	
	
	
	// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		var clientProp = "client" + name,
			scrollProp = "scroll" + name,
			offsetProp = "offset" + name;
	
		// innerHeight and innerWidth
		jQuery.fn[ "inner" + name ] = function() {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat( jQuery.css( elem, type, "padding" ) ) :
				this[ type ]() :
				null;
		};
	
		// outerHeight and outerWidth
		jQuery.fn[ "outer" + name ] = function( margin ) {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
				this[ type ]() :
				null;
		};
	
		jQuery.fn[ type ] = function( value ) {
			return jQuery.access( this, function( elem, type, value ) {
				var doc, docElemProp, orig, ret;
	
				if ( jQuery.isWindow( elem ) ) {
					// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
					doc = elem.document;
					docElemProp = doc.documentElement[ clientProp ];
					return jQuery.support.boxModel && docElemProp ||
						doc.body && doc.body[ clientProp ] || docElemProp;
				}
	
				// Get document width or height
				if ( elem.nodeType === 9 ) {
					// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
					doc = elem.documentElement;
	
					// when a window > document, IE6 reports a offset[Width/Height] > client[Width/Height]
					// so we can't use max, as it'll choose the incorrect offset[Width/Height]
					// instead we use the correct client[Width/Height]
					// support:IE6
					if ( doc[ clientProp ] >= doc[ scrollProp ] ) {
						return doc[ clientProp ];
					}
	
					return Math.max(
						elem.body[ scrollProp ], doc[ scrollProp ],
						elem.body[ offsetProp ], doc[ offsetProp ]
					);
				}
	
				// Get width or height on the element
				if ( value === undefined ) {
					orig = jQuery.css( elem, type );
					ret = parseFloat( orig );
					return jQuery.isNumeric( ret ) ? ret : orig;
				}
	
				// Set the width or height on the element
				jQuery( elem ).css( type, value );
			}, type, value, arguments.length, null );
		};
	});



	
	// Expose jQuery to the global object
	window.jQuery = window.$ = jQuery;
	
	// Expose jQuery as an AMD module, but only for AMD loaders that
	// understand the issues with loading multiple versions of jQuery
	// in a page that all might call define(). The loader will indicate
	// they have special allowances for multiple jQuery versions by
	// specifying define.amd.jQuery = true. Register as a named module,
	// since jQuery can be concatenated with other files that may use define,
	// but not use a proper concatenation script that understands anonymous
	// AMD modules. A named AMD is safest and most robust way to register.
	// Lowercase jquery is used because AMD module names are derived from
	// file names, and jQuery is normally delivered in a lowercase file name.
	// Do this after creating the global so that if an AMD module wants to call
	// noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
		define( "jquery", [], function () { return jQuery; } );
	}



})( window );

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
	 * ����jQuery����jQuery��һ����������
	 * ͨ�� window��jQuery=window.$=jQuery 
	 * ��Ϊwindow��һ�����ԣ�����ͨ��window��jQuery(),jQuery(),$()�Ϳ��Ե���jQuery���캯��������һ��jQuery����
	 * ����$("#nsrmc")
	 */
	//jQuery��һ������������ͨ��һ���������ú���������һ������
	var jQuery = (function() {
		
		// Define a local copy of jQuery
		/*
		 * ����jQuery���캯��
		 * add by zhangjh   2016-2-16
		 */
		var jQuery = function( selector, context ) {
			// The jQuery object is actually just the init constructor 'enhanced'
			/*
			 * add by zhangjh   2016-2-16
			 * ��ͨ��new ����jQuery.prototype.init()������һ��jQuery����
			 */
			return new jQuery.fn.init( selector, context, rootjQuery );
		},
		
		/*
		 * add by zhangjh   2016-2-20
		 * ע�������_jQuery��_$������ȫ�ֱ���������var a=***,b=***,c=**��д��
		 * ��Ҫ��������Ϊû����var��������Զ�����Ϊȫ�ֱ���
		 */
		// Map over jQuery in case of overwrite
		/*
		 * add by zhangjh   2016-2-24
		 * _jQuery,_$���ڱ���window.jQuery��window.$,
		 * ����jQuery֮ǰ��winodw��jQuery��$����undefinde
		 * ������֮��_jQuery,_$Ϊundefined��
		 * window��jQuery=window.$=jQuery
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
		 * �����ж��ַ����Ǹ��ӵ�html���뻹��#adfa
		 */
		quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
	
		// Check if a string has a non-whitespace character in it
		//���ҷǿհ��ַ�      /\s/����˼Ϊ���ҿհ��ַ�
		rnotwhite = /\S/,
	
		// Used for trimming whitespace
		//��ͷΪһ�����߶���ո�
		trimLeft = /^\s+/,
		//��βΪһ�����߶���ո�
		trimRight = /\s+$/,
	
		// Match a standalone tag
		//�ж�һ��html��ǩ��<b>,����<b/>,����<b></b>����<b/></b>��ʽ
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
		 * hasOwnProperty�����ж������ǲ��Ƕ�������ԣ�������ȥԭ�����ϲ���
		 * һ��ʹ��for(a in b)�����������Ե�ʱ�����������ԭ�ͣ���ԭ������Ҳ����������������hasOwnProterty����
		 * ��ֻ���������ʡ�Լ�������
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
		 *����jQuery���캯����ԭ������(ÿ�����������Ժ󣬶���prototype����)
		 *jQuery.fn ΪjQuery.prototype �ı����������ڽ������Ĵ����д�п��Լ��ٴ����� 
		 */
		jQuery.fn = jQuery.prototype = {
				/*
				 *  add by zhangjh   2016-2-16
				 *  ����ԭ���Դ�constructor���ԣ�ָ��ǰ����
				 *  constructor���Ե����ã�����
				 */
				constructor: jQuery,
				/*
				 * add by zhangjh   2016-2-16
				 * ���캯��jQuery�����ִ�к���,�������selector,context������
				 * selector:Ҫת��ΪjQuery�����Ŀ����󣬿����������ֵ����ֻ��undefined��DOMԪ��,�ַ���,����,jQuery����,��ͨ��js�����⼸����������Ч�ģ�
				 *          �������͵�ֵʱû�������
				 * context:�����ģ����Բ����룬���ߴ���DOMԪ�أ�jQuery������ͨ��js����
				 * rootjQuery��������document�����jQuery����  rootjQuery=$(document)
				 *            ����document.getElementById()����ʧ�ܡ�selector��ѡ�������ʽ��δָ��context��selector�Ǻ��������(???)
				 */
				init: function( selector, context, rootjQuery ) {
					var match, elem, ret, doc;
					/*
					 * add by zhangjh   2016-2-16
					 * ����init����Ϊ���캯�������ã�����thisָ�����������ɵ�jQuery���󣬶����ǵ���init�Ķ���jQuery��prototype
					 * selectorΪfalse������һ���յ�jQuery����
					 * Handle $(""), $(null), or $(undefined)
					 */
					if ( !selector ) {
						return this;  //this ָ��Ҫ���ɵ�jQuery����
					}
					/*
					 * add by zhangjh 2016-2-16
					 * selector��nodeType���ԣ�������һ��DOMԪ�ص�jQuery����
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
	
					// ��selector���ַ���
					if ( typeof selector === "string" ) {
						/*
						 * add by zhangjh 2016-2-16
						 * Are we dealing with HTML string or an ID?
						 * �ж��ַ�����html���뻹��id
						 */
						if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
							/*
							 * add by zhangjh    2016-2-16
							 * Assume that strings that start and end with <> are HTML and skip the regex check
							 * �ж��ַ�����htmlƬ�Σ�����ȷ���ǺϷ���htmlƬ��
							 * match[0]Ϊ����selector���϶���ֵ
							 * match[1]Ϊƥ���html�������undefined
							 * match[2]Ϊƥ���id����undefinde
							 */
							match = [ null, selector, null ];
	
						} else {
							//�ж��ַ�����һЩ���ӵ�html���������#id
							//quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
							//��#��ʼ���ַ������ַ����в��ܺ�����������ĸ�����ֵ��ַ�  #1.2�Ͳ��ᱻƥ��
							match = quickExpr.exec( selector );
						}
	
						// Verify a match, and that no context was specified for #id
						/*
						 * add by zhangjh    2016-2-16
						 * match[0]�϶���ֵ������ֻ���ж�match[1]||match[2]||!context,����match[1],match[2]����һ����ֵ������ֻ���ж�һ���ͺ�
						 */
						
						if ( match && (match[1] || !context) ) {
	
							// HANDLE: $(html) -> $(array)
							//html����
							if ( match[1] ) {
								/*
								 * add by zhangjh      2016-2-17
								 * �ж�context�ǲ���jQuery�������ɵ�jQuery������һ����������������jQuery������Ϊcontext[0]
								 * ������ǣ���Ϊcontext
								 */
								context = context instanceof jQuery ? context[0] : context;
								/*
								 * add by zhangjh   2016-2-17
								 * ȡ��document�ĵ�
								 */
								doc = ( context ? context.ownerDocument || context : document );
	
								// If a single string is passed in and it's a single tag
								// just do a createElement and skip the rest
								ret = rsingleTag.exec( selector );
								//�ж�selector�Ƿ��ǵ�����ǩ
								if ( ret ) {
									//���ret��Ϊnull����Ϊ������ǩ
									if ( jQuery.isPlainObject( context ) ) {
										//�ж�context�ǲ�����ͨ����
										selector = [ document.createElement( ret[1] ) ];
										//�������ͨ���󣬰���ͨ��������ԡ��¼����õ��´�����domԪ����
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
							 * ���selector��"#id",��δָ������context������
							 * �ж��߼���match[1]Ϊundefinedʱ��Ĭ��match[2]��ֵ������ʱҪ�����if��䣬��Ҫmatch[1]||!contextΪ��
							 *       ��contextΪfalse��δָ��������
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
						//����html���롢id����ѡ����
						else if ( !context || context.jquery ) {
							//���û�������ģ������rootjQuery��find�����ָ�������ģ�����������jQuery������context.find()
							return ( context || rootjQuery ).find( selector );
	
							// HANDLE: $(expr, context)
							// (which is just equivalent to: $(context).find(expr)
						} 
						else {
							//ָ�������ģ��������Ĳ���jQuery�����ȴ���һ������context��jQuery����Ȼ���ڸö������Ѱ��selectorָ���Ķ���
							return this.constructor( context ).find( selector );
						}
						/*
						 * add by zhangjh   2016-2-16
						 * HANDLE: $(function)
						 * Shortcut for document ready
						 * selectorΪ����������Ϊ�ǰ�ready�¼������������֮��ֱ�����к���
						 * $(document).ready(function(){})
						 */
					} else if ( jQuery.isFunction( selector ) ) {
						return rootjQuery.ready( selector );
					}
	                /*
	                 * add by zhangjh   2016-2-22
	                 * selector���Դ��ڣ�����Ϊselector��һ��jQuery����
	                 * ��selector�����selector���Ժ�context���Ը�ֵ�����ɵ�jQuery����
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
				//��ʾ��ǰjQuery������Ԫ�صĸ���������
				length: 0,
	
				// The number of elements contained in the matched element set
				size: function() {
					return this.length;
				},
	
				toArray: function() {
				//slice=Array.prototype.slice�����������鷽��slice������ǰjQuery����ת��Ϊ����������
					return slice.call( this, 0 );
				},
	
				// Get the Nth element in the matched element set OR
				// Get the whole matched element set as a clean array
				//��ȡjQuery��Ӧλ�õ�Ԫ��
				get: function( num ) {
					return num == null ?
	
							// Return a 'clean' array
							this.toArray() :
	
								// Return just the object
								//numΪ��������Ԫ�ص�ĩβ��ʼ����
								( num < 0 ? this[ this.length + num ] : this[ num ] );
				},
	
				// Take an array of elements and push it onto the stack
				// (returning the new matched element set)
				/*
				 * add by zhangjh   2016-2-23
				 * �½�һ��jQuery���󣬽�elems��ֵ�����µ�jQuery����
				 * �µ�jQuery�����preObjectָ��ǰ��jQuery����
				 * elems:��������jQuery�����Ԫ������
				 * name:��������elems��jQuery������
				 * selector������jQuery�����Ĳ�������������ԭ������.selector
				 */
				pushStack: function( elems, name, selector ) {
					// Build a new jQuery matched element set
					//thisָ��һ��jQuery����
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
				 * jQuery�����ÿ������ִ�к���callback������Ĳ�����args��
				 * callback��������falseʱ��ֹͣ����
				 */
				each: function( callback, args ) {
					return jQuery.each( this, callback, args );
				},
	            /**
	             * add by zhangjh  2016-5-12
	             * ������document�����ϰ�һ��ready�¼�������������DOM�ṹ��������Ժ󣬼���������ִ��
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
					//���i�������ڡ�1�����ַ�����ת��Ϊ1
					i = +i;
					//Array.slice(i) i����Ϊ�Ǹ�������ʾ�������ĵ�i+1��λ��
					//��iΪ��������ʾ���ұ���ĵ�i��λ��
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
			     * �൱��map:fcuntion(callback){
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
	             * .end()�������ڷ������һ�Ρ��ƻ��Բ�����֮ǰ��jQuery����
	             * var a=$("div")  var b=a.find("p")  �������ƻ��Բ�����b.end()����a
	             * var b=a.css("","")û������µ�jQuery���󣬲����ƻ��Բ���
	             */
				end: function() {
					return this.prevObject || this.constructor(null);
				},
	
				// For internal use only.
				// Behaves like an Array's method, not like a jQuery method.
				push: push,
				sort: [].sort,
				//�������в����ɾ��Ԫ�أ����޸�ԭ��������
				splice: [].splice
			};
	
		// Give the init function the jQuery prototype for later instantiation
		//����jQuery�ĺ�����jQuery.fn.init������init������prototype���Ե���jQuery.prototype���ԣ��������ɵ�jQuery���󶼿���ʹ��jQuery.fn�ķ���
		jQuery.fn.init.prototype = jQuery.fn;
		
		/*
		 * add by zhangjh   2016-2-22
		 * ���ںϲ�����������߶����������Ե���һ������
		 */	
		jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
		    //arguments[0]Ϊ����extend����ʱ����ĵ�һ��������targetָ��Ŀ�����
			target = arguments[0] || {},
			//��ʾԴ�������ʼ���꣬Դ��������Ϊ��
			i = 1,
			//��������ĸ���
			length = arguments.length,
			//�Ƿ������ȸ���
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			//�������extend����ʱ����ĵ�һ������Ϊ����ֵ����
			deep = target;
			//targetָ���뺯���ĵڶ�������
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		//��������Ŀ�������һ�������Ҳ���һ�������������ַ������������Ļ�������ʱ������Ϊ{}���ڻ������������÷�ԭ����������Ч��
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}
	
		// extend jQuery itself if only one argument is passed
		/*
		 * add by zhangjh   2016-2-22
		 * ������һ�����������󣩣�ȱ��Դ����
		 * ����������������һ������Ϊboolean���ڶ�������Ϊ����ȱ��Դ����
		 * �����������ϵĲ���ʱԴ�������
		 * ��Դ���󲻴��ڵ�ʱ�򣬰�jQuery����jQuery.fn����Ŀ�����Դ�����λ����ǰ��1
		 * 
		 */
		//length��ʾ��������Ĳ����ĸ�����i��ʾ����Դ����ʼ��λ��
		if ( length === i ) {
			target = this;
			--i;
		}
	
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			//options����i��λ��ָ��ĳ��Դ����
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					//��ֹ����$.extend(true,o,{n:o}),��ȱ�����ʱ��������ѭ��
					if ( target === copy ) {
						//continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					/*
					 * add by zhangjh   2016-2-22
					 * ��deepΪtrue��copy��ֵ���ڵ�ʱ�򣬱�ʾ��Ҫ��ȸ���
					 */
					if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							//���Ƶ�����������
							copyIsArray = false;
							//Ŀ�����Ķ�Ӧ���ԣ����Ҳ��ֵ��Ϊ���飬�򲻱䣬����ֵ���߲������飬������Ϊ������
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
		//�����ͷ�ȫ�ֱ�����$��jQuery�Ŀ���Ȩ
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
		 * �����ӳٻ��߻ظ�ready�¼��Ĵ���
		 */
		holdReady: function( hold ) {
			if ( hold ) {
				//���holdΪtrue����ʾ�����ӳ�ready�¼��Ĵ���
				jQuery.readyWait++;
			} else {
				//�����ָ�ready�¼��Ĵ���
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		/**
		 * add by zhangjh  2016-5-12
		 * ִ��ready�¼���������
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
	     * �����ʼ��ready�¼����������б�readyList����Ϊdocument�����ready�¼�����������DOMContentLoaded
	     * @returns
	     */
		bindReady: function() {
			//���readyList����undefinde����ʾ�Ѿ����ù�bindReady�Ѿ������ù�������Ҫ�ٴ�ִ�к���Ĵ���
//			if ( readyList ) {
//				return;
//			}
	        //��ʼ���¼����������б�readyList
			//once      ȷ�����������б�ֻ�ܱ�����һ��
			//memory    ��¼��һ�δ���readyListʱ�Ĳ�����֮����ӵ��κμ������������þ�¹�Ĳ�����������
			readyList = jQuery.Callbacks( "once memory" );
	
			// Catch cases where $(document).ready() is called after the
			// browser event has already occurred.
			// document.readyState ֻ��document����ļ���״̬   
			// uninitialized:��δ��ʼ����,
			// loading:���ڼ���,
			// interactive:�Ѿ������˱�������ݣ���ʱ�û����Բ���
			// compelete:  ȫ���������
			if ( document.readyState === "complete" ) {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				return setTimeout( jQuery.ready, 1 );
			}
	
			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
	
				// A fallback to window.onload, that will always work
				//�ѷ����󶨵�window�����load�¼��ϣ���ȷ���ķ������ǻᱻִ��
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
		//�ж��ǲ��Ǻ���
		isFunction: function( obj ) {
			return jQuery.type(obj) === "function";
		},
	    //�ж��ǲ�������
		isArray: Array.isArray || function( obj ) {
			return jQuery.type(obj) === "array";
		},
	    //���window�������������window
		isWindow: function( obj ) {
			return obj != null && obj == obj.window;
		},
	    /*
	     *  add by zhangjh   2016-2-24
	     *  �ж�obj�ǲ�������
	     *  isFinite�ж�obj�Ƿ�������
	     */
		isNumeric: function( obj ) {
			return !isNaN( parseFloat(obj) ) && isFinite( obj );
		},
	    //�ж�����
		type: function( obj ) {
			return obj == null ?
				String( obj ) :
					//toString=Object.prototype.toString
				class2type[ toString.call(obj) ] || "object";
		},
		
	    /*
	     * add by zhangjh   2016-2-17
	     * �ж϶����ǲ���һ������Ķ��󣬾����ö���������{}����new Object()�����Ķ���
	     * ע�⣺��ͨ��new Object()�����Ķ���û�в���
	     */
		isPlainObject: function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			//������һ�����󣬵�������Dom�ڵ㣬window����
			if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
	
			try {
				// Not own constructor property must be Object
				if ( obj.constructor &&
				    //�ж�obj�������Ƿ���constructor���ԣ�������ͨ���̳е���
					!hasOwn.call(obj, "constructor") &&
					//�ж�obj�����ԭ�Ͷ������Ƿ���isPrototype���ԣ�ֻ��Objecct���캯����isPrototype���ԣ�����û��
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
	         * for( p in obj) һ������ö�ٶ���Ŀ�ö�����ԣ�ö��˳�������Զ����˳����ö�ٶ���������ԣ���ö�ټ̳���������
	         * ��Js���Ժ��Ķ�������÷����Ͳ��ǿ�ö�ٵģ����ö��������Ҳ�ǡ�����ö�ٵġ���
	         * ����ͨ���Լ���д���붨������Ժͷ����ǿ�ö�ٵģ��̳е��Զ�������Ҳ�ǿ���ö�ٵ�
	         * ���һ��������˼�ǣ�����ö��˳������ö����������ԣ�Ȼ����ö�ټ̳��������ԣ����Ե�����Ϊ�ջ���ö�ٵ������һ�����������������Ƿ���true
	         */
			return key === undefined || hasOwn.call( obj, key );
		},
	    //�ж϶����Ƿ�Ϊ��
		isEmptyObject: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
	    //����һ���ַ������׳��������ַ������쳣 
		error: function( msg ) {
			throw new Error( msg );
		},
	   /*
	    * ����JSON���ݸ�ʽ�����ݣ�����һ��js����
	    */
		parseJSON: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}
	
			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );
	
			// Attempt to parse using the native JSON parser first
			//���������ṩԭ����JSON.parse����
			if ( window.JSON && window.JSON.parse ) {
				return window.JSON.parse( data );
			}
	
			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			/*
			 * add by zhangjh    2016-2-24
			 * rvalidchars = /^[\],:{}\s]*$/,�������ַ����Ƿ����ض����ַ�(']',',',':','{','}','\s')
			 * rvalidbrace = /(?:^|:|,)(?:\s*\[)+/g   ƥ��'['
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
	    //�պ���
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
		 * object:jQuery����
		 * callback��jQuery��������Ҫִ�еĺ���
		 * args������callback�����Ĳ���
		 */
		each: function( object, callback, args ) {
			var name, i = 0,
				length = object.length,
				//�ж�object�Ƕ���������
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
				//���û�д�������������±���±��Ӧ��ֵ
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
		 * ȥ���ַ����������ߵĿո�
		 * �е������ľ��String.prototype.trim
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
		 * ��һ�����������ת��Ϊ���飨��������ڲ�ʹ�ã�
		 * array:��ת���Ķ��󣬿������κ�����
		 * results: ����jQuery�ڲ�ʹ�ã�����������results������results�����Ԫ��
		 */
		makeArray: function( array, results ) {
			var ret = results || [];
	
			if ( array != null ) {
				// The window, strings (and functions) also have 'length'
				// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
				var type = jQuery.type( array );
	            
				if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
					//�ж�array�������������������� ����Щ��length���ԵĲ�һ���Ƕ��� string���͵�ֵ��length����  function��length�������βεĸ�����regexp��window����Ҳ��length����
					push.call( ret, array );
					//ret��һ�������飬���Բ���ֱ��ʹ��ret��push��array��
				} else {
					jQuery.merge( ret, array );
				}
			}
	
			return ret;
		},
	    /*
	     * add by zhangjh   2016-2-24
	     * �������в���ָ����Ԫ�ز������±꣬δ�ҵ��򷵻�-1
	     * elem��Ҫ�������в��ҵ�ֵ
	     * array������������
	     * i��ָ����ʼ���ҵ�λ��
	     */
		inArray: function( elem, array, i ) {
			var len;
	
			if ( array ) {
				//indexOf = Array.prototype.indexOf
				if ( indexOf ) {
					//��������֧��indexOf����
					return indexOf.call( array, elem, i );
				}
	
				len = array.length;
				//����i��ֵ�����δ����i��ֵ��i����Ϊ0����������ֵ�Ǹ����Ҵ�������ĳ��ȣ�����Ϊ0
				i = i ? (i < 0 ? Math.max( 0, len + i ) : i) : 0;
	
				for ( ; i < len; i++ ) {
					// Skip accessing in sparse arrays
					//��������е��±겻�������ģ��򷵻�false��ʹ�á�===����������ת��
					if ( i in array && array[ i ] === elem ) {
						return i;
					}
				}
			}
	
			return -1;
		},
	    /*
	     * add by zhangjh   2016-2-25
	     * �ϲ����������Ԫ�ص���һ��������
	     * first:���������������󣬱��뺬�����ͣ���ת��Ϊ���ͣ���length����
	     * second:���顢�����������߰��������������ԵĶ���{0:'a',1:'b'}
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
	     * ���ڲ���������������˺�����Ԫ�أ�ԭ���鲻���ܵ�Ӱ��
	     * elems:������������
	     * callback:���˺���������Ϊ����Ԫ�غͶ�Ӧ�±�
	     * inv:true,��ʾ�����������������Ԫ����ɵ����飻false,��ʾ���ز��������������Ԫ����ɵ�����
	     */
		grep: function( elems, callback, inv ) {
			var ret = [], retVal;
			//��invת��Ϊbooleanֵ
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
		 * elems:����������������
		 * callback���ص��������������ÿ��Ԫ�ػ��߶����ÿ��������ִ�У�ִ��ʱ�������������������±���±��Ӧ��ֵ
		 * arg���������jQuery��map��ʱ�����˲���arg����ᴫ��callback
		 */
		map: function( elems, callback, arg ) {
			var value, key, ret = [],
				i = 0,
				length = elems.length,
				// jquery objects are treated as arrays
				//�ж�elems�ǲ���������������������jQuery���������������
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
			//�൱��Array.concat.apply([],ret)  ����ΪʲôҪ��ƽ������
			return ret.concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		//ȫ�ּ�����
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		/*
		 * add by zhangjh   2016-2-25
		 * ����һ������������һ���º������º������ǳ����ض���������
		 */
		proxy: function( fn, context ) {
			//���fn�Ǻ�������ָ��contextΪfn�������ģ����context���ַ�������ָ��fn������Ϊcontext��Ӧ�ĺ�����������Ϊfn
			if ( typeof context === "string" ) {
				//���context��string������fn��context
				var tmp = fn[ context ];
				//����contextָ������������
				context = fn;
				//����fnָ������������
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			//ִ��proxy���ܻ�ഫ���������ȡ����Ĳ���
			var args = slice.call( arguments, 2 ),
				proxy = function() {
				    //���������Ӧ��fn.apply(context,***),��fn��������ָ��Ϊcontext��ͬʱ�˴���argument�������arguments��һ�����˴���arguments
				    //ָ����ǵ���proxy���ɵĺ�����ʱ����Ĳ���
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
		 *    ����Ϊ�����е�Ԫ������һ�����߶�����ԣ����߶�ȡ��һ��Ԫ�ص�����ֵ
		 * elems:Ԫ�ؼ��ϣ�ͨ��ΪjQuery����
		 * fn:�ص�������ͬʱ֧�ֺ���������
		 * key:���������м�ֵ�ԵĶ���
		 * value:����ֵ������������key�Ƕ��󣬸ò���Ϊundefined
		 * chainable:false,get;true,set??
		 * emptyGet:jQueryû��ѡ��Ԫ�صķ���ֵ
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
					//Ϊÿһ��elems����һ�����߶��html����
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
	    //���ص�ǰʱ��ĺ����ʾ
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
	 * ����jQuery.js�ļ���ʱ�򣬶�class2Type���и���
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
	//����flagsCache���ڴ洢ת����ı�Ƕ�������Ϊ����ַ���������ֵΪtrue
	var flagsCache = {};
	
	// Convert String-formatted flags into Object-formatted ones and store in cache
	/**
	 *add by zhangjh  2016-3-18
	 *���ڽ��ַ�����ʽ�ı�ǣ�����flags��ת��Ϊ�����ʽ�ı�ǣ�����ת������������� 
	 */
	function createFlags( flags ) {
		//object��flagsCache[flags]ͬʱ����һ�����󣬸ı�object��ͬʱҲ��ı�flagsCache[flags]
		var object = flagsCache[ flags ] = {},
			i, length;
		flags = flags.split( /\s+/ );
		for ( i = 0, length = flags.length; i < length; i++ ) {
			object[ flags[i] ] = true;
		}
		return object;
		//  ���flagsΪ'once memory',����{'once':true,'memory':true},   flagsCache={'once memory':{'once':true,'memory':true}}
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
    /**---------------------------------------------   �첽���� Deferred Object   -----------------------------------------------------**/
	jQuery.Callbacks = function( flags ) {
		/*
		 * flags:
		 *     once:ȷ���ص������б�ֻ�ܱ�����һ�Σ�
		 *     memory:��¼��һ�γ����ص������б�ʱ�Ĳ�����֮����ӵ��κλص����������ü�¼�Ĳ���ֵ�������ã�
		 *     unique:ȷ��һ���ص�����ֻ�ܱ����һ�Σ��ص������б���û���ظ�ֵ
		 *     stopOnFalse:��ĳ���ص���������falseʱ�ж�ִ��
		 */
	
		// Convert flags from String-formatted to Object-formatted
		// (we check in cache first)
		
		flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};
	
		var // Actual callback list
		    //��Żص�����������
			list = [],
			// Stack of fire calls for repeatable lists
			//
			stack = [],
			// Last fire value (for non-forgettable lists)
			//
			memory,
			// Flag to know if list was already fired
			//�ص������б��Ƿ��Ѿ�ִ����
			fired,
			// Flag to know if list is currently firing
			//�ص������б��Ƿ�����ִ��
			firing,
			// First callback to fire (used internally by add and fireWith)
			//��ִ�еĵ�һ���ص��������±�
			firingStart,
			// End of the loop when firing
			//��ִ�е����һ���ص��������±�
			firingLength,
			// Index of currently firing callback (modified by remove if needed)
			//��ǰ����ִ�еĻص��������±�
			firingIndex,
			// Add one or several callbacks to the list
			//���һ�����߶���Ե�����������list��
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
						//���Ԫ�ػ������飬���������add��������ӻص�������list����
						add( elem );
					} else if ( type === "function" ) {
						// Add if not in unique mode and callback is not in
						if ( !flags.unique || !self.has( elem ) ) {
							//!(flags.unique&&self.has(elem))  �����uniqueģʽ���Ѿ���ӵĻ��������
							list.push( elem );
						}
					}
				}
			},
			// Fire callbacks
			/**
			 * add by zhangjh   2016-3-18
			 * ʹ��ָ����������context�Ͳ���args��������list�еĻص�����
			 * @param context  ����ָ��ִ��fire��������
			 * @param args ����ָ�����ûص�����ʱ����Ĳ���
			 */
			fire = function( context, args ) {
				args = args || [];
				//�����ǰ�ص������б���memoryģʽ�������memoryΪtrue�������memoryģʽ���򱻸�ֵΪ[context,args]����ӱ�ʾmemoryģʽ
				memory = !flags.memory || [ context, args ];
				fired = true;
				firing = true;
				firingIndex = firingStart || 0;
				firingStart = 0;
				firingLength = list.length;
				for ( ; list && firingIndex < firingLength; firingIndex++ ) {
					if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
						//ִ�лص�����list[firingIndex],�������false����ΪstopOnFalseģʽ
						memory = true; // Mark as halted
						break;
					}
				}
				firing = false;
				if ( list ) {
					//onceȷ���ص������б�ֻ�ܱ�����һ��
					if ( !flags.once ) {
						//�������onceģʽ�������Զ�γ����ص������б���ӱ���stack�е�����ŵ����ĺͲ������ٴ�ִ�������ص������б�֪��stackΪ��
						if ( stack && stack.length ) {
							memory = stack.shift();
							self.fireWith( memory[ 0 ], memory[ 1 ] );
						}
					} else if ( memory === true ) {
						//�������memory��ȫ����true����˵��ģʽΪ��memoryģʽ����stop+ĳ���ص����صķ���ֵ��false
					  //�����onceģʽ+��memoryģʽ����onceģʽ+stopOnFalseģʽ�����ֹ�ص������б�
						self.disable();
					} else {
						//�����once+memoryģʽ�������list���飬������ӵĻص�������������ִ��
						list = [];
					}
				}
			},
			// Actual Callbacks object
			self = {
				// Add a callback or a collection of callbacks to the list
				//���һ����һ��ص��������ص������б���
				add: function() {
					if ( list ) {
						var length = list.length;
						add( arguments );
						// Do we need to add the callbacks to the
						// current firing batch?
						//˵���ص������б���һ��һ��ִ��
						if ( firing ) {
							//����ǻص������б�����ִ���У��ı�����±�firingLength��ʹ������ӵĺ���Ҳ��������
							firingLength = list.length;
						// With memory, if we're not firing then
						// we should call right away, unless previous
						// firing was halted (stopOnFalse)
							//˵���ص������б��Ѿ�ִ������
						} else if ( memory && memory !== true ) {
							//��memoryģʽ�²��ҵ�����stopOnFalseģʽ��û�з���false�Ļص�����������firingStart������ִ��
							firingStart = length;
							fire( memory[ 0 ], memory[ 1 ] );
						}
					}
					return this;
				},
				// Remove a callback from the list
				//�ӻص������б����Ƴ�һ����һ��ص�����
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
										//˵���ص������б�����ִ�й�����
										if ( i <= firingLength ) {
											//����firingLength
											firingLength--;
											if ( i <= firingIndex ) {
												//����firingIndex
												firingIndex--;
											}
										}
									}
									// Remove the element
									list.splice( i--, 1 );
									// If we have some unicity property then
									// we only need to do this once
									if ( flags.unique ) {
										//��uniqueģʽ�£�list�в������ظ��Ļص����������Բ�������ʣ�µ�list��Ѱ��
										break;
									}
								}
							}
						}
					}
					return this;
				},
				// Control if a given callback is in the list
				//���ָ���Ļص����������ڻص������б���
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
				//�Ƴ��ص������б������еĻص�����
				empty: function() {
					list = [];
					return this;
				},
				// Have the list do nothing anymore
				//���ûص��������������κ�����
				disable: function() {
					list = stack = memory = undefined;
					return this;
				},
				// Is it disabled?
				//�жϻص������б��Ƿ��Ѿ�������
				disabled: function() {
					//���û�б����ã�����Ϊ[]
					return !list;
				},
				// Lock the list in its current state
				//�����ص������б���memoryģʽ�£��Կ�����Ӻ�ɾ���ص�������Ҳ����ֹͣ�������µ������Ļص�����������ӵĻص�����Ҳ������ִ�У��������޷�����
				lock: function() {
					//�޷��ٴδ����ص������б�
					stack = undefined;
					if ( !memory || memory === true ) {
						//����Ƿ�memoryģʽ����memory+stopOnFalseģʽ���лص���������false�����ûص������б�
						self.disable();
					}
					return this;
				},
				// Is it locked?
				//�жϻص������б��Ƿ��Ѿ�������
				locked: function() {
					//�жϻص������б��Ƿ��Ѿ��޷��ٴδ���
					return !stack;
				},
				// Call all callbacks with the given context and arguments
				//ʹ��ָ���������ĺͲ��������ص������б��е����лص�����
				fireWith: function( context, args ) {
					if ( stack ) {
						if ( firing ) {
							//����ִ�лص������б���
							if ( !flags.once ) {
								//�������onceģʽ���ȰѲ�������������
								stack.push( [ context, args ] );
							}
						} else if ( !( flags.once && memory ) ) {
							//�ص������б��ǳ���ִ��״̬����������Ѿ���������һ��ģʽ���ͼ���ִ��
							fire( context, args );
						}
					}
					return this;
				},
				// Call all the callbacks with the given arguments
				//ʹ��ָ���Ĳ��������ص������б��е����лص�����
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
				// To know if the callbacks have already been called at least once
				//�жϻص������Ƿ񱻴�����
				fired: function() {
					return !!fired;
				}
			};
	    //���ػص������б�
		return self;
	};
	
	
	
	
	var // Static reference to slice
		sliceDeferred = [].slice;
	
	jQuery.extend({
	    //�첽����
		Deferred: function( func ) {
			     //�ɹ��ص������б�
			var doneList = jQuery.Callbacks( "once memory" ),
			    //ʧ�ܻص������б�
				failList = jQuery.Callbacks( "once memory" ),
				//��Ϣ�ص������б�
				progressList = jQuery.Callbacks( "memory" ),
				//״̬������->pending,�ɹ�->resolved,ʧ��->rejected
				state = "pending",
				lists = {
					resolve: doneList,
					reject: failList,
					notify: progressList
				},
				//�첽���е�ֻ������
				promise = {
				    //��ӳɹ��ص�����
					done: doneList.add,
					//���ʧ�ܻص�����
					fail: failList.add,
					//�����Ϣ�ص�����
					progress: progressList.add,
	                //�����첽���е�״̬
					state: function() {
						return state;
					},
	
					// Deprecated
					//���سɹ��ص������б��ת̬
					isResolved: doneList.fired,
					//����ʧ�ܻص������б��ת̬
					isRejected: failList.fired,
	                //ͬʱ��ӳɹ��ص�������ʧ�ܻص���������Ϣ�ص���������Ӧ�Ļص������б���
					then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
						//done���ص�thisָ��deferred
						deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
						return this;
					},
					//���ص�����ͬʱ��ӵ��ɹ��ص������б��ʧ�ܻص������б�
					always: function() {
						//apply�Ļ��ƣ�done��Ӧ�ĺ���һ�㷵�ص�thisΪ�ص������б�������apply��ʹ�ã�thisָ��Ϊdeferred
						//���ﲻ��apply����Ҳ����
						deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
						return this;
					},
					//����������ѡ�Ĺ��˺�����Ϊ���������ڹ��˵�ǰ�첽���е�״̬�Ͳ�����������һ���µ��첽���е�ֻ������??
					pipe: function( fnDone, fnFail, fnProgress ) {
						//�����µ��첽���е�ʱ�򣬴���һ���������� function(newDefer),���µ��첽���з���ǰ����
						return jQuery.Deferred(function( newDefer ) {
							//each������ÿ�����Ի���ֵ��ִ��function(handler,data)
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
					//�����첽���е�ֻ������
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
				//�����첽����
				deferred = promise.promise({}),
				key;
	        //Ϊ�첽�������resolve()(��Ӧfire����)��resolveWith()(��Ӧfirewith����)��reject()��
			for ( key in lists ) {
				deferred[ key ] = lists[ key ].fire;
				deferred[ key + "With" ] = lists[ key ].fireWith;
			}
	
			// Handle state
			//��������ɹ��ص�����
			deferred.done( function() {
				state = "resolved";
			}, failList.disable, progressList.lock )
			//�������ʧ�ܻص�����
			.fail( function() {
				state = "rejected";
			}, doneList.disable, progressList.lock );
	
			// Call given func if any
			//�������func��ִ��func��deferred��Ϊ��������
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		//�ṩ��һ�����������״̬��ִ�лص������Ĺ���
		when: function( firstParam ) {
			//�����������ת��Ϊ����
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
	
	
	
/*********************************************************   ��������ܲ���ģ��Support   ******************************************************************/	
	/**
	 * һ������������������������ַ�����һ�����������̽��ͨ���жϵ�ǰ����������ͺͰ汾��Ȼ���д�����Դ��룻һ����
	 * ��������ܲ��ԣ�ͨ�����ĳ�ع����ڵ�ǰ��������Ƿ�֧�֣�Ȼ���д��Ӧ�ļ����Դ���
	 */
	
	jQuery.support = (function() {  //�Ե�����������
	      
		var support,   //���ڴ�Ų�����Ͳ��Խ��
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
			//����һ��divԪ�أ���Ϊ�������Ե�����
			div = document.createElement( "div" ), 
			//documentElement��html�ļ��е�htmlԪ��
			documentElement = document.documentElement;
	
		// Preliminary tests
		div.setAttribute("className", "t");
		div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
	    //��ȡdiv�����е�Ԫ��
		all = div.getElementsByTagName( "*" );
		//��ȡdiv�е�һ��a
		a = div.getElementsByTagName( "a" )[ 0 ];
	
		// Can't get basic test support
		if ( !all || !all.length || !a ) {
			return {};
		}
	
		// First batch of supports tests
		//����һ��selectԪ��
		select = document.createElement( "select" );
		//����select����Ԫ��option
		opt = select.appendChild( document.createElement("option") );
		//��ȡһ��inputԪ��
		input = div.getElementsByTagName( "input" )[ 0 ];
	
		support = {
			// IE strips leading whitespace when .innerHTML is used
	        //��������ʹ��innerHtml���Բ���HTML����ʱ����ǰ���հ׷�����leadingWhitespaceΪtrue
			leadingWhitespace: ( div.firstChild.nodeType === 3 ),   //nodeType���ı��ڵ�
	
			// Make sure that tbody elements aren't automatically inserted
			// IE will insert them into empty tables
			
			//ȷ�����������tablesԪ�ص�ʱ�򲻻��Զ�����tbodyԪ�أ�IE6��IE7����table���Զ�����tbodyԪ��
			tbody: !div.getElementsByTagName("tbody").length,
	
			// Make sure that link elements get serialized correctly by innerHTML
			// This requires a wrapper element in IE
			//��������������ȷ���л�link��ǩ����htmlSerializeΪtrue��IE6/IE7������ȷ���л�link��ǩ
			htmlSerialize: !!div.getElementsByTagName("link").length,
	
			// Get the style information from getAttribute
			// (IE uses .cssText instead)
			//���DOMԪ�ص�������ʽ����ͨ��DOM����styleֱ�ӷ��ʣ���Ϊtrue
			// IE6/IE7����ͨ��getAttribute("style")����ȡ������ʽ
			style: /top/.test( a.getAttribute("style") ),
	
			// Make sure that URLs aren't manipulated
			// (IE normalizes it by default)
			//���getAttribute("href")�ķ���ֵ�����õ����·���Ƿ���ȣ���û�иı䣬��Ϊtrue
			//IE6,IE7���ʽ��Ϊȫ·��
			hrefNormalized: ( a.getAttribute("href") === "/a" ),
	
			// Make sure that element opacity exists
			// (IE uses filter instead)
			// Use a regex to work around a WebKit issue. See #5145
			//��������֧����ʽopacity����Ϊtrue��IE6��IE7��֧��opacity��ʽ
			//style����һ������Ԫ��������ʽ�Ķ���
			opacity: /^0.55/.test( a.style.opacity ),  //opacity����Ԫ�صĲ�͸������
	
			// Verify style float existence
			// (IE uses styleFloat instead of cssFloat)
			//��������֧��ͨ��cssFloat������ʽfloat����Ϊtrue
			//IEʹ��styleFloat����float��ʽ
			cssFloat: !!a.style.cssFloat,
	
			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			//�����ѡ�������valueĬ����on������true��SafariĬ��Ϊ���ַ���
			checkOn: ( input.value === "on" ),
	
			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			//selectԪ������ӵ�optionԪ�أ�Ĭ��Ϊѡ��״̬Ϊtrue��IE6/IE7 Ĭ�ϲ�ѡ��
			optSelected: opt.selected,
	
			// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
			//���ԭ������getAttribute��setAttribute��removeAttribute������ȷ�����á���ȡ���Ƴ�HTML���ԣ���Ϊtrue
			//IE6/IE7����setAttribute���ñ�ǩ��class����ʱ����Ҫ����DOM������className�����ȸ衣ff����Ҫ��ֱ�Ӵ���HTMl����class�Ϳ���
			//IE6/IE7����false
			getSetAttribute: div.className !== "t",
	
			// Tests for enctype support on a form(#6743)
			//�����Ԫ��֧������enctype����Ϊtrue����encode���Եȼۣ���һЩ�ϰ汾����������������������֧��
			enctype: !!document.createElement("form").enctype,  //enctype�涨����Ԫ�ط��͵�������֮ǰӦ����ζ�����б���
	
			// Makes sure cloning an html5 element does not cause problems
			// Where outerHTML is undefined, this still works
			//������������ȷ�ĸ���HTML5Ԫ�أ���Ϊtrue��IE6/IE7Ϊfalse
			html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",
	
			// Will be defined later
			//���submitʱ������DOM������ð�ݣ���Ϊtrue
			submitBubbles: true,
			//���change�¼�����DOM������ð�ݣ���Ϊtrue
			changeBubbles: true,
			//���֧��focusin�¼�����Ϊtrue
			focusinBubbles: false,
			//������������ɾ��DOMԪ���ϵ����ԣ���Ϊtrue��IE6/IE7/IE8������ɾ��DOMԪ���ϵ�����
			deleteExpando: true,
			//���������ڸ���DOMԪ��ʱ�������¼�������������Ϊtrue
			noCloneEvent: true,
			//���ΪDOMԪ����������ʽ��display:inline;zoom:1��֮�������Ԫ�ذ���inline-block��ʾ����Ϊtrue
			inlineBlockNeedsLayout: false,
			//һ����Ԫ��ӵ��hasLayout���Ժ͹̶���width����heightʱ�������Ԫ�ػᱻ��Ԫ�سŴ���Ϊtrue
			shrinkWrapBlocks: false,
			//��������������ȷ�ļ�����ʽmarginRight���������Ϊtrue
			reliableMarginRight: true,
			
			pixelMargin: true
		};
	
		// jQuery.boxModel DEPRECATED in 1.3, use jQuery.support.boxModel instead
		//��������ձ�׼��ģ�ͽ���Ԫ�����ݴ�С����Ϊtrue
		//document.compatMode�����жϵ�ǰ���������Ⱦģʽ��CSS1Compat����׼����ģʽ������BackCompat��׼����ģʽ�ر�
		jQuery.boxModel = support.boxModel = (document.compatMode === "CSS1Compat");
	
		// Make sure checked status is properly cloned
		//����ѡ��״̬
		input.checked = true;
		//����һ����ѡ�еĸ�ѡ��Ȼ���鸱��Ԫ�ص�ѡ��״̬��IE6/IE7Ϊfalse
		support.noCloneChecked = input.cloneNode( true ).checked;
	
		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		//����selectԪ�ؽ���
		select.disabled = true;
		//����ѽ��õ�selectԪ���е�optionԪ��δ���Զ����ã���optDisabledΪtrue
		//IE6,�ȸ趼δ������
		support.optDisabled = !opt.disabled;
	
		// Test to see if it's possible to delete an expando from an element
		// Fails in Internet Explorer
		//IE�������֧��ʹ�� deleteɾ������
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
		//�������inputԪ�ص�����typeΪ��radio�����ᵼ������value��ֵ��ʧ����Ϊtrue
		//IE6/IE7����input��type����Ϊradio��ʱ�򣬻ᶪʧnameֵ
		input = document.createElement("input");
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";
	
		input.setAttribute("checked", "checked");
	
		// #11217 - WebKit loses check when the name is after the checked attribute
		//�ĵ�Ƭ������ȷ���Ƶ�ѡ��ť�͸�ѡ���ѡ��״̬����Ϊtrue
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
		fragment = document.createDocumentFragment();
		fragment.appendChild( div.lastChild );
	
		// WebKit doesn't clone checked state correctly in fragments
		//IE6/IE7���Ƶ�ʱ��ᶪʧѡ��״̬
		support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		//��ѡ�еĵ�ѡ��ť�͸�ѡ����ӵ�DOM���к������ȻΪѡ��״̬����Ϊtrue
		//IE6/IE7�а�ѡ�еĵ�ѡ��ť�͸�ѡ����ӵ�DOM���к󣬻ᶪʧѡ��״̬
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
			
	        //containerΪһ��divԪ��
			container = document.createElement("div");
			//����container��������ʽ
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
			//clientHeight:�ɼ�����ĸ߶ȣ�������border����������offsetHeight��һ��Ϊ���������style�е�height���ԣ��ȸ��border��IE���ӣ�
			//scrollHeight:���������ݵ�ʵ�ʸ߶�
			isSupported = ( tds[ 0 ].offsetHeight === 0 );
	
			tds[ 0 ].style.display = "";
			tds[ 1 ].style.display = "none";
	
			// Check if empty table cells still have offsetWidth/Height
			// (IE <= 8 fail this test)
			//����յ�Ԫ��Ŀɼ��߶�offsetHeightΪ0����Ϊtrue
			support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
	
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			if ( window.getComputedStyle ) {
				//ԭ������getComputerdStyle����DOMԪ�صļ�����ʽ��
				div.innerHTML = "";
				marginDiv = document.createElement( "div" );
				marginDiv.style.width = "0";
				//margin ��߾ࣻ padding �ڱ߾�
				marginDiv.style.marginRight = "0";
				div.style.width = "2px";
				div.appendChild( marginDiv );
				support.reliableMarginRight =
					( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
			}
	        //zoom���ԣ�
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
				//�����Ԫ�ؾ��丸Ԫ���ϱ߽�ľ��벻������Ԫ�ص��ϱ߿��ȣ���Ϊtrue
				doesNotAddBorder: ( inner.offsetTop !== 5 ),
				//���tdԪ�ؾ��丸Ԫ��tr�ϱ߽�ľ������tableԪ�ص��ϱ߿��ȣ���Ϊtrue
				doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
			};
	
			inner.style.position = "fixed";
			inner.style.top = "20px";
	
			// safari subtracts parent border width here which is 5px
			//������������ȷ����fixedԪ�صĴ������꣬��Ϊtrue
			offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
			inner.style.position = inner.style.top = "";
	
			outer.style.overflow = "hidden";
			outer.style.position = "relative";
	        //�����Ԫ�ص���ʽoverflowΪ��hidden������Ԫ�ؾุԪ�ر߽�ľ�����ȥ��Ԫ�صı߿��ȣ���Ϊtrue
			offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
			//���bodyԪ�ؾ�htmlԪ�ر߿�ľ��벻����bodyԪ�ص���߾�margin����Ϊtrue
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
	
	/*************************************************  ���ݻ���ģ��   ***********************************************************/
	jQuery.extend({
		//ȫ�ֻ������
		cache: {},
	
		// Please use with caution
		//Ψһ����ID
		uuid: 0,
	
		// Unique for each copy of jQuery on the page
		// Non-digits removed to match rinlinejQuery
		//ҳ����ÿ��jQuery������Ψһ��ʶ
		expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),
	
		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData: {
			"embed": true,
			// Ban all objects except for Flash (which handle expandos)
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet": true
		},
	    //�Ƿ��й���������
		hasData: function( elem ) {
			elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
			return !!elem && !isEmptyDataObject( elem );
		},
	    //���á���ȡ�Զ������ݻ��ڲ�����
		/**
		 * add by zhangjh   2016-3-21
		 * @param elem ��ʾ�����ݹ�����DOMԪ��
		 * @param name ��ʾҪ���û��ȡ���������������Ǻ��м�ֵ�ԵĶ���
		 * @param data ��ʾҪ���õ�����ֵ����������������
		 * @param pvt ָʾ��ȡ����ֻ���������ڲ����ݻ����Զ�������ݣ����true��ʾ��ȡ�����õ����ڲ����ݣ�false���ʾ��ȡ�����õ����Զ�������
		 */
		data: function( elem, name, data, pvt /* Internal Use Only */ ) {
			//�ж�elem�ǲ��ǿ�����������
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
				//�����DOMԪ�أ����������ӵ�jQuery.cache�У�����ֱ����ӵ�������
				cache = isNode ? jQuery.cache : elem,
	
				// Only defining an ID for JS objects if its cache already exists allows
				// the code to shortcut on the same path as a DOM node with no cache
				//ȡ������ID������DOMԪ�أ�elem[internalKey]�洢���ǹ���ID������js����elem[internalKey]�洢�������ݶ���internalkey�ǹ���ID
				id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
				//isEvent��ʾ�Ƿ��ȡ˽������events
				isEvents = name === "events";
	
			// Avoid doing any more work than we need to when trying to get data on an
			// object that has no data at all
			//��������һ��û���κ����ݵĶ����϶�ȡ����ʱ��ֱ�ӷ���    getByName&&data===undefined��ʾ��ȡ����
			if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
				return;
			}
	        //�������ID�����ڣ������һ��
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
				//������ݻ�����󲻴��ڣ�������Ϊ��
				cache[ id ] = {};
	
				// Avoids exposing jQuery metadata on plain JS objects when the object
				// is serialized using JSON.stringify
				if ( !isNode ) {
					//�����js��������toJSONΪ�պ������ѱ�����ִ��JSON.stringify()�Ǳ�¶�������ݣ�������
					cache[ id ].toJSON = jQuery.noop;
				}
			}
	
			// An object can be passed to jQuery.data instead of a key/value pair; this gets
			// shallow copied over onto the existing cache
			if ( typeof name === "object" || typeof name === "function" ) {
				//�������name�Ƕ�����ߺ�������������������
				if ( pvt ) {
					//�����ڲ����ݣ��ɲ���name��Ӧ��ֵ���ϵ�cache[id]��
					cache[ id ] = jQuery.extend( cache[ id ], name );
				} else {
					//������Զ������ݣ�������name��Ӧ��ֵ���ϵ�cache[id].data��
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
			//�����ô�������ַ��������ȡ��������
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
	     * �Ƴ�ͨ��jQuery.data()���õ�����
	     * @param elem  ���Ƴ����ݵ�DOMԪ�ػ���js����
	     * @param name  ���Ƴ����������������ǵ��������������������顢�ÿո���Ķ��������
	     * @param pvt  ָ���Ƴ����������ڲ����ݻ����Զ�������
	     */
		removeData: function( elem, name, pvt /* Internal Use Only */ ) {
			//���elem�Ƿ�������ò���
			if ( !jQuery.acceptData( elem ) ) {
				return;
			}
	
			var thisCache, i, l,
	
				// Reference to internal data cache key
				internalKey = jQuery.expando,
	
				isNode = elem.nodeType,
	
				// See jQuery.data for more information
				//cacheָ��洢���ݵĶ���
				cache = isNode ? jQuery.cache : elem,
	
				// See jQuery.data for more information
			    //����ID
				id = isNode ? elem[ internalKey ] : internalKey;
	
			// If there is already no cache entry for this object, there is no
			// purpose in continuing
			//������ݻ�����󲻴��ڣ��򷵻�
			if ( !cache[ id ] ) {
				return;
			}
	
			if ( name ) {
	            //pvt��true��Ϊ�ڲ����ݣ�Ϊfalse�����Զ�������
				thisCache = pvt ? cache[ id ] : cache[ id ].data;
	
				if ( thisCache ) {
	
					// Support array or space separated string names for data keys
					if ( !jQuery.isArray( name ) ) {
	                    //name�������飬��name��װ������
						// try the string as a key before any manipulation
						if ( name in thisCache ) {
							name = [ name ];
						} else {
	
							// split the camel cased version by spaces unless a key with the spaces exists
							name = jQuery.camelCase( name );
							if ( name in thisCache ) {
								name = [ name ];
							} else {
								//�������
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
	        //���û��name���������Ƴ�DOMԪ�ػ���js�������й���������
			// See jQuery.data for more information
			if ( !pvt ) {
				//ɾ���Զ�������
				delete cache[ id ].data;
	
				// Don't destroy the parent cache unless the internal data object
				// had been the only thing left in it
				//����Ƿ����ڲ����ݣ�����У��򷵻أ���
				if ( !isEmptyDataObject(cache[ id ]) ) {
					return;
				}
			}
	
			// Browsers that fail expando deletion also refuse to delete expandos on
			// the window, but it will allow it on all other JS objects; other browsers
			// don't care
			// Ensure that `cache` is not a window object #10080
			
			if ( jQuery.support.deleteExpando || !cache.setInterval ) {
				//���֧��ɾ��DOMԪ���ϵ���չ���Ի���cache����window����
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
		//����ΪDOMԪ�ػ���javascript�������û��߶�ȡ�ڲ����ݣ����ĸ�����pvt����Ϊtrue
		//���ڶ���ģ�顢����ģ�顢��ʽ����ģ�顢�¼�ϵͳ�ṩ�������ܣ��������û��߶�ȡ��Щģ������ʱ���ڲ�����
		_data: function( elem, name, data ) {
			return jQuery.data( elem, name, data, true );
		},
	
		// A method for determining if a DOM node can handle the data expando
		//�ж�elem�Ƿ������������
		acceptData: function( elem ) {
			if ( elem.nodeName ) {
				//embed��object��appletԪ�ز�֧���������ݣ�����Ҫ�����ж�
				var match = jQuery.noData[ elem.nodeName.toLowerCase() ];
	
				if ( match ) {
					//�ж�elem�ǲ���flash��flash������������
					return !(match === true || elem.getAttribute("classid") !== match);
				}
			}
	
			return true;
		}
	});
	
	jQuery.fn.extend({
		//���á���ȡ�Զ������ݣ�����HTML5���ԣ�����jQuery�������
		data: function( key, value ) {
			var parts, part, attr, name, l,
			    //jQuery����ĵ�һ��Ԫ��
				elem = this[0],
				i = 0,
				data = null;
	
			// Gets all values
			if ( key === undefined ) {
				//���û�в������key���൱��$("***").data();
				if ( this.length ) {
					//��ȡjQuery�����һ��Ԫ�ص��Զ������ݻ������
					data = jQuery.data( elem );
	                //���elem��Element����html5Ԫ�أ���
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
			//���key��object
			if ( typeof key === "object" ) {
				//���object�Ƕ��������ƥ��Ԫ�ؼ��ϣ�Ϊÿһ��ƥ��Ԫ�ص���jQuery.data������������
				return this.each(function() {
					jQuery.data( this, key );
				});
			}
	        //���ֻ�������key
			//ȡ�������ռ䣿��
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
       //�Ƴ��Զ�������	
		removeData: function( key ) {
			return this.each(function() {
				jQuery.removeData( this, key );
			});
		}
	});
	
	
	/**
	 * add by zhangjh   2016-3-22
	 * ���ڽ���HTML5����data-�к��е����ݣ����ѽ����������DOMԪ�ع������Զ������ݻ��������
	 * @param elem ��ʾ������HTML5����data-��DOMԪ��
	 * @param key ��ʾ��������������
	 * @param data ��ʾ��DOMԪ�ع������Զ������ݻ��������ȡ�������ݣ�ֻ��dataΪundefiedʱ���Ż����html5����
	 */
	function dataAttr( elem, key, data ) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
	        //rmultiDash = /([A-Z])/g;
			//��keyת��Ϊhtml5Ԫ����Ӧ����������data-****
			var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
	        //��ȡ����ֵ
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
				//�ѽ����������������Զ������ݻ������jQuery.cache[id].data��
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
				//��data���ԣ�����data���Զ�Ӧ��ֵΪ��
				continue;
			}
			if ( name !== "toJSON" ) {
				//����toJSON���ԣ��򷵻�false
				return false;
			}
		}
	
		return true;
	}
	
	
/******************************************************   ����ģ��   **************************************************************/
	/**
	 * add by zhangjh   2016-3-26
	 * ������ƥ��Ԫ�ع����Ķ��кͼ������Ƿ���ɣ������ɣ�����promise�ļ�����-1
	 * @param elem   domԪ�ػ���js����
	 * @parm type    �����Ķ��л��߼���������
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
			//ʹ��setTimeout(function(){},0)��Ϊ�˺�������ִ��
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
	     * @param elem  ÿ��DOMԪ�ػ���js����
	     * @param type  ���������ƣ�Ĭ��Ϊ����������������fx
	     * ʹelem�ļ�����+1
	     */
		_mark: function( elem, type ) {
			if ( elem ) {
				//����ά��һ��elemԪ�صļ�����
				type = ( type || "fx" ) + "mark";
				//������+1
				jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
			}
		},
	    /**
	     * add by zhangjh
	     * @param force   ��ʾ�Ƿ�ǿ�Ƽ�������0
	     * @param elem    ��ʾDOMԪ�ػ���js����
	     * @param type    ����������
	     * 
	     */
		_unmark: function( force, elem, type ) {
			//����force��elem��type
			//����forceĬ����false��falseʱ���ô�false�Ĳ���
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
					//true��ʾ�Ƴ��ڲ�����
					jQuery.removeData( elem, key, true );
					handleQueueMarkDefer( elem, type, "mark" );
				}
			}
		},
	    /**
	     * add by zhangjh  2016-3-26
	     * ���ڷ��ػ��޸�ƥ��Ԫ�ع����ĺ�������,data�����ڣ�����elem��type��Ӧ��Ԫ�أ�data������Ϊ���飬���滻elem��type��Ӧ��Ԫ�أ�
	     * data������Ϊ�����������elem��type��Ӧ��ֵ
	     * elem��fxqueue��Ӧ����һ����������
	     * @param elem  DOMԪ�ػ���Js���������ϲ��һ����޸Ķ���
	     * @param type  �ַ�������ʾ�������ƣ�Ĭ��Ϊ��׼����fx
	     * @param data  ��ѡ�ĺ������ߺ�������
	     * @returns {Boolean}
	     */
		queue: function( elem, type, data ) {
			var q;
			if ( elem ) {
				//typeĬ��Ϊfx
				type = ( type || "fx" ) + "queue";
				//��ȡelem��type��Ӧ���ڲ�����
				q = jQuery._data( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !q || jQuery.isArray(data) ) {
						//���elem��type+queue��Ӧ�����ݲ����ڻ���data�����飬������elem��type��Ӧ��ֵΪdata
						q = jQuery._data( elem, type, jQuery.makeArray(data) );
					} else {
						//���dataֵ�������飬�����
						q.push( data );
					}
				}
				//���data�����ڣ�elem��type��Ӧ��ֵ���ڣ�����q�������ڣ��򷵻�[]
				return q || [];
			}
		},
	    /**
	     * add by zhangjh   2016-3-26
	     * ���ڳ��Ӳ�ִ��ƥ��Ԫ�ع����ĺ��������е���һ������
	     * @param elem
	     * @param type
	     */
		dequeue: function( elem, type ) {
			type = type || "fx";
	        //��ȡƥ��Ԫ�ع����ĺ�������
			var queue = jQuery.queue( elem, type ),
			    //���ӵ�һ������
				fn = queue.shift(),
				//��ų��ӵĺ�����ִ��ʱ������
				hooks = {};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			//������ӵ���һ��ռλ����inprogress���������³���һ������
			if ( fn === "inprogress" ) {
				fn = queue.shift();
			}
	        //fnӦ����һ������һ���ص����������ĺ���
			if ( fn ) {
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				//ֻ�ж������л�����ռλ������typeΪ��fx��
				if ( type === "fx" ) {
					//����ͷ������ռλ��inprogress������������������ִ����
					queue.unshift( "inprogress" );
				}
	            //�����ڲ�����type+��.run������Ӧ��ֵΪhooks
				jQuery._data( elem, type + ".run", hooks );
				fn.call( elem, function() {
					//ִ��fn��������������elem������fn��������������f()��hooks
					jQuery.dequeue( elem, type );
				}, hooks );
			}
	
			if ( !queue.length ) {
				//���type��Ӧ�Ķ���Ϊ�գ����Ƴ�����type��ص����ݶ��� ��remove���ܵĲ����������ÿո�������ַ���
				jQuery.removeData( elem, type + "queue " + type + ".run", true );
				handleQueueMarkDefer( elem, type, "queue" );
			}
		}
	});

	jQuery.fn.extend({
		/**
		 * add by zhangjh   2016-3-26
		 * ���ڷ��ص�һ��ƥ��Ԫ�ع����ĺ������л����޸�����ƥ��Ԫ�ع����ĺ�������
		 * @param type �ַ�������ʾ�������ƣ�Ĭ���Ƕ�������fx
		 * @param data ��ѡ�İ��������ߺ�������
		 * @returns
		 */
		queue: function( type, data ) {
			var setter = 2;
	        //����type
			if ( typeof type !== "string" ) {
				//��Ϊ$("a").queue()����$("a").queue(data)ʱ������typeΪfx��dataΪtype
				data = type;
				type = "fx";
				setter--;
			}
	        //�����$("a").queue()������ʾ�ǻ�ȡ������ȡ��һ��ƥ��Ԫ���ϲ���type���εĺ�������
			if ( arguments.length < setter ) {
				return jQuery.queue( this[0], type );
			}
	        //���ò���
			return data === undefined ?
				this :
				this.each(function() {
					//thisָ��ƥ���jQuery�����е�ÿһ��Ԫ��
					var queue = jQuery.queue( this, type, data );
	
					if ( type === "fx" && queue[0] !== "inprogress" ) {
						//�����������֮�������ǰû�ж���������ִ�У�������ִ�ж�������
						jQuery.dequeue( this, type );
					}
				});
		},
		//���ڳ��Ӳ�ִ��ƥ��Ԫ�ع����ĺ��������е���һ������
		dequeue: function( type ) {
			return this.each(function() {
				jQuery.dequeue( this, type );
			});
		},
		// Based off of the plugin by Clint Helfers, with permission.
		// http://blindsignals.com/index.php/2009/07/jquery-delay/
		/**
		 *  add by zhangjh   2016-3-26
		 *  @param time  ��ʾ�ӳ�ʱ��
		 *  @param type  ��ʾ��������
		 *  ��������һ����ʱ������ʹƥ��Ԫ�ع����ĺ��������к����ĺ����ӳٳ��Ӻ�ִ��
		 */
		delay: function( time, type ) {
			time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
			type = type || "fx";
	        //����$("a").queue������next����������function(){jQuery.dequeue( elem, type );}
			//ͨ��setTimeout(next,time)������һ����������ִ�е�ʱ��
			return this.queue( type, function( next, hooks ) {
				var timeout = setTimeout( next, time );
				//ȡ����ʱ������
				hooks.stop = function() {
					clearTimeout( timeout );
				};
			});
		},
		//����jQuery����ÿһ��ƥ��Ԫ�ص�type�ĺ�������Ϊ[]
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		/**
		 * add by zhangjh   2016-3-26
		 * ����һ���첽���е�ֻ���������۲�ÿ��ƥ��Ԫ�ع�����ĳ�����͵Ķ��кͼ������Ƿ����
		 * @param type  ��ʾ��Ҫ�۲�Ķ������ƺͼ��������ƣ�Ĭ��Ϊfx
		 * @param object  ��ѡ�Ķ���ָ���첽���е�ֻ���������ӵĶ���
		 */
		promise: function( type, object ) {
			//��Ϊ$("a").promise(object)ʱ����type��object
			if ( typeof type !== "string" ) {
				object = type;
				type = undefined;
			}
			//����type
			type = type || "fx";
			//����һ���첽����
			var defer = jQuery.Deferred(),
			    //Ԫ�ؼ���
				elements = this,
				//ƥ��Ԫ�صĸ���
				i = elements.length,
				count = 1,
				//ƥ��Ԫ�ع����Ļص������б������
				deferDataKey = type + "defer",
				//ƥ��Ԫ�ع����Ķ�������
				queueDataKey = type + "queue",
				//ƥ��Ԫ�ع����ļ�����������
				markDataKey = type + "mark",
				//��ʱ������ָ��ƥ��Ԫ�ع����Ļص������б�
				tmp;
			//����ص�����
			function resolve() {
				if ( !( --count ) ) {
					//��count��Ϊ0��ʱ�򣬴����첽���еĳɹ��ص�����
					defer.resolveWith( elements, [ elements ] );
				}
			}
			while( i-- ) {
				if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
						( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
							jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
						jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
					//���ڻص������б����resolve��ӵ��첽�����У������ڣ���һ���ص������б�
					count++;
					tmp.add( resolve );
				}
			}
			//��������ص����������û����Ҫ�۲��Ԫ�أ����������첽���еĳɹ��ص�����
			resolve();
			//�����첽���е�ֻ������
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

/*********************************************************   ���Բ���ģ��  ********************************************************************/	
	//jquery���Բ���ģ�����Ĳ������:HTML���Բ�����DOM���Բ���������ʽ������ֵ����
	jQuery.fn.extend({
		//
		attr: function( name, value ) {
			return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * @param name  html����
	     * @returns
	     * ���ڴ�ƥ��Ԫ�ؼ��е�ÿ��Ԫ�����Ƴ�һ�����߶��HTML����
	     */
		removeAttr: function( name ) {
			return this.each(function() {
				jQuery.removeAttr( this, name );
			});
		},
        /**
         * add by zhangjh  2016-4-14
         * @param name  DOM����
         * @param value ����ֵ
         * @returns
         * ����Ϊƥ��Ԫ�ؼ����е����Ԫ������һ�����߶��DOM����
         */
		prop: function( name, value ) {
			return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * @param name  DOM������
	     * @returns
	     * ���ڴ�ƥ��Ԫ�ؼ��е�ÿ��Ԫ�����Ƴ�һ��DOM����
	     */
		removeProp: function( name ) {
			name = jQuery.propFix[ name ] || name;
			return this.each(function() {
				// try/catch handles cases where IE balks (such as removing a property on window)
				//IE6/7������ɾ��DOMԪ���ϵ����ԣ���try-catch�����������쳣
				try {
					this[ name ] = undefined;
					delete this[ name ];
				} catch( e ) {}
			});
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * Ϊƥ��Ԫ�ؼ����е�ÿ��Ԫ�����һ�����߶����ʽ
	     * @param value   
	     * @returns
	     */
		addClass: function( value ) {
			var classNames, i, l, elem,
				setClass, c, cl;
	        //���value�Ǻ���
			if ( jQuery.isFunction( value ) ) {
				return this.each(function( j ) {
					jQuery( this ).addClass( value.call(this, j, this.className) );
				});
			}
	
			if ( value && typeof value === "string" ) {
				//�ָ�value
				classNames = value.split( rspace );
	
				for ( i = 0, l = this.length; i < l; i++ ) {
					elem = this[ i ];
	
					if ( elem.nodeType === 1 ) {
						if ( !elem.className && classNames.length === 1 ) {
							//���DOMԪ��û��className����ֱ�����
							elem.className = value;
	
						} else {
							setClass = " " + elem.className + " ";
	
							for ( c = 0, cl = classNames.length; c < cl; c++ ) {
								if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
									//�ж�setClass���Ƿ��Դ���Ҫ��ӵ�className
									setClass += classNames[ c ] + " ";
								}
							}
							// ȥ��classNameǰ��Ŀո�
							elem.className = jQuery.trim( setClass );
						}
					}
				}
			}
	
			return this;
		},
	   /**
	    * add by zhangjh   2016-4-14
	    * �Ƴ���ʽ
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
							//δ������������Ƴ�DOMԪ�ص�������ʽ
							elem.className = "";
						}
					}
				}
			}
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-4-14
	     * Ϊÿһ��DOMԪ����ӻ���ɾ��һ�����߶����ʽ
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
						//�Ȱ��Լ�����ʽ��������
						jQuery._data( this, "__className__", this.className );
					}
	
					// toggle whole className
					this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
				}
			});
		},
	    /**
	     * add by zhangjh    2016-4-14
	     * ���ڼ��ƥ��Ԫ�ؼ������Ƿ���ָ��������ʽ��ֻҪ�����е�һ��Ԫ�ؾͷ���true
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
	     * ���ڻ�ȡ��������DOMԪ�ص�valueֵ
	     * @param value
	     * @returns
	     */
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[0];
			if ( !arguments.length ) {
				//���û�д������
				if ( elem ) {
					//���ҽڵ����ƻ�����type��Ӧ����������
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
	        //��������˲�����������ÿ��Ԫ�ص�valueֵ
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
	     * ���ڻ�ȡ������HTML���ԡ�
	     * @param elem    DOMԪ��
	     * @param name    ������
	     * @param value   Ҫ���õ�����ֵ
	     * @param pass    ���HTML������jQuery����ͬ�����Ƿ����ͬ����jQuery������true����ã�false�򲻵���
	     * @returns
	     */
		attr: function( elem, name, value, pass ) {
			var ret, hooks, notxml,
			    //elemԪ�ص�����
				nType = elem.nodeType;
	
			// don't get/set attributes on text, comment and attribute nodes
			//�������ı��ڵ㡢ע�ͽڵ㡢���Խڵ�������html����
			if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	        
			if ( pass && name in jQuery.attrFn ) {
				//ִ��jQuery��ͬ������
				return jQuery( elem )[ name ]( value );
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
			    //����������֧��getAttribute�������jQuery.prop
				return jQuery.prop( elem, name, value );
			}
	        //�ж��Ƿ�Ϊxml�ڵ�
			notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
	
			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( notxml ) {
				name = name.toLowerCase();
				//��ȡ��Ӧ����������,�����������get��set����
				//��ȡHTML������������jQuery.attrHooks/����������������boolHook/���IE6��7��ͨ��HTML������������nodeHook
				//ֻ���ڲ�֧��get/setAttribute��ʱ��nodeHook����Ż����
				hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
			}
	
			if ( value !== undefined ) {
	            //��������
				if ( value === null ) {
					//�����������ֵ��null�����Ƴ�����
					jQuery.removeAttr( elem, name );
					return;
	
				} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
					//���ȵ��������������������
					return ret;
	
				} else {
					//����ԭ��̬��setAttribute������������
					elem.setAttribute( name, "" + value );
					return value;
				}
	
			} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
				//���ȵ������������get����
				return ret;
	
			} else {
	            //����ԭ��̬��getAttribute����
				ret = elem.getAttribute( name );
	
				// Non-existent attributes return null, we normalize to undefined
				return ret === null ?
					undefined :
					ret;
			}
		},
	    /**
	     * add by zhangjh   2016-4-10
	     * ���ڴ�DOMԪ�����Ƴ�һ�����߶��HTML���ԣ����HTML����֮���ÿո�ָ�
	     * @param elem    DOMԪ��
	     * @param value   HTML���Ի���HTML�����ַ���	
	     */
		removeAttr: function( elem, value ) {
			var propName, attrNames, name, l, isBool,
				i = 0;
	
			if ( value && elem.nodeType === 1 ) {
				//rspace = /\s+/, ���value�Ƕ���ÿո�ֿ���ֵ����ָ�������
				attrNames = value.toLowerCase().split( rspace );
				l = attrNames.length;
	
				for ( ; i < l; i++ ) {
					name = attrNames[ i ];
	
					if ( name ) {
						//�ж��������ǲ���������������ȡ����Ӧ��DOM������
						propName = jQuery.propFix[ name ] || name;
						//�ж��������ǲ���ֵΪ����ֵ��������
						isBool = rboolean.test( name );
	
						// See #9699 for explanation of this approach (setting first, then removal)
						// Do not do this for boolean attributes (see #10870)
						if ( !isBool ) {
							jQuery.attr( elem, name, "" );
						}
						//�жϵ�ǰ������������Ե�ʱ����ʹ��HTML���Ի��Ǳ���ʹ��DOM����
						elem.removeAttribute( getSetAttribute ? name : propName );
	
						// Set corresponding property to false for boolean attributes
						//�����ֵΪbool���͵����ԣ��򽫶�Ӧ��DOM������Ϊfalse
						if ( isBool && propName in elem ) {
							elem[ propName ] = false;
						}
					}
				}
			}
		},
	    /**
	     * add by zhangjh   2016-4-10
	     * ������������html���ԵĶ�ȡ�����÷���
	     */
		attrHooks: {
			//��Ҫ����������type
			type: {
				set: function( elem, value ) {
					// We can't allow the type property to be changed (since it causes problems in IE)
					//rtype = /^(?:button|input)$/i,
					if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
						//��IE9���޸��и�Ԫ�ص�button��inputԪ�ص�����type���Ի��׳��쳣
						jQuery.error( "type property can't be changed" );
					} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
						//radioValue=true,�޸�input��typeΪradioʱ����ı�valueֵ
						// Setting the type on a radio button after the value resets the value in IE6-9
						// Reset value to it's default in case type is set after value
						// This is for element creation
						var val = elem.value;
						//�����޸�type��ֵ��ʹvalue��ֵ�ı䣬���Ե��ȱ���ԭ����value��ֵ
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
					//���support��getSetAttributeΪfalse��ʱ��nodeHook�Ŵ���
					if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
						//IE6/7ͨ��value��ȡ��ֵ��innerHtmlֵ�����Ե�ͨ��DOMԪ�ص����Խڵ��ȡ
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
	    //����������
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
	     * ͨ��HTML��������ȡDOMԪ�ض�Ӧ��DOM���Ի�������DOM����
	     * @param elem   DOMԪ��
	     * @param name   HTML������
	     * @param value  ����ֵ
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
				//��ȡDOM������
				name = jQuery.propFix[ name ] || name;
				//��ȡ���ε���������
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				//���������valueֵ�������Ϊset����󷵻�valueֵ
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
	     * ������������propHooks�������Ҫ������DOM���ԺͶ�Ӧ����������
	     */
		propHooks: {
			//����ĵ���δ��ȷָ��HTML����tabindex����DOM����tabIndex�������Ƿ�����ȷ��ֵ
			tabIndex: {
				get: function( elem ) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					var attributeNode = elem.getAttributeNode("tabindex");
	
					return attributeNode && attributeNode.specified ?
						parseInt( attributeNode.value, 10 ) :
						//rfocusable = /^(?:button|input|object|select|textarea)$/i,
						rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
							//���ڿ��Ի�ý�����߿��Ե����Ԫ�أ�һ�ɷ���0
							0 :
							undefined;
				}
			}
		}
	});
	
	// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
	
	jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
	
	// Hook for boolean attributes
	//ע��html������ָ����htmlԪ���еĸ������ԣ�����˵class��style��title��
	//  DOM������ָDOMԪ�صĸ�������
	/**
	 * add by zhangjh   2016-3-26
	 * bool���͵����ԣ�html������Сд������������Ӧ��DOM������boolֵ
	 * ���ĳ��HTML���Զ�Ӧ��DOM���Ե�ֵ��bool���ͣ���ɸ�HTML����Ϊ������HTML���ԣ�����ֵΪСд��html����
	 * ע��������checkbox��checked��html���ԣ�����checked������ʲôֵ����Ӧ��checkbox��δѡ��״̬
	 */
	boolHook = {
		/**
		 * add by zhangjh   2016-3-26
		 * ����������HTML���ԵĶ�ȡ��ʽ��������Ӧ��DOM����ֵ�������µ�HTML����ֵ��
		 * @param elem  DOMԪ��
		 * @param name  ������
		 * 
		 * @returns  ���ص�html����ֵ
		 */
		get: function( elem, name ) {
			// Align boolean attributes with corresponding properties
			// Fall back to attribute presence where some booleans are not supported
			var attrNode,
			    //ȡ����Ӧ��DOM����ֵ
				property = jQuery.prop( elem, name );
			//getAttributeNode����name��Ӧ�����Խڵ㣻nodeValue�������Խڵ��������
			return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
				//������Ҫ���ص���html���ԣ�������Ҫ������������Сд
				name.toLowerCase() :
				undefined;
		},
		/**
		 * add by zhangjh  2016-3-26
		 * 
		 * @param elem  DOMԪ��
		 * @param value ����ֵ
		 * @param name  HTML������
		 * @returns
		 */
		set: function( elem, value, name ) {
			var propName;
			if ( value === false ) {
				// Remove boolean attributes when set to false
				//���Ҫ��������Ϊfalse�����Ƴ�����
				jQuery.removeAttr( elem, name );
			} else {
				// value is true since we know at this point it's type boolean and not false
				// Set boolean attributes to the same name and set the DOM property
				//ȡ��HTML��������Ӧ��DOM������
				propName = jQuery.propFix[ name ] || name;
				if ( propName in elem ) {
					// Only set the IDL specifically if it already exists on the element
					//�����������������DOMԪ���д��ڣ�������Ϊtrue
					elem[ propName ] = true;
				}
	            //����elem html����ΪСд��������
				elem.setAttribute( name, name.toLowerCase() );
			}
			//����������
			return name;
		}
	};
	
	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if ( !getSetAttribute ) {
		
	    //��������getAttribute��setAttribute��removeAttribute������ȷ�����á���ȡ���Ƴ�html����
		//IE6/IE7����ͨ��DOM���������������ԣ�������ͨ��HTML����������������
	
		fixSpecified = {
			name: true,
			id: true,
			coords: true
		};
	
		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		/**
		 * add by zhangjh   2016-4-9
		 * ���ԭ����������getAttribute��setAttribute��removeAttribute������ȷ�����á���ȡ���Ƴ�html���Ե�ʱ��
		 * �򴴽�ͨ��HTML������������
		 */
		nodeHook = jQuery.valHooks.button = {
			
			get: function( elem, name ) {
				var ret;
				//Ϊʲôͨ��getAttributeNode����ȡ���Խڵ�
				//ͨ��getAttributeNode��ȡ���Խڵ��ʱ������Ķ���HTML����
				ret = elem.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
					//ret.soecifiedΪfalse��ʾ�ĵ���Ϊ���ù���html����
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
	//IE6/IE7����ͨ��styleֱ�ӻ�ȡ��������
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
	
	
	
/************************************************************   �¼�ϵͳģ��   *****************************************************************/	
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
	//jQuery�¼�ϵͳ
	jQuery.event = {
        /**
         * add by zhangjh  2016-4-21
         * ����ΪDOMԪ�ذ�һ�����߶�����͵��¼���������
         * @param elem     �����¼���DOMԪ��
         * @param types    �¼�����
         * @param handler  ���󶨵��¼���������
         * @param data     �Զ������ݣ��������κ�����
         * @param selector һ��ѡ�������ʽ�ַ��������ڰ󶨴����¼�(����<ul><li>a</li><li>b</li></ul>����elem�൱��elem��li�൱��selector)
         */
		add: function( elem, types, handler, data, selector ) {
	        /*
	         * elemData:     ָ��DOMԪ�ع����Ļ������
	         * eventHandle:  ָ������������
	         * events: DOMԪ�ض�Ӧ���¼���������
	         * 
	         * handleObj:��װ���¼������ļ�������
	         * handleObjIn:����ļ�������
	         * handlers:������������
	         * special:�����¼����Ͷ�Ӧ����������
	         */
			var elemData, eventHandle, events,
				t, tns, type, namespaces, handleObj,
				handleObjIn, quick, handlers, special;
	
			// Don't attach events to noData or text/comment nodes (allow plain objects tho)
			/**
			 * nodeType===3 �����ı��ڵ��ϰ��¼�
			 * nodeType===8 ����ע�ͽڵ��ϰ��¼�
			 * !type||!handler ���û�д����¼����ͻ��߼������������Ա��ε���
			 * !elemData=jQuery.data(elem) �����ȡ����elem��Ӧ�����ݻ�����󼴲�֧�ָ�����չ���ԣ� ���Ա��ε���
			 */
			if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			//handler��һ���Զ���ļ�������
			if ( handler.handler ) {
				//���handler�Ǽ�������
				handleObjIn = handler;
				//����handler��handlerΪ���󶨵��¼���������
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			//Ϊ������������һ��Ψһ��ʶguid���Ƴ���������ʱ����ͨ�����Ψһ��ʶ��ƥ���������
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			//ȡ���¼��������events��events���ڴ�ŵ�ǰԪ�ع��������м�������
			events = elemData.events;
			if ( !events ) {
				//��ʾ��δ�ڵ�ǰԪ���ϰ󶨹��¼�����events��ʼ��Ϊһ���ն���
				elemData.events = events = {};
			}
			//ȡ������������
			eventHandle = elemData.handle;
			if ( !eventHandle ) {
				//��ʼ������������
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
			//�Ѳ���typesת��Ϊ���飬��֧��һ�ΰ󶨶���¼�
			types = jQuery.trim( hoverHack(types) ).split( " " );
			//�����¼��������飬������¼�
			for ( t = 0; t < types.length; t++ ) {
	            //rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
				//������������
				tns = rtypenamespace.exec( types[t] ) || [];
				type = tns[1];
				//�����ռ�.a.b.c���ָ�������[a,b,c]
				namespaces = ( tns[2] || "" ).split( "." ).sort();
	
				// If event changes its type, use the special event handlers for the changed type
				//��ȡ��ǰ�¼����Ͷ�Ӧ����������
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				//��������typeΪʵ��ʹ�õ��¼�����
				//���������selector�����������󶨵��Ǵ����¼���������Ҫ�ѵ�ǰ�¼���������Ϊ��ð�ݵ��¼�����  special.delegateType
				//���δ����selector��������������ͨ�¼��󶨣����������������ĳЩ�����¼���֧�ֻ���֧�ֵĲ��Ǻ���������Ҫ����Ϊ֧�ֶ� ���õ��¼����� special.bindType
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				//�¼����Ϳ����Ѿ������ı䣬��Ҫ�ٴγ��Ի�ȡ��Ӧ����������
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				//��װ��������Ϊ��������
				handleObj = jQuery.extend({
					type: type,                                     //ʵ��ʹ�õ��¼����ͣ������������ռ䣬�����Ѿ���������
					origType: tns[1],                               //ԭʼ�¼����ͣ������������ռ䣬δ��������
					data: data,                                     //�Զ�����¼����ݣ���
					handler: handler,                               //���󶨵��¼���������
					guid: handler.guid,                             //����������Ψһ��ʶguid
					selector: selector,                             //�����ѡ�������ʽ�������¼�����
					quick: selector && quickParse( selector ),      //�������ѡ�������ʽ�Ľ�����������ڼӿ�Ժ��Ԫ�صĹ����ٶ�
					namespace: namespaces.join(".")                 //�����������ռ�
					//handleObjIn�Ǵ���ļ�������������и������չ���ԣ���һ������Щ��չ������ӵ�����������
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				//��ʼ�������������飬������������
				handlers = events[ type ];
				if ( !handlers ) {
					//����ǵ�һ�ΰ󶨸����͵��¼�����Ѽ�����������handlers��ʼ��Ϊһ��������
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener/attachEvent if the special events handler returns false
					//����ǵ�һ�ΰ󶨸����͵��¼����������������
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						// Bind the global event handler to the element
						if ( elem.addEventListener ) {
							//IE9+�����������
							elem.addEventListener( type, eventHandle, false );
	
						} else if ( elem.attachEvent ) {
							//IE9���µ������
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}
	            //������������������������
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					//��������˲���selector����󶨵��Ǵ����¼����Ѵ���ͣ�����������handlers.delegateCount��ָ����λ��
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				//��¼�󶨹����¼�����
				jQuery.event.global[ type ] = true;
			}
	
			// Nullify elem to prevent memory leaks in IE
			//�Ӵ�����elem��DOMԪ�ص����ã������ڴ�й¶
			elem = null;
		},
	
		global: {},
	
		// Detach an event or set of events from an element
		/**
		 * add by zhangjh   2016-4-23
		 * �����Ƴ�DOMԪ�ذ󶨵�һ�����߶�����͵��¼���������
		 * @elem                 ���Ƴ��¼���DOMԪ��
		 * @types                �¼������ַ���
		 * @handler              ���Ƴ����¼���������
		 * @selector             һ��ѡ�������ʽ�������Ƴ������¼�
		 * @mappedTypes          ָʾ�Ƴ��¼�ʱ�Ƿ��ϸ����¼�������
		 */
		remove: function( elem, types, handler, selector, mappedTypes ) {
	       /**
	        * elemData:                  ָ��ǰDOMԪ�ع����Ļ������
	        * origType:
	        * namespaces:                �����ռ�
	        * origCount:                 type��Ӧ�ļ�������ĸ���
	        * 
	        * events:                    ָ��DOMԪ�ع��������ݻ��������¼��������
	        * handle:
	        * eventType:
	        * handleobj:                 ��������
	        */
			var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
				t, tns, type, origType, namespaces, origCount,
				j, events, special, handle, eventType, handleObj;
	       
			if ( !elemData || !(events = elemData.events) ) {
				//���DOMԪ�ع��������ݻ������������ݻ�������в������¼����������ֱ�ӷ���
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			//ת���¼�����typesΪ��������  ��hoverHack����������¼��ֽ⣿����
			types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
			
			for ( t = 0; t < types.length; t++ ) {
				//�����¼����ͺ������ռ�
				tns = rtypenamespace.exec( types[t] ) || [];
				//�¼�����
				type = origType = tns[1];
				//�����ռ�
				namespaces = tns[2];
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					//���type�ǿ��ַ�����û��ָ�����ͣ�������ָ���������ռ�
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	            //���Դ��¼���������jQuery.event.special�л�ȡ��ǰ�¼����Ͷ�Ӧ�������������δȡ������Ĭ��Ϊһ���ն���
				special = jQuery.event.special[ type ] || {};
				//��������typeΪʵ��ʹ�õ��¼����ͣ����������selector�����Ƴ����Ǵ����¼���������Ҫ�ѵ�ǰ�¼���������Ϊ��ð�ݵ��¼�����
				//���δ�������selector��������ͨ�Ƴ��������������ĳЩ�����¼���֧�ֻ�֧�ֵĲ���������Ҫ����Ϊ֧�ֶȸ��õ��¼�����(special.bindType)
				type = ( selector? special.delegateType : special.bindType ) || type;
				//���¼��������events��ȡ����ǰ�¼����Ͷ�Ӧ�ļ�����������
				eventType = events[ type ] || [];
				//��������ĸ���
				origCount = eventType.length;
				//������������ռ䣬��������ռ�ת��Ϊһ��������ʽ�����ڼ���Ѱ��¼��������ռ�ʱ�������types�е������ռ�ƥ��
				namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
	
				// Remove matching events
				//���������������飬�����Ƴ�ƥ��ļ�������
				for ( j = 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];
	                     //����Ҫ���ԭʼ�¼����ͻ��߼��������ԭʼ�¼������봫������
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						 //û��ָ�������������߼���������ָ���ļ�������������ͬ��Ψһ��ʶguid
						 ( !handler || handler.guid === handleObj.guid ) &&
						 //û�������ռ���߼�������������ռ京��ָ���������ռ�
						 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
						 //û�д���ѡ�������ʽ�����߼��������ѡ�������ʽ�봫������
						 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
						//ɾ����������
						eventType.splice( j--, 1 );
	                    //������Ƴ��ļ�������������selector�����൱��һ�������������
						if ( handleObj.selector ) {
							eventType.delegateCount--;
						}
						//�������������remove���������ִ��������Ƴ���Ϊ
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				//���������������Ϊ�գ����Ƴ�����������
				if ( eventType.length === 0 && origCount !== eventType.length ) {
					if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove the expando if it's no longer used
			//����¼��������Ϊ�ն�����ӻ��������ɾ������events��handle
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
	     * �����ֶ������¼���ִ�а󶨵��¼�����������Ĭ����Ϊ�����һ�ģ��ð�ݹ���
	     * @param event    ���������¼����������¼����ͻ����¼�����
	     * @param data     ������������������������
	     * @param elem     DOMԪ��
	     * @param onlyHandlers  booleanֵ��ֻ���Ƿ�ִֻ�м��������������ᴥ��Ĭ����Ϊ
	     * @returns
	     */
		trigger: function( event, data, elem, onlyHandlers ) {
			// Don't do events on text and comment nodes
			//������ı��ڵ����ע�ͽڵ㣬����
			if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
				return;
			}
	
			// Event object or event type
			/**
			 * type             �����¼�����
			 * namespace        �����ռ�����
			 * cache            ȫ�ֻ������
			 * exclusive        ָʾ�Ƿ�ֻ����û�������ռ���¼�
			 * special          �¼����͵���������
			 * handle           �����¼�����
			 * eventPath        ð��·������
			 * bubbleType       ð���¼�����
			 */
			var type = event.type || event,
				namespaces = [],
				cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			//rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
			//jQuery.event.triggered???   ָʾ�����ڴ���Ĭ����Ϊ���¼����ͣ��������ڴ�����Ϊǰ������Ϊ�¼����ͣ�����������Ϊundefined
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	        //����Ƿ�ֻ����û�������ռ�ļ�������
			if ( type.indexOf( "!" ) >= 0 ) {
				//����¼������ԡ�!����������ʾֻ�ᴥ��û�������ռ�ļ�������
				// Exclusive events trigger only for the exact event (no namespaces)
				//ȥ��ĩβ�ģ�
				type = type.slice(0, -1);
				exclusive = true;
			}
	        //�����¼����ͺ������ռ�
			if ( type.indexOf( "." ) >= 0 ) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}
	
			if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
				//δ����elem����ʾҪ�������Ǹ����͵������¼������ǲ��ᴥ�����ڼ���������Ĭ����Ϊ������
				// No jQuery handlers for this event type, and it can't have inline handlers
				return;
			}
	
			// Caller can pass in an Event, Object, or just an event type string
			//eventΪjQuery�¼�����
			event = typeof event === "object" ?
				// jQuery.Event object
				event[ jQuery.expando ] ? event :
				// Object literal
				new jQuery.Event( type, event ) :
				// Just the event type (string)
				new jQuery.Event( type );
	        
			event.type = type;
			//isTrigger��ʾ���ڴ�������¼�
			event.isTrigger = true;
			//exclusiveָʾ�Ƿ�ֻ����û�������ռ�ļ�������
			event.exclusive = exclusive;
			//�����ռ�
			event.namespace = namespaces.join( "." );
			//�����ռ��������ڼ���Ѱ��¼��������ռ��Ƿ�Ͳ���event�е������ռ�ƥ��
			event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
			//���캬��ǰ׺��on�����¼����͡�ontype��,���ڵ��ö�Ӧ�����ڼ�������
			ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";
	
			// Handle a global trigger
			//���û�д������elem����û��ָ��DOMԪ�أ��������а󶨹������͵�Ԫ�����ֶ�������Ӧ���͵ļ�������
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
			//�����¼�����result�����ڴ���¼����������ķ���ֵ
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			//��event��data��װΪ����
			data = data != null ? jQuery.makeArray( data ) : [];
			data.unshift( event );
	
			// Allow special events to draw outside the lines
			//�������¼����Ͷ���
			special = jQuery.event.special[ type ] || {};
			if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			
			
			//�ӵ�ǰԪ�س���������DOM������ð�ݣ�����һ��ð��·��
			//elem ��ǰԪ��    type  �¼�����
			eventPath = [[ elem, special.bindType || type ]];
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	            //onlyHandlersΪtrueʱ����ʾֻ������ǰԪ���ϵļ������������ᴥ��Ĭ����Ϊ������ģ��ð����Ϊ
				//noBubbleΪtrueʱ����ʾ������ð����Ϊ
				//�����ǰԪ����window���Ѿ��������Ԫ�أ�������ð����Ϊ
				
				//����ʹ�����������delegateType���ԣ���������ָ���˵�ǰ�¼���������Ӧ��ð���¼�����
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
			//����ð��·����Ԫ�ص����������������ڼ�������
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
			//����Ĭ����Ϊ
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
	     * ����ַ���ִ�м���������Ϊִ�м��������ṩ�ײ�֧��
	     * @param event    �¼�����
	     *   ����¼�������������������event��ԭ���¼����󣬺���Ĵ���������װ��jQuery�¼�����
	     *   ����¼����ֶ������ģ������event��jQuery�¼�����
	     *   IE9һ�µ�������ڴ����¼��ǲ����ԭ���¼����󴫵ݸ���������������ͨ��window.event����ȡ
	     * @returns
	     */
		dispatch: function( event ) {
	
			// Make a writable jQuery.Event from the native event object
			//���÷���jQuery.event��fix��ԭ���¼���װΪjQuery�¼�����
			//IE9���µ�������ڴ����¼�ʱ�����ԭ���¼����󴫵ݸ�������������Ҫͨ������window.event
			event = jQuery.event.fix( event || window.event );
	        //handlersָ��ǰ�¼����Ͷ�Ӧ�ļ�����������
			var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			    //������������λ�ü�������ָʾ����һ�������������Ĳ���λ�ú���ͨ�����������ʼ����λ�ã�Ҳ��ʾ���Ѱ󶨵Ĵ�������������
				delegateCount = handlers.delegateCount,
				//�����������argumentsת��Ϊ����������
				args = [].slice.call( arguments, 0 ),
				//ָʾ�Ƿ�ִ�е�ǰ�¼����͵����м���������true��ʾִ�е�ǰ�¼����͵���������������false��ʾִ���뵱ǰ�¼����ͺ������ռ�ƥ��ļ�������
				//exclusive???
				run_all = !event.exclusive && !event.namespace,
				//����type
				special = jQuery.event.special[ event.type ] || {},
				//��ִ�ж��У������˺��Ԫ��ƥ��Ĵ���������������Լ���ǰԪ���ϰ󶨵���ͨ������������
				handlerQueue = [],
				i, j,
				//�����¼�ʱָ��ĳ�����Ԫ��
				cur,
				//����ĳ�����Ԫ�ص�jQuery����
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
			//thisָ����ǰ��¼��ĵ�ǰԪ�أ��¼���������ͨ�¼���Ҳ�����Ǽ����¼�
			//event.delegateTarget??
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			//preDispatch ???
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers that should run if there are delegated events
			// Avoid non-left-click bubbling in Firefox (#3861)
			//���Ϊ��ǰԪ�ذ��˴����¼�������ȡ���Ԫ��ƥ��Ĵ��������������
			if ( delegateCount && !(event.button && event.type === "click") ) {
	
				// Pregenerate a single jQuery object for reuse with .is()
				//�õ�ǰԪ�ع���һ��jQuery����
				//����jQuery.event.dispatchһ����.call(elem,...)ʹ�ã�����thisӦ��ָ�����elemԪ��
				//this->����Ԫ��
				jqcur = jQuery(this);
				//
				jqcur.context = this.ownerDocument || this;
	            //������forѭ����ȡ���Ԫ��ƥ��Ĵ��������������
				for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
	                //��һ��ѭ�������ش����¼���Ԫ�ص�����Ԫ������·���ϵ����к��Ԫ��
					// Don't process events on disabled elements (#6911, #8165)
					//cur�Ǵ����¼���Ԫ��
					if ( cur.disabled !== true ) {
						//selMatch���ڴ洢���Ԫ���������������ѡ�������ʽ������ƥ����
						selMatch = {};
						//matches���ڴ洢���Ԫ��ƥ������д����������
						matches = [];
						jqcur[0] = cur;
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
							sel = handleObj.selector;
	                        //�����Ԫ���������������ѡ�������ʽ�Ƿ�ƥ��
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
			//��ȡ����Ԫ���ϰ󶨵���ͨ������������
			if ( handlers.length > delegateCount ) {
				handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
			}
	
			// Run delegates first; they may want to stop propagation beneath us
			//ִ�к��Ԫ��ƥ��Ĵ��������������ʹ���Ԫ���ϰ󶨵���ͨ������������
			for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
				matched = handlerQueue[ i ];
				//�ѵ�ǰ����ִ�м���������Ԫ�ظ�ֵ��event.currentTarget
				event.currentTarget = matched.elem;
	
				for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
					//��ȡ��������
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
		//�¼�����Ĺ�������
		/**
		 * attrChange   ??
		 * attrName     ??
		 * relatedNode  ??
		 * srcElement           �����¼��Ķ��������
		 * altKey��ctrlKey       �¼�������alt��ctrl���Ƿ񱻰���
		 * bubbles              ָʾ�¼��Ƿ��ǿ�ð�ݵ�����
		 * cancelable           ָʾ�¼��Ƿ���Ա�ȡ��
		 * currentTarget        �����¼��Ķ�������ã���sreElement��һ��
		 * eventPhase           �¼������ĵ�ǰ�׶� 1��ʾ�¼��ڲ���׶����У�2��ʾ�¼����ɷ��׶����У�3��ʾ�¼���ð�ݽ׶�����
		 * relatedTarget        �������¼���Ŀ��ڵ���صĽڵ� 
		 * target               �����¼��Ķ�Ӧ�����ã�IE������õ���srcElement
		 * timeStap             �����¼����ɵ����ں�ʱ�䡣
		 * button               �Ǹ���갴ť������
		 * view                 ���¼������ĳ�����ͼ����ͬ�ڷ����¼���window����
		 * which                ָʾ��ꡢ���̲�����ʱ���
		 */
		props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
	    //�¼�������������
		/**
		 * fixHooks:{
		 *     key:keyHooks,
		 *     mouse/click...:mouseHooks
		 * }
		 */
		fixHooks: {},
		//�¼���������Ǽ����¼�������¼�
	    //�����¼���������Ժ���������
		keyHooks: {
			//�����¼���ר������
			// char       ��ʾһ�����������Ŀɴ�ӡ�ַ��룬�ַ���   ����
			// charCode   ��ʾһ�����������Ŀɴ�ӡ�ַ��룬��ֵ�ͣ���
			// key        ��ʾһ�����������ĽϵͲ�εġ����ⰴ���롱���ַ�����
			// keyCode    ��ʾһ�����������ĽϵͲ�εġ����ⰴ���롱����ֵ��
			props: "char charCode key keyCode".split(" "),
			/**
			 * add by zhangjh   2016-4-21
			 * �������������¼���ר������
			 * @param event    jQuery�¼�����
			 * @param original   ԭ���¼�����
			 * @returns
			 */
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					//���which���Բ�����
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
	    //����¼���������Ժ���������
		mouseHooks: {
			/**
			 * add by zhangjh  2016-4-21
			 * ����¼���ר������
			 * button:ָʾ�¼�������ʱ�ĸ���갴�������  DOM2
			 * buttons: ���¼�������ʱ�ĸ���갴�������  DOM3
			 * clientX, clientY: �ֱ��ʾ���ָ������ڴ������Ͻǵ�X�����Y����
			 * offsetX, offsetY: �ֱ��ʾ���ָ��������¼�ԭԪ�����Ͻǵ�X�����Y����
			 * pageX��pageY: �ֱ��ʾ���ָ������������ĵ����Ͻǵ�X�����Y����
			 * screenX��screenY: �ֱ��ʾ���ָ���������ʾ�����Ͻǵ�X�����Y����
			 * formElemnt: ��ʾmouseover�¼�������뿪���ĵ�Ԫ��
			 * toElement: ��ʾmouseout�¼�����������ĵ�Ԫ��(mouseover��mouseoutһ�����ʹ��)
			 */
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			/**
			 * add by zhangjh   2016-4-21
			 * ������������¼���ר������
			 * @param event     jQuery�¼�����
			 * @param original  ԭ�����¼�����
			 * @returns
			 */
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button,
					//mouseover��mouseout�¼�����ʱfromElement�Ż���ֵ
					fromElement = original.fromElement;
	
				// Calculate pageX/Y if missing and clientX/Y available
				//�е���������ܲ�֧��pageX��pageY
				if ( event.pageX == null && original.clientX != null ) {
					//����������֧���ĵ�����pageX��pageY,���ֶ���������
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	                //�ĵ������� = ����������+��������Ŀ�Ȱ�-�ĵ���߿���
					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					//�ĵ������� = ����������+�Ϲ������Ŀ��-�ĵ��ϱ߿���
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add relatedTarget, if necessary
			    //���������¼�����relatedTarget�����ڣ������¼�����fromElement���ڣ�˵����IE9һ��
				//������mouseenter��mouseleave��mouseover��mouseout�е�һ��
				if ( !event.relatedTarget && fromElement ) {
					//�����¼�����relatedTargerΪfromElement����toElement
					//mouseover��mouseenter����������ʱ��target=toElement��relatedTarget����ΪfromElement
					//mouseout��mouseleave����������ʱ��target=fromElement��relatedTarget����ΪtoElement
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					//����¼�����witch�����ڣ����¼�����button��ֵΪ:���1���м�4���Ҽ�2
					//�����갴�µ��������which����Ϊ1��
					//�����갴�µ��Ҽ���which����Ϊ3��
					//�����갲�ص����м�ļ���which����Ϊ2
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		},
	    /**
	     * add by zhangjh   2016-4-21
	     * ��������jQuery�¼�����event
	     * @param event  ������ԭ���¼�����Ҳ������jQuery�¼�����
	     * @returns
	     */
		fix: function( event ) {
			//�ж��Ƿ���jQuery�¼����������ֱ�ӷ���event
			if ( event[ jQuery.expando ] ) {
				return event;
			}
	
			// Create a writable copy of the event object and normalize some properties
			var i, prop,
			    //��originalEvent����ԭ���¼�����
				originalEvent = event,
				//��ȡ��Ӧ����������,fixHooksΪ�¼�������������
				//���type��key�¼�����fixHook��ʱ�൱��keyHook�����type������¼�����fixHook��ʱ�൱��mouseHook
				fixHook = jQuery.event.fixHooks[ event.type ] || {},
				//�ϲ������¼����Ժ�ר���¼�����      ���thisָ��jQuery.enents???(fix���¼�ϵͳ����jQuery.event��һ��������thisָ��jQuery.events)
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
	        //����jQuery.Event��ԭ���¼������װΪjQuery�¼�����
			event = jQuery.Event( originalEvent );
	        //��һ��forѭ���Ѻϲ�����¼����Դ�ԭ���¼������Ƶ�jQuery�¼�������
			//copy������һ������
			for ( i = copy.length; i; ) {
				//�����ظ���ȡ
				prop = copy[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
			//target��ʾ������ǰ�¼���Ԫ�أ�����ִ��������ĸ������Բ���������jQuery�¼�����Ҳ����target���ԣ����û�еĻ��������¸�ֵ
			//�¼������target�����Ǻ���Ҫ�ģ�һ��������¼����󶼻���target����(IE6/7/8ΪsreElement����)�����eventû��target����Ҳû��srcElement���ԣ�����event.targetΪdocument
			if ( !event.target ) {
				//srcElementҲ��ʾ������ǰ�¼���Ԫ�أ�������IE�¼����������
				event.target = originalEvent.srcElement || document;
			}
	
			// Target should not be a text node (#504, Safari)
			if ( event.target.nodeType === 3 ) {
				//��Ӧ�����ı��ڵ��ϴ����¼������target��һ���ı��ڵ㣬������Ϊ���ĸ�Ԫ��
				event.target = event.target.parentNode;
			}
	
			// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
			//�¼�����metaKeyָʾMeta���Ƿ񱻰���
			if ( event.metaKey === undefined ) {
				//���û�У���Ctrl����
				event.metaKey = event.ctrlKey;
			}
	        //�����¼����Զ������������filter����������¼����ԡ������ص�ǰjQuery�¼�����
			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
		},
	    //���������¼��İ󶨡������������Ƴ���Ϊ���ö����д����ʱ�����ͺ�������Ӧ��ӳ��
		special: {
			//����special������ֻ����һ����������setup��ָ��jQuery.bindReady,����ȷ���ڰ�ready�¼�֮ǰ����صĳ�ʼ�������Ѿ����
			ready: {
				// Make sure the ready event is setup
				//����ִ���������������������Ϊ������ִ�б���ĳ�ʼ���������ڵ�һ�ΰ󶨵�ǰ���͵��¼�ʱ������
				setup: jQuery.bindReady
			},
	        //����loadֻ����һ��noBubble���ԣ���ʾ������load�¼�ð��
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				//��ʾ��ǰ�¼����Ͳ�֧�ֻ��߲�����ð����Ϊ
				noBubble: true
			},
	        //
			focus: {
				//delegateType   ָʾ�󶨴����¼�ʱʹ�õ��¼����� 
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
	            //����ִ������������������Ƴ���Ϊ���ڵ�ǰ���͵��¼��Ƴ��󱻵���
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
	    //ģ���¼�
		/**
		 * add by zhangjh  2016-5-12 
		 * @type           Ҫģ����¼�����
		 * @elem           ��ģ���¼���Ԫ��
		 * @event          ָ��һ��ԭ���¼������һ���ѷַ���jQuery�¼�����
		 * @bubble         ����ֵ��ָʾ�Ƿ�ģ��ð�ݹ���
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
				//����trigger�����ֶ������¼�����ģ��ð�ݹ���
				jQuery.event.trigger( e, null, elem );
			} else {
				//�ڵ�ǰԪ���Ϸַ���ִ���¼�
				jQuery.event.dispatch.call( elem, e );
			}
			if ( e.isDefaultPrevented() ) {
				//���ĳ������������ֹ��Ĭ����Ϊ����ͬ������ԭ���¼������Ĭ����Ϊ
				event.preventDefault();
			}
		}
	};
	
	// Some plugins are using, but it's undocumented/deprecated and will be removed.
	// The 1.7 special event interface should provide all the hooks needed now.
	jQuery.event.handle = jQuery.event.dispatch;
	//�Ƴ�����������
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
		
	/****************************************   �����¼������캯���͹��캯����ԭ��prototype***************************************************************/
	/**
	 * add by zhangjh   2016-4-19
	 * ���캯�������ڴ���һ��jQuery�¼����󣬸ú����ᱸ��ԭ���¼�����Ȼ�������¼�����type��isDefaultPrevented��timeStamp��
	 * �����ñ��jQuery.expando
	 * @param src    ������ԭ���¼����͡��Զ����¼����͡�ԭ���¼��������jQuery�¼�����
	 * @param props  ��ѡ��js�������е����Ա����õ��´�����jQuery�¼�����
	 * @returns {jQuery.Event}
	 */
	jQuery.Event = function( src, props ) {
		// Allow instantiation without the 'new' keyword
		//һ�����������ͨ�� new ���ã�thisָ���������Ҫ���ɵĶ��������ͨ��new ���ã�һ���������˭��������thisָ��˭
		if ( !(this instanceof jQuery.Event) ) {
			//�����캯������ͨ��new���õ�ʱ���Զ�����new
			return new jQuery.Event( src, props );
		}
	
		// Event object
		//����ԭ���¼����������¼�����type��isDefaultPrevented
		if ( src && src.type ) {
			//ͨ��src.type���ж�src�ǲ���ԭ�����¼�����
			//����ԭ���¼�����
			this.originalEvent = src;
			//����ԭ���¼���type����
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			//�����ǰʱ����ð�ݹ������Ѿ�����һ�����Ͳ��ʱ���ͦ������ֹ��Ĭ����Ϊ��������ΪreturnTure������ΪreturnFalse��������
			this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
				src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;
	
		// Event type
		} else {
			//�������src���¼�����
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			//��props�����Զ���ӵ����ɵ�jQuery�¼�������
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		//ָʾ����������¼���ʱ�䣬��λΪ���룬IE9һ�µ��������ԭ���¼�����û��timeStamp����
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		//Ϊ��ǰjQuery�¼��������ñ��
		this[ jQuery.expando ] = true;
	};
	//����false
	function returnFalse() {
		return false;
	}
	//����true
	function returnTrue() {
		return true;
	}
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		/**
		 * add by zhangjh  2016-4-19
		 * jQueryʱ�����ķ�����������ֹ��ǰ�¼���Ĭ����Ϊ
		 */
		preventDefault: function() {
			//isDefaultPrevented()�����ж��Ƿ��ڵ�ǰjQuery�¼������ϵ��ù�����preventDefault
			//returnTrue��һ������������true
			this.isDefaultPrevented = returnTrue;
	        //originalEvent��ʾjQuery�¼������ԭ������
			var e = this.originalEvent;
			if ( !e ) {
				//˵����һ���Զ�����¼����󣬲�����Ĭ����Ϊ
				return;
			}
	
			// if preventDefault exists run it on the original event
			/**
	         *preventDefault ֪ͨ Web �������Ҫִ�����¼�������Ĭ�϶�����������������Ķ�����
	         *����  <a href="http://www.baidu.com" id="test1">baidu</a>
	         *    var test1 = document.getElementById("test1");
	         *    test1.onclick = function(e){alert("123");e.preventDefault();}
	         *    ͨ��e.preventDefault()������֯a��Ĭ�϶�����Ҳ��������
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
		 * ����ֹͣ�¼���������ֹ�κ�����Ԫ���յ�����¼�
		 */
		stopPropagation: function() {
			this.isPropagationStopped = returnTrue;
	
			var e = this.originalEvent;
			if ( !e ) {
				//˵����һ���Զ�����¼����󣬲�����ʱ�䴫����Ϊ
				return;
			}
			// if stopPropagation exists run it on the original event
			/**
			 * stopPropagation������:��ֹ�¼�ð�ݣ����ǰ��ڵ�ǰԪ���ϵ��¼��Ի�ִ��
			 */
			if ( e.stopPropagation ) {
				e.stopPropagation();
			}
			// otherwise set the cancelBubble property of the original event to true (IE)
			e.cancelBubble = true;
		},
		/**
		 * add by zhangjh   2016-4-19
		 * ����ֹͣ��ǰԪ���ϵ��¼���ֹͣ�¼�����
		 */
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		},
		//������������ʲô�ã�����
		isDefaultPrevented: returnFalse,
		//????
		isPropagationStopped: returnFalse,
		//???
		isImmediatePropagationStopped: returnFalse
	};
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	//��ʼ���¼�mouseenter��mouseleave��submit��change��focus��blur��Ӧ����������
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
	 * ���submit�¼�����DOM������ð�ݣ��������submitBubbleΪtrue
	 * IE6/7/8submit�¼�����ð�ݣ�����Ϊfalse��������������Ļ�����Ҫ����
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
	 * ���change�¼�����DOM������ð�ݣ���changeBubblesΪtrue
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
	//ΪjQuery���캯����ԭ��prototype��ӷ���
	jQuery.fn.extend({
	    /**
	     * add by zhangjh  2016-4-21
	     * Ϊƥ��Ԫ�ؼ����е�ÿ��Ԫ�ذ�һ���������͵��¼���������
	     * @param types         �¼������ַ���������¼�����֮���ÿո����
	     * @param selector      һ��ѡ�������ʽ�ַ��������ڰ󶨴����¼�,ָ������Ԫ�ص���Ԫ��
	     * @param data          ���ݸ��¼������������Զ������ݣ��������κ�����
	     * @param fn            ���󶨵ļ�������������Ӧ���͵��¼�������ʱ���ü�����������ִ��
	     * @param one           �����ڲ�ʹ��
	     * @returns
	     */
		on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
			var origFn, type;
	
			// Types can be a map of types/handlers
			//�������types�Ƕ�����ݹ���÷���on
			if ( typeof types === "object" ) {
				//�������types�Ƕ��󣬴�ʱtype����������һ������{type1:fn1,type2:fn2,type3:fn3...}
				// ( types-Object, selector, data )
				if ( typeof selector !== "string" ) { // && selector != null
					// ( types-Object, data )
					//���selector�����ַ�������data����Ϊdata||selector
					data = data || selector;
					selector = undefined;
				}
				//��������types���ݹ���÷���.on(types��selector��data��fn��one)���¼�
				for ( type in types ) {
					this.on( type, selector, data, types[ type ], one );
				}
				//����֧����ʽ����
				return this;
			}
	        //���ݴ�������Ĳ�ͬ����fn��������
			if ( data == null && fn == null ) {
				// ( types, fn ),$("#id").on("click",function(){});
				//����fn
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
			//�������fn�ǲ���ֵfalse�����������Ϊ�ܷ���false�ĺ���
			if ( fn === false ) {
				fn = returnFalse;
			} else if ( !fn ) {
				//û�м����������򷵻ص�ǰjQuery����
				return this;
			}
	
			if ( one === 1 ) {
				//����oneΪ1��ʱ����Ҫ�Ѳ���fn��װΪһ��ֻ��ִ��һ�ε��¼�������
				origFn = fn;
				fn = function( event ) {
					// Can use an empty set, since event contains the info
					//���Ƴ��¼�
					jQuery().off( event );
					//�ٴ�����������
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
		 * ����Ϊƥ��Ԫ�ؼ����е�ÿ��Ԫ�ذ�һ�����߶�����͵��¼�����������ÿ������������ÿ��ƥ��Ԫ�������ִ��һ��
		 */
		one: function( types, selector, data, fn ) {
			return this.on( types, selector, data, fn, 1 );
		},
		/**
		 * add by zhangjh   2016-4-23
		 * �����Ƴ�ƥ��Ԫ�ؼ�����ÿ��Ԫ���ϰ󶨵�һ���������͵ļ�������
		 * @param types     һ�������ո�ָ���ʱ�����ͺͿ�ѡ�������ռ�
		 * @param selector  һ��ѡ�������ʽ�ַ����������Ƴ������¼�
		 * @param fn        ���Ƴ��ļ�������
		 * @returns
		 */
		off: function( types, selector, fn ) {
			//���types�Ǳ��ַ���jQuery�¼�����
			if ( types && types.preventDefault && types.handleObj ) {
				//���type.preventDefault���ڣ�˵���ò�����һ���¼�����  ������
				//���type.handleObj���ڣ�˵���ò�����һ���ַ���jQuery�¼����󣿣���
				// ( event )  dispatched jQuery.Event
				//ȡ��jQuery�¼��������õļ�������
				var handleObj = types.handleObj;
				//types.delegateTarget��ʾ�����������󶨵�Ԫ��
				//�¼�����������addEventListener�� attachEvent������
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			//�������types�Ƕ���
			if ( typeof types === "object" ) {
				// ( types-object [, selector] )
				for ( var type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			//���ݲ���������������������
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
	     * ��ָ����Ԫ�ذ�һ�����߶���¼���������
	     * @param types    �¼�����
	     * @param data     �Զ�������
	     * @param fn       �¼���������
	     * @returns
	     */
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		/**
		 * add by zhangjh   2016-5-10
		 * ��ָ����Ԫ�ؽ���󶨵��¼���������
		 * @param types
		 * @param fn
		 * @returns
		 */
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	    /**
	     * add by zhangjh 
	     * ����ָ��Ԫ����ͬ������Ԫ�ذ���ͬ���¼�������������ָ��Ԫ�ص�context������
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
		 * ��ָ����Ԫ�ؽ���󶨵��¼���������
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
	     * Ϊָ����Ԫ�����һ�����߶���¼��������ָ����Ԫ�ص����¼�����ָ��Ԫ�ص���Ԫ�ؿ��Դ�����ӵ��¼��������
	     * �÷�:$(selector).delegate(childSelector,type,function(){})
	     * @param selector  ָ��Ԫ�ص���Ԫ��
	     * @param types     �¼�����
	     * @param data      �Զ�������
	     * @param fn        ��������
	     * @returns
	     */
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		/**
		 * add by zhangjh   2016-5-10
		 * ɾ���ɷ���delegate������ӵ�һ�����߶���¼��������
		 * @param selector  ��ѡ���涨��Ҫɾ���¼���������ѡ����
		 * @param types     ��ѡ���¼�������������
		 * @param fn        ��ѡ���¼��������
		 * @returns
		 */
		undelegate: function( selector, types, fn ) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
		},
	    /**
	     * add by zhangjh  2016-5-11
	     * �ֶ�����DOMԪ�ذ󶨵ļ����¼�
	     * @param type    �����¼����ͣ�click��select��change
	     * @param data    �Զ�������
	     * @returns
	     */
		trigger: function( type, data ) {
			return this.each(function() {
				jQuery.event.trigger( type, data, this );
			});
		},
		/**
		 * add by zhangjh   2016-5-12
		 * �ֶ��������������ĵ�һ��DOMԪ�ذ󶨵ļ����¼�������ȡ��Ĭ�ϲ��� 
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
	     * ��һ��DOMԪ�ذ󶨶���¼�ʱ������ִ��
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
	     * �涨�����ָ����ͣ�ڱ�ѡԪ����ʱҪ���е���������
	     * @param fnOver  ����Ԫ��ʱ�������¼���������
	     * @param fnOut   �뿪Ԫ��ʱ�������¼���������
	     * @returns
	     */
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	});
	//�¼���ݷ���
	jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			//����$("#id").click(fn);
			if ( fn == null ) {
				fn = data;
				data = null;
			}
	
			return arguments.length > 0 ?
				//���������������0�����൱�ڸ���ӦԪ�ذ󶨼�������
				this.on( name, null, data, fn ) :
				//û�в������ֶ�ִ�м�������
				this.trigger( name );
		};
	    //????
		if ( jQuery.attrFn ) {
			jQuery.attrFn[ name ] = true;
		}
	    //��ʼ�������¼���������������
		if ( rkeyEvent.test( name ) ) {
			jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
		}
	    //��ʼ������¼���������������
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
	
	//CSSѡ��������
	(function(){
	
	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		expando = "sizcache" + (Math.random() + '').replace('.', ''),
		done = 0,
		toString = Object.prototype.toString,
		//�ж��Ƿ����ظ���
		hasDuplicate = false,
		baseHasDuplicate = true,
		//����'\'
		rBackslash = /\\/g,
		rReturn = /\r\n/g,
		//���ҷ��ַ�
		rNonWord = /\W/;
	
	// Here we check if the JavaScript engine is using some sort of
	// optimization where it does not always call our comparision
	// function. If that is the case, discard the hasDuplicate value.
	//   Thus far that includes Google Chrome.
	[0, 0].sort(function() {
		baseHasDuplicate = false;
		return 0;
	});
/**----------------------------------------   Sizzle:CSSѡ����������ڣ����ڲ�����ѡ����ʽselectorƥ���Ԫ��   -------------------------------------**/
	/*
	 * add by zhangjh 2016-2-27
	 * @param selector:cssѡ�������ʽ
	 * @param context:DOMԪ�ػ����ĵ�������Ϊ����Ԫ�ص������ģ������޶����ҷ�Χ��Ĭ��Ϊ��ǰ�ĵ�����
	 * @param results:��ѡ�����������������󣬽����ҵ���Ԫ�ز���results��
	 * @param seed:��ѡ��Ԫ�ؼ��ϣ�Sizzle���Ӹ�Ԫ�ؼ����й��˳�ƥ��ѡ�������ʽ��Ԫ�ؼ���
	 */
	//��querySelector��querySelectorAll���������õ�ʱ�������������
	var Sizzle = function( selector, context, results, seed ) {
		results = results || [];
		//����context
		context = context || document;
	    //����context,����$("#id1,#id2,#id3")��ʱ�򣬱���������
		var origContext = context;
	    //���context����Ԫ�أ�Ҳ����document���󣬺��Ա��β���  '1'->element  '9'->document
		if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
			return [];
		}
	    //��������selector�ǿ��ַ������������ַ��������Ա��β�ѯ������������jQuery�����Ѿ�����������
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}
	
		var m, set, checkSet, extra, ret, cur, pop, i,
			prune = true,
			contextXML = Sizzle.isXML( context ),
			//�����������ʽchunker��ѡ�������ʽ������Ŀ���ʽ�Ϳ���ϵ��
			parts = [],
			soFar = selector;
	
		// Reset the position of the chunker regexp (start from head)
        /**---------------------------------------����������ʽchunker��������ʽ�Ϳ���ϵ��-----------------------------------**/
		do {
			//chunker = /( (?: \((?:\([^()]+\)|[^()]+)+\) | \[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\] | \\. | [^ >+~,(\[\\]+ )+|[>+~])  (\s*,\s*)?   ((?:.|\r|\n)*)/g, 
			 //               --------------------------   -----------------------------------------------   ----   -------------  ---------    ---------   --------------
			 //                   ((******))����(*****)              [[*****]]����['******']����[******]         \****   ������ >+~,([\      ����ϵ��                     ,             �����ַ� 
			//             ---------------------------------------------------------------------------------------------------------  
			 //          ------------------------------------------------------------------------------------------------------------------- 
			//������ʽ���ƥ��ͬһ���ַ���ʱ�������һ��ƥ���λ�ÿ�ʼ��exec("")����ƥ��λ����ͷ��ʼ����lastIndex=0һ��
			chunker.exec( "" );
			//m��һ�������ĸ�Ԫ�ص�����[0,1,2,3],1�������ʽ���߿���ϵ����2��ʾ','������ڶ��ţ�3��ʾ','����Ĳ��б��ʽ�������ʾ���ʽʣ�ಿ��
			m = chunker.exec( soFar );
	       
			if ( m ) {
				//ֻҪselector�д��ڶ��ţ�m[2]Ϊ���ţ�m[3]Ϊ���ź�����ַ���������m[2]Ϊundefinded��m[3]Ϊʣ���ַ���
				soFar = m[3];
	
				parts.push( m[1] );
	
				if ( m[2] ) {
					//m2=',',������ڣ���ʾ���ڲ���ѡ�����������в��ֱ�����extra�У���������Sizzle
					extra = m[3];
					break;
				}
			}
		} while ( m );
        /**---------------------------------------�ж��Ƿ����λ��α�࣬������ڣ������Ҳ���----------------------------------------**/
	    // parts.length>1 ��ʾѡ�������д��ڿ���ϵ��     orisPos��exec(selector)��������λ��α�� ������λ��α�࣬��������Ҳ���
		if ( parts.length > 1 && origPOS.exec( selector ) ) {
			//�����һ���ǿ���ϵ��  A B:��A������Ԫ����ƥ��B; A>B:��A����Ԫ����ƥ��B; A+B:A����һ���ֵ�Ԫ����,ƥ��B; A~B:A�������ֵ�Ԫ����ƥ��B
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				//ֱ�ӵ��ú���posProcess
				set = posProcess( parts[0] + parts[1], context, seed );
	 
			} else {
				//[].pop,[].push;�������β��ɾ�������;[].unshift,[].shift �������ͷ�������ɾ��
				set = Expr.relative[ parts[0] ] ?
				    //�������ĵ�һ��Ԫ���ǿ���ϵ����ֱ�ӰѲ���context��Ϊ��һ��������Ԫ�ؼ���
					[ context ] :
					//�������ĵ�һ��Ԫ�ز��ǿ���ϵ�����������׳���Ȼ��ִ��Sizzle
					Sizzle( parts.shift(), context );
	            //��ʱ�����Ԫ���Ѿ�����һ�� 
				while ( parts.length ) {
					//�����׳�
					selector = parts.shift();
	                //����׳��Ŀ���ϵ���������׳�
					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
                    //ִ��Sizzle   	
					set = posProcess( selector, set, seed );
				}
			}
	
		} 
        /**----------------------------------------------������α�࣬����ҵ���ʼ����---------------------------------------------**/
		else {
			// Take a shortcut and set the context if the root selector is an ID
			// (but not if it'll be faster if the inner selector is an ID)
			/**----------------------------------       ��С���ҷ�Χ      ---------------------------**/
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					//�����һ����ѡ������ID���������һ����ѡ��������ID���ͣ�������contextΪ��һ����ѡ����ƥ���Ԫ��
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
	
				ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ?
				    //�����ʣ�ಿ�֣�����filter�������й���
					Sizzle.filter( ret.expr, ret.set )[0] :
					ret.set[0];
			}
	        
			if ( context ) {
				/**-----------------   �������һ������ʽƥ���Ԫ�ؼ��ϣ��õ���ѡ��set��ӳ�伯checkSet   ---**/
				ret = seed ?
				    //�������seed��ֱ�ӵ���Sizzle.filter����
					{ expr: parts.pop(), set: makeArray(seed) } :
					//��ΪҪ����������ң�����Ҫ��[].pop()    '~','+'�����ֵ�Ԫ��
					Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
	            //find��������һ������{ set: set, expr: expr }.set
				set = ret.expr ?
					//�������ʣ�ಿ�֣������
					Sizzle.filter( ret.expr, ret.set ) :
					ret.set;
	
				if ( parts.length > 0 ) {
					//��������л�������Ԫ�أ��򽫵�ǰ��set������һ������
					checkSet = makeArray( set );
	
				} else {
					prune = false;
				}
	           /**---------------------   ����ʣ��Ŀ���ʽ�Ϳ���ϵ������ӳ�伯checkSet����   ------------**/
				while ( parts.length ) {
					//cur��ʾ����ϵ��
					cur = parts.pop();
					//pop��ʾ���ϵ����ߵĿ�ѡ����ʽ
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
	    //����ӳ�伯checkSetɸѡ��ѡ��set�������յ�ƥ��Ԫ�ط�������results
		if ( !checkSet ) {
			checkSet = set;
		}
	
		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}
	
		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				//pruneΪfalse����ʾ����Ҫɸѡ��ѡ��set
				results.push.apply( results, checkSet );
	
			} else if ( context && context.nodeType === 1 ) {
				//�����������Ԫ�أ��������ĵ����������ӳ�伯��ѡ������������Ԫ��
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
						results.push( set[i] );
					}
				}
	
			} else {
				//������������ĵ����󣬱���ӳ�伯
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}
	
		} else {
			//�����ѡ���������飬
			makeArray( checkSet, results );
		}
        /**--------------------------------------  ������ڲ���ѡ�������ʽ���ݹ����Sizzle  ---------------------------------------**/
		if ( extra ) {
			Sizzle( extra, origContext, results, seed );
			Sizzle.uniqueSort( results );
		}
	    /**------------------------------------------------  ���ؽ����  ------------------------------------------------ --**/
		return results;
	};
	/**
	 * add by zhangjh    2016-3-15
	 * ��Ԫ�ؼ����е�Ԫ�ذ��ճ������ĵ��е�˳��������򣬲�ɾ���ظ�Ԫ��
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
	//ʹ��ָ����ѡ����ʽ expr ��Ԫ�ؼ���set���й���
	Sizzle.matches = function( expr, set ) {
		return Sizzle( expr, null, null, set );
	};
	//���ĳ��Ԫ��node�Ƿ�ƥ��ѡ����ʽ  expr
	Sizzle.matchesSelector = function( node, expr ) {
		return Sizzle( expr, null, null, [node] ).length > 0;
	};
	/*
	 * add by zhangjh   2016-2-29
	 * ���������ʽƥ���Ԫ�ؼ��ϣ�û���ҵ��Ļ�������������ĵ����к��Ԫ�أ��ҵ��Ļ������ز��ҽ���Ϳ����ʽ��ʣ�ಿ�֣����ڹ��ˣ�
	 * @param expr:����ʽ
	 * @param context:������
	 * @param isXML:context�Ƿ���XML�ĵ�
	 */
	Sizzle.find = function( expr, context, isXML ) {
		var set, i, len, match, type, left;
	
		if ( !expr ) {
			return [];
		}
	    //order: [ "ID", "NAME", "TAG","CLASS" ]
		for ( i = 0, len = Expr.order.length; i < len; i++ ) {
			type = Expr.order[i];
			//�жϿ���ʽ��ID��NAME��TAG��CLASS�е�һ��
			if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
				
				left = match[1];
				//ӦΪleftMatch�Ǽ���ǰ׺��������ʽ����slice(1,1),match['a','b','c']��Ϊm['a','c']
				match.splice( 1, 1 );
				//���ƥ�������������'\\'��ʼ������'\\'֮����ַ���ת���ˣ���������������
				if ( left.substr( left.length - 1 ) !== "\\" ) {
					//rBackslash=/\\/ ȥ��ת���   ��$('#a\\.b')   id=a.b
					match[1] = (match[1] || "").replace( rBackslash, "" );
					//ͨ��ԭ��̬��getElementBy����������Ԫ��
					set = Expr.find[ type ]( match, context, isXML );
	
					if ( set != null ) {
						//���set����null��undefined����expr���Ѿ����ҹ��Ĳ���ɾ��
						expr = expr.replace( Expr.match[ type ], "" );
						break;
					}
				}
			}
		}
	    //���û���ҵ���Ӧ���͵Ĳ��Һ��������ȡ�����ĵ����к��Ԫ��
		if ( !set ) {
			set = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( "*" ) :
				[];
		}
	
		return { set: set, expr: expr };
	};
	/*
	 * add by zhangjh  2016-2-29
	 * �ÿ���ʽ����Ԫ�ؼ���
	 * @param expr:����ʽ
	 * @param set:���˵�Ԫ�ؼ���
	 * @param inplace: true����ԭset���в�ƥ���Ԫ����Ϊfalse��false�����¹���һ��Ԫ�����飬ֻ����ƥ��Ԫ��
	 * @param not: true,ȥ��ƥ��Ԫ�أ�������ƥ��Ԫ�أ�false��ȥ����ƥ��Ԫ�أ�����ƥ��Ԫ��
	 */
	Sizzle.filter = function( expr, set, inplace, not ) {
		var match, anyFound,
			type, found, item, filter, left,
			i, pass,
			old = expr,
			result = [],
			curLoop = set,
			isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );
	    //���setԪ�ؼ�Ϊ�գ��򲻱�Ҫִ�й��˲���
		while ( expr && set.length ) {
			// filter��type��PSEUDO��CHILD��ID��TAG��CLASS��ATTR��POS
			for ( type in Expr.filter ) {
				
				if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
					//filterΪ��Ӧ�Ĺ��˺���
					filter = Expr.filter[ type ];
					//leftΪͨ��������ʽƥ�䵽��expr��ǰ׺����
					left = match[1];
	
					anyFound = false;
	                //ɾ��match�еĵڶ���Ԫ��
					match.splice(1,1);
	                //���ƥ����ַ�����ǰ׺��'\'����������'\'֮����ַ���ת���ˣ��������������ͣ�����'\\#id',$('\\#id'),#��ת��
					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}
	
					if ( curLoop === result ) {
						result = [];
					}
	                //�������Ԥ���˺�����ִ�й���ǰ����������
					if ( Expr.preFilter[ type ] ) {
						/*
						 * add by zhangjh   2016-3-12
						 * 1.������α�࣬�ȿ��ǲ���not������ǣ��Ѳ��������û��ɷ��ϲ�����Ԫ�ؼ��ϣ�������ǣ��ж��ǲ���λ��α����ߺ���α�࣬�ǵĻ�����true�����Ƿ���false��
						 * 2.������ID��ȥ��'\'
						 * 3.�������tag ȥ��'\'��Сд
						 * 4�������λ��α�࣬��matchͷ������true
						 * 5������Ǻ���α�࣬���������odd��ת��Ϊ2n+1;���������even��ת��Ϊ2n�����������3��ת��Ϊ0*n+3
						 * 6.�����class����С���˼���
						 * 7.��������ԣ�class->className;for->htmlfor;����ǵ���ƥ�䣬ǰ��ӿո�
						 */
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
	                    //Ԥ���˺�����3�з���ֵ
						if ( !match ) {
							//�������ֵΪfalse����ʾ�Ѿ�ִ���˹���
							anyFound = found = true;
	
						} else if ( match === true ) {
							//����true����ʾ��Ҫ����ִ��Ԥ����
							//����filter������PSEUDO��CHILD��POS֮ǰ������filter���Ե�ʱ�����ȱ���PSEUDO�����㣻ִ��Ԥ���ǣ�����CHILD��POS������������ѭ��
							//����ִ�У�֪������������CHILD��POS
							continue;
						}
						
					}
					//�������ַ�������ʾ������Ĺ��˲�����������ù��˺���
					if ( match ) {
						for ( i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								//ִ�й��˺������ж�Ԫ��item�ǲ���ƥ��match������true��ʾƥ�䣻false��ʾ��ƥ��
								found = filter( item, match, i, curLoop );
								//pass��ʾ��ǰԪ��item�Ƿ����ͨ�����˱��ʽ�Ĺ���
								pass = not ^ found;
								if ( inplace && found != null ) {
									//���inplaceΪtrue���������ʽ��ƥ���Ԫ������Ϊfalse
									if ( pass ) {
										anyFound = true;
	
									} else {
										//notΪtrue��ȥ��ƥ��Ԫ�أ�������ƥ��Ԫ��
										curLoop[i] = false;
									}
	
								} else if ( pass ) {
									//inplace��Ϊtrue�����¹���һ��Ԫ������
									result.push( item );
									anyFound = true;
								}
							}
						}
					}
	                //ɾ������ʽexpr���ѹ��˵Ĳ���
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
			//�������ʽû�з����仯������Ϊ�� �Ϸ�
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );
	
				} else {
					break;
				}
			}
	
			old = expr;
		}
	    //���ع��˺��Ԫ�ؼ��ϣ���������Χ���Ԫ�ؼ���
		return curLoop;
	};
	//�׳�һ������ѡ�����﷨������Ϣ���쳣
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Utility function for retreiving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 * ���ڻ�ȡԪ�ؼ���������Ԫ�غϲ�����ı�����
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
				//3->text,4->CDATASection,�����ɽ������������ı�
			} else if ( nodeType === 3 || nodeType === 4 ) {
				return elem.nodeValue;
			}
		} else {
	         //��Ϊ��Ԫ�ؼ��ϣ��ݹ����getText����
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
		//��������֧��getElementByClassName��������'CLASS'��order
		order: [ "ID", "NAME", "TAG" ],
	
		match: {
			//����ƥ��򵥱��ʽ��#id������������#��֮���id  #****����#\****
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			//����ƥ��򵥱��ʽ��.class��,������"."֮���class  .*****����.\*****
			CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			//����ƥ��򵥱��ʽ[name=��value��]������������name��ֵ    [name='****']����[name='\****']
			NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
			//����ƥ�����Ա��ʽ[attribute = "value"],������������������ֵ    [***='***']����[#]
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			//����ƥ��ӵ����ʽ��tag��    ****����/*** ֻ�ѱ�ǩ�����˳�������p:has(a),ֻ�õ�p
			TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
			//����ƥ����Ԫ��α����ʽ:nth-child(index/even/odd/equation)��:first-child��:last:child,��������Ԫ��α���α�����
			CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
			//ƥ��λ��α����ʽ:eq(indxe)��gt(index)��:lt(index)��:first��:last��:odd��:even,������λ��α���α�����,���������ַ�
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
			//ƥ��α����ʽ  :*******('(****)')
			PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},
	    /*
	     * add by zhangjh   2016-2-29
	     * leftMatch��jQuery�ļ����ص�ʱ��ͻᱻ��ʼ��
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
	    //�����˺�����
		relative: {
			//A+B ��A����һ���ֵ�Ԫ����Ѱ��B
			//@param  checkSet ӳ�伯���Ը�Ԫ�ؼ���ִ�й��˲���,������B�����ļ���
			//@param  part ����ʽ��Ҳ������DOMԪ�أ���ӦA
			"+": function(checkSet, part){
				//�ж��Ƿ�Ϊ�ַ���
				var isPartStr = typeof part === "string",
				    //	rNonWord = /\W/;�ж����ǲ��Ǳ�ǩ  /\W/.test('div')Ϊfalse
				    //�߼�����Ϊ'abc','123'Ҳ��'div'һ�������ڱ�ǩ��'@#$234',{}���Ǳ�ǩ
					isTag = isPartStr && !rNonWord.test( part ), 
					//�ж��ǲ��ǷǱ�ǩ�ַ���
					isPartStrNotTag = isPartStr && !isTag;  //true��ʾpart����һ����ǩ
				                                            //false��1��part����һ���ַ�����
				                                            //      2.div��һ����ǩ
	            //��ǩСд
				if ( isTag ) {
					part = part.toLowerCase();
				}
	
				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						//previousSibling����Ԫ��֮ǰ����Ľڵ㣬�����ֵܽڵ㣬�����˵���Ԫ�ؽڵ�
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
	                    /*
	                     * add by zhangjh   2016-3-1
	                     * ���δ�ҵ��ֵ�Ԫ�أ�elemΪnull���򷵻�false
	                     * ����ҵ����ֵ�Ԫ�أ����Ҳ���part�Ǳ�ǩ�������ֵ�Ԫ�صĽڵ�����nodeName�Ƿ���֮��ȣ���ȵĻ��û�Ϊ�ֵ�Ԫ�أ������û�Ϊ�գ�
	                     * ����ҵ����ֵ�Ԫ�أ����Ҳ���part��DOMԪ�أ���������Ƿ���ȣ����������滻Ϊtrue����������滻Ϊfalse
	                     * 
	                     */
						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
								
							elem || false :
							elem === part;
					}
				}
	            //��������ǷǱ�ǩ�ַ���������÷���fillter
				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},
			
	        // A>B ��A����Ԫ����Ѱ��B
			">": function( checkSet, part ) {
				var elem,
					isPartStr = typeof part === "string",
					i = 0,
					l = checkSet.length;
	
				if ( isPartStr && !rNonWord.test( part ) ) {
					//part����ASCII�ַ���ɵ��ַ���
					part = part.toLowerCase();
	
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
	
				} else {
					//partΪ�Ǳ�ǩ�ַ�������DOMԪ��
					for ( ; i < l; i++ ) {
						elem = checkSet[i];
	
						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								//���part�����ַ��������ж�elem��parentNode��part���
								elem.parentNode === part;
						}
					}
	
					if ( isPartStr ) {
						//�Ǳ�ǩ�ַ����������
						Sizzle.filter( part, checkSet, true );
					}
				}
			},
	        //��A������Ԫ����Ѱ��B
			"": function(checkSet, part, isXML){
				var nodeCheck,
				    //done=0;
					doneName = done++,
					checkFn = dirCheck;
	            //rNonWord = /\W/;  �ȼ���[^a-z0-9A-Z]
				//���part�Ǳ�ǩ������dirNodeCheck���ˣ�������ǣ�����dirCheck����
				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part; 
					checkFn = dirNodeCheck;
				}
	
				checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
			},
	        //��A�������ֵ�Ԫ����Ѱ��B
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
	     * ͨ��ID,NAME,TAG������Ԫ�أ�����ԭ��̬��getElementBy...
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
		// Ԥ���˺�����
		preFilter: {

		   /***********************************   ���˲�ƥ��Ԫ�أ�����СԪ�ؼ���   ******************************************/
			/*
			 * add by zhangjh   2016-3-1
			 * @param match ƥ���Ӧ����������ʽ�Ľ��
			 * @param curloop  ������Ľ����
			 * @param inplace  true����ƥ���Ԫ��ְλfalse��false�����¹���һ�����飬����ƥ���Ԫ��
			 * @param result  
			 * @param not     true��������ƥ��Ԫ�أ�false������ƥ��Ԫ��
			 * @param isXML
			 */
			CLASS: function( match, curLoop, inplace, result, not, isXML ) {
				// .*****����.\*****
				//  CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
				//class���͵�������ʽƥ�����ʽ������һ��a[2],a[1]Ϊ��������ַ���
				//ȥ����������ַ����е�'\'   class="1\.2",ʵ��classΪ1.2
				match = " " + match[1].replace( rBackslash, "" ) + " ";
	
				if ( isXML ) {
					return match;
				}
	
				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
							//��elem����������notΪfalse��ʱ��result�������ƥ��Ԫ�أ���elem����������notΪtrue�ǣ�result������ǲ�ƥ���Ԫ��
							if ( !inplace ) {
								//inplaceΪfalse�����¹���һ������
								result.push( elem );
							}
							//��inplaceΪtrueʱ
	
						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}
	            //CLASSԤ���˺������Ƿ���false����ʾ�Ѿ�ִ�й��ˣ������Ѿ���С�˹��˼���
				return false;
			},
	        //�������'\'
			ID: function( match ) {
				return match[1].replace( rBackslash, "" );
			},
	        //����'\'��Сд
			TAG: function( match, curLoop ) {
				return match[1].replace( rBackslash, "" ).toLowerCase();
			},
			
	       //CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/
			//����α��Ĳ���ת��Ϊa*n+b�ĸ�ʽ
			CHILD: function( match ) {
				//match[1]α�࣬match[2]��α�����
				if ( match[1] === "nth" ) {
					if ( !match[2] ) {
						Sizzle.error( match[0] );
					}
	                //��α�����ǰ��Ŀո񡢡�+����Ϊ��
					match[2] = match[2].replace(/^\+|\s*/g, '');
	
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					//��α�����ͳһ��ʽ��Ϊfirst*n+last
					//even->ż��  odd->����    a*n+b
					// match[2] Ϊeven��ת��Ϊ2n��Ϊodd��ת��Ϊ2n+1��Ϊ������ת��Ϊ0n+d
					var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
	
					// calculate the numbers (first)n+(last) including if they are negative
					//�ַ���-0�����ַ���ǿ��ת��Ϊ���֣��õ�first����
					//����������Ľ������ַ�������֮���ת��
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
					
				}
				//�������α����only��last��first����α��������׳�����
				else if ( match[2] ) {
					Sizzle.error( match[0] );
				}
	
				// TODO: Move to normal caching system
				//Ϊ���ι������һ��Ψһ��ʶ��
				match[0] = done++;
	
				return match;
			},
	        //ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			//��������������������ֵ
			ATTR: function( match, curLoop, inplace, result, not, isXML ) {
				//match��һ������Ϊ6�����飬match[1]->name,match[2]->'=',match[3]->'"'
				//match[4]����match[5]Ϊ����ֵ
				var name = match[1] = match[1].replace( rBackslash, "" );
	            //attrMap: {"class": "className","for": "htmlFor"},
				if ( !isXML && Expr.attrMap[name] ) {
					match[1] = Expr.attrMap[name];
				}
	
				// Handle if an un-quoted value was used
				match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );
	
				if ( match[2] === "~=" ) {
					//'~='��ʾ�ǵ���ƥ�䣬��Ҫ�������ϼӿո�
					match[4] = " " + match[4] + " ";
				}
	
				return match;
			},
	        //  /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
			//
			PSEUDO: function( match, curLoop, inplace, result, not ) {
				//match��һ������Ϊ4�����飬match[1]Ϊα��Ԫ�أ�match[3]Ϊα�����
				if ( match[1] === "not" ) {
					//���match[1]��not�������math[3]���������ҳ�curloop�����������Ԫ�أ�Ȼ���滻match[3],�ò���������Sizzle.selector.filter������ʹ��
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
				//������ƥ����match��ͷ������һ����Ԫ��true��ʹ��ƥ����match��λ��α��������±�����3���Ӷ���α���ƥ��������һ��
				match.unshift( true );
	
				return match;
			}
		},
	
		filters: {
			//ƥ�����п���Ԫ��(δ���õġ��ɼ���)
			enabled: function( elem ) {
				return elem.disabled === false && elem.type !== "hidden";
			},
	        //ƥ�����в����õ�Ԫ��
			disabled: function( elem ) {
				return elem.disabled === true;
			},
	        //ƥ������ѡ�еı�ѡ��Ԫ��(ֻ���ڵ�ѡ�͸�ѡ��)
			checked: function( elem ) {
				return elem.checked === true;
			},
	        //ƥ�����б�ѡ�е�optionԪ��
			selected: function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	        //ƥ�����к�����Ԫ�ص�Ԫ��
			parent: function( elem ) {
				return !!elem.firstChild;
			},
	        //ƥ�䲻������Ԫ�ص�Ԫ��
			empty: function( elem ) {
				return !elem.firstChild;
			},
	        //$('has[selector]')ƥ�京������selector������Ԫ�ص�Ԫ��
			has: function( elem, i, match ) {
				return !!Sizzle( match[3], elem ).length;
			},
	        //ƥ�����
			header: function( elem ) {
				return (/h\d/i).test( elem.nodeName );
			},
	        //ƥ�䵥���ı���
			text: function( elem ) {
				var attr = elem.getAttribute( "type" ), type = elem.type;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
			},
	        //ƥ�䵥ѡ��ť
			radio: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
			},
	        //ƥ�临ѡ��
			checkbox: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
			},
	        //ƥ���ļ���
			file: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
			},
	        //ƥ�������
			password: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
			},
	        //ƥ���ύ��ť
			submit: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "submit" === elem.type;
			},
	        //ƥ��ͼƬ��
			image: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
			},
	        //ƥ�����ð�ť
			reset: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "reset" === elem.type;
			},
	        //ƥ�䰴ť
			button: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && "button" === elem.type || name === "button";
			},
	        //ƥ�������
			input: function( elem ) {
				return (/input|select|textarea|button/i).test( elem.nodeName );
			},
	        //ƥ�䵱ǰ����Ԫ�� elem.ownerDocument.activeElement
			focus: function( elem ) {
				return elem === elem.ownerDocument.activeElement;
			}
		},
		//λ��α��Ͷ�Ӧ��α����˺���
		setFilters: {
			//$(":first") �ҵ���һ��Ԫ��
			first: function( elem, i ) {
				return i === 0;
			},
	        //$(":last")�ҵ����һ��Ԫ��
			last: function( elem, i, match, array ) {
				return i === array.length - 1;
			},
	        //$(":even")ƥ���±�Ϊż����Ԫ�أ���0��ʼ 
			even: function( elem, i ) {
				return i % 2 === 0;
			},
	        //$(":odd")ƥ���±�Ϊ������Ԫ�أ���0��ʼ
			odd: function( elem, i ) {
				return i % 2 === 1;
			},
	        //$(":lt(index)")ƥ������С��ָ���±��Ԫ��
			lt: function( elem, i, match ) {
				return i < match[3] - 0;
			},
	        //$(":gt(index)")ƥ�����д���ָ���±��Ԫ��
			gt: function( elem, i, match ) {
				return i > match[3] - 0;
			},
	        //$(":nth(index)")ƥ��һ��ָ���±��Ԫ�أ���0��ʼ
			nth: function( elem, i, match ) {
				return match[3] - 0 === i;
			},
	        //$(":eq(index)")ƥ��һ��ָ���±��Ԫ�أ���0��ʼ
			eq: function( elem, i, match ) {
				return match[3] - 0 === i;
			}
		},
		/*
		 * add by zhangjh  2016-3-2
		 * ���Ԫ���Ƿ�ƥ��α��
		 */
		filter: {
			PSEUDO: function( elem, match, i, array ) {
				//name��α��
				var name = match[1],
				    //α���Ӧ�ĺ���
					filter = Expr.filters[ name ];
	
				if ( filter ) {
					return filter( elem, i, match, array );
	
				} else if ( name === "contains" ) {
					//$(":contains(test)")  match[3]Ϊα�������ƥ�����test�ı���Ԫ��
					return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
	
				} else if ( name === "not" ) {
					//��α��Ϊnot��ʱ��$(":not(selector)"),ƥ�䲻��selector��Ԫ�أ���ʱmatch[3]����Ԥ������Ϊselector��Ԫ�ؼ���
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
	        //�ж�Ԫ��elem�ǲ�������match
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
							//���elemǰ�滹��element���������ǰԪ�ز���first��Ҳ����only���򷵻�false
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	
						if ( type === "first" ) {
							//˵����Ԫ����first
							return true;
						}
	
						node = elem;
	
						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							//���elem���滹��element���������ǰԪ�ز���last��Ҳ����only������false
							if ( node.nodeType === 1 ) {
								return false;
							}
						}
	                    //˵����Ԫ����only
						return true;
	
					case "nth":
						first = match[2];
						last = match[3];
	
						if ( first === 1 && last === 0 ) {
							//�൱��nth(n)���϶�����true
							return true;
						}
	
						doneName = match[0];
						parent = elem.parentNode;
	
						if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
							count = 0;
	
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									//�ҵ�elementԪ��
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
	        //���Ԫ�ص�id�Ƿ���ָ����id��match���
			ID: function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},
	        //ָ��Ԫ���Ƿ�����ĳ����ǩ
			TAG: function( elem, match ) {
				return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
			},
	        //ָ��Ԫ���Ƿ�����ĳ����
			CLASS: function( elem, match ) {
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf( match ) > -1;
			},
	
			ATTR: function( elem, match ) {
				//name��ָ����������
				var name = match[1],
				//�õ�elem��Ӧ������������
					result = Sizzle.attr ?
						Sizzle.attr( elem, name ) :
						Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					//���ԵĶ�Ӧ����ֵ		
					value = result + "",
					//���Ա��ʽ�ĵȺŲ���=,!=
					type = match[2],
					//ָ��������ֵ
					check = match[4];
	                   
				return result == null ?
					//�����������ԣ�type='!=',����true�����򷵻�false
					type === "!=" :
					//����������
					!type && Sizzle.attr ?
					result != null :
					//����ָ������������ֵ����ָ��ֵ
					type === "=" ?
				    //����ָ��ֵ��ָ��ֵ����Ϊ��
					value === check :
					type === "*=" ?
					//����ָ��ֵ��ָ��ֵ����Ϊ��
					value.indexOf(check) >= 0 :
					type === "~=" ?
					//����ָ������
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					//û��ָ��ֵ����Ҫ���Ժ�����ֵ��Ϊ��
					value && result !== false :
					type === "!=" ?
					//������ָ��ֵ
					value !== check :
					type === "^=" ?
					//��ָ��ֵ��ʼ
					value.indexOf(check) === 0 :
					type === "$=" ?
					//��ָ��ֵ����
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					//���ڵ�ǰָ��ֵ�����ѵ�ǰָ��ֵ��ͷ�Һ��һ��'-'		
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},
	       
			POS: function( elem, match, i, array ) {
				//���Ԫ�ص�λ���Ƿ����λ��
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
		 * string.replace(a,b),��b��һ��������ʱ�򣬴���ú����ĵ�һ��������ƥ��a���ַ������ڶ���������a��ĳ�������е��ַ���������Ĳ�����ƥ������λ�ã����һ��������string����
		 */
		Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
	}
	// Expose origPOS
	// "global" as in regardless of relation to brackets/parens
	Expr.match.globalPOS = origPOS;
	
	var makeArray = function( array, results ) {
		//array �������������Ҫ��֮ת��Ϊ���� ע�⣺DOM������ȡ���Ľ���п�������������󣬵�����ʹ������ķ���
		array = Array.prototype.slice.call( array, 0 );
	
		if ( results ) {
			//����һ��С���ɣ����Խ�����array�е�Ԫ����ӵ�results��
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
	 * ����Ƚ�Ԫ��a��Ԫ��b���ĵ��е�λ�á����a��b֮ǰ������-1�����a��b֮�󣬷���1�������ȣ�����0
	 */
	var sortOrder, siblingCheck;
	//��������֧��ԭ������compareDocumentPosition������ø÷����Ƚ�Ԫ��λ��
	if ( document.documentElement.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( a === b ) {
				//�ж��Ƿ����ظ������a==b����ʾ���ظ�
				hasDuplicate = true;
				return 0;
			}
	        // ���a��compareDocumentPosition������bû�еĻ�������-1�����aû�У�����1������
			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				return a.compareDocumentPosition ? -1 : 1;
			}
	        //���a��b����compareDocumentPosition����
			/**
			 * 1��û�й�ϵ���������ڵ㲻����ͬһ���ĵ���
			 * 2�� ��һ�ڵ㣨P1��λ�ڵڶ����ڵ��P2����
			 * 4����һ�ڵ㣨P1����λ�ڵڶ��ڵ㣨P2��ǰ��
			 * 8�� ��һ�ڵ㣨P1��λ�ڵڶ��ڵ��ڣ�P2����
			 * 16�� �ڶ��ڵ㣨P2��λ�ڵ�һ�ڵ��ڣ�P1����
			 * 32:û�й�ϵ�ģ����������ڵ���ͬһԪ�ص���������
			 */
			//���Ϊ4����ʾa��b��ǰ�棬����-1�����򷵻�1
			return a.compareDocumentPosition(b) & 4 ? -1 : 1;
		};
	
	} else {
		//����������֧��ԭ������compareDocumentPosition
		sortOrder = function( a, b ) {
			// The nodes are identical, we can exit early
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
	
			// Fallback to using sourceIndex (in IE) if it's available on both nodes
		    //�����֧��sourceIndex����
			} else if ( a.sourceIndex && b.sourceIndex ) {
				return a.sourceIndex - b.sourceIndex;
			}
	        //�������֧��sourceIndex����
			var al, bl,
				ap = [],
				bp = [],
				//a�ĸ��ڵ�
				aup = a.parentNode,
				//b�ĸ��ڵ�
				bup = b.parentNode,
				cur = aup;
	
			// If the nodes are siblings (or identical) we can do a quick check
			if ( aup === bup ) {
				//˵��a��b���ֵ�Ԫ��
				return siblingCheck( a, b );
	
			// If no parents were found then the nodes are disconnected
			} else if ( !aup ) {
				//���a�ĸ��ڵ㲻���ڣ���ʾa��b����ͬһ���ļ��У�a��b֮ǰ
				return -1;
	
			} else if ( !bup ) {
				//���b�ĸ��ڵ㲻���ڣ���ʾb����a���ļ��У�b��a֮ǰ
				return 1;
			}
	
			// Otherwise they're somewhere else in the tree so we need
			// to build up a full list of the parentNodes for comparison
			//a,b�ĸ��ڵ㶼���ڣ�������ȣ��ҵ�a�ڵ�����ϲ�
			while ( cur ) {
				ap.unshift( cur );
				cur = cur.parentNode;
			}
	
			cur = bup;
	        //�ҵ�b�ڵ�����ϲ�ڵ�
			while ( cur ) {
				//��������bp��ͷ��
				bp.unshift( cur );
				cur = cur.parentNode;
			}
	
			al = ap.length;
			bl = bp.length;
	
			// Start walking down the tree looking for a discrepancy
			for ( var i = 0; i < al && i < bl; i++ ) {
				//a��b�����ϲ�ڵ�϶�һ���������ϲ�ڵ㿪ʼ�Ƚϣ������ֲ�����ǱȽ�
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
	        //���a����һ��ֱ������Ϊֹ����û��b���ǿ϶�b��a��ǰ�棬����1
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
	 * ����������querySelectorAll����
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
					//�����tag���ࡢid
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
	                //ע�⣺ֻ��Document�������getElementById����
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
						 * querySelector,querySelectorAll��������һ��bug
						 * <div id="1">
						 * 	  <p>123</p>         
						 * </div>
						 * var a=document.getElementById("1");
						 * var b=a.querySelectorAll("#1 p")Ӧ�÷���null�������ص�ȴ��<p>,�൱��ִ����document��querySelectorAll("#1 p")
						 *      ����취��a.querySelectorAll([id=1] #1 p);
						 */
						var oldContext = context,
							old = context.getAttribute( "id" ),
							nid = old || id,
							//
							hasParent = context.parentNode,
							//�ж���ѡ�����Ƿ�����ֵܹ�ϵ,���Ҫ�������ĵ��ֵܽڵ㣬�϶����ҵ������ĵĸ��ڵ�
							relativeHierarchySelector = /^\s*[+~]/.test( query );
	
						if ( !old ) {
							context.setAttribute( "id", nid );
						} else {
							nid = nid.replace( /'/g, "\\$&" );
						}
						//ѡ���������ֵܹ�ϵ���������и��ڵ�
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
								//��old�����ڵ�ʱ��ǰ���Ѿ����old�����Ƴ�
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
		//documnet.documentElement,�����ĵ�Ԫ��<html>***</html>
		var html = document.documentElement,
		    /**
		     * ��ͬ�������ʵ��matchesSelector�ķ�����ͬ
		     * �ȸ裬opera�������webkitMatchesSelector
		     * ����������mozMatchesSelector
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
	        //������������matchesSelector������������������matchesSelector����
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
	 * ����������Ƿ�֧��getElementByClassName
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
	    //ע����splice������slice
		Expr.order.splice(1, 0, "CLASS");  //order���class
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
	 *     ���������ѡ��checkSet��������е�ÿ��Ԫ����ĳ������dir���Ƿ��в���cur����ƥ���Ԫ�ء�����ҵ���
	 * �򽫺�ѡ��checkSet�ж�Ӧλ�õ�Ԫ���滻Ϊ�ҵ���Ԫ�أ����δ�ҵ������û�Ϊfalse
	 * @param dir ��ʾ���ҷ�����ַ��������硰parentNode������previousSibling��
	 * @param cur ��ǩ�ַ���
	 * @param doneName  ��ֵ�����β��ҵ�Ψһ��ʶ
	 * @param checkSet  ��ѡ��
	 * @param nodeCheck ��ǩ�ַ���
	 * @param isXML
	 */
	function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
	
			if ( elem ) {
				var match = false;
	
				elem = elem[dir];
	            //�ҵ�elem���ϲ�ڵ�
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
	 *   ���������ѡ��checkSet,�������ÿ��Ԫ����ĳ������dir���Ƿ��������curƥ�������ȵ�Ԫ�ء�����ҵ���
	 * �򽫺�ѡ��checkSet�ж�Ӧλ�õ�Ԫ��ָ��Ϊ�ҵ���Ԫ�ػ���true���������滻Ϊfalse
	 * @param dir  ��ʾ���ҷ�������parentNode��previousSibling
	 * @param cur  �󲿷������Ϊ�Ǳ�ǩ�ַ�����ʽ�Ŀ���ʽ��Ҳ�п�����DOMԪ��
	 * @param doneName  ���β��ҵ�Ψһ��ʶ�������Ż����ҹ���
	 * @checkSet  ��ѡ��
	 * @nodeCheck undefined��û���õ�
	 * @isXML   ����Ƿ���һ��XML�ļ�������
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
	//���Ԫ��a�Ƿ����Ԫ��b
	if ( document.documentElement.contains ) {
		Sizzle.contains = function( a, b ) {
			return a !== b && (a.contains ? a.contains(b) : true);
		};
	
	} else if ( document.documentElement.compareDocumentPosition ) {
		Sizzle.contains = function( a, b ) {
			return !!(a.compareDocumentPosition(b) & 16);
		};
	
	} else {
		//Ϊʲô��false����
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
	 * ��ָ��������������context�£�������ѡ�������ʽselectorƥ���Ԫ�ؼ��ϣ�����֧��α��
	 */
	var posProcess = function( selector, context, seed ) {
		var match,
			tmpSet = [],
			later = "",
			root = context.nodeType ? [context] : context;
	
		// Position selectors must be done after the filter
		// And so must :not(positional) so we move all PSEUDOs to the end
		//��ѡ�����е�α����˳���
		while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
			later += match[0];
			selector = selector.replace( Expr.match.PSEUDO, "" );
		}
	    //������˺��ѡ������ֻʣ�¿���ϵ�������ڿ���ϵ���������һ��*
		selector = Expr.relative[selector] ? selector + "*" : selector;
	    //��������selector��Ԫ�ر�����temset��
		for ( var i = 0, l = root.length; i < l; i++ ) {
			Sizzle( selector, root[i], tmpSet, seed );
		}
	    //��temSet��������α��ѡ�����Ľ�����˳���
		return Sizzle.filter( later, tmpSet );
	};
	
	// EXPOSE
	// Override sizzle attribute retrieval
	//��¶Sizzle��jQuery
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
    //������jQuery��prototype��ӷ�������Щ���������Ա�jQuery����ʹ��
	jQuery.fn.extend({
		/*
		 *add by zhangjh   2016-3-8
		 *@param selector�������ַ�����Ҳ����ʹjQuery�������DomԪ��
		 */
		find: function( selector ) {
			//����find��jQuery��������thisָ��jQuery���󣬸�jQuery�����ǲ���Ԫ��ʱ���ɵ�jQuery����(������jQuery����Ҳ������DOMԪ��)
			var self = this,
				i, l;
	       
			if ( typeof selector !== "string" ) {
				//���selector�����ַ�������Ϊ�ò�����jQuery���������DOMԪ�أ����ù��캯��������һ��jQuery����
				return jQuery( selector ).filter(function() {
					for ( i = 0, l = self.length; i < l; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				});
			}
	        //����pushStack����������һ���µĿ�jQuery���󣬲�������Ϊ����ֵ�������ҵ���Ԫ�ض���ӵ���jQuery������
			var ret = this.pushStack( "", "find", selector ),
				length, n, r;
	        //jQuery������һ��������
			for ( i = 0, l = this.length; i < l; i++ ) {
				//lengthΪ��һ�β��ҵ�Ԫ�صĸ���
				length = ret.length;
				//jQuery.find-> Sizzle,���������Ľ������ret��
				jQuery.find( selector, this[i], ret );
	
				if ( i > 0 ) {
					// Make sure that the results are unique
					//��length��ʼ����ret��length������ѭ����ΧΪ����find���ҵ��Ľ��
					for ( n = length; n < ret.length; n++ ) {
						//0-lengthΪ����find֮ǰ�����н��
						for ( r = 0; r < length; r++ ) {
							if ( ret[r] === ret[n] ) {
								//�ҵ���Ԫ���ظ���ɾ��������ɾ���ı���ret��n��Ҫ-1
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
	     * �õ�ǰjQuery������Ӽ�����һ���µ�jQuery����
	     * @param target ������ѡ�������ʽ��jQuery�������DOMԪ��
	     */
		has: function( target ) {
			//����ƥ�������jQuery����
			var targets = jQuery( target );
			return this.filter(function() {
				for ( var i = 0, l = targets.length; i < l; i++ ) {
					if ( jQuery.contains( this, targets[i] ) ) {
						return true;
					}
				}
			});
		},
	    //�ҵ�jQuery�����в�����selector������Ԫ��
		not: function( selector ) {
			return this.pushStack( winnow(this, selector, false), "not", selector);
		},
	    //����jQuery����������selector������Ԫ�� 
		filter: function( selector ) {
			return this.pushStack( winnow(this, selector, true), "filter", selector );
		},
	    //selector������ѡ�������ʽ��DOMԪ�ء�jQuery���󡢻��ߺ�����������鵱ǰ��Ԫ�ؼ����Ƿ�ƥ��selector��ֻҪ��һ��ƥ��ͷ���true
		is: function( selector ) {
			return !!selector && (
				typeof selector === "string" ?
					// If this is a positional selector, check membership in the returned set
					// so $("p:first").is("p:last") won't return true for a doc with two "p".
					POS.test( selector ) ?
						//λ��α�� 
						jQuery( selector, this.context ).index( this[0] ) >= 0 :
						//����λ��α�࣬����jQuery��filter
						jQuery.filter( selector, this ).length > 0 :
					//����jQuery�����filter
					this.filter( selector ).length > 0 );
		},
	    /**
	     * add by zhangjh   2016-3-17
	     * �����ڵ�ǰƥ��Ԫ�ؼ����к����ǵ�����Ԫ���в��������selectorsƥ������Ԫ�أ����ò��ҽṹ����һ���µ�jQuery����
	     * @param selectors
	     * @param context
	     * @returns
	     */
		closest: function( selectors, context ) {
			var ret = [], i, l, cur = this[0];
	
			// Array (deprecated as of jQuery 1.7)
			if ( jQuery.isArray( selectors ) ) {
				//���selectors������
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
		 * ���ݲ���elem�Ĳ�ͬ��������λ�õ��ж�
		 * �������elemΪ�ջ���Ϊ�ַ���(ѡ�������ʽ)���򷵻ص�ǰjQuery������elem�е�λ�ã�
		 * �������elemΪDOMԪ�ػ���jQuery�����򷵻�elem�ڵ�ǰjQuery�����е�λ��
		 */
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				//û�д���������ҵ�jQuery�����е�һ��Ԫ��ǰ��������ֵܽڵ�
				return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
			}
	
			// index in selector
			if ( typeof elem === "string" ) {
				//ѡ�������ʽ�����ҵ�����elem��Ԫ�ؼ��ϣ�Ȼ���ж�jQuery����ĵ�һ��Ԫ���ǲ��������Ԫ�ؼ�����
				return jQuery.inArray( this[0], jQuery( elem ) );
			}
	
			// Locate the position of the desired element
			return jQuery.inArray(
					//���elem��jQuery������jQuery����ĵ�һ��Ԫ���ǲ����ڵ�ǰjQuery������
				// If it receives a jQuery object, the first element is used
				//ͨ��jquery�������ж�һ��elem�ǲ���jQuery����
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
	
/*********************************************   DOM���� Traversing(ʹ����ģ��ģʽ����)   ***********************************/
	
	jQuery.each({
		/**
		 * add by zhangjh  2016-5-28
		 * ����ָ��DOMԪ�صĸ�Ԫ�أ����˵��ı��ڵ�
		 * @param elem  DOMԪ��
		 * @returns
		 */
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		/**
		 * add by zhangjh   2016-5-28
		 * ����ָ��DOMԪ�ص����и��ڵ�
		 * @param elem
		 * @returns
		 */
		parents: function( elem ) {
			return jQuery.dir( elem, "parentNode" );
		},
		/**
		 * add by zhangjh
		 * ����ָ��DOMԪ�ص�����Ԫ�أ�ֱ������ƥ��until��Ԫ��Ϊֹ
		 */
		parentsUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "parentNode", until );
		},
		//����ִ��DOMԪ��֮������ŵ��ֵ�Ԫ��
		next: function( elem ) {
			return jQuery.nth( elem, 2, "nextSibling" );
		},
		//����ָ��DOMԪ��֮ǰ�����ŵ��ֵ�Ԫ��
		prev: function( elem ) {
			return jQuery.nth( elem, 2, "previousSibling" );
		},
		//����ָ��DOMԪ��֮��������ֵ�Ԫ��
		nextAll: function( elem ) {
			return jQuery.dir( elem, "nextSibling" );
		},
		//����ָ��DOMԪ��֮ǰ�������ֵ�Ԫ��
		prevAll: function( elem ) {
			return jQuery.dir( elem, "previousSibling" );
		},
		//����ָ��DOMԪ��֮����ֵ�Ԫ�أ�֪��untilΪֹ
		nextUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "nextSibling", until );
		},
		//����ָ��DOMԪ��֮ǰ���ֵ�Ԫ�أ�֪��untilΪֹ
		prevUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "previousSibling", until );
		},
		//����DOMԪ�ص������ֵ�Ԫ��
		siblings: function( elem ) {
			return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
		},
		//����DOMԪ�ص���Ԫ�أ��������ı��ڵ��ע�ͽڵ�
		children: function( elem ) {
			return jQuery.sibling( elem.firstChild );
		},
		//����DOMԪ�ص���Ԫ�أ������ı��ڵ��ע�ͽڵ�
		contents: function( elem ) {
			return jQuery.nodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				jQuery.makeArray( elem.childNodes );
		}
		
	}, function( name, fn ) {
		/**
		 * add by zhangjh  2016-5-28
		 * 
		 * @param until      ѡ�������ʽ������ָʾ����ֹͣ��λ��
		 * @paramselector    ѡ�������ʽ�����ڹ����ҵ���Ԫ��
		 */
		jQuery.fn[ name ] = function( until, selector ) {
			//�Ե�ǰƥ��Ԫ�ص��ú���fn����������ֵ����һ���µ�������
			var ret = jQuery.map( this, fn, until );
	        //����selector
			if ( !runtil.test( name ) ) {
				//���������������Until��β����ΪjQuery.fn[name]([seletor])
				//�������������Until��β����ΪjQuery.fn[name]([until,selector])
				selector = until;
			}
	        //����Ԫ�أ�ֻ����ƥ��ѡ�������ʽselector��Ԫ��
			if ( selector && typeof selector === "string" ) {
				ret = jQuery.filter( selector, ret );
			}
	        //�����ȥ��
			ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;
	        //��������
			if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
	        //���ҵ���Ԫ������ret�����µ�jQuery���󣬲�����
			return this.pushStack( ret, name, slice.call( arguments ).join(",") );
		};
	});
	
	jQuery.extend({
		/**
		 * add by zhangjh  2016-5-28
		 *  ����Ԫ��
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
	     * ��һ��Ԫ�س���������ĳ�������ϵ�����Ԫ�أ�֪������ĳ��Ԫ��Ϊֹ
	     * @param elem   DOMԪ��
	     * @param dir    ����  parentNode��nextSibling��
	     * @param until  ����Ԫ��
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
	     * ��һ��Ԫ�س���������ĳ�������ϵĵ�n��Ԫ��
	     * @param cur      ��ʾ���ҵ���ʼԪ��
	     * @param result   ��ʾҪ���ҵ�Ԫ�ص���ţ���1��ʼ
	     * @param dir      ��ʾ���ҵķ���
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
	     * �������һ��Ԫ��֮��������ֵ�Ԫ�أ�������ʼԪ�أ�������������elem
	     * @param n     ��ʾ���ҵ���ʼԪ��
	     * @param elem  ��ѡ��DOMԪ��
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
	 * �������Ԫ�ؼ���
	 * @param elements �����˵�Ԫ�ؼ���
	 * @param qualifier ������DOMԪ�ء�ѡ�������ʽ��DOMԪ�����顢jQuery�������ڹ���elementsԪ�ؼ���
	 * @param keep  true������ƥ��Ԫ�أ�false��������ƥ��Ԫ��
	 */
	function winnow( elements, qualifier, keep ) {
	
		// Can't pass null or undefined to indexOf in Firefox 4
		// Set to 0 to skip string check
		qualifier = qualifier || 0;
	    //qualifer�Ǻ���
		if ( jQuery.isFunction( qualifier ) ) {
			//�ҵ�����function(elem,i)������Ԫ��,grep�����������������ڵ���������Ϊundefied����grep��������function��ֵ
			return jQuery.grep(elements, function( elem, i ) {
				//keepΪfalse�����ز�����qualifer��elem��true�෴
				var retVal = !!qualifier.call( elem, i, elem );
				return retVal === keep;
			});
	    //qualofer��domԪ��
		} else if ( qualifier.nodeType ) {
			return jQuery.grep(elements, function( elem, i ) {
				return ( elem === qualifier ) === keep;
			});
	    //qualfier��ѡ�������ʽ
		} else if ( typeof qualifier === "string" ) {
			//����elements�е�elementԪ�ؼ���
			var filtered = jQuery.grep(elements, function( elem ) {
				return elem.nodeType === 1;
			});
	        //isSimple = /^.[^:#\[\.,]*$/,��ѡ��������������:not(***)��ѡ����
			if ( isSimple.test( qualifier ) ) {
				return jQuery.filter(qualifier, filtered, !keep);
			} else {
				//Ĭ��filter������������false�����ܵĻ����ҵ�����qualifier������Ԫ�أ�������grep������Ԫ��
				qualifier = jQuery.filter( qualifier, filtered );
			}
		}
	   //�������qualifier��DOMԪ���������jQuery����
		return jQuery.grep(elements, function( elem, i ) {
			//inArray���ҵ�elem��qualifer�е��±�
			return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
		});
	}
	
	
	
	/*
	 *add by zhangjh   2016-2-20 
	 *var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|
	 *                 header|hgroup|mark|meter|nav|output|progress|section|summary|time|video"	
	 * nodeNames�������е�html5��ǩ
	 * IE9һ�µ��������֧��html5������html5��ǩ��������ȷ�Ĺ���Dom�������ǿ����ֶ���html��ǩ����һ����Ӧ��DOMԪ��
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
		 * wrapMap��������Ҫ�����ı�ǩ�������ֵ��һ�����飬����������Ⱥ����ĸ���ǩ
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
	
/*****************************************************   DOM����ģ�� Manipulation   *****************************************************/
	jQuery.fn.extend({
		/**
		 * add by zhangjh 2016-5-31
		 * ���ڻ�ȡƥ��Ԫ�ؼ���������Ԫ�غϲ�����ı����ݣ���������ÿ��Ԫ�ص��ı�����
		 * @param value   ��ѡ�������������ı����ݻ����Ƿ����ı����ݵĺ���
		 * @returns
		 */
		text: function( value ) {
			return jQuery.access( this, function( value ) {
				return value === undefined ?
					//��ȡƥ��Ԫ�ؼ���������Ԫ�غϲ�����ı�����
					jQuery.text( this ) :
					//Ϊÿһ��Ԫ�������ı��ڵ�
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
	     * ������ƥ��Ԫ�ؼ�����ÿ��Ԫ�ص�ĩβ�������ָ��������,����Ԫ�ص��ڲ�����
	     * @returns
	     */
		append: function() {
			return this.domManip(arguments, true, function( elem ) {
				//�ڻص������е���ԭ������appendchild������Ԫ��
				if ( this.nodeType === 1 ) {
					//elemΪҪ�����DOMԪ��
					this.appendChild( elem );
				}
			});
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * ������ƥ��Ԫ�ؼ�����ÿ��Ԫ�ص�ͷ���������ָ�������ݣ�����Ԫ�ص��ڲ�����
	     * @returns
	     */
		prepend: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					//�ڻص������е���ԭ������insertBefore����Ԫ��
					//��ƥ��Ԫ�صĵ�һ����Ԫ��֮ǰ����DOMԪ�ذ�
					this.insertBefore( elem, this.firstChild );
				}
			});
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * ������ƥ��Ԫ�ؼ��ϵ�ÿ��Ԫ��֮ǰ�������ָ�������ݣ�����Ԫ�ص��������
	     * @returns
	     */
		before: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					//�ڻص�������ͨ�����ڵ����ԭ������insertBefor������Ԫ�أ���elemǰ�����this
					//ƥ�� Ԫ�صĸ��ڵ����insertBefore�������ڵ�ǰԪ����ǰ����DOMԪ��
					this.parentNode.insertBefore( elem, this );
				});//���û�и��ڵ�
			} else if ( arguments.length ) {
				//ͨ��clean������htmlƬ��ת��ΪDOmԪ��
				var set = jQuery.clean( arguments );
				//��ƥ��Ԫ�ز���ת�����DOMԪ��֮��
				set.push.apply( set, this.toArray() );
				//�úϲ����DOMԪ�����鹹���µ�jQuery���󲢷���
				return this.pushStack( set, "before", arguments );
			}
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * ������ƥ��Ԫ�ؼ��ϵ�ÿ��Ԫ�صĺ���������ָ�������ݣ�����Ԫ�ص��������
	     * @returns
	     */
		after: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					//ƥ��Ԫ�صĸ��ڵ����insertBefore�������ڵ�ǰԪ�صĺ���Ҳ����this.nextSibling����DOMԪ��
					this.parentNode.insertBefore( elem, this.nextSibling );
				});
			} else if ( arguments.length ) {
				//���õ�ǰƥ��Ԫ�ؼ����е�Ԫ�ع���һ���µ�jQuery����
				var set = this.pushStack( this, "after", arguments );
				//��ͨ��HTML����ת��Ϊ��DOMԪ�ز����µ�jQuery����ĺ���
				set.push.apply( set, jQuery.clean(arguments) );
				return set;
			}
		},
	
		// keepData is for internal use only--do not document
		/**
		 * add by zhangjh   2016-5-30
		 * ���ĵ����Ƴ�ƥ��Ԫ�ؼ���
		 * @param selector   ��ѡ��ѡ�������ʽ�����ڹ��˴��Ƴ���ƥ��Ԫ��
		 * @param keepData   ��ѡ�Ĳ���ֵ��ָʾ�Ƿ���ƥ��Ԫ���Լ����Ԫ�������������ݺ��¼�
		 */
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						//�Ƴ����������ݺ��¼�
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
	     * �����Ƴ��ĵ���ƥ��Ԫ�ص�������Ԫ��
	     */
		empty: function() {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				// Remove element nodes and prevent memory leaks
				if ( elem.nodeType === 1 ) {
					//�Ƴ����Ԫ�ع��������ݺ��¼�
					jQuery.cleanData( elem.getElementsByTagName("*") );
				}
	
				// Remove any remaining nodes
				while ( elem.firstChild ) {
					//����ԭ���������ظ��Ƴ���һ��Ԫ�أ�ֱ�����е���Ԫ�ض����Ƴ���
					elem.removeChild( elem.firstChild );
				}
			}
	
			return this;
		},
	    /**
	     * add by zhangjh   2016-5-31
	     * ���ڴ���ƥ��Ԫ�ؼ��ϵ���ȸ��Ƹ���
	     * @param dataAndEvents        ��ѡ�Ĳ���ֵ��ָʾ�Ƿ������ݺ��¼�
	     * @param deepDataAndEvents    ��ѡ�Ĳ���ֵ��ָʾ�Ƿ���ȸ������ݺ��¼�
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
	     * ���ڻ�ȡƥ��Ԫ�ؼ����е�һ��Ԫ�ص�HTML���ݻ�������ÿ��Ԫ�ص�HTML����
	     * @param value   HTML��������Ƿ���HTML����ĺ���
	     * @returns
	     */
		html: function( value ) {
			// this->����html�����ĵ�ǰjQuery����
			//accessΪƥ���ÿ��Ԫ������ֵ���߶�ȡ��һ��Ԫ�ص�ֵ
			return jQuery.access( this, function( value ) {
				//elem��ǰjQuery����ĵ�һ��Ԫ��
				var elem = this[0] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined ) {
					//���value��ֵΪ�գ���ȡelem��innerHtml����
					return elem.nodeType === 1 ?
						elem.innerHTML.replace( rinlinejQuery, "" ) :
						null;
				}
	
	            //���value��ֵ���ڣ���ʾΪѡ��Ԫ������html����
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
					!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {
	                //����value
					value = value.replace( rxhtmlTag, "<$1></$2>" );
	
					try {
						for (; i < l; i++ ) {
							// Remove element nodes and prevent memory leaks
							elem = this[i] || {};
							if ( elem.nodeType === 1 ) {
								//�Ƴ����к��Ԫ�ع��������ݺ��¼�
								jQuery.cleanData( elem.getElementsByTagName( "*" ) );
								elem.innerHTML = value;
							}
						}
	                    //����ִ�����ʱ��elem�����0
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch(e) {}
				}
	
				if ( elem ) {
					//���elemΪtrue��˵��������0��û������ִ����ϣ�����append�������Ԫ��
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
	     * ���ڴ��ĵ����Ƴ�ƥ��Ԫ�ؼ��ϣ����ǻᱣ�����Ԫ�غ�ƥ��Ԫ�ع��������ݺ��¼����������Ƴ���Ԫ���Ժ��ٴβ����ĵ��ĳ���
	     * @param selector
	     * @returns
	     */
		detach: function( selector ) {
			return this.remove( selector, true );
		},
	    /**
	     * add by zhangjh   2016-5-30
	     * 
	     * @param args        ���д��������ݵ����� ʹ��$("#aaa").append("aaa","bbb","ccc")��ʱ�򣬵���domManip��argsΪarguments
	     * @param table       ����ֵ��ֻ���Ƿ�����tbodyԪ��
	     * @param callback    ʵ��ִ�в�������Ļص�����
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
	        //���args�е�Ԫ���Ǻ����������ƥ��Ԫ�ؼ��ϣ���ÿ��Ԫ����ִ�иú�����ȡ����ֵ��Ϊ�������ֵ���������÷���domManip
			if ( jQuery.isFunction(value) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					//��ÿ��ƥ��Ԫ����ִ�к���
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip( args, table, callback );
				});
			}
	        //thisָ����ǰ����domManip��jQuery����
			if ( this[0] ) {
				//�����ǰ�ڵ��и��ڵ㣬���ظ��ڵ�
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
	 * ����һ���ĵ�Ƭ��DocumentFragment��Ȼ�����jQuery��clean(elems,context,fragment,script)��html����ת��ΪDOMԪ�أ����洢�ڴ������ĵ�Ƭ����
	 * args:���飬���д�ת��ΪDOMԪ�ص�HTML����
	 * nodes:���飬�����ĵ�����jQuery�������DOMԪ�أ��������������ĵ�Ƭ��DocumentFragment
	 * scripts:���飬���ڴ��html�����е�scriptԪ��
	 */
	jQuery.buildFragment = function( args, nodes, scripts ) {
		var fragment,       //ָ���Ժ���ܴ������ĵ�Ƭ��DocumentFragment 
		    cacheable,      //��ʾhtml�����Ƿ���ϻ�������
		    cacheresults,   //ָ��ӻ������jQuery��fragments��ȡ�����ĵ�Ƭ�Σ����а����˻����DOMԪ��
		    doc,            //��ʾ�����ĵ�Ƭ�ε��ĵ�����
		    first = args[ 0 ];   //HTML����Ƭ��
		// nodes may contain either an explicit document object,
		// a jQuery collection or context object.
		// If nodes[0] contains a valid object to assign to doc
		
	    /*
	     * add by zhangjh   2016-2-17
	     * �����ĵ�����doc
	     * nodes[0] ������һ��DomԪ�ػ�����һ��Jquery����ownerDocument��ʾDomԪ�����ڵ��ĵ�����
	     * ��node[0].ownerDocument���ڵ�ʱ��doc��ֵΪnode[0].ownerDocument��document
	     * ���node[0].ownerDocument�����ڵ�ʱ��doc��ֵΪnodes[0]
	     * ����ʱnodes[0]��һ��Ϊdocument���п�������ͨ��js����
	     */

		if ( nodes && nodes[0] ) {
			doc = nodes[0].ownerDocument || nodes[0];
		}
	
		// Ensure that an attr object doesn't incorrectly stand in as a document object
		// Chrome and Firefox seem to allow this to occur and will throw exception
		// Fixes #8950
		/*
		 * add by zhangjh   2016-2-16
		 * document.createDocumentFragment��������һ���ĵ�Ƭ��
		 * ��doc��Ϊdocument��ʱ�򣬽�doc��ֵΪdocument
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
		 * ���HTML����Ƭ�η��ϻ������������Դӻ������jQuery��fragments�ж�ȡ�����DOMԪ��
		 * args.length===1&&typeof first ==="string"   Ҫ��HTML����Ƭ��ֻ��һ��
		 * first��length<512(1/2 KB)                    ��ֹ����ռ�õ��ڴ����
		 * doc===documnet    ֻ���浥ǰ�ĵ�������DOMԪ�أ����ܻ���������ܵ�
		 * first��charAt(0) === "<"  ֻ����DOMԪ�أ��������ı��ڵ�
		 * ��roncache.test(first)  HTML����Ƭ���в��ܺ���<script>��<object>��<embed>��<option>��<style> ��ǩ��why������
		 * 
		 *
		 */
		if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
			first.charAt(0) === "<" && !rnocache.test( first ) &&
			//��ǰ�����֧�ָ��Ƶ�ѡ��ť�͸�ѡ���ѡ��״̬����HTML����Ƭ���еĵ�ѡ��ť�͸�ѡ��ťû�б�ѡ��
			(jQuery.support.checkClone || !rchecked.test( first )) &&
			//��ǰ�����֧�ָ���HTML5Ԫ�ػ���HTML����Ƭ���в�����HTML5Ԫ��
			(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {
			
	        //���ϻ�������
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
		 * ���ܣ������HTML����ת����DOMԪ�أ�����ȡ���е�scriptԪ��
		 * elems:HTML����Ƭ��
		 * context:document
		 * fragment:�ĵ�����Ƭ��
		 * scripts:script����
		 */
		clean: function( elems, context, fragment, scripts ) {
			var checkScriptType, script, j,
					ret = [];
	
			context = context || document;
	
			// !context.createElement fails in IE with an error but returns typeof 'object'
			//��֤context===document
			if ( typeof context.createElement === "undefined" ) {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
			}
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( typeof elem === "number" ) {
					//������ת��Ϊ�ַ�����һ�ּ��д��
					elem += "";
				}
	
				if ( !elem ) {
					continue;
				}
	
				// Convert html string into DOM nodes
				if ( typeof elem === "string" ) {
					// rhtml = /<|&#?\w+;/,���html����Ƭ�����Ƿ��б�ǩ�����ִ�������ַ����룬��  <afe>,&copy,&#123
					if ( !rhtml.test( elem ) ) {
						//��û�У������ı��ڵ�
						elem = context.createTextNode( elem );
					} else {
						// Fix "XHTML"-style tags in all browsers
						/*
						 * add by zhangjh   2016-2-20
						 * rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
						 * ��������ʽ��������ƥ���Թرձ�ǩ��Ȼ���滻���ǳɶԵı�ǩ������<div/>�޸�Ϊ<div></div>
						 * area,br,embed,hr,img,input,link,meta,param���Թرձ�ǩ������ʹ��(?!  )���˵���<areadiv/>Ҳ��ƥ��
						 * <$1>ָ��([\w:]+)[^>]* 
						 * <$2>ָ��[\w:]+
						 */
						elem = elem.replace(rxhtmlTag, "<$1></$2>");
	
						// Trim whitespace, otherwise indexOf won't work as expected
						//rtagName = /<([\w:]+)/,ȡ��ǩ�ڵ����Ʋ�Сд
						var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						    //��ǩ�ĸ���ǩ
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
						//��ʱ��divָ��divԪ�أ������������div=div��lastChild
						//��˼���ǵ�ǰ���div�д���tbody
						//���htmlƬ����û��tbodyƬ�εĻ�������������table
						if ( !jQuery.support.tbody ) {
	                         //table�а���tbody
							// String was a <table>, *may* have spurious <tbody>
							// rtbody = /<tbody/i,
							var hasBody = rtbody.test(elem),
							    //!hasBody  hasBody true������tbody  false����û��tbody
								tbody = tag === "table" && !hasBody ?
						    //����Ϊʲô��һ���divָ�����divԪ��   
										//tag��table��ʱ��wrap�ǿյģ����Ϊ0������div��divԪ��
									div.firstChild && div.firstChild.childNodes :
	
									// String was a bare <thead> or <tfoot>
								    //wrap[1]==="<table>",���Ϊ1��divָ��table
									wrap[1] === "<table>" && !hasBody ?
										div.childNodes :
										[];
	                        //�Ƴ�������Զ�����Ŀ�tbodyԪ��
							for ( j = tbody.length - 1; j >= 0 ; --j ) {
								if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
									tbody[ j ].parentNode.removeChild( tbody[ j ] );
								}
							}
						}
	
						// IE completely kills leading whitespace when innerHTML is used
						// rleadingWhitespace = /^\s+/  �ж��ַ����Ƿ��Կո�ʼ
						if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
							//��������������ǰ���հ׷�����ǰ���հ׷����ɵ��ı��ڵ�����һ���ӽڵ��ǰ��
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
	     * �����Ƴ����DOMԪ�ع�����ȫ�����ݺ�ʱ��
	     * @param elems ���Ƴ���Ԫ��
	     */
		cleanData: function( elems ) {
			var data, id,
				cache = jQuery.cache,
				special = jQuery.event.special,
				deleteExpando = jQuery.support.deleteExpando;
	
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				//�ж�elem�ǲ��ǿ������õ�
				if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
					continue;
				}
	            //��ȡ����ID
				id = elem[ jQuery.expando ];
	
				if ( id ) {
					//��ȡ����ID��Ӧ������
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

/*************************************************************   ��ʽ����ģ�� CSS   ******************************************************************/
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
	
	
	
/***************************************************************   �첽����Ajax   ***************************************************************/	
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
		//ǰ�ù�������,�ṹΪ����������ǰ�ù����������ӳ��
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		//�������������ṹΪ����������������������������ӳ��
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
		//ajaxLocation��¼��ǰҳ���url
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
	//����url��ͷ����Ϣ��Э�顢���������˿ں�
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	/**
	 * add by zhangjh  2016-5-21
	 * Ϊ����prefilters���ǰ�ù�������Ϊ����transports������������
	 * ʹ�÷�����
	 *     jQuery.ajaxPrefilter=addToPrefiltersOrTransports( prefilters )
	 *     jQuery.ajaxTransport= addToPrefiltersOrTransports( transports )
	 * ����һ���������ں���ĳ����У��������������Ϊǰ�ù�����������������Ӷ�Ӧ���͵Ĵ�����
	 * @param structure    ����prefilters����transports
	 */
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		/**
		 * add by zhangjh  2016-5-21
		 * @param  dataTypeExpression
		 *      �ַ�������ѡ�ģ���ʾһ�����߶���ո�����������ͣ����硰json��jsonp��
		 * @param  func
		 *      ��ʾ�������Ͷ�Ӧ��ǰ�ù�������������������������
		 */
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				//����dataTypeExpression��func
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			if ( jQuery.isFunction( func ) ) {
				// rspacesAjax = /\s+/   ���������Ͱ��տո�ָ�
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
					//�������������+��ʼ
					placeBefore = /^\+/.test( dataType );
					if ( placeBefore ) {
						//��+***������Ϊ��***��
						dataType = dataType.substr( 1 ) || "*";
					}
					//�����˱հ�ԭ��
					list = structure[ dataType ] = structure[ dataType ] || [];
					// then we add to the structure accordingly
					//������������ԡ�+����ͷ������������ͷ����������������β��
					list[ placeBefore ? "unshift" : "push" ]( func );
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	/**
	 * add by zhangjh   2016-5-24
	 * ����Ӧ��ǰ�ù�����������������
	 * @param structure
	 *           ǰ�ù�����������������
	 * @param options
	 *           ��ǰ���������ѡ�
	 * @param originalOption
	 *           ��������jQuery.ajax��ԭʼѡ�
	 * @param jqXHR
	 *           ��ǰ�����jqXHR����
	 * @param dataType
	 *           ��ʾ�������͵��ַ���
	 * @param inspected
	 *           ����Ѿ�ִ�й����������͵Ķ��󣬾��ڵݹ���øú���ʱ������
	 */
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
			dataType /* internal */, inspected /* internal */ ) {
	
		dataType = dataType || options.dataTypes[ 0 ];
		inspected = inspected || {};
	
		inspected[ dataType ] = true;
	        //ȡ���������Ͷ�Ӧ��ǰ�ù��������������������������������
		var list = structure[ dataType ],
			i = 0,
			length = list ? list.length : 0,
			//���structure��ǰ�ù�����prefilters��executeOnlyΪtrue����ʾִ�У�û�з���ֵ������Ϊfalse����ʾ��ֻ��ִ�У������з���ֵ
			executeOnly = ( structure === prefilters ),
			selection;
	
		for ( ; i < length && ( executeOnly || !selection ); i++ ) {
			//ִ������list�еĺ���
			selection = list[ i ]( options, originalOptions, jqXHR );
			// If we got redirected to another dataType
			// we try there if executing only and not done already
			if ( typeof selection === "string" ) {
				//�����������ֵ���������ַ���������ǰ�����ض�������һ����������
				if ( !executeOnly || inspected[ selection ] ) {
					//����ǻ�ȡ����������������selectionΪundefined����������ִ������list�еĺ���
					//���������ǰ�ù������������ض�������������Ѿ��������������selectionΪundefined����������ִ������list�еĺ��� 
					selection = undefined;
				} else {
					//�����ǰ�ù������������ض������������û�д����
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
	 * ��Դ����src�е�������Ⱥϲ���Ŀ�����target������
	 * @param target    �ϲ���Ŀ�����
	 * @param src       �ϲ���Դ����
	 */
	function ajaxExtend( target, src ) {
		var key, deep,
		    //flatOptions�к��в�����Ⱥϲ������ԣ�����context��ur
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				//�����������context��url����ֱ��д��target�У�������ǣ��Ƚ�ֵ��������ʱ����deep��
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			//����ʱ����deep�е�������ȸ��Ƶ�����target��
			jQuery.extend( true, target, deep );
		}
	}
	
	jQuery.fn.extend({
		/**
		 * add by zhangjh   2016-5-26
		 * ����ӷ������������ݣ��������ص�HTML����ƥ��Ԫ����
		 * @param url        �����ַ
		 * @param params     ��ѡ�Ķ������ַ������������󱻷��͵�����������Ӧ����jQuery.ajax()�е�data
		 * @param callback   �ص�����
		 * @returns
		 */
		load: function( url, params, callback ) {
			if ( typeof url !== "string" && _load ) {
				//���url�����ַ����������ͬ�����¼���ݷ���.load(data,fn)??
				return _load.apply( this, arguments );
	
			// Don't do a request if no elements are being requested
			} else if ( !this.length ) {
				return this;
			}
	
			var off = url.indexOf( " " );
			if ( off >= 0 ) {
				//���url�к��пո�
				var selector = url.slice( off, url.length );
				//����url
				url = url.slice( 0, off );
			}
	
			// Default to a GET request
			//Ĭ��Ϊget����   get��post������ʲô���𣿣�
			var type = "GET";
	
			// If the second parameter was provided
			if ( params ) {
				// If it's a function
				if ( jQuery.isFunction( params ) ) {
					// We assume that it's the callback
					//���params�Ǻ���������callback
					callback = params;
					params = undefined;
	
				// Otherwise, build a param string
				} else if ( typeof params === "object" ) {
					//���params�Ƕ������л�Ϊ�ַ���
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
				//Ϊʲô��complete������
				complete: function( jqXHR, status, responseText ) {
					// Store the response as specified by the jqXHR object
					//��ȡԭʼ��Ӧ����
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
	     * �����һ���Ԫ�����л�Ϊһ��url��ѯ��
	     * @returns
	     */
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
	    /**
	     * add by zhangjh   2016-5-26
	     * �����һ���Ԫ�ر���Ϊһ����������
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
	 * ajaxStart(): ����Ϊȫ���¼�ajaxStart�󶨴�����
	 *     ����ʲôʱ�򣬵�һ��AJAX����Ҫ������ʱ��jQuery���鵱ǰ�Ƿ���������Ծ��(δ��ɵ�)AJAX����
	 *     ����ڽ�����û���ҵ�������Ծ��AJAX����jQuery�ͻᴥ��ajaxStart�¼���
	 *     ��ʱ��ͨ��ajaxStart()�����󶨵������¼�������������ִ�С�      
	 * ajaxStop(): ����Ϊȫ���¼�ajaxStop�󶨴�����
	 *     ����Ajax�����ں�ʱ��ɣ�jQuery�������Ƿ��������Ajax����
	 *     ��������ڣ���jQuery�ᴥ����ajaxStop�¼����ڴ�ʱ��.ajaxStop() ����ע����κκ������ᱻִ�С�
	 * ajaxComplete():����Ϊȫ���¼�ajaxComplete�󶨴�����
	 *     ��ajax�������ʱ��������û�з��سɹ������ᴥ��ajaxComplete�¼�����
	 * ajaxError(): ����Ϊȫ���¼�ajaxError�󶨴�����
	 *     ��ajax������ɲ��ҷ��������ʱ�򣬴���ajaxError�¼�
	 * ajaxSuccess(): ����Ϊȫ���¼�ajaxSuccess�󶨴�����
	 *     ��ajax������ɲ��ҳɹ�ʱ������ajaxSuccess�¼�
	 * ajaxSend(): ����Ϊȫ���¼�ajaxSend�󶨴�����
	 *     ��ajax����ʼʱ����������
	 */
	jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
		jQuery.fn[ o ] = function( f ){
			return this.on( o, f );
		};
	});
	/**
	 * add by zhangjh  2016-5-26
	 * �����ݵķ���
	 * jQuery.get(url,data,callback,type)    ���÷���jQuery.ajax({type:"get",data:data,success:callback,dataType:type})
	 * jQuery.post(url,data,callback,type)   ���÷���jQuery.ajax({type:"post",data:data,success:callback,dataType:type})
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
	     * ʹ��http get����ӷ������˼���һ��js�ļ���ִ��
	     * @param url         �����ַ
	     * @param callback    �ص�����
	     * @returns
	     */
		getScript: function( url, callback ) {
			//�൱��$.ajax({url:...,type:'get',success:function(){},dataType:script})
			return jQuery.get( url, undefined, callback, "script" );
		},
	    /**
	     * add by zhangjh   2016-5-26
	     * @param url         �����ַ
	     * @param data        ����������
	     * @param callback    �ص�����
	     * @returns
	     */
		getJSON: function( url, data, callback ) {
			////�൱��$.ajax({url:...,type:'get',success:function(){},dataType:json})
			return jQuery.get( url, data, callback, "json" );
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		/**
		 * add by zhangjh   2016-5-21
		 * Ϊ��ǰ����������������ѡ�
		 * ��ajaxĬ��ѡ�ajaxSettrings���Զ���ѡ�settrings��������Ⱥϲ�һ�����󣬲�����
		 * @param target      Ŀ�����       
		 * @param settings    ��Ҫ����Ķ���  
		 */
		ajaxSetup: function( target, settings ) {
			if ( settings ) {
				//ajaxSetup(a,b)
				// Building a settings object
				ajaxExtend( target, jQuery.ajaxSettings );
			} else {
				// Extending ajaxSettings
				//ajaxSetup(a)
				//ΪjQuery.ajaxSetting�����������
				settings = target;
				target = jQuery.ajaxSettings;
			}
			ajaxExtend( target, settings );
			return target;
		},
	    /**
	     * add by zhangjh   2016-5-21
	     * ajaxĬ��ѡ�
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
			//ת�����ͺͶ�Ӧ��ת������
			converters: {
	
				// Convert anything to text
				//���������͵�����ת��Ϊ�ַ�����ͨ�����캯��window.String()ת��
				"* text": window.String,
	
				// Text to html (true = no transformation)
				//���ַ���ת��ΪHTML���룬ֵΪtrue��ʾ����Ҫת��
				"text html": true,
	
				// Evaluate text as a json expression
				//���ַ���ת��ΪJSON����
				"text json": jQuery.parseJSON,
	
				// Parse text as xml
				//���ַ���ת��ΪXML�ĵ�
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			//����Ҫ���copy������
			flatOptions: {
				context: true,
				url: true
			}
		},
	    //Ϊprefilters���ǰ�ù�������addToPrefiltersOrTransports(prefilters)����һ���������ú�����������������һ�������ͣ���һ���Ƕ�Ӧ�Ļص�������
		//����ʹ���˱հ������ʹ��ajaxPrefilter��ʱ�򣬿��Զ�ǰ�ù�����prefilters���в���
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		//ʹ�÷�����ajaxPrefilter��ͬ
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		/**
		 * add by zhangjh  2016-5-17
		 * ����ִ��һ���첽HTTP(Ajax����)
		 * @url       ����URL�ַ���  
		 * @options   һ��ѡ���ֵ�ԣ���������Ajax����
		 */
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			//��������url�Ƕ���������url��option
			//֧��$.ajax(url,options)??
			//   $.ajax(options) ??  ����option��һ�����������и������ԣ�����url��data��success
			//����һ���ʹ����$.ajax({url:"***",data:{},type:"POST",success:function(){}}),�ö�url��option��������
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			//����options
			options = options || {};
	
			var // Create the final options object
			    //Ϊ��ǰ����������������ѡ���s�е����԰���ajaxĬ��ѡ�+�Զ���ѡ�options
				s = jQuery.ajaxSetup( {}, options ),
				// Callbacks context
				//�ص�����������
				callbackContext = s.context || s,
				// Context for global events
				// It's the callbackContext if one was provided in the options
				// and if it's a DOM node or a jQuery collection
				//Ajaxȫ���¼���������
				globalEventContext = callbackContext !== s &&
					( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
							jQuery( callbackContext ) : jQuery.event,
				// Deferreds
				//����һ���첽���У����ڴ�źʹ����ɹ��ص�������ʧ�ܻص�����
				deferred = jQuery.Deferred(),
				//����һ���ص������б����ڴ�źʹ�����ɻص���������
				completeDeferred = jQuery.Callbacks( "once memory" ),
				// Status-dependent callbacks
				//���������״̬��Ļص���������������������Ӧʱ��״̬���Ӧ�Ļص���������ִ��
				statusCode = s.statusCode || {},
				// ifModified key
				/**
				 * ����ֵΪѡ��url������ǰ����ĵ�ַ
				 * ��ǰ������Ӧ����Ժ����ifModifiedΪtrue������ǰ���������ĵ�ַ��Ϊ�������洢�ڶ���jQuery.lastModified(��ӦͷLast-Modified��ֵ����ʾ������Դ������޸�ʱ��)
				 *     �Ͷ���jQuery.etag��(��ӦͷEtag��ֵ����ʾ�����ʶ)
				 * ��������ʱ�����ifModifiedΪtrue������������ͷif-modified-since��if-None-Match��ֵ��ֵΪ���һ����Ӧͷ����Ӧ��ֵ
				 * 
				 * �������Ὣ����ͷif-modified-since��ֵ��������Դ������޸�ʱ����бȽϣ����һ���򷵻�304�����᷵�����ݣ������һ�£�����200���µ����ݣ�
				 * ������������ͷif-None-Match��ֵ�����������������ʶ���бȽϣ����һ���ⷵ��304�����᷵�����ݣ������һ�£��򷵻�200���µ�����
				 * �����������ǿ��Գ���������������
				 */
				ifModifiedKey,
				// Headers (they are sent all at once)
				//�洢����ͷ���������Ͷ�Ӧ������ֵ    ����
				requestHeaders = {},
				//�洢����ͷ������������
				requestHeadersNames = {},
				// Response headers
				//���ڴ洢��Ӧͷ�ַ�������
				responseHeadersString,
				//���ڴ洢���������Ӧͷ��ֵ����
				responseHeaders,
				// transport
				//ָ��Ϊ��ǰ����������������������send()��abort()����
				transport,
				// timeout handle
				//��ʱ��ʱ��
				timeoutTimer,
				// Cross-domain detection vars
				//���飬��Ž�����ǰ����ĵ�ַ�õ���Э�顣��������IP���˿ڣ������жϵ�ǰ�����Ƿ����
				parts,
				// The jqXHR state
				//��ʾ��ǰ����jqXHR�����״̬����ѡֵ��0��1��2���ֱ��ʾ��ʼ״̬�������С���Ӧ�ɹ�
				state = 0,
				// To know if global events are to be dispatched
				//�Ƿ񴥷�ȫ�ֵ�Ajax�¼�
				fireGlobals,
				// Loop variable
				i,
				// Fake xhr
				//jqXHR�������ԭ��XMLHttpRequest����ĳ�������������������XMLHttpRequestʱ��jqXHR����ᾡ���ܵ�ģ��XMLHttpRequest�Ĺ���
				//XMLHttpRequest??
				jqXHR = {
	                /**
	                 * ��ʾ��ǰjqXHR�����״̬
	                 * readyState���Զ�ӦXMLHttpRequest�����ͬ�����ԣ���0-4 5��״̬
	                 * 0:Uninitialized,��ʼ��״̬��XMLHTTPRequest�����Ѿ����������߱�abort��������
	                 * 1:Open,open()�����Ѿ����ã���send()������û�е��ã�����û�б�����
	                 * 2:Sent,send()�����Ѿ����ã�HTTP�����Ѿ��͵���Web������,δ���յ���Ӧ
	                 * 3:Receiving,������Ӧͷ�����Ѿ����յ�����Ӧ�忪ʼ���յ�δ���
	                 * 4:Loaded HTTP��Ӧ�Ѿ���ȫ����
	                 * readyState��ֵ����ݼ������ǵ�һ�������ڴ�������е�ʱ�������abort����open����
	                 * ÿ��������Ե�ֵ���ӵ�ʱ�򣬶��ᴥ��onreadystatechange �¼�
	                 */
					readyState: 0,
					
					//status        //��Ӧ��HTTP״̬�룬200��ʾ�ɹ���404��ʾNot Found
					//statusText    //��Ӧ��HTTP״̬����  �ɹ� or Not Found
					//ĿǰΪֹΪ���������յ�����Ӧ�壿���������readyStateС��3��Ϊ�գ����Ϊ3����ʾ�Ѿ����յ���Ӧ���֣�
					//���Ϊ4��Ϊ��������Ӧ��
					//reponseText   
					// ���������Ӧ������ΪXML����ΪDocument���󷵻�
	                //reponseXML    //��Ӧ��XML�ĵ�
					// Caches the header
					
				    /**
				     * add by zhangjh   2016-5-19
				     * ��������ͷ����ӦXMLHTTPRequest�����ͬ������,��name������requestHeaderNames�У�
				     * ��value������requestHeaders�У���XMLHTTPRequest�����ͬ������ʹ�ã�����
				     * XMLHTTPRequest�����ͬ������setRequestHeader������ָ����һ��HTTP�����ͷ��
				     * @param name      ͷ��������
				     * @param value     ͷ������ֵ
				     */
					setRequestHeader: function( name, value ) {
						if ( !state ) {
							//��ʾ��������
							var lname = name.toLowerCase();
							//requestHeadersNames���ڼ�¼http����ͷ���������������е�����Ϊ{lname:name},lnameΪȫ��Сд
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							//requestHeaders���ڼ�¼http����ͷ����name��Ӧ��������value��Ӧ����ֵ
							requestHeaders[ name ] = value;
						}
						//����jqXHR����
						return this;
					},
	
					// Raw string
					/**
					 * add by zhangjh   2016-5-19
					 * ��ȡ��Ӧͷ�ַ�������ӦXMLHTTPRequest�����ͬ������
					 * ��HTTP��Ӧͷ����Ϊδ�������ַ�������
					 * ���readyState<3���Ż�null�����򷵻ط��������͵�HTTP��Ӧ��ͷ��
					 */
					getAllResponseHeaders: function() {
						//state��jqXHR�����״̬��0��ʾ��ʼ��״̬��1��ʾ�������У�2��ʾ���������
						//����Ӧ���ʱ�������XMLHTTPRequest�����getALLResponseHeaders������ȡ��Ӧͷ��Ϣ����������responseHeadersString��
						//responseHeadersString��ֵ����
						return state === 2 ? responseHeadersString : null;
					},
	
					// Builds headers hashtable if needed
					/**
					 * add by zhangjh   2016-5-19
					 * ��ȡָ�����Ƶ���Ӧͷ��ֵ����XMLHTTPRequest�����getALLResponseHeaders����ǿ��
					 * ����ָ����HTTP��Ӧͷ����ֵ
					 */
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								//rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,ȫ��ƥ��ģʽ+����ƥ��ģʽ
								while( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match === undefined ? null : match;
					},
	
					// Overrides response content-type header
					//���ڸ���MIME����
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},
	                /**
	                 * add by zhangjh   2016-5-19
	                 * XMLHTTPRequestͬ������ abort
	                 *    ȡ����ǰ��Ӧ���ر����Ӳ��ҽ����κ�δ������������readyState������Ϊ0
	                 * @param statusText
	                 * @returns {___anonymous280884_283821}
	                 */
					// Cancel the request
					abort: function( statusText ) {
						statusText = statusText || "abort";
						//ָ��Ϊ��ǰ����������������
						if ( transport ) {
							transport.abort( statusText );
						}
						//���ûص�����done����ʧ�ܻص�����
						done( 0, statusText );
						return this;
					}
				};
	
			// Callback for when everything is done
			// It is defined here because jslint complains if it is declared
			// at the end of the function (which would be more logical and readable)
			/**
			 * add by zhangjh   2016-5-19
			 * ���ƺ����˷�װ�������ڷ���������Ӧ��ɺ󱻵��ã���ִ�еĶ����������������õ��ı�������ȡ��Ӧ���ݡ�ת���������͡�ִ�лص�����������ȫ���¼�
			 * @param states              //��ӦXMLHTTPRequest�����ͬ�����ԣ���ʾ��Ӧ��HTTP״̬��
			 * @param nativeStatusText    //��ӦXMLHTTPRequest�����statusText,��ʾ��Ӧ��http״̬����
			 * @param resonses            //���󣬺�������text����xml���ֱ��ӦXMLHTTPRequest�����responseText��responseXM����
			 * @param headers             //��Ӧͷ�ַ�������Ӧ��ɺ�ͨ������XMLHTTPRequest����ķ���getALLResponseHeaders()ȡ��
			 */
			function done( status, nativeStatusText, responses, headers ) {
	
				// Called once
				//state:0,��ʼ״̬��1,������;2,�����
				if ( state === 2 ) {
					//�����Ӧ����ɣ�ֱ�ӷ���
					return;
				}
	
				// State is "done" now
				//������Ӧ״̬����ִ��done��ʱ�򣬱�ʾ��Ӧ�Ѿ����
				state = 2;
	
				// Clear timeout if it exists
				//�������������ʱ��ʱ����ȡ����
				if ( timeoutTimer ) {
					clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				//����������������ã�ʹ���������վ�������ķ���������
				transport = undefined;
	
				// Cache response headers
				//����Ӧͷ�ַ������浽����responseHeadersString��
				//������
				responseHeadersString = headers || "";
	
				// Set readyState
				//����jxXHR�����readyState״̬��4��ʾ��Ӧ���
				jqXHR.readyState = status > 0 ? 4 : 0;
	            //isSuccess ָʾ�˴������Ƿ���Ӧ�ɹ�����ȷ��������
				var isSuccess,
				    //���ڴ��ת���������
					success,
					//��ʾ����״̬��������ָ������׳����쳣����
					error,
					//��ʾ��ǰ�����״̬ ����
					statusText = nativeStatusText,
					//����ajaxHandlerResponses�����������ͣ�����ȡ��Ӧ����
					response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
					//���ڴ����ӦͷLast-Modified��ֵ����ֵ��ʾ������Դ������޸�ʱ��
					lastModified,
					//���ڴ����ӦͷEtag��ֵ����ʾ�����ʶ
					etag;
	
				// If successful, handle type chaining
					/*
					 * ״̬��:
					 * 1XX-��ʾ��ʱ��Ӧ��������Ҫ�����߼���ִ�в�����״̬��
					 *   100(����)�����������شδ����ʾ�Ѿ��յ������һ���֣����ڵȴ����ಿ�֣�
					 *   101(�л�Э��)����������Ҫ��������л�Э�飬��������ȷ�ϲ�׼���л�
					 * 2XX-��ʾ�ɹ������������״̬��
					 *   200(�ɹ�): �������ѳɹ����������󣬱�ʾ�������ṩ���������ҳ
					 *   201(�Ѵ���):����ɹ����ҷ������������µ���Դ
					 *   202(�ѽ���):�������ѽ������󣬵�����δ����
					 *   203(����Ȩ��Ϣ):�������ѳɹ����������󣬵����ص���Ϣ����������һ��Դ
					 *   204(������):�������ɹ����������󣬵�û�з����κ�����
					 *   205(��������):�������ɹ����������󣬵�û�з����κ����ݣ�����ӦҪ�������������ĵ�����
					 *   206(��������):�������ɹ������˲���GET����
					 * 3XX-Ҫ���������Ҫ��һ��������ͨ�������ض���
					 *   300(����ѡ��):������󣬷�������ִ�ж��ֲ�������
					 *   301(�����ƶ�):�������ҳ�Ѿ��ƶ�������λ�ã���
					 *   302(��ʱ�ƶ�):������Ŀǰ�Ӳ�ͬλ�õ���ҳ��Ӧ���󣬵�������Ӧ����ʹ��ԭ��λ������Ӧ�Ժ������
					 *   303(�鿴����λ��):������Ӧ���Բ�ͬ��λ��ʹ�õ�����GET������������Ӧʱ�����������ش˴���
					 *   304(δ�޸�):�Դ��ϴ�������������ҳδ�޸Ĺ�
					 *   305(ʹ�ô���):������ֻ��ʹ�ô�������������ҳ
					 *   307(��ʱ�ض���):������Ŀǰ�Ӳ�ͬλ�õ���ҳ��Ӧ���󣬵�������Ӧ����ʹ��ԭ����λ����Ӧ�Ժ�����󣿣�
					 * 4XX-������������˷������Ĵ���
					 *   400(��������):�����������������﷨
					 *   401(δ��Ȩ):����Ҫ�������֤
					 *   403(��ֹ):�������ܾ�����
					 *   404(δ�ҵ�):�������Ҳ����������ҳ
					 *   405(��������):����������ָ���ķ���  
					 *   406(������):�޷�ʹ�����������������Ӧ�������ҳ
					 *   407(��Ҫ������Ȩ):��ʾ������Ӧ��ʹ�ô���
					 *   408(����ʱ):�������Ⱥ�����ʱ��ʱ
					 *   409(��ͻ):���������������ʱ������ͻ
					 *   410(��ɾ��):����������Դ�����õ�ɾ�����������᷵�ش���Ӧ
					 *   411(��Ҫ��Ч����):�����������ܲ�������Ч���ݳ��ȱ�ͷ�ֶε�����
					 *   412(δ����ǰ������):������δ��������������ף�����õ����е�һ��ǰ������
					 *   413(����ʵ�����):�������޷�����������Ϊ����ʵ����󣬳����������Ĵ�������
					 *   414(����url����):�����url�������������޷�����
					 *   415(��֧�ֵ�ý������):����ĸ�ʽ��������ҳ���֧��
					 *   416(����Χ������Ҫ��):���ҳ���޷��ṩ����ķ�Χ������������ش�״̬��
					 *   417(δ��������ֵ):������δ�������������ͷ�ֶε�Ҫ��
					 * 5XX-���������󣬱�ʾ�������ڴ�������ʱ�����ڲ�������Щ��������Ƿ���������Ĵ��󣬶������������
					 *   500(�������ڲ�����):���������������޷��������
					 *   501(��δʵʩ):���������߱��������Ĺ���
					 *   502(��������):��������Ϊ���ػ���������η������յ���Ч��Ӧ
					 *   503(���񲻿���):������Ŀǰ�޷�ʹ��(���ڳ��ػ�ͣ��ά��)��ͨ��ֻ����ʱ
					 *   504(���س�ʱ):��������Ϊ���ػ����û�м�ʱ�����η������յ�����
					 *   505(HTTP�汾����֧��):��������֧�����������õ�HTTPЭ��汾
					 */
				if ( status >= 200 && status < 300 || status === 304 ) {
	                //��ʾ��Ӧ�ɹ�
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
	                    //���������ѡ��ifModified�����¼��ӦͷLast-Modified��Etag��������һ�ζ�ͬһ��ַ������
						if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
							//last-Modified  ����޸�ʱ��
							jQuery.lastModified[ ifModifiedKey ] = lastModified;
						}
						if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
							//Etag�����ʶ
							jQuery.etag[ ifModifiedKey ] = etag;
						}
					}
	
					// If not modified
					if ( status === 304 ) {
	                    //���״̬��Ϊ304����ʾ�������Դû�б仯
						statusText = "notmodified";
						isSuccess = true;
	
					// If we have data
					} else {
	                    //���״̬����200-300����ʾ��������ɹ�����������Ӧ����
						try {
							//����ajaxConvert����Ӧ������ת��Ϊ����������
							//s:����������ѡ�,response:��Ӧ����
							//success���ڴ��ת���ɹ��������
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
					//�����Ӧʧ�ܣ�
					error = statusText;    //��Ӧʧ�ܺ��״̬����
					if ( !statusText || status ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				//����jqXHR�����status����Ӧ״̬(200,304...)
				jqXHR.status = status;
				//����jqXHR�����statusText����Ӧ״̬����
				jqXHR.statusText = "" + ( nativeStatusText || statusText );
	
				// Success/Error
				if ( isSuccess ) {
					//�����Ӧ�ɹ�����������ת���ɹ�������÷��������ɹ��ص�����
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					//�����Ӧʧ�ܣ�����÷�������ʧ�ܻص�����
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				//���÷���statusCodeִ��״̬���Ӧ�Ļص�����
				//status���״̬���Ӧ�Ļص�����
				jqXHR.statusCode( statusCode );
				
				statusCode = undefined;
	            
				if ( fireGlobals ) {
					//���ѡ��globalΪtrue����Ϊ����ȫ���¼����������Ӧ�Ƿ�ɹ�����������ת���Ƿ�ɹ�����������ȫ���¼�ajaxSuccess����ajaxError
					globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
							[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				//����completeDeferred������ɻص�����
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					//����ȫ���¼�
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			// Attach deferreds
			//ΪjqXHR���������첽����ֻ�������еķ�����ʹ��jqXHR��������첽���е���Ϊ����
			deferred.promise( jqXHR );
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
			jqXHR.complete = completeDeferred.add;
	
			// Status-dependent callbacks
			//����  ִ��״̬��ص������ķ���
			jqXHR.statusCode = function( map ) {
				if ( map ) {
					var tmp;
					if ( state < 2 ) {
						//�������δ���ͣ��������ڴ����У��������statusCode�����״̬���Ӧ�Ļص�����
						for ( tmp in map ) {
							statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
						}
					} else {
						//�����������ɣ���״̬���Ӧ�Ļص�����ͬʱ��ӵ��첽���еĳɹ���ʧ�ܻص������б���
						//��ȡ״̬���Ӧ�Ļص�����
						tmp = map[ jqXHR.status ];
						jqXHR.then( tmp, tmp );
					}
				}
				//����jqXHR����
				return this;
			};
	
			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
			// We also use the url parameter if available
			
			//����url����ȡ��ǰ�����url����$.ajax({url:***....})�е�url
			s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );
	
			// Extract dataTypes list
			//��dataType�ÿհ׷��ָ������飬����ֵ��ѡ��dataTypes��ѡ��dataType��ʾ�����ӷ��������ص������Ǻ����ͣ���Ч������:xml��html��script��json��jsonp��text
			//���δָ��dataType����Ĭ��Ϊ��*��
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );
	
			// Determine if a cross-domain request is in order
			//crossDomain��ʾ�Ƿ����
			//�жϵ�ǰ����ʱ�����
			if ( s.crossDomain == null ) {
				//���δָ����ǰ�����Ƿ����
				parts = rurl.exec( s.url.toLowerCase() );
				//������url�н�����Э�顢IP���˿ڣ�Ȼ���뵱ǰҳ���url���бȽϣ�ֻҪ��һ����ϣ�����Ϊ�ǿ���
				s.crossDomain = !!( parts &&
					( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
						( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
							( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
				);
			}
	
			// Convert data if not already a string
			//���ѡ��processDataΪtrue��data�����ַ����������jQuery.param�������л�Ϊ�ַ���
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				//��֯���������еĲ��� data:{hy_id:"aaa",jt_id:"123"}->hy_id=aaa&jt_id=123
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			//Ӧ��ǰ�ù���������������ѡ���
			
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			//�����ѡ��datatype��Ӧ�Ĺ������е���jqXHR.abort()ȡ���˱���������ֱ�ӷ��أ���
			if ( state === 2 ) {
				return false;
			}
	
			// We can fire global events as of now if asked to
			fireGlobals = s.global;
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			//�жϵ�ǰ�����Ƿ��������
			s.hasContent = !rnoContent.test( s.type );
	
			// Watch for a new set of requests
			//���Ϊ����ȫ���¼�����û������Ajax��������ִ�У����ֶ�����ȫ�����¼�ajaxStart����
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// More options handling for requests with no content
			//���û���������ݣ�������ѡ��url
			if ( !s.hasContent ) {
	
				// If data is available, append data to url
				if ( s.data ) {
					//���������ѡ��data����ѡ��data���ӵ�ѡ��url֮��
					s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Get ifModifiedKey before adding the anti-cache parameter
				ifModifiedKey = s.url;
	
				// Add anti-cache in url if needed
				if ( s.cache === false ) {
	                //������û���
					var ts = jQuery.now(),
						// try replacing _= if it is there
					    //��ѡ��url���滻�������ʱ���jQuery.now()
						ret = s.url.replace( rts, "$1_=" + ts );
	
					// if nothing was replaced, add timestamp to the end
					s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				//��������ͷContent-Type
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
			//��������ͷAccept,����ָ��������ɽ��ܵ���Ӧ����
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
					s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			//������������ͷ��Ϣ
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			//����֮ǰ���ûص�����beforeSend���������false��ȡ����������
			if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
					// Abort if not done already
					jqXHR.abort();
					return false;
	
			}
	
			// Install callbacks on deferreds
			//��ӳɹ���ʧ�ܡ���ɻص�����
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}
	
			// Get transport
			//��ȡ����dataType���ε���������
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				//���û���ҵ���Ӧ�ķ���������������ûص�����done������ʧ�ܻص�������������������
				done( -1, "No Transport" );
			} else {
				//
				jqXHR.readyState = 1;
				// Send global event
				if ( fireGlobals ) {
					//����ȫ���¼�ajaxSend
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
				// Timeout
				//�첽��������ʱ�����������ѡ��timeout����Ϊ��ǰ��������һ����ʱ��ʱ��
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = setTimeout( function(){
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					state = 1;
					//��������������send�����������󣬴����ͷ�ͻص�����
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
		 * ���첽����������ݲ������л�Ϊһ��url��ѯ��
		 * @param a              ��������ݲ����������Ƕ���Ҳ������һ�����飨������һ���������飩
		 * @param traditional    ����ֵ��ָʾ�Ƿ�ִ�д�ͳ��ǳ���л�
		 */
		param: function( a, traditional ) {
			var s = [],
			    //��keyֵ��valueֵ�á�=����������
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
				//������������jQuery����
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
			//�á�&����������s�еĲ����ԣ������ո��滻Ϊ"+"??
			return s.join( "&" ).replace( r20, "+" );
		}
	});
	/**
	 * add by zhangjh   2016-5-25
	 * ������л�����Ͷ���
	 * @param prefix         ������
	 * @param obj            ����ֵ
	 * @param traditional    ָʾ�Ƿ�ִ�д�ͳ��ǳ���л�
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
	 * �����ajaxSettring.converters�в�������ת�����ʽ��Ӧ������ת��������ִ�У����޷�ֱ��ת��ʱ����ҿɹ��ɵ���������
	 * @param s           ��ǰ���������ѡ�
	 * @param response    ԭʼ��Ӧ����
	 */
	function ajaxConvert( s, response ) {
	
		// Apply the dataFilter if provided
		if ( s.dataFilter ) {
			//���������ѡ��dataFilter����ִ�и�ѡ���
			response = s.dataFilter( response, s.dataType );
		}
	
		var dataTypes = s.dataTypes,
		    //��ѡ��ajaxSettings.converters�ĸ��������Զ���Сд��
			converters = {},
			i,
			key,
			length = dataTypes.length,
			tmp,
			// Current and previous dataTypes
			//�ӱ���dataTypes��ȡ����һ��Ԫ����Ϊ��ʼ���ͣ�Ŀ������
			current = dataTypes[ 0 ],
			//����pre��ʾĿ�����͵�ǰһ�����ͣ���ת������
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
				//ƴ��ת�����ʽ����ת������-> ת������
				conversion = prev + " " + current;
				//���Ҷ�Ӧ������ת����func
				conv = converters[ conversion ] || converters[ "* " + current ];
	
				// If there is no direct converter, search transitively
				if ( !conv ) {
					//���δ�ҵ������ҿɹ��ɵ���������
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
	 * ΪjQuery.ajaxSettings���jsonp��jsonpCallbck����
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
	 * Ϊǰ�ù��������json��jsonp���Ͷ�Ӧ�Ĵ�����
	 */
	jQuery.ajaxPrefilter( "json jsonp", 
			/**
			 * add by zhangjh   2016-5-25
			 * @param s                     ����������
			 * @param originalSettings      ����$.ajax({....})���������
			 * @param jqXHR                 ����ģ��XMLHTTPRequest
			 */
			function( s, originalSettings, jqXHR ) {
	
		var inspectData = ( typeof s.data === "string" ) && /^application\/x\-www\-form\-urlencoded/.test( s.contentType );
		    //�������������jsonp
		if ( s.dataTypes[ 0 ] === "jsonp" ||
			//����������json������δ��ֹjsonp���󣬲���ѡ��url�к��д���jsonp����������ַ���=��&�� ���ߡ�=��$�� ����"??"  ???ʲô��˼�� 
			s.jsonp !== false && ( jsre.test( s.url ) ||
			       ////����������json������δ��ֹjsonp���󣬲���������data�к��д���jsonp����������ַ���=��&�� ���ߡ�=��$�� ����"??"  ???ʲô��˼��      
					inspectData && jsre.test( s.data ) ) ) {
			
	            //���ڴ����Ӧ����
			var responseContainer,
			    //��ʾjsonp�ص�������
				jsonpCallback = s.jsonpCallback =
					jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			    //���ڱ��ݿ���������window������ע�����ͬ��jsonp�ص���������
				previous = window[ jsonpCallback ],
				url = s.url,
				data = s.data,
				//�����滻ѡ��url��data�д���jsonp����������ַ�
				replace = "$1" + jsonpCallback + "$2";
	        //����url����data������
			if ( s.jsonp !== false ) {
				//����url����
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
			//��window������ע��һ��ͬ���ص����������ڻ�ȡ��Ӧ��json����
			window[ jsonpCallback ] = function( response ) {
				responseContainer = [ response ];
			};
	
			// Clean-up function
			//���÷���jqXHR.always()���һ���ص�������ע����window������ע���ͬ���ص�����
			jqXHR.always(function() {
				// Set callback back to previous value
				window[ jsonpCallback ] = previous;
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( previous ) ) {
					window[ jsonpCallback ]( responseContainer[ 0 ] );
				}
			});
	
			// Use data converter to retrieve json after script execution
			//Ϊ����������ӡ�script json�� ��Ӧ������ת����
			s.converters["script json"] = function() {
				if ( !responseContainer ) {
					jQuery.error( jsonpCallback + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// force json dataType
			//ǿ�����ñ����������������Ϊjson������������������json����
			s.dataTypes[ 0 ] = "json";
	                             
			// Delegate to script
			//ͨ������"script",����ǰ��������������ض���Ϊscript���Ӷ�ʹ�õ�ǰ���󱻵���script���󣬲���Ϊ��ǰ����Ӧ��script��Ӧ��ǰ�ù�����������
			return "script";
		}
	});
	
	
	
	
	// Install script dataType
	/**
	 * add by zhangjh   2016-5-25
	 * ΪjQuery.ajaxSettings��accepts��contents��converters�����Ӧ������
	 */
	jQuery.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /javascript|ecmascript/
		},
		converters: {
			//���ı�ת��Ϊjs����
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	});
	
	// Handle cache's special case and global
	//Ϊǰ�ù��������script ��Ӧ�Ĵ�����
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
	//��������script��Ӧ����������������������һ��������������
	jQuery.ajaxTransport( "script", function(s) {
	
		// This transport only deals with cross domain requests
		//�жϵ�ǰ������������ȷ����ѡ��crossDomainΪtrue��script��Ӧ���������������Ż᷵��һ��������������
		if ( s.crossDomain ) {
	
			var script,
				head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;
	
			return {
	            /**
	             * add by zhangjh  2016-5-24
	             *  ����ͨ��script���ͱ�������
	             * @param _   ��ʾ�����Ļ��߲����õ��ò���
	             * @param callback  �ص�����
	             * @returns
	             */
				send: function( _, callback ) {
	                //����script  
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
	    //�����ǰ�������IE����ʼ������xhrOnUnloadAbortΪһ���������ú����󶨵�window�����unload�¼���
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
	     * function(s)�뵱��������������typeΪ"*"��Ӧ�Ĵ�����
	     * ͨ���*��Ӧ���������������᷵��һ���������������к�����������send��abort���ֱ����ڷ��ͺ�ȡ������
	     * �����ڲ�ͨ��XMLHttpRequest����������
	     */
		jQuery.ajaxTransport(function( s ) {
			// Cross domain only allowed if supported through XMLHttpRequest
			if ( !s.crossDomain || jQuery.support.cors ) {
	            //�����ǰ���󲻿������֧�ֿ�����Դ����
				var callback;
	            //����һ����������
				return {
					/**
					 * add by zhangjh   2016-5-25
					 * ͨ��XMLHttpRequest����������
					 * @param headers   ����ͷ����
					 * @param complete  ��Ӧ�Ĵ�����
					 * @returns
					 */
					send: function( headers, complete ) {
	
						// Get a new xhr
						//����xhr��������XMLHttpRequest����
						var xhr = s.xhr(),
							handle,
							i;
	
						// Open the socket
						// Passing null username, generates a login popup on Opera (#2865)
						//��socket����
						if ( s.username ) {
							//�����Ҫ�����֤������ѡ��username��password
							xhr.open( s.type, s.url, s.async, s.username, s.password );
						} else {
							xhr.open( s.type, s.url, s.async );
						}
	
						// Apply custom fields if provided
						//���������xhrFields���������ѡ��������е����Ժ�����ֵ�������õ�XMLHttpRequest������
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
						//��������ͷX-Requested-WithΪ��XMLHttpRequest������Ǳ�������ʱAjax����
						if ( !s.crossDomain && !headers["X-Requested-With"] ) {
							headers[ "X-Requested-With" ] = "XMLHttpRequest";
						}
	
						// Need an extra try/catch for cross domain requests in Firefox 3
						//��������ͷ��headers������XMLHttpRequest����ķ���setRequestHeader�������
						try {
							for ( i in headers ) {
								//setRequestHeader�����ڷ���open֮��send����֮ǰ����
								xhr.setRequestHeader( i, headers[ i ] );
							}
						} catch( _ ) {}
	
						// Do send the request
						// This may raise an exception which is actually
						// handled in jQuery.ajax (so no try/catch here)
						xhr.send( ( s.hasContent && s.data ) || null );
	
						// Listener
						//����onreadystatechange�¼���������
						callback = function( _, isAbort ) {
							
							//������ȡ��Ӧͷ����Ӧ���ݡ�����״̬�롢���ûص�����done
	
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
	                                //�����ȡ���������������ɣ������ִ�к�������
									// Only called once
									callback = undefined;
	
									// Do not keep as active anymore
									if ( handle ) {
										//����������������ת��Ϊtrue����ʾ����ʱ����onreadystatechange�������½�������Ϊ�պ���
										xhr.onreadystatechange = jQuery.noop;
										if ( xhrOnUnloadAbort ) {
											delete xhrCallbacks[ handle ];
										}
									}
	
									// If it's an abort
									if ( isAbort ) {
										//�������isAbort����ת��Ϊtrue�����ҵ�ǰ����δ��ɣ������XMLHttpRequest����ķ���abortȡ����������
										// Abort it manually if needed
										if ( xhr.readyState !== 4 ) {
											xhr.abort();
										}  //��ȡ״̬�롢��Ӧͷ�ַ�������Ӧ���ݡ�״̬����
									} else {
										//��ȡ״̬��
										status = xhr.status;
										//��ȡ��Ӧͷ�ַ���
										responseHeaders = xhr.getAllResponseHeaders();
										
										responses = {};
										xml = xhr.responseXML;
	
										// Construct response list
										if ( xml && xml.documentElement /* #4958 */ ) {
											//���Զ�ȡresponseXML
											responses.xml = xml;
										}
	
										// When requesting binary data, IE6-9 will throw an exception
										// on any attempt to access responseText (#11426)
										try {
											//���Զ�ȡresponseText
											responses.text = xhr.responseText;
										} catch( _ ) {
										}
	
										// Firefox throws an exception when accessing
										// statusText for faulty cross-domain requests
										try {
											//���Զ�ȡstatusText��Ӧ״̬����
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
								//�����Ӧ��ɲ��ҳɹ�������ûص�����done�������ɹ��ص�����
								complete( status, statusText, responses, responseHeaders );
							}
						};
	
						// if we're in sync mode or it's in cache
						// and has been retrieved directly (IE6 & IE7)
						// we need to manually fire the callback
						if ( !s.async || xhr.readyState === 4 ) {
							//���ѡ��asyncΪfalse����ʾ����ͬ��ģʽ�����ߵ�ǰ�����Ѿ���ɣ���Ҫ�ֶ������ص���������
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
							//XMLHTTPRequest�����readyState״̬�ı��ʱ�򣬴���onreadystatechange�¼�
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
	
	
	
/**********************************************************���� Effects****************************************************************************/	
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

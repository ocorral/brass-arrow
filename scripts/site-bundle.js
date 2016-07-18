/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*
	
	    Squarespace Dynamic Data
	    ------------------------
	    On click, inject page content dynamically into an element.
	    Value in a[href] is used.
	
	    Params:
	
	    - wrapper: where to inject the fetched data
	    - target: elements to be used as an onclick triggers
	    - preCallback: function to be executed pre-load
	    - postCallback: function to be executed post-load
	    - useHashes: keep track of the current active page using # in URL's
	    - autoOpenHash: if the current URL includes a #, fetch that page on init
	    - injectEl: by default, all page data is injected into wrapper. Use this option
	      to specify which part of the loaded page is to be injected in wrapper.
	      Ex: '#content' or '#content, #thumbnails'
	    - minimumResolution: minimum browser width required for this plugin to work
	      Ex: 1025px ensures that default clicking behavior is maintained on mobiles and tablets
	    - scrollToWrapperPreLoad: scroll and focus on wrapper pre-load
	
	    Methods:
	    - simulateHash( hash ): simulate an onClick event by passing the
	      trigger's href value as hash
	
	 */
	
	YUI.add( 'squarespace-dynamic-data', function( Y ) {
	
	  Y.namespace( 'Squarespace' );
	
	  Y.Squarespace.DynamicData = function( params ) {
	    var wrapper = ( params && params.wrapper ) || 'body',
	      preCallback = ( params && params.preCallback ) || null,
	      postCallback = ( params && params.postCallback ) || null,
	      useHashes = ( params && params.useHashes ) || false,
	      autoOpenHash = ( params && params.autoOpenHash ) || false,
	      injectEl = ( params && params.injectEl ) || null,
	      minimumResolution = ( params && params.minimumResolution ) || null,
	      scrollToWrapperPreLoad = ( params && params.scrollToWrapperPreLoad ) || false,
	      appendData = ( params && params.appendData ) || null,
	      classes = {
	        search: ( params && params.target ) || '.sqs-dynamic-data',
	        active: 'sqs-dynamic-data-active',
	        loading: 'sqs-dynamic-data-loading',
	        ready: 'sqs-dynamic-data-ready',
	        activeWrapper: 'data-dynamic-data-link',
	        appendWrapper: 'sqs-dynamic-data-wrapper'
	      };
	
	    // Core
	    function init() {
	      if ( !minimumResolution || window.innerWidth >= minimumResolution ) {
	        wrapper = Y.one( wrapper );
	
	        if ( wrapper ) {
	          Y.on( 'click', fetch, classes.search );
	          openCurrentHash();
	        }
	      }
	    }
	
	    // Simulate a click
	    this.simulateHash = function( hash ) {
	      if ( hash ) {
	        hash = hash.replace( '#', '' );
	        fetch( null, hash);
	      }
	    }
	
	    // Check if current URL contains a hash
	    function openCurrentHash() {
	      var hash = window.location.hash;
	
	      if ( autoOpenHash && hash ) {
	        hash = hash.replace( '#', '' );
	        hash = hash.endsWith('/') ? hash : hash + '/'; // append slash if not present
	        fetch( null, hash);
	      }
	    }
	
	    // Call Fn
	    function callFn( fn ) {
	      if ( typeof fn === 'function') {
	        fn();
	      }
	    }
	
	    // Clean url
	    function cleanUrl( url ) {
	      return url.replace(/\//g,'');
	    }
	
	    // Fetch url - on click or forced
	    function fetch( e, simulate ) {
	
	      var trigger = ( simulate && Y.one( classes.search + '[href="' + simulate + '"]'  ) ) || ( e && e.currentTarget || null ),
	        url = ( simulate ) || ( trigger && trigger.getAttribute( 'href' ) ),
	        tempWrapper,
	        loadingWrapper;
	
	      if ( e ) {
	        e.preventDefault();
	      }
	
	      if ( useHashes ) {
	        window.location.hash = url;
	      }
	
	      // Only load items that have never been loaded
	      if ( ( trigger && !appendData && cleanUrl( url ) != wrapper.getAttribute( classes.activeWrapper ) ) ||
	           ( trigger && appendData && !wrapper.one( '[' + classes.activeWrapper + '=' + cleanUrl( url ) + ']' ) ) ) {
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        Y.all( '.' + classes.active ).removeClass( classes.active );
	        trigger.addClass( classes.active );
	        wrapper.removeClass( classes.ready );
	        wrapper.addClass( classes.loading );
	
	        // Scroll to top if required
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	        callFn( preCallback );
	
	        if ( appendData ) {
	          tempWrapper = Y.Node.create( '<div></div>' );
	          tempWrapper.addClass( classes.appendWrapper );
	          tempWrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	          tempWrapper.appendTo( wrapper );
	        }
	
	        loadingWrapper = tempWrapper ? tempWrapper : wrapper;
	
	        loadingWrapper.load( url, injectEl, function() {
	          loadReady( url );
	        });
	
	      } else {
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	        // their style attributes (determining cropping) get blasted away.
	        // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	        // but for now, save these styles so we can reapply later. -schai
	        Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	          img.setAttribute('saved-styles', img.getAttribute('style'));
	        });
	
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	      }
	
	    }
	
	    // SQS block related inits
	    function sqsBlocks(callback) {
	
	      Squarespace.AFTER_BODY_LOADED = false;
	      Squarespace.afterBodyLoad();
	      Squarespace.initializeCommerce(Y);
	
	      // Load Non-Block Images
	      wrapper.all('img[data-src]').each(function(el) {
	        if (!el.ancestor('.sqs-layout')) {
	          ImageLoader.load(el);
	        }
	      });
	
	      // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	      // their style attributes (determining cropping) get blasted away.
	      // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	      // but for now, save these styles so we can reapply later. -schai
	      Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	        if(img.getAttribute('saved-styles')) {
	          img.setAttribute('style', img.getAttribute('saved-styles'));
	        }
	      });
	
	      // Social Buttons
	      var socialButtonsNode = Y.all( '.squarespace-social-buttons' );
	      if (!socialButtonsNode.isEmpty()) {
	        Y.all( '.squarespace-social-buttons' ).empty( true );
	        new Y.Squarespace.SocialButtons();
	      }
	
	      // Like Button
	      wrapper.all( '.sqs-simple-like' ).each(function( n ) {
	        Y.Squarespace.SimpleLike.renderLikeCount( n );
	      });
	
	      // Execute scripts
	      wrapper.all( 'script' ).each(function( n ) {
	        var newScript = document.createElement('script');
	        newScript.type = 'text/javascript';
	        if (n.getAttribute('src')) {
	          newScript.src = n.getAttribute('src');
	        } else {
	          newScript.innerHTML = n.get('innerHTML');
	        }
	
	        Y.one('head').append(newScript);
	      });
	
	      callFn( callback ); // wait for images to load?
	    }
	
	    // Locate Wrapper
	    function scrollToWrapper() {
	      var scrollY, scrollAnim;
	
	      if ( scrollToWrapperPreLoad ) {
	        scrollY = wrapper.getXY();
	        scrollY = scrollY[ 1 ];
	        scrollAnim = new Y.Anim({ node: Y.UA.gecko ? 'html' : 'body', to: { scroll: [ 0, scrollY ] }, duration: 0.2, easing: 'easeBoth' });
	        scrollAnim.run();
	      }
	    }
	
	    // Load ready
	    function loadReady( url ) {
	      sqsBlocks( postCallback );
	
	      wrapper.removeClass( classes.loading );
	      wrapper.addClass( classes.ready );
	    }
	
	    init();
	  }
	}, '1.0', { requires: [ 'node', 'node-load', 'squarespace-social-buttons' ] });


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var VideoBackgroundRenderer = __webpack_require__(3).VideoBackground;
	var GetVideoProps = __webpack_require__(3).getVideoProps;
	
	Y.use('node', 'squarespace-dynamic-data', 'history-hash', function(Y) {
	
	  Y.on('domready', function() {
	
	    // fix goofy zooming on orientation change
	    if (navigator.userAgent.match(/iPhone/i) && Y.one('body.mobile-style-available')) {
	      var fixedViewport = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1',
	          zoomViewport = 'width=device-width, initial-scale=1',
	          viewport = Y.one('meta[name="viewport"]');
	      viewport.setAttribute('content', fixedViewport);
	      Y.one('body').on('touchstart', function(e) {
	        if (e.touches.length > 1) {
	          viewport.setAttribute('content', zoomViewport);
	        }
	      });
	    }
	    var videoBackgroundNodes = Array.prototype.slice.call(document.body.querySelectorAll('div.sqs-video-background'));
	    var videoBackgrounds = [];
	    window.vdbg = videoBackgrounds;
	    videoBackgroundNodes.forEach(function(item) {
	      var videoItem = new VideoBackgroundRenderer(GetVideoProps(item));
	      videoBackgrounds.push(
	        videoItem
	      );
	      item.addEventListener('ready', function() {
	        var dimensions = this._findPlayerDimensions();
	        this.container.parentElement.style.paddingBottom = dimensions.height * 100 / dimensions.width + '%';
	        setTimeout(function() {
	          this.syncPlayer();
	        }.bind(this), 500);
	      }.bind(videoItem), true);
	    });
	
	    // Mobile Nav ///////////////////////////////////
	
	    Y.one('#mobileMenuLink a').on('click', function(e){
	      console.log(e);
	       // var mobileMenuHeight = parseInt(Y.one('#mobileNav .wrapper').get('offsetHeight'),10);
	       // if (Y.one('#mobileNav').hasClass('menu-open')) {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: 0 }, duration: 0.5, easing: 'easeBoth' }).run();
	       // } else {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	
	       Y.one('#mobileNav').toggleClass('menu-open');
	
	       //iOS6 Safari fix...
	       // if(Y.one('#mobileNav').hasClass('menu-open') && Y.one('#mobileNav').get('offsetHeight') == 0){
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	    });
	
	    body = Y.one('body');
	    bodyWidth = parseInt(body.getComputedStyle('width'),10);
	
	    // center align dropdown menus (when design is centered)
	    if(Y.one('body').hasClass('layout-style-center')) {
	      Y.all('#topNav .subnav').each( function(n){
	        n.setStyle('marginLeft', -(parseInt(n.getComputedStyle('width'),10)/2) + 'px' );
	      });
	    }
	
	    // vertically align page title/description
	    if (Y.one('.page-image .wrapper')) {
	      var vertAlign = function() {
	        Y.one('.page-image .wrapper').setStyles({
	          marginTop: -1 * parseInt(Y.one('.page-image .wrapper').getComputedStyle('height'),10)/2 + 'px',
	          opacity: 1
	        });
	      };
	      vertAlign();
	      Y.one('window').on('resize', vertAlign);
	    }
	
	    Y.one('#page').setStyle('opacity', 1);
	
	    // PROJECT PAGES
	    if (Y.one('.collection-type-template-page #projectPages, .collection-type-index #projectPages')) {
	
	      thumbLoader();
	
	      // thumbnail click events
	      thumbClickHandler();
	
	      // hash based page loading
	      pageLoader();
	      Y.on('hashchange', pageLoader);
	
	
	      // project pagination
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').previous('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.prev-project');
	
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').next('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.next-project');
	
	    }
	
	
	    // GALLERY PAGES
	
	
	
	    var body, bodyWidth;
	
	    // SIDEBAR min-height set
	
	    function setPageHeight() {
	      var sidebarHeight;
	      if (Y.one('#sidebar')) {
	        sidebarHeight = Y.one('#sidebar').getComputedStyle('height');
	      }
	      if (sidebarHeight) {
	        Y.one('#page').setStyle('minHeight', sidebarHeight);
	      }
	    }
	
	    // run on page load
	    setPageHeight();
	    Y.later(1000, this, setPageHeight);
	
	
	    // run when sidebar width is tweaked
	    if (Y.Squarespace.Management) {
	      Y.Squarespace.Management.on('tweak', function(f){
	        if (f.getName() == 'blogSidebarWidth' ) {
	          setPageHeight();
	        }
	      });
	    }
	
	
	  });
	
	
	  // GLOBAL FUNCTIONS
	  var dynamicLoaders = {};
	
	  function pageLoader() {
	
	    if (window.location.hash && window.location.hash != '#') {
	      var urlId = window.location.hash.split('#')[1];
	
	      urlId = urlId.charAt(0) == '/' ? urlId : '/' + urlId;
	      urlId = urlId.charAt(urlId.length-1) == '/' ? urlId : urlId + '/';
	
	      var activePage = Y.one('#projectPages .project[data-url="'+urlId+'"]');
	
	      if (activePage) {
	        if (activePage.hasAttribute('data-type-protected') || !activePage.hasClass('page-project') && !activePage.hasClass('gallery-project')) {
	          // navigate away for anything other than pages/galleries
	          window.location.replace(urlId);
	          return;
	        }
	
	        if (activePage.hasClass('page-project') && !activePage.hasClass('sqs-dynamic-data-ready')) {
	          var loader = dynamicLoaders['#'+urlId];
	          if (loader) {
	            loader.simulateHash(urlId);
	          }
	        }
	      }
	
	      // set active on projectPages
	      Y.one('#page').addClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').each(function(project) {
	        project.removeClass('active-project');
	      });
	
	      activePage.addClass('active-project');
	
	      // set active thumb
	      var activeThumb = Y.one('#projectThumbs a.project[href="'+urlId+'"]');
	      if (activeThumb) {
	        activeThumb.addClass('active-project');
	      }
	
	      // set active navigation
	      if (activePage.next('.project')) {
	        Y.one('#projectNav .next-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .next-project').addClass('disabled');
	      }
	      if (activePage.previous('.project')) {
	        Y.one('#projectNav .prev-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .prev-project').addClass('disabled');
	      }
	
	      scrollToTop(function() {
	        Y.all('#projectPages .active-project img.loading').each(function(img) {
	          // Load Non-Block Images
	          if (!img.ancestor('.sqs-layout')) {
	            ImageLoader.load(img, { load: true });
	          }
	        });
	
	        Y.all('#projectPages .active-project .sqs-video-wrapper').each(function(video) {
	          video.videoloader.load();
	        });
	      });
	
	    } else { // no url hash
	
	      // clear active on projectPages
	      Y.one('#page').removeClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').removeClass('active-project');
	
	    }
	  }
	
	  function resetAudioVideoBlocks() {
	    // Audio/video blocks need to be forced reset
	    var preActive = Y.one('#projectPages .active-project');
	    if (preActive && preActive.one('.video-block, .code-block, .embed-block, .audio-block')){
	      Y.fire('audioPlayer:stopAll', {container: preActive });
	      preActive.empty(true).removeClass('sqs-dynamic-data-ready').removeAttribute('data-dynamic-data-link');
	    }
	
	    if (preActive && preActive.one('.sqs-video-wrapper')) {
	      preActive.all('.sqs-video-wrapper').each(function(elem) {
	        elem.videoloader.reload();
	      });
	    }
	  }
	
	  function thumbLoader() {
	    var projectThumbs = Y.all('#projectThumbs img[data-src]');
	
	    // lazy load on scroll
	    var loadThumbsOnScreen = function() {
	      projectThumbs.each(function(img) {
	        if (img.inRegion(Y.one(Y.config.win).get('region'))) {
	          ImageLoader.load(img, { load: true });
	        }
	      });
	    };
	    loadThumbsOnScreen();
	    Y.on('scroll', loadThumbsOnScreen, Y.config.win);
	
	    // also load/refresh on resize
	    Y.one('window').on('resize', function(e){
	      loadThumbsOnScreen();
	    });
	
	
	    // Proactively lazy load
	    var lazyImageLoader = Y.later(100, this, function() {
	      var bInProcess = projectThumbs.some(function(img) {
	        if (img.hasClass('loading')) { // something is loading... wait
	          return true;
	        } else if(!img.getAttribute('src')) { // start the loading
	          ImageLoader.load(img, { load: true });
	          return true;
	        }
	      });
	      if (!bInProcess) {
	        lazyImageLoader.cancel();
	      }
	    }, null, true);
	  }
	
	  function thumbClickHandler() {
	    Y.all('#projectThumbs a.project').each(Y.bind(function(elem) {
	      var href = elem.getAttribute('href');
	      // set dynamic loader for pages
	      if (Y.one('#projectPages [data-url="'+href+'"]').hasClass('page-project')) {
	        dynamicLoaders['#'+href] = new Y.Squarespace.DynamicData({
	            wrapper: '#projectPages [data-url="'+href+'"]',
	            target: 'a.project[href="'+href+'"]',
	            injectEl: 'section > *',
	            autoOpenHash: true,
	            useHashes: true,
	            scrollToWrapperPreLoad: true
	        });
	      } else {
	        elem.on('click', function(e) {
	          e.halt();
	          window.location.hash = '#' + elem.getAttribute('href');
	        });
	      }
	    }, this));
	  }
	
	  function scrollToTop(callback) {
	    var scrollNodes = Y.UA.gecko || Y.UA.ie >= 10 ? 'html' : 'body',
	        scrollLocation = Math.round(Y.one('#page').getXY()[1]);
	    new Y.Anim({
	      node: scrollNodes,
	      to: { scroll: [0, scrollLocation] },
	      duration: 0.2,
	      easing: Y.Easing.easeBoth
	    }).run().on('end', function() {
	      // Bug - yui anim seems to stop if target style couldnt be reached in time
	      if (Y.one(scrollNodes).get('scrollTop') != scrollLocation) {
	        Y.one(scrollNodes).set('scrollTop', scrollLocation);
	      }
	
	      callback && callback();
	    });
	  }
	
	  function lazyOnResize(f,t) {
	    var timer;
	    Y.one('window').on('resize', function(e){
	      if (timer) { timer.cancel(); }
	      timer = Y.later(t, this, f);
	    });
	  }
	
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var VideoBackground = __webpack_require__(4).VideoBackground;
	var getVideoProps = __webpack_require__(93);
	
	module.exports = {
	  'VideoBackground': VideoBackground,
	  'getVideoProps': getVideoProps
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var VideoBackground = __webpack_require__(5);
	var VideoFilterPropertyValues = __webpack_require__(88).filterProperties;
	
	module.exports = {
	  VideoBackground: VideoBackground,
	  VideoFilterPropertyValues: VideoFilterPropertyValues
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _assign = __webpack_require__(6);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _typeof2 = __webpack_require__(43);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	var _classCallCheck2 = __webpack_require__(78);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(79);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var custEvent = __webpack_require__(83);
	var parseUrl = __webpack_require__(84);
	
	var DEBUG = false;
	
	var DEFAULT_PROPERTY_VALUES = {
	  'container': '.background-wrapper',
	  'url': 'https://www.youtube.com/watch?v=xkEmYQvJ_68',
	  'fitMode': 'fill',
	  'maxLoops': '',
	  'scaleFactor': 1,
	  'playbackSpeed': 1,
	  'filter': 1,
	  'filterStrength': 50,
	  'timeCode': { 'start': 0, 'end': null },
	  'useCustomFallbackImage': false
	};
	
	var FILTER_OPTIONS = __webpack_require__(88).filterOptions;
	var FILTER_PROPERTIES = __webpack_require__(88).filterProperties;
	
	var YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
	
	/**
	 * A class which uses the YouTube API to initialize an IFRAME with a YouTube video.
	 * Additional display options and functionality are configured through a set of properties,
	 * superceding default properties.
	 */
	
	var VideoBackground = function () {
	  /**
	   * @param {Object} props - An optional object with configuation.
	   * @param {Object} windowContext - The parent window object (due to .sqs-site-frame).
	   */
	
	  function VideoBackground(props) {
	    var _this = this;
	
	    var windowContext = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];
	    (0, _classCallCheck3["default"])(this, VideoBackground);
	
	    this.windowContext = windowContext;
	    this.initializeProperties(props);
	    this.setDisplayEffects();
	    this.setFallbackImage();
	    this.initializeYouTubeAPI();
	    this.bindUI();
	
	    if (DEBUG === true) {
	      window.vdbg = this;
	      this.debugInterval = setInterval(function () {
	        if (_this.player.getCurrentTime) {
	          _this.logger((_this.player.getCurrentTime() / _this.player.getDuration()).toFixed(2));
	        }
	      }, 900);
	    }
	  }
	
	  (0, _createClass3["default"])(VideoBackground, [{
	    key: 'destroy',
	    value: function destroy() {
	      if (this.events) {
	        this.events.forEach(function (evt) {
	          return evt.target.removeEventListener(evt.type, evt.handler, true);
	        });
	      }
	      this.events = null;
	
	      if (this.player && (0, _typeof3["default"])(this.player) === 'object') {
	        try {
	          this.player.getIframe().classList.remove('ready');
	          this.player.destroy();
	          this.player = null;
	        } catch (err) {
	          console.error(err);
	        }
	      }
	
	      if (typeof this.timer === 'number') {
	        clearTimeout(this.timer);
	        this.timer = null;
	      }
	
	      if (typeof this.debugInterval === 'number') {
	        clearInterval(this.debugInterval);
	        this.debugInterval = null;
	      }
	    }
	  }, {
	    key: 'bindUI',
	    value: function bindUI() {
	      var _this2 = this;
	
	      this.events = [];
	
	      var resizeHandler = function resizeHandler() {
	        _this2.windowContext.requestAnimationFrame(function () {
	          _this2.scaleVideo();
	        });
	      };
	      this.events.push({
	        'target': this.windowContext,
	        'type': 'resize',
	        'handler': resizeHandler
	      });
	      this.windowContext.addEventListener('resize', resizeHandler, true);
	    }
	
	    /**
	     * Merge configuration properties with defaults with minimal validation.
	     */
	
	  }, {
	    key: 'initializeProperties',
	    value: function initializeProperties() {
	      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	      props = (0, _assign2["default"])({}, DEFAULT_PROPERTY_VALUES, props);
	      if (props.container.nodeType === 1) {
	        this.container = props.container;
	      } else if (typeof props.container === 'string') {
	        this.container = document.querySelector(props.container);
	      } else {
	        console.error('Container ' + props.container + ' not found');
	        return false;
	      }
	      this.videoId = this.getVideoID(props.url);
	      this.filter = props.filter;
	      this.filterStrength = props.filterStrength;
	      this.useCustomFallbackImage = props.useCustomFallbackImage;
	      this.fitMode = props.fitMode;
	      this.maxLoops = parseInt(props.maxLoops, 10) || null;
	      this.scaleFactor = props.scaleFactor;
	      this.playbackSpeed = parseFloat(props.playbackSpeed) === 0.0 ? 1 : parseFloat(props.playbackSpeed);
	      this.timeCode = {
	        start: this._getStartTime(props.url) || props.timeCode.start,
	        end: props.timeCode.end
	      };
	
	      var ua = window.navigator.userAgent;
	      this.isMobileBrowser = ua.indexOf('AppleWebKit') !== -1 && ua.indexOf('Mobile') !== -1;
	      if (this.isMobileBrowser) {
	        this.container.classList.add('mobile');
	      }
	      this.player = {};
	      this.currentLoop = 0;
	    }
	
	    /**
	     * All diplay related effects should be applied prior to the video loading to
	     * ensure the effects are visible on the fallback image while loading.
	     */
	
	  }, {
	    key: 'setDisplayEffects',
	    value: function setDisplayEffects() {
	      this.setFilter();
	    }
	
	    /**
	     * A default fallback image element will be create from the YouTube API unless the
	     * custom fallback image exists.
	     */
	
	  }, {
	    key: 'setFallbackImage',
	    value: function setFallbackImage() {
	      var _this3 = this;
	
	      if (this.useCustomFallbackImage) {
	        (function () {
	          var customFallbackImage = _this3.container.querySelector('.custom-fallback-image');
	          var tempImage = document.createElement('img');
	          tempImage.src = customFallbackImage.src;
	          tempImage.addEventListener('load', function () {
	            customFallbackImage.classList.add('loaded');
	          });
	        })();
	      }
	
	      var fallback = this.container.querySelector('.default-fallback-image');
	      if (fallback) {
	        fallback.parentNode.removeChild(fallback);
	      }
	
	      if (this.isMobileBrowser) {
	        return;
	      }
	
	      var getBestQuality = function getBestQuality(evt) {
	        // Prefer the HD-quality image if present. If not, load the default thumbnail.
	        var defaultFallbackImage = evt.currentTarget;
	        if (defaultFallbackImage.width < 480 && defaultFallbackImage.src.indexOf('0.jpg') === -1) {
	          defaultFallbackImage.src = 'https://img.youtube.com/vi/' + _this3.videoId + '/0.jpg';
	          return;
	        }
	        // Only display a real thumbnail image, not the small YouTube gray box.
	        if (defaultFallbackImage.width >= 480) {
	          _this3.container.insertBefore(defaultFallbackImage, _this3.container.querySelector('#player'));
	          defaultFallbackImage.classList.add('loaded');
	        }
	        _this3.setDisplayEffects();
	        defaultFallbackImage.removeEventListener('load', getBestQuality);
	      };
	
	      var imageURL = 'https://img.youtube.com/vi/' + this.videoId + '/maxresdefault.jpg';
	      var defaultFallbackImage = document.createElement('img');
	      defaultFallbackImage.src = this.fallbackImageURL || imageURL;
	      defaultFallbackImage.classList.add('default-fallback-image');
	      defaultFallbackImage.classList.add('buffering');
	      defaultFallbackImage.addEventListener('load', getBestQuality);
	    }
	
	    /**
	     * Call YouTube API per their guidelines.
	     */
	
	  }, {
	    key: 'initializeYouTubeAPI',
	    value: function initializeYouTubeAPI() {
	      var _this4 = this;
	
	      if (this.isMobileBrowser) {
	        return;
	      }
	
	      if (this.windowContext.document.documentElement.querySelector('script[src*="www.youtube.com/iframe_api"].loaded')) {
	        this.setVideoPlayer();
	        return;
	      }
	
	      this.player.ready = false;
	      var tag = this.windowContext.document.createElement('script');
	      tag.src = 'https://www.youtube.com/iframe_api';
	      var firstScriptTag = this.windowContext.document.getElementsByTagName('script')[0];
	      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	      tag.addEventListener('load', function (evt) {
	        evt.currentTarget.classList.add('loaded');
	        _this4.setVideoPlayer();
	      }, true);
	    }
	
	    /**
	     * The ID is the only unique property need to use in the YouTube API.
	     */
	
	  }, {
	    key: 'getVideoID',
	    value: function getVideoID(value) {
	      if (!value) {
	        value = DEFAULT_PROPERTY_VALUES.url;
	      }
	
	      var match = value.match(YOUTUBE_REGEX);
	      if (match && match[2].length) {
	        return match[2];
	      }
	
	      return '';
	    }
	
	    /**
	     * Initialize a YouTube video player and register its callbacks.
	     */
	
	  }, {
	    key: 'setVideoPlayer',
	    value: function setVideoPlayer() {
	      var _this5 = this;
	
	      if (this.player.ready) {
	        try {
	          this.player.destroy();
	        } catch (e) {
	          // nothing to destroy
	        }
	      }
	
	      // Poll until the API is ready.
	      if (this.windowContext.YT.loaded !== 1) {
	        setTimeout(this.setVideoPlayer.bind(this), 100);
	        return false;
	      }
	
	      this.player = new this.windowContext.YT.Player(this.container.querySelector('#player'), {
	        height: '315',
	        width: '560',
	        videoId: this.videoId,
	        playerVars: {
	          'autohide': 1,
	          'autoplay': 0,
	          'controls': 0,
	          'enablejsapi': 1,
	          'iv_load_policy': 3,
	          'loop': 0,
	          'modestbranding': 1,
	          'playsinline': 1,
	          'rel': 0,
	          'showinfo': 0,
	          'wmode': 'opaque'
	        },
	        events: {
	          'onReady': function onReady(event) {
	            _this5.onPlayerReady(event);
	          },
	          'onStateChange': function onStateChange(event) {
	            _this5.onPlayerStateChange(event);
	          }
	        }
	      });
	    }
	
	    /**
	     * YouTube event handler. Add the proper class to the player element and set
	     * player properties.
	     */
	
	  }, {
	    key: 'onPlayerReady',
	    value: function onPlayerReady(event) {
	      this.player.getIframe().classList.add('background-video');
	      this.syncPlayer();
	      this.player.mute();
	      if (typeof window.CustomEvent !== 'function') {
	        custEvent();
	      }
	      var readyEvent = new CustomEvent('ready');
	      this.container.dispatchEvent(readyEvent);
	      document.body.classList.add('ready');
	      this.player.ready = true;
	      if (this.isMobileBrowser) {
	        return;
	      }
	      this.player.seekTo(this.timeCode.start);
	      this.player.playVideo();
	    }
	
	    /**
	     * YouTube event handler. Determine whether or not to loop the video.
	     */
	
	  }, {
	    key: 'onPlayerStateChange',
	    value: function onPlayerStateChange(event) {
	      var _this6 = this;
	
	      var playerIframe = this.player.getIframe();
	      var defaultImage = this.container.querySelector('.default-fallback-image');
	      var duration = (this.player.getDuration() - this.timeCode.start) / this.playbackSpeed;
	
	      if (event.data === this.windowContext.YT.PlayerState.BUFFERING && this.player.getVideoLoadedFraction() !== 1 && (this.player.getCurrentTime() === 0 || this.player.getCurrentTime() > duration - -0.1)) {
	        this.logger('BUFFERING');
	        defaultImage && defaultImage.classList.add('buffering');
	      } else if (event.data === this.windowContext.YT.PlayerState.PLAYING) {
	        this.logger('PLAYING');
	        playerIframe.classList.add('ready');
	        defaultImage && defaultImage.classList.remove('buffering');
	
	        if (this.player.getCurrentTime() === this.timeCode.start) {
	          clearTimeout(this.timer);
	
	          if (this.maxLoops) {
	            this.currentLoop++;
	            if (this.currentLoop > this.maxLoops) {
	              this.player.pauseVideo();
	              this.currentLoop = 0;
	              return;
	            }
	          }
	
	          this.timer = setTimeout(function () {
	            _this6.player.pauseVideo();
	            _this6.player.seekTo(_this6.timeCode.start);
	          }, duration * 1000 - 100);
	        }
	      } else {
	        this.logger('PAUSED/ENDED: ' + event.data);
	        this.player.playVideo();
	      }
	    }
	
	    /**
	     * The IFRAME will be the entire width and height of its container but the video
	     * may be a completely different size and ratio. Scale up the IFRAME so the inner video
	     * behaves in the proper `fitMode` with optional additional scaling to zoom in.
	     */
	
	  }, {
	    key: 'scaleVideo',
	    value: function scaleVideo(scaleValue) {
	      var scale = scaleValue || this.scaleFactor;
	      var videoDimensions = this._findPlayerDimensions();
	      var playerIframe = this.player.getIframe();
	      var fallbackImg = null;
	      if (!this.useCustomFallbackImage) {
	        fallbackImg = this.container.querySelector('.default-fallback-image');
	      }
	
	      if (this.fitMode !== 'fill') {
	        playerIframe.style.width = '';
	        playerIframe.style.height = '';
	        if (fallbackImg) {
	          fallbackImg.style.width = '';
	          fallbackImg.style.minHeight = '';
	        }
	        return false;
	      }
	
	      var containerWidth = playerIframe.parentNode.clientWidth;
	      var containerHeight = playerIframe.parentNode.clientHeight;
	      var containerRatio = containerWidth / containerHeight;
	      var videoRatio = videoDimensions.width / videoDimensions.height;
	      var pWidth = 0;
	      var pHeight = 0;
	      if (containerRatio > videoRatio) {
	        // at the same width, the video is taller than the window
	        pWidth = containerWidth * scale;
	        pHeight = containerWidth * scale / videoRatio;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      } else if (videoRatio > containerRatio) {
	        // at the same width, the video is shorter than the window
	        pWidth = containerHeight * scale * videoRatio;
	        pHeight = containerHeight * scale;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      } else {
	        // the window and video ratios match
	        pWidth = containerWidth * scale;
	        pHeight = containerHeight * scale;
	        playerIframe.style.width = pWidth + 'px';
	        playerIframe.style.height = pHeight + 'px';
	      }
	      playerIframe.style.left = 0 - (pWidth - containerWidth) / 2 + 'px';
	      playerIframe.style.top = 0 - (pHeight - containerHeight) / 2 + 'px';
	
	      if (fallbackImg) {
	        if (containerRatio > videoRatio) {
	          // at the same width, the video is taller than the window
	          fallbackImg.style.width = containerWidth * scale + 'px';
	          fallbackImg.style.height = containerWidth * scale / videoRatio + 'px';
	        } else if (videoRatio > containerRatio) {
	          // at the same width, the video is shorter than the window
	          fallbackImg.style.width = containerHeight * scale * videoRatio + 'px';
	          fallbackImg.style.height = containerHeight * scale + 'px';
	        } else {
	          // the window and video ratios match
	          fallbackImg.style.width = containerWidth * scale + 'px';
	          fallbackImg.style.height = containerHeight * scale + 'px';
	        }
	      }
	    }
	
	    /**
	     * Play back speed options based on the YouTube API options.
	     */
	
	  }, {
	    key: 'setSpeed',
	    value: function setSpeed(speedValue) {
	      this.playbackSpeed = parseFloat(this.playbackSpeed);
	      this.player.setPlaybackRate(this.playbackSpeed);
	    }
	
	    /**
	     * Apply filter with values based on filterStrength.
	     */
	
	  }, {
	    key: 'setFilter',
	    value: function setFilter() {
	      var containerStyle = this.container.style;
	      var filter = FILTER_OPTIONS[this.filter - 1];
	      var filterStyle = '';
	      if (filter !== 'none') {
	        filterStyle = this.getFilterStyle(filter, this.filterStrength);
	      }
	
	      // To prevent the blur effect from displaying the background at the edges as
	      // part of the blur, the filer needs to be applied to the player and fallback image,
	      // and those elements need to be scaled slightly.
	      // No other combination of filter target and scaling seems to work.
	      if (filter === 'blur') {
	        containerStyle.webkitFilter = '';
	        containerStyle.filter = '';
	        this.container.classList.add('filter-blur');
	
	        Array.prototype.slice.call(this.container.children).forEach(function (el) {
	          el.style.webkitFilter = filterStyle;
	          el.style.filter = filterStyle;
	        });
	      } else {
	        containerStyle.webkitFilter = filterStyle;
	        containerStyle.filter = filterStyle;
	        this.container.classList.remove('filter-blur');
	
	        Array.prototype.slice.call(this.container.children).forEach(function (el) {
	          el.style.webkitFilter = '';
	          el.style.filter = '';
	        });
	      }
	    }
	
	    /**
	     * Construct the style based on the filter strength and `FILTER_PROPERTIES`.
	     */
	
	  }, {
	    key: 'getFilterStyle',
	    value: function getFilterStyle(filter, strength) {
	      return filter + '(' + (FILTER_PROPERTIES[filter].modifier(strength) + FILTER_PROPERTIES[filter].unit) + ')';
	    }
	
	    /**
	     * The YouTube API seemingly does not expose the actual width and height dimensions
	     * of the video itself. The video's dimensions and ratio may be completely different
	     * than the IFRAME's. This hack finds those values inside some private objects.
	     * Since this is not part of the pbulic API the dimensions will fall back to the
	     * container width and height in case YouTube changes the internals unexpectedly.
	     */
	
	  }, {
	    key: '_findPlayerDimensions',
	    value: function _findPlayerDimensions() {
	      var w = this.container.clientWidth;
	      var h = this.container.clientHeight;
	      var hasDimensions = false;
	      var playerObjs = [];
	      var player = this.player;
	      for (var o in player) {
	        if ((0, _typeof3["default"])(player[o]) === 'object') {
	          playerObjs.push(player[o]);
	        }
	      }
	      playerObjs.forEach(function (obj) {
	        for (var p in obj) {
	          if (hasDimensions) {
	            break;
	          }
	          try {
	            if ((0, _typeof3["default"])(obj[p]) === 'object' && !!obj[p].host) {
	              if (obj[p].width && obj[p].height) {
	                w = obj[p].width;
	                h = obj[p].height;
	                hasDimensions = true;
	              }
	            }
	          } catch (err) {
	            // console.error(err);
	          }
	        }
	      });
	      return {
	        'width': w,
	        'height': h
	      };
	    }
	  }, {
	    key: '_getStartTime',
	    value: function _getStartTime(url) {
	      var parsedUrl = new parseUrl(url, true);
	
	      if (!parsedUrl.query || !parsedUrl.query.t) {
	        return false;
	      }
	
	      var timeParam = parsedUrl.query.t;
	      var m = (timeParam.match(/\d+(?=m)/g) ? timeParam.match(/\d+(?=m)/g)[0] : 0) * 60;
	      var s = timeParam.match(/\d+(?=s)/g) ? timeParam.match(/\d+(?=s)/g)[0] : timeParam;
	      return parseInt(m, 10) + parseInt(s, 10);
	    }
	
	    /**
	      * Apply the purely vidual effects.
	      */
	
	  }, {
	    key: 'syncPlayer',
	    value: function syncPlayer() {
	      this.setDisplayEffects();
	      this.setSpeed();
	      this.scaleVideo();
	    }
	  }, {
	    key: 'logger',
	    value: function logger(msg) {
	      if (!DEBUG) {
	        return;
	      }
	
	      console.log(msg);
	    }
	  }]);
	  return VideoBackground;
	}();
	
	module.exports = VideoBackground;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(7), __esModule: true };

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(8);
	module.exports = __webpack_require__(11).Object.assign;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(9);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(24)});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(10)
	  , core      = __webpack_require__(11)
	  , ctx       = __webpack_require__(12)
	  , hide      = __webpack_require__(14)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 10 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(13);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(15)
	  , createDesc = __webpack_require__(23);
	module.exports = __webpack_require__(19) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(16)
	  , IE8_DOM_DEFINE = __webpack_require__(18)
	  , toPrimitive    = __webpack_require__(22)
	  , dP             = Object.defineProperty;
	
	exports.f = __webpack_require__(19) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(19) && !__webpack_require__(20)(function(){
	  return Object.defineProperty(__webpack_require__(21)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(20)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17)
	  , document = __webpack_require__(10).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(17);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(25)
	  , gOPS     = __webpack_require__(40)
	  , pIE      = __webpack_require__(41)
	  , toObject = __webpack_require__(42)
	  , IObject  = __webpack_require__(29)
	  , $assign  = Object.assign;
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(20)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(26)
	  , enumBugKeys = __webpack_require__(39);
	
	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(27)
	  , toIObject    = __webpack_require__(28)
	  , arrayIndexOf = __webpack_require__(32)(false)
	  , IE_PROTO     = __webpack_require__(36)('IE_PROTO');
	
	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(29)
	  , defined = __webpack_require__(31);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(30);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(28)
	  , toLength  = __webpack_require__(33)
	  , toIndex   = __webpack_require__(35);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(34)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(34)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(37)('keys')
	  , uid    = __webpack_require__(38);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(10)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 40 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 41 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(31);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _iterator = __webpack_require__(44);
	
	var _iterator2 = _interopRequireDefault(_iterator);
	
	var _symbol = __webpack_require__(64);
	
	var _symbol2 = _interopRequireDefault(_symbol);
	
	var _typeof = typeof _symbol2["default"] === "function" && typeof _iterator2["default"] === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2["default"] === "function" && obj.constructor === _symbol2["default"] ? "symbol" : typeof obj; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	exports["default"] = typeof _symbol2["default"] === "function" && _typeof(_iterator2["default"]) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2["default"] === "function" && obj.constructor === _symbol2["default"] ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(45), __esModule: true };

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(46);
	__webpack_require__(59);
	module.exports = __webpack_require__(63).f('iterator');

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(47)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(48)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(34)
	  , defined   = __webpack_require__(31);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(49)
	  , $export        = __webpack_require__(9)
	  , redefine       = __webpack_require__(50)
	  , hide           = __webpack_require__(14)
	  , has            = __webpack_require__(27)
	  , Iterators      = __webpack_require__(51)
	  , $iterCreate    = __webpack_require__(52)
	  , setToStringTag = __webpack_require__(56)
	  , getPrototypeOf = __webpack_require__(58)
	  , ITERATOR       = __webpack_require__(57)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(53)
	  , descriptor     = __webpack_require__(23)
	  , setToStringTag = __webpack_require__(56)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(14)(IteratorPrototype, __webpack_require__(57)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(16)
	  , dPs         = __webpack_require__(54)
	  , enumBugKeys = __webpack_require__(39)
	  , IE_PROTO    = __webpack_require__(36)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';
	
	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(21)('iframe')
	    , i      = enumBugKeys.length
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(55).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};
	
	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(15)
	  , anObject = __webpack_require__(16)
	  , getKeys  = __webpack_require__(25);
	
	module.exports = __webpack_require__(19) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(10).document && document.documentElement;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(15).f
	  , has = __webpack_require__(27)
	  , TAG = __webpack_require__(57)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(37)('wks')
	  , uid        = __webpack_require__(38)
	  , Symbol     = __webpack_require__(10).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';
	
	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};
	
	$exports.store = store;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(27)
	  , toObject    = __webpack_require__(42)
	  , IE_PROTO    = __webpack_require__(36)('IE_PROTO')
	  , ObjectProto = Object.prototype;
	
	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(60);
	var global        = __webpack_require__(10)
	  , hide          = __webpack_require__(14)
	  , Iterators     = __webpack_require__(51)
	  , TO_STRING_TAG = __webpack_require__(57)('toStringTag');
	
	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(61)
	  , step             = __webpack_require__(62)
	  , Iterators        = __webpack_require__(51)
	  , toIObject        = __webpack_require__(28);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(48)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(57);

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(65), __esModule: true };

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(66);
	__webpack_require__(75);
	__webpack_require__(76);
	__webpack_require__(77);
	module.exports = __webpack_require__(11).Symbol;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(10)
	  , has            = __webpack_require__(27)
	  , DESCRIPTORS    = __webpack_require__(19)
	  , $export        = __webpack_require__(9)
	  , redefine       = __webpack_require__(50)
	  , META           = __webpack_require__(67).KEY
	  , $fails         = __webpack_require__(20)
	  , shared         = __webpack_require__(37)
	  , setToStringTag = __webpack_require__(56)
	  , uid            = __webpack_require__(38)
	  , wks            = __webpack_require__(57)
	  , wksExt         = __webpack_require__(63)
	  , wksDefine      = __webpack_require__(68)
	  , keyOf          = __webpack_require__(69)
	  , enumKeys       = __webpack_require__(70)
	  , isArray        = __webpack_require__(71)
	  , anObject       = __webpack_require__(16)
	  , toIObject      = __webpack_require__(28)
	  , toPrimitive    = __webpack_require__(22)
	  , createDesc     = __webpack_require__(23)
	  , _create        = __webpack_require__(53)
	  , gOPNExt        = __webpack_require__(72)
	  , $GOPD          = __webpack_require__(74)
	  , $DP            = __webpack_require__(15)
	  , $keys          = __webpack_require__(25)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;
	
	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};
	
	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};
	
	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};
	
	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });
	
	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(73).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(41).f  = $propertyIsEnumerable;
	  __webpack_require__(40).f = $getOwnPropertySymbols;
	
	  if(DESCRIPTORS && !__webpack_require__(49)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	
	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});
	
	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);
	
	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);
	
	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});
	
	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});
	
	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(14)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(38)('meta')
	  , isObject = __webpack_require__(17)
	  , has      = __webpack_require__(27)
	  , setDesc  = __webpack_require__(15).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(20)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(10)
	  , core           = __webpack_require__(11)
	  , LIBRARY        = __webpack_require__(49)
	  , wksExt         = __webpack_require__(63)
	  , defineProperty = __webpack_require__(15).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(25)
	  , toIObject = __webpack_require__(28);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(25)
	  , gOPS    = __webpack_require__(40)
	  , pIE     = __webpack_require__(41);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(30);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(28)
	  , gOPN      = __webpack_require__(73).f
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(26)
	  , hiddenKeys = __webpack_require__(39).concat('length', 'prototype');
	
	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(41)
	  , createDesc     = __webpack_require__(23)
	  , toIObject      = __webpack_require__(28)
	  , toPrimitive    = __webpack_require__(22)
	  , has            = __webpack_require__(27)
	  , IE8_DOM_DEFINE = __webpack_require__(18)
	  , gOPD           = Object.getOwnPropertyDescriptor;
	
	exports.f = __webpack_require__(19) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 75 */
/***/ function(module, exports) {



/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(68)('asyncIterator');

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(68)('observable');

/***/ },
/* 78 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(80);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	exports["default"] = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2["default"])(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(81), __esModule: true };

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(82);
	var $Object = __webpack_require__(11).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(9);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(19), 'Object', {defineProperty: __webpack_require__(15).f});

/***/ },
/* 83 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * CustomEvent polyfill for Internet Explorer versions >= 9
	 * Polyfill from
	 *   https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
	 */
	var custEvent = function custEvent() {
	  (function () {
	
	    function CustomEvent(event, params) {
	      params = params || { bubbles: false, cancelable: false, detail: undefined };
	      var evt = document.createEvent('CustomEvent');
	      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
	      return evt;
	    }
	
	    CustomEvent.prototype = window.Event.prototype;
	
	    window.CustomEvent = CustomEvent;
	  })();
	};
	
	module.exports = custEvent;

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var required = __webpack_require__(85)
	  , lolcation = __webpack_require__(86)
	  , qs = __webpack_require__(87)
	  , relativere = /^\/(?!\/)/
	  , protocolre = /^([a-z0-9.+-]+:)?(\/\/)?(.*)$/i; // actual protocol is first match
	
	/**
	 * These are the parse instructions for the URL parsers, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var instructions = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/\:(\d+)$/, 'port'],                 // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];
	
	 /**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase
	 * @property {Boolean} slashes Indicates whether the protocol is followed by double slash ("//")
	 * @property {String} rest     Rest of the URL that is not part of the protocol
	 */
	
	 /**
	  * Extract protocol information from a URL with/without double slash ("//")
	  *
	  * @param  {String} address   URL we want to extract from.
	  * @return {ProtocolExtract}  Extracted information
	  * @private
	  */
	function extractProtocol(address) {
	  var match = protocolre.exec(address);
	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3] ? match[3] : ''
	  };
	}
	
	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my CDO.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} location Location defaults for relative paths.
	 * @param {Boolean|Function} parser Parser for the query string.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }
	
	  var relative = relativere.test(address)
	    , parse, instruction, index, key
	    , type = typeof location
	    , url = this
	    , i = 0;
	
	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }
	
	  if (parser && 'function' !== typeof parser) {
	    parser = qs.parse;
	  }
	
	  location = lolcation(location);
	
	  // extract protocol information before running the instructions
	  var extracted = extractProtocol(address);
	  url.protocol = extracted.protocol || location.protocol || '';
	  url.slashes = extracted.slashes || location.slashes;
	  address = extracted.rest;
	
	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];
	
	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, address.length - index[0].length);
	    }
	
	    url[key] = url[key] || (instruction[3] || ('port' === key && relative) ? location[key] || '' : '');
	
	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) {
	      url[key] = url[key].toLowerCase();
	    }
	  }
	
	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);
	
	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }
	
	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }
	
	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}
	
	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} prop          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function used to parse
	 *                               the query.
	 *                               When setting the protocol, double slash will be removed from
	 *                               the final url if it is true.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;
	
	  if ('query' === part) {
	    if ('string' === typeof value && value.length) {
	      value = (fn || qs.parse)(value);
	    }
	
	    url[part] = value;
	  } else if ('port' === part) {
	    url[part] = value;
	
	    if (!required(value, url.protocol)) {
	      url.host = url.hostname;
	      url[part] = '';
	    } else if (value) {
	      url.host = url.hostname +':'+ value;
	    }
	  } else if ('hostname' === part) {
	    url[part] = value;
	
	    if (url.port) value += ':'+ url.port;
	    url.host = value;
	  } else if ('host' === part) {
	    url[part] = value;
	
	    if (/\:\d+/.test(value)) {
	      value = value.split(':');
	      url.hostname = value[0];
	      url.port = value[1];
	    }
	  } else if ('protocol' === part) {
	    url.protocol = value;
	    url.slashes = !fn;
	  } else {
	    url[part] = value;
	  }
	
	  url.href = url.toString();
	  return url;
	};
	
	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	
	  var query
	    , url = this
	    , protocol = url.protocol;
	
	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
	
	  var result = protocol + (url.slashes ? '//' : '');
	
	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }
	
	  result += url.hostname;
	  if (url.port) result += ':'+ url.port;
	
	  result += url.pathname;
	
	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
	
	  if (url.hash) result += url.hash;
	
	  return result;
	};
	
	//
	// Expose the URL parser and some additional properties that might be useful for
	// others.
	//
	URL.qs = qs;
	URL.location = lolcation;
	module.exports = URL;


/***/ },
/* 85 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;
	
	  if (!port) return false;
	
	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;
	
	    case 'https':
	    case 'wss':
	    return port !== 443;
	
	    case 'ftp':
	    return port !== 21;
	
	    case 'gopher':
	    return port !== 70;
	
	    case 'file':
	    return false;
	  }
	
	  return port !== 0;
	};


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
	
	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;
	
	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(84);
	
	  var finaldestination = {}
	    , type = typeof loc
	    , key;
	
	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }
	
	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }
	
	  return finaldestination;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 87 */
/***/ function(module, exports) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=([^&]*)/g
	    , result = {}
	    , part;
	
	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
	  );
	
	  return result;
	}
	
	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';
	
	  var pairs = [];
	
	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';
	
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }
	
	  return pairs.length ? prefix + pairs.join('&') : '';
	}
	
	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _freeze = __webpack_require__(89);
	
	var _freeze2 = _interopRequireDefault(_freeze);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var filterOptions = ['none', 'blur', 'brightness', 'contrast', 'invert', 'opacity', 'saturate', 'sepia', 'drop-shadow', 'grayscale', 'hue-rotate'];
	
	(0, _freeze2["default"])(filterOptions);
	
	/**
	 * Each filter style needs to adjust the strength value (1 - 100) by a `modifier`
	 * function and a unit, as appropriate. The `modifier` is purely subjective.
	 */
	var filterProperties = {
	  blur: {
	    modifier: function modifier(value) {
	      return value * 0.3;
	    },
	    unit: 'px'
	  },
	  brightness: {
	    modifier: function modifier(value) {
	      return value * 0.009 + 0.1;
	    },
	    unit: ''
	  },
	  contrast: {
	    modifier: function modifier(value) {
	      return value * 0.4 + 80;
	    },
	    unit: '%'
	  },
	  grayscale: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  'hue-rotate': {
	    modifier: function modifier(value) {
	      return value * 3.6;
	    },
	    unit: 'deg'
	  },
	  invert: {
	    modifier: function modifier(value) {
	      return 1;
	    },
	    unit: ''
	  },
	  opacity: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  saturate: {
	    modifier: function modifier(value) {
	      return value * 2;
	    },
	    unit: '%'
	  },
	  sepia: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  }
	};
	
	(0, _freeze2["default"])(filterProperties);
	
	module.exports = {
	  filterOptions: filterOptions,
	  filterProperties: filterProperties
	};

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(90), __esModule: true };

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(91);
	module.exports = __webpack_require__(11).Object.freeze;

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(17)
	  , meta     = __webpack_require__(67).onFreeze;
	
	__webpack_require__(92)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(9)
	  , core    = __webpack_require__(11)
	  , fails   = __webpack_require__(20);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 93 */
/***/ function(module, exports) {

	var getPropsFromNode = function(node) {
	  var props = {
	    'container': node
	  };
	
	  if (node.getAttribute('data-config-url')) {
	    props.url = node.getAttribute('data-config-url');
	  }
	
	  if (node.getAttribute('data-config-playback-speed')) {
	    props.playbackSpeed = node.getAttribute('data-config-playback-speed');
	  }
	
	  if (node.getAttribute('data-config-filter')) {
	    props.filter = node.getAttribute('data-config-filter');
	  }
	
	  if (node.getAttribute('data-config-filter-strength')) {
	    props.filterStrength = node.getAttribute('data-config-filter-strength');
	  }
	
	  return props;
	};
	
	module.exports = getPropsFromNode;


/***/ }
/******/ ]);
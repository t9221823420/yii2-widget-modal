( function ( $ ) {
	
	"use strict";
	
	yozh.Modal = {};
	
	yozh.Modal.BUTTON_HIDE_CLASS = 'ACTION_BUTTON_TYPE_OK';

	var _pluginName = 'yozhModal';
	var _context;
	
	/**
	 * Retrieves the script tags in document
	 * @return {Array}
	 */
	var _getPageScriptTags = function () {
		var scripts = [];
		jQuery( 'script[src]' ).each( function () {
			scripts.push( jQuery( this ).attr( 'src' ) );
		} );
		return scripts;
	};
	
	/**
	 * Retrieves the CSS links in document
	 * @return {Array}
	 */
	var _getPageCssLinks = function () {
		var links = [];
		jQuery( 'link[rel="stylesheet"]' ).each( function () {
			links.push( jQuery( this ).attr( 'href' ) );
		} );
		return links;
	};
	
	/**
	 * Injects the form of given html into the modal and extecutes css and js
	 * @param  {string} html the html to inject
	 */
	Modal.prototype.injectHtml = function ( $element, _response ) {
		
		var $html = jQuery( '<root>' + _response + '</root>' );
		var $assets = jQuery( '<root>' );
		var _context = this;
		
		var knownScripts = Modal.loadedScripts;
		var knownCssLinks = Modal.loadedCSS;
		var newScripts = [];
		var inlineInjections = [];
		var loadedScriptsCount = 0;
		
		// Find some element to append to
		var headTag = jQuery( 'head' );
		if ( headTag.length < 1 ) {
			headTag = jQuery( 'body' );
			if ( headTag.length < 1 ) {
				headTag = jQuery( document );
			}
		}
		
		// CSS stylesheets that haven't been added need to be loaded
		$html.find( 'link[rel="stylesheet"]' ).each( function ( index, element ) {
			
			var href = jQuery( this ).attr( 'href' );
			
			if ( knownCssLinks.indexOf( href ) < 0 ) {
				// Append the CSS link to the page
				headTag.append( jQuery( this ).prop( 'outerHTML' ) );
				// Store the link so its not needed to be requested again
				knownCssLinks.push( href );
				Modal.loadedCSS.push( href );
			}
			
			jQuery( this ).appendTo( $assets );
			
		} );
		
		// Scripts that haven't yet been loaded need to be added to the end of the body
		$html.find( 'script' ).each( function ( index, element ) {
			
			var _check = jQuery( this );
			
			var src = jQuery( this ).attr( "src" );
			
			if ( typeof src === 'undefined' ) {
				// If no src supplied, execute the raw JS (need to execute after the script tags have been loaded)
				inlineInjections.push( jQuery( this ).text() );
			}
			else if ( knownScripts.indexOf( src ) < 0 ) {
				
				Modal.loadedScripts.push( src );
				
				// Prepare src so we can append GET parameter later
				src += ( src.indexOf( '?' ) < 0 ) ? '?' : '&';
				newScripts.push( src );
			}
			
			jQuery( this ).appendTo( $assets );
		} );
		
		if ( this.ajaxSubmit === true ) {
			$html.find( 'form' ).each( this.bindAjaxSubmit );
		}
		
		
		if ( $element ) {
			$element.html( $html[ 0 ].childNodes );
		}
		
		/*
		console.log('---------------------------------');
		console.log($element);
		*/
		
		/**
		 * Scripts loaded callback
		 */
		var scriptLoaded = function () {
			
			/*
			console.log('-----------');
			console.log(loadedScriptsCount);
			console.log(newScripts);
			console.log(inlineInjections);
			*/
			
			loadedScriptsCount += 1;
			if ( loadedScriptsCount >= newScripts.length ) {
				// Execute inline scripts
				for ( var i = 0; i < inlineInjections.length; i += 1 ) {
					window.eval( inlineInjections[ i ] );
				}
				
			}
		};
		
		if( newScripts.length ){
			// Load each script tag
			for ( var i = 0; i < newScripts.length; i += 1 ) {
				jQuery.getScript( newScripts[ i ] + ( new Date().getTime() ), scriptLoaded );
			}
			
		}
		else if( inlineInjections.length ){
			scriptLoaded();
		}
		
		
	};
	
	
	function Modal( element, options ) {
		
		_context = this;
		
		this.element = element;
		this.config( options );
		this.init( options );
		
	};
	
	Modal.loadedScripts = _getPageScriptTags();
	Modal.loadedCSS = _getPageCssLinks();
	
	Modal.prototype.init = function ( options ) {
		
		jQuery( _context.element ).off( 'show.bs.modal' ).on( 'show.bs.modal', _context.shown.bind( _context ) );
		
		jQuery( _context.element ).on( 'click', '.yozh-modal-button-hide', function(){
			jQuery(_context.element).modal('hide');
		});
		
	};
	
	Modal.prototype.config = function ( options ) {
		
		var $element = jQuery( this.element );
		
		this.dialog = $element.find( '.modal-dialog' );
		this.spinner = $element.find( '.spinner' );
		this.header = $element.find( '.modal-header' );
		this.body = $element.find( '.modal-body' );
		this.footer = $element.find( '.modal-footer' );
		
		this.url = options.url || this.url || '';
		this.ajaxSubmit = options.ajaxSubmit || this.ajaxSubmit || true;
	};
	
	/**
	 * Requests the content of the modal and injects it, called after the
	 * modal is shown
	 */
	Modal.prototype.shown = function () {
		
		if ( this.url ) {
			this.load();
		}
	};
	
	Modal.prototype.hideAll = function () {
		
		this.dialog.hide();
		this.header.hide();
		this.footer.hide();
		this.spinner.show();
		
		this.header.removeClass (function ( _index, _className) {
			return ( _className.match (/(^|\s)alert-\S+/g) || []).join(' ');
		});
		
	}
	
	Modal.prototype.showAll = function () {
		
		this.dialog.show();
		this.header.show();
		this.header.show();
		this.footer.show();
		this.spinner.hide();
		
	}
	
	Modal.prototype.showDialog = function () {
		
		this.dialog.show();
		this.spinner.hide();
		
	}
	
	/**
	 * Requests the content of the modal and injects it, called after the
	 * modal is shown
	 */
	Modal.prototype.load = function () {
		
		_context.hideAll();
		
		jQuery.ajax( {
				url : _context.url,
				context : _context,
				beforeSend : function ( xhr, settings ) {
					jQuery( _context.element ).triggerHandler( 'yozh.Modal.beforeLoad', [ xhr, settings ] );
				},
			} )
			.done( function ( _response, status, xhr ) {
				
				_context.processResponse( _response );
				
				jQuery( _context.element ).triggerHandler( 'yozh.Modal.load', [ _response, status, xhr ] );
				
			} )
			.fail( function ( _response, status, xhr ) {
				
				_context.processFail( _response, status, xhr );
				
				jQuery( _context.element ).triggerHandler( 'yozh.Modal.failLoad', [ _response, status, xhr ] );
				
			} )
	};
	
	Modal.prototype.processResponse = function ( _response, status, xhr ) {
		
		if ( typeof ( _response.yozh || {} ).modal !== 'undefined' ) {
			
			this.processResponseElement( 'header', _response );
			this.processResponseElement( 'body', _response );
			this.processResponseElement( 'footer', _response );
			
		}
		else {
			this.injectHtml( this.body, _response );
		}
		
		this.showDialog();
		
	}
	
	Modal.prototype.processResponseElement = function ( _elementName, _response ) {
		
		if ( typeof ( ( _response.yozh.modal || {} )[ _elementName ] || {} ).text !== 'undefined' ) {
			
			this[ _elementName ].show();
			
			return this.injectHtml( this[ _elementName ], _response.yozh.modal[ _elementName ].text );
		}
		
	}
	
	Modal.prototype.processFail = function ( _response, status, xhr ) {
		
		this.injectHtml( this.header, _response.statusText );
		this.injectHtml( this.body, _response.responseText );
		
		this.header.addClass('alert alert-danger').show();
		this.showDialog();
	}
	/**
	 * Adds event handlers to the form to check for submit
	 */
	Modal.prototype.bindAjaxSubmit = function ( index, _element ) {
		
		var $form = jQuery( _element );
		
		$form.on( 'submit', function ( e ) {
			
			var _formData = new FormData( this );
			
			$.ajax( {
					url : $form.attr( 'action' ),
					type : $form.attr( 'method' ),
					data : _formData,
					processData : false,
					contentType : false,
					context : this,
					beforeSend : function ( xhr, settings ) {
						jQuery( this.element ).triggerHandler( 'yozh.Modal.beforeSubmit', [ xhr, settings ] );
					},
				} )
				.done( function ( _response, status, xhr ) {
					
					_context.processResponse( _response, status, xhr );
					
					jQuery( _context.element ).triggerHandler( 'yozh.Modal.submit', [ _response, status, xhr ] );
					
				} )
				.fail( function ( _response, status, xhr ) {
					
					_context.processFail( _response, status, xhr );
					
					jQuery( _context.element ).triggerHandler( 'yozh.Modal.failSubmit', [ _response, status, xhr ] );
					
				} )
			;
			
			e.preventDefault();
			
		} );
		
		return false;
	};
	
	
	var _plugin = function ( _data, _params ) {
		
		var _context = $( this )[ 0 ];
		var _Modal = $.data( _context, _pluginName );
		var _data = _data || {};
		
		/**
		 * If not init
		 */
		if ( !_Modal ) {
			_Modal = $.data( _context, _pluginName, new Modal( _context, _data ) );
		}
		
		/**
		 * If _data is String - that's command
		 */
		if ( ( typeof _data == 'string' || _data instanceof String ) && typeof _actions[ _data ] === "function" ) {
			
			_params = _params || {};
			return _actions[ _data ]( _Modal, _params );
			
		}
		else if ( typeof _data === "object" ) {
			
			_Modal.config( _data );
			
		}
		
		return this;
	};
	
	
	$.fn[ _pluginName ] = _plugin;
	
	var _actions = {};
	
	_actions.bar = function ( _Modal, _params ) {
		
		if ( !_Modal instanceof Modal ) {
			return
		}
		
		_Modal.foo();
		
		console.log( _params.foo );
	}
	
} )
( jQuery );

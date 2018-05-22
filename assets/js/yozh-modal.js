( function ( $ ) {
	
	"use strict";
	
	var _context;
	
	yozh.Modal = {
		
		pluginId : 'yozhModal',
		
		BUTTON_HIDE_CLASS : 'yozh-modal-button-hide',
		
		helpers : {}
		
	};
	
	yozh.Modal.helpers.confirm = function ( _config ) {
		
		if ( typeof yozh.ActiveButton !== 'undefined' ) {
			
			var _modalId = '#' + yozh.Modal.pluginId;
			var _$target = $( this );
			
			var _btnYes = strtr( yozh.ActiveButton.TEMPLATE, { 
				'{type}' : 'yes',
				'{label}' : 'Yes',
				'{class}' : 'btn btn-success ' + yozh.Modal.BUTTON_HIDE_CLAS
			} );
			
			var _btnNo = strtr( yozh.ActiveButton.TEMPLATE, { 
				'{type}' : 'no', 
				'{label}' : 'No', 
				'{class}' : 'btn btn-danger ' + yozh.Modal.BUTTON_HIDE_CLAS 
			} );
			
			_config = $.extend( {
				header : false,
				body : 'Please, confirm your action.',
				footer : _btnYes + _btnNo,
			}, _config || {});
			
			$( _modalId ).yozhModal( _config ).show();
			
			var _deferred = $.Deferred();
			
			$( _modalId ).find( '.modal-footer .' + yozh.ActiveButton.WIDGET_CLASS + '-yes' ).one( 'click', function () {
				_deferred.resolve();
				_$target.triggerHandler( 'yozh.ActiveButton.yes', [ _$target ] );
			} )
			
			$( _modalId ).find( '.modal-footer .' + yozh.ActiveButton.WIDGET_CLASS + '-no' ).one( 'click', function () {
				_deferred.reject();
				_$target.triggerHandler( 'yozh.ActiveButton.no', [ _$target ] );
			} )
			
			return _deferred
		}
		
	}
	
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
		
		if ( newScripts.length ) {
			// Load each script tag
			for ( var i = 0; i < newScripts.length; i += 1 ) {
				jQuery.getScript( newScripts[ i ] + ( new Date().getTime() ), scriptLoaded );
			}
			
		}
		else if ( inlineInjections.length ) {
			scriptLoaded();
		}
		
		
	};
	
	
	function Modal( element, options ) {
		
		_context = this;
		
		this.element = element;
		
		var $element = jQuery( this.element );
		
		this.dialog = $element.find( '.modal-dialog' );
		this.spinner = $element.find( '.spinner' );
		this.header = $element.find( '.modal-header' );
		this.body = $element.find( '.modal-body' );
		this.footer = $element.find( '.modal-footer' );
		
		
		this.config( options );
		
		this.init( options );
		
	};
	
	Modal.loadedScripts = _getPageScriptTags();
	Modal.loadedCSS = _getPageCssLinks();
	
	Modal.prototype.init = function ( options ) {
		
		jQuery( _context.element ).off( 'show.bs.modal' ).on( 'show.bs.modal', _context.shown.bind( _context ) );
		
		jQuery( _context.element ).on( 'click', '.yozh-modal-button-hide', function () {
			jQuery( this ).parents( '.yozh-modal' ).modal( 'hide' );
		} );
		
	};
	
	Modal.prototype.config = function ( _config ) {
		
		var _processSection = ( function ( _sectionName ) {
			
			if ( typeof _config[ _sectionName ] !== 'undefined' ) {
				
				if ( _config[ _sectionName ] === false ) {
					this[ _sectionName ].hide();
				}
				else if ( _config[ _sectionName ] === true ) {
					this[ _sectionName ].show();
				}
				else {
					this[ _sectionName ].html( _config[ _sectionName ] ).show();
				}
				
			}
			
			if ( typeof _config[ _sectionName + 'Options' ] !== 'undefined' ) {
				
				var _sectionNameOptions = _config[ _sectionName + 'Options' ];
				
				for ( var _option in _sectionNameOptions ) {
					switch ( _option ) {
						
						case 'class':
							
							this[ _sectionName ].attr( 'class', 'modal-' + _sectionName + ' ' + _sectionNameOptions.class );
							
							break;
						
						default:
						
						//this[ _sectionName ].attr( _option, _sectionNameOptions[ _option ] );
					}
				}
				
			}
			
		} ).bind( this );
		
		_processSection( 'header' );
		_processSection( 'body' );
		_processSection( 'footer' );
		
		this.url = _config.url || this.url || '';
		this.ajaxSubmit = _config.ajaxSubmit || this.ajaxSubmit || true;
		
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
		
		this.header.removeClass( function ( _index, _className ) {
			return ( _className.match( /(^|\s)alert-\S+/g ) || [] ).join( ' ' );
		} );
		
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
			
			this.processSectionWithResponse( 'header', _response );
			this.processSectionWithResponse( 'body', _response );
			this.processSectionWithResponse( 'footer', _response );
			
		}
		else {
			this.injectHtml( this.body, _response );
		}
		
		this.showDialog();
		
	}
	
	Modal.prototype.processSectionWithResponse = function ( _sectionName, _response ) {
		
		if ( typeof ( ( _response.yozh.modal || {} )[ _sectionName ] || {} ).text !== 'undefined' ) {
			
			this[ _sectionName ].show();
			
			return this.injectHtml( this[ _sectionName ], _response.yozh.modal[ _sectionName ].text );
		}
		
	}
	
	Modal.prototype.processFail = function ( _response, status, xhr ) {
		
		this.injectHtml( this.header, _response.statusText );
		this.injectHtml( this.body, _response.responseText );
		
		this.header.addClass( 'alert alert-danger' ).show();
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
	
	var _getContext = function () {
		
		console.log( this );
		
		return $.data( this, yozh.Modal.pluginId );
	}
	
	var _actions = {};
	
	_actions.bar = function ( _Modal, _params ) {
		
		if ( !_Modal instanceof Modal ) {
			return
		}
		
		_Modal.foo();
		
		console.log( _params.foo );
	}
	
	
	_actions.show = ( function () {
		
		$( _actions.context ).modal( 'show' );
		
	} );
	
	var _plugin = function ( _config ) {
		
		if ( typeof this[ 0 ] !== 'undefined' ) {
			
			var _context = this[ 0 ];
			var _Modal = $.data( _context, yozh.Modal.pluginId );
			var _config = _config || {};
			
			/**
			 * If not init
			 */
			if ( !_Modal ) {
				_Modal = $.data( _context, yozh.Modal.pluginId, new Modal( _context, _config ) );
			}
			else if ( typeof _config === "object" ) {
				_Modal.config( _config );
			}
			
			// @TODO переделать
			_actions.context = _context;
			
			return _actions;
			
		}
		
	};
	
	
	$.fn[ yozh.Modal.pluginId ] = _plugin;
	
} )
( jQuery );

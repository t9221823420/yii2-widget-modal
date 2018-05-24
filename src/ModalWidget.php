<?php
/**
 * Created by PhpStorm.
 * User: bw_dev
 * Date: 12.05.2018
 * Time: 23:38
 */

namespace yozh\modal;

use yii\bootstrap\Html;
use yii\bootstrap\Widget;
use yozh\base\components\utils\ArrayHelper;
use yozh\widget\traits\BaseWidgetTrait;

/**
 * Modal renders a modal window that can be toggled by clicking on a button.
 *
 * The following example will show the content enclosed between the [[begin()]]
 * and [[end()]] calls within the modal window:
 *
 * ~~~php
 * Modal::begin([
 *     'header' => '<h2>Hello world</h2>',
 *     'toggleButton' => ['label' => 'click me'],
 * ]);
 *
 * echo 'Say hello...';
 *
 * Modal::end();
 * ~~~
 *
 * @see http://getbootstrap.com/javascript/#modals
 * @author Antonio Ramirez <amigo.cobos@gmail.com>
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class ModalWidget extends Widget
{
	use BaseWidgetTrait{
		init as public baseInitTarit;
	}
	
	
	const SIZE_LARGE   = "modal-lg";
	const SIZE_SMALL   = "modal-sm";
	const SIZE_DEFAULT = "";
	
	const JS_BUTTON_HIDE_CLASS = 'yozh-modal-button-hide';
	
	/**
	 * @var string the header content in the modal window.
	 */
	public $header;
	/**
	 * @var string additional header options
	 * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
	 * @since 2.0.1
	 */
	public $headerOptions;
	/**
	 * @var array body options
	 * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
	 * @since 2.0.7
	 */
	public $bodyOptions = [ 'class' => 'modal-body' ];
	/**
	 * @var string the footer content in the modal window.
	 */
	public $footer;
	/**
	 * @var string additional footer options
	 * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
	 * @since 2.0.1
	 */
	public $footerOptions;
	/**
	 * @var string the modal size. Can be [[SIZE_LARGE]] or [[SIZE_SMALL]], or empty for default.
	 */
	public $size;
	/**
	 * @var array|false the options for rendering the close button tag.
	 * The close button is displayed in the header of the modal window. Clicking
	 * on the button will hide the modal window. If this is false, no close button will be rendered.
	 *
	 * The following special options are supported:
	 *
	 * - tag: string, the tag name of the button. Defaults to 'button'.
	 * - label: string, the label of the button. Defaults to '&times;'.
	 *
	 * The rest of the options will be rendered as the HTML attributes of the button tag.
	 * Please refer to the [Modal plugin help](http://getbootstrap.com/javascript/#modals)
	 * for the supported HTML attributes.
	 */
	public $closeButton = [];
	/**
	 * @var array the options for rendering the toggle button tag.
	 * The toggle button is used to toggle the visibility of the modal window.
	 * If this property is false, no toggle button will be rendered.
	 *
	 * The following special options are supported:
	 *
	 * - tag: string, the tag name of the button. Defaults to 'button'.
	 * - label: string, the label of the button. Defaults to 'Show'.
	 *
	 * The rest of the options will be rendered as the HTML attributes of the button tag.
	 * Please refer to the [Modal plugin help](http://getbootstrap.com/javascript/#modals)
	 * for the supported HTML attributes.
	 */
	public $toggleButton = false;
	
	/**
	 * The url to request when modal is opened
	 * @var string
	 */
	public $url;
	
	/**
	 * @var string the body content in the alert component. Note that anything between
	 * the [[begin()]] and [[end()]] calls of the Alert widget will also be treated
	 * as the body content, and will be rendered before this.
	 */
	public $body;
	
	/**
	 * Submit the form via ajax
	 * @var boolean
	 */
	public $ajaxSubmit = true;
	
	/**
	 * Initializes the widget.
	 */
	public function init()
	{
		static::baseInitTarit();
		
		$this->_initOptions();
		
		$output = ''
			. "\n" . $this->_renderToggleButton()
			. "\n" . $this->_renderWrapBegin()
			. "\n" . $this->_renderHeader()
			. "\n" . $this->_renderBodyBegin()
		;
		
		print $output;
	}
	
	/**
	 * Renders the widget.
	 */
	public function run()
	{
		$output = ''
			. "\n" . $this->_renderBodyEnd()
			. "\n" . $this->_renderFooter()
			. "\n" . $this->_renderWrapEnd()
		;
		
		print $output;
		
		$this->_registerJs();
		$this->registerPlugin( 'modal' );
		
		AssetBundle::register( $this->getView() );
	}
	
	protected function _registerJs()
	{
		$id = $this->options['id'];
		
		$ajaxSubmit = $this->ajaxSubmit ? 'true' : 'false';
		
		$js = <<<JS
		
        jQuery('#$id').yozhModal({
            url: '{$this->url}',
            ajaxSubmit: {$ajaxSubmit},
        });

JS;
		$this->getView()->registerJs( $js );
	}
	
	/**
	 * Renders the opening tag of the modal body.
	 * @return string the rendering result
	 */
	protected function _renderBodyBegin()
	{
		return ''
			. "\n" . Html::beginTag( 'div', $this->bodyOptions )
			. "\n" . $this->body . "\n";
	}
	
	/**
	 * Renders the closing tag of the modal body.
	 * @return string the rendering result
	 */
	protected function _renderBodyEnd()
	{
		return ''
			. "\n" . Html::endTag( 'div' );
	}
	
	
	protected function _renderWrapBegin()
	{
		return ''
			. "\n" . Html::beginTag( 'div', $this->options )
			. "\n" . '<div class="spinner"></div>'
			. "\n" . Html::beginTag( 'div', [ 'class' => 'modal-dialog ' . $this->size ] )
			. "\n" . Html::beginTag( 'div', [ 'class' => 'modal-content' ] );
		
	}
	
	protected function _renderWrapEnd()
	{
		return ''
			. "\n" . Html::endTag( 'div' ) // modal-content
			. "\n" . Html::endTag( 'div' ) // modal-dialog
			. "\n" . Html::endTag( 'div' );
	}
	
	/**
	 * Renders the toggle button.
	 * @return string the rendering result
	 */
	protected function _renderToggleButton()
	{
		if( $toggleButton = $this->toggleButton ) {
			
			$tag   = ArrayHelper::remove( $toggleButton, 'tag', 'button' );
			$label = ArrayHelper::remove( $toggleButton, 'label', 'Show' );
			
			if( $tag === 'button' && !isset( $toggleButton['type'] ) ) {
				$toggleButton['type'] = 'button';
			}
			
			return Html::tag( $tag, $label, $toggleButton );
		}
	}
	
	/**
	 * Renders the close button.
	 * @return string the rendering result
	 */
	protected function _renderCloseButton()
	{
		if( $closeButton = $this->closeButton ) {
			
			$tag   = ArrayHelper::remove( $closeButton, 'tag', 'button' );
			$label = ArrayHelper::remove( $closeButton, 'label', '&times;' );
			
			if( $tag === 'button' && !isset( $closeButton['type'] ) ) {
				$closeButton['type'] = 'button';
			}
			
			return Html::tag( $tag, $label, $closeButton );
		}
		
	}
	
	/**
	 * Initializes the widget options.
	 * This method sets the default values for various options.
	 */
	protected function _initOptions()
	{
		
		$this->options = array_merge( [
			'role'     => 'dialog',
			'tabindex' => -1,
		], $this->options );
		
		Html::addCssClass( $this->options, [ 'widget' => 'yozh-modal fade modal' ] );
		
		if( $this->clientOptions !== false ) {
			$this->clientOptions = array_merge( [ 'show' => false ], $this->clientOptions );
		}
		
		if( $this->closeButton !== false ) {
			
			$this->closeButton = array_merge( [
				'data-dismiss' => 'modal',
				'aria-hidden'  => 'true',
				'class'        => 'close',
			], $this->closeButton );
			
		}
		
		if( $this->toggleButton !== false ) {
			
			$this->toggleButton = array_merge( [
				'data-toggle' => 'modal',
			], $this->toggleButton );
			
			if( !isset( $this->toggleButton['data-target'] ) && !isset( $this->toggleButton['href'] ) ) {
				$this->toggleButton['data-target'] = '#' . $this->options['id'];
			}
		}
		
	}
	
	/**
	 * Renders the HTML markup for the footer of the modal
	 * @return string the rendering result
	 */
	protected function _renderFooter()
	{
		$output = '';
		
		if( $this->footer !== false ) {
			
			Html::addCssClass( $this->footerOptions, [ 'widget' => 'modal-footer' ] );
			
			$output .= ''
				. "\n" . Html::beginTag( 'div', $this->footerOptions )
				. "\n" . $this->footer
				. "\n" . Html::endTag( 'div' );
		}
		
		return $output ?? null;
	}
	
	/**
	 * Renders the header HTML markup of the modal
	 * @return string the rendering result
	 */
	protected function _renderHeader()
	{
		
		if( $this->header !== false ) {
			
			$button = $this->_renderCloseButton();
			
			Html::addCssClass( $this->headerOptions, [ 'widget' => 'modal-header' ] );
			
			return ''
				. "\n" . Html::beginTag( 'div', $this->headerOptions )
				. "\n" . $button
				. "\n" . $this->header
				. "\n" . Html::endTag( 'div' );
			
		}
		
	}
}
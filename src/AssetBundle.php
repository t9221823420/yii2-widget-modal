<?php

namespace yozh\modal;

class AssetBundle extends \yozh\base\AssetBundle
{

    public $sourcePath = __DIR__ .'/../assets/';

    public $css = [
        'css/yozh-modal.css',
	    //['css/yozh-modal.print.css', 'media' => 'print'],
    ];
	
    public $js = [
        'js/yozh-modal.js'
    ];
	
	public $depends = [
		'yii\bootstrap\BootstrapAsset',
		'yozh\base\AssetBundle',
	];
    
	public $publishOptions = [
		'forceCopy'       => true,
	];
	
}
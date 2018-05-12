<?php

namespace yozh\modal;

use yozh\base\Module as BaseModule;

class Module extends BaseModule
{

	const MODULE_ID = 'modal';
	
	public $controllerNamespace = 'yozh\\' . self::MODULE_ID . '\controllers';
	
}

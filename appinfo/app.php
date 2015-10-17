<?php
/**
 * ownCloud - musicapi
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Anto Martel <amartel@quatral.com>
 * @copyright Anto Martel 2015
 */

namespace OCA\MusicApi\AppInfo;
\OCP\Util::addStyle('musicapi', '../3rdparty/fontawesome/css/font-awesome.min');

\OCP\App::addNavigationEntry([
	// the string under which your app will be referenced in owncloud
	'id' => 'musicapi',

	// sorting weight for the navigation. The higher the number, the higher
	// will it be listed in the navigation
	'order' => 10,

	// the route that will be shown on startup
	'href' => \OCP\Util::linkToRoute('musicapi.page.index'),

	// the icon that will be shown in the navigation
	// this file needs to exist in img/
	'icon' => \OCP\Util::imagePath('musicapi', 'app.svg'),

	// the title of your application. This will be used in the
	// navigation or on the settings page of your app
	'name' => \OC_L10N::get('musicapi')->t('Music Api')
]);
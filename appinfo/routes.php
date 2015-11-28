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

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\MusicApi\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
    'routes' => [
	    ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	    ['name' => 'scanner#scandrivemusic', 'url' => '/scandrivemusic', 'verb' => 'POST'],
        ['name' => 'music#getmusic', 'url' => '/getmusic', 'verb' => 'POST'],
        ['name' => 'music#addtimeplayed', 'url' => '/addtimeplayed', 'verb' => 'POST'],
        ['name' => 'music#getRadioSongDetail', 'url' => '/getradiosongdetail', 'verb' => 'POST'],
    ]
];
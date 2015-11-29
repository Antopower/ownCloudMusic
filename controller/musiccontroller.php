<?php
/**
 * ownCloud - Audios
 *
 * @author Sebastian Doell
 * @copyright 2015 sebastian doell sebastian@libasys.de
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\MusicApi\Controller;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\IDb;

/**
 * Controller class for main page.
 */
class MusicController extends Controller {

    private $userId;
    private $db;

    public function __construct($appName, IRequest $request, $userId,IDb $db) {
        parent::__construct($appName, $request);
        $this->userId = $userId;
        $this->db = $db;
    }

    /**
     * Get the music from the database
     *
     * @return id
     */
    public function getMusic(){

        $aSongs = $this->loadSongs();

        if(is_array($aSongs)){
            $result=[
                'status' => 'success',
                'data' => ['songs'=>$aSongs]
            ];
        }else{
            $result=[
                'status' => 'success',
                'data' =>'nodata'
            ];
        }

        $response = new JSONResponse();
        $response -> setData($result);
        return $response;


    }

    /**
     * Get the music from the database
     * @return id
     * @internal param $streamingUrl
     * @internal param $interval
     * @internal param int $offset
     * @internal param bool $headers
     */
    public function getRadioSongDetail(){
        $streamingUrl = $this -> params('streamUrl');
        $needle = 'StreamTitle=';
        $interval = 19200;
        $ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36';

        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => 'Icy-MetaData: 1',
                'user_agent' => $ua
            ]
        ];

        if (($headers = get_headers($streamingUrl))) {
            foreach ($headers as $h) {
                if (strpos(strtolower($h), 'icy-metaint') !== false && ($interval = explode(':', $h)[1])) {
                    break;
                }
            }
        }

        $context = stream_context_create($opts);

        $result=[
            'success' => false,
            'data' => ['songTitle'=>'Unknown']
        ];

        if ($stream = fopen($streamingUrl, 'r', false, $context)) {
            $buffer = stream_get_contents($stream, $interval, 0);

            fclose($stream);
            if (strpos($buffer, $needle) !== false) {
                $title = explode($needle, $buffer)[1];
                $title = substr($title, 1, strpos($title, ';') - 2);
                $result=[
                    'success' => true,
                    'data' => ['songTitle'=>$title, 'error' => 'none']
                ];
            } else {
                $result=[
                    'success' => true,
                    'data' => ['songTitle'=>'Unknown - No information found', 'error' => 'none']
                ];
            }
        } else {
            $result=[
                'success' => false,
                'data' => ['songTitle'=>'Unknown', 'error' => 'URL is wrong or radio do not exist. Check your URL.']
            ];
        }
        $response = new JSONResponse();
        $response -> setData($result);
        return $response;
    }

    /**
     * return the music from the database
     *
     * @return songArray
     */
    public function addTimePlayed(){
        $fileid = $this -> params('fileid');
        $SQLselect="SELECT `time_played` FROM `*PREFIX*music` WHERE `user_id` = ? AND `file_id` = ?";
        $stmt = $this->db->prepareQuery($SQLselect);
        $result = $stmt->execute(array($this->userId, $fileid));

        $SQL="UPDATE  `*PREFIX*music` SET `time_played` = ? WHERE `user_id` = ? AND `file_id` = ?";
        $stmt = $this->db->prepareQuery($SQL);
        $result = $stmt->execute(array($result->fetchRow()['time_played']+1, $this->userId, $fileid));

        return $result;

    }

    /**
     * return the music from the database
     *
     * @return songArray
     */
    public function loadSongs(){
        $SQL="SELECT  `AT`.`id`,`AT`.`title`,`AT`.`artist`,`AT`.`album`,`AT`.`genre`,`AT`.`bitrate`,`AT`.`year`,`AT`.`play_time`,`AT`.`path`,`AT`.`time_played`,`AT`.`date_added`,`AT`.`file_id` FROM `*PREFIX*music` `AT`
			 			WHERE  `AT`.`user_id` = ?
			 			ORDER BY `AT`.`title` ASC
			 			";

        $stmt = $this->db->prepareQuery($SQL);
        $result = $stmt->execute(array($this->userId));

        $aSongs='';
        while( $row = $result->fetchRow()) {

            $path = \OC\Files\Filesystem::getPath($row['file_id']);

            if(\OC\Files\Filesystem::file_exists($path)){
                $row['path'] = $path;
                $aSongs[] = $row;
            } else {
                $this->_deleteFromDB($row['id'],$row['path'],$row['file_id']);
            }

        }
        if(is_array($aSongs)){
            return $aSongs;
        }else{
            return false;
        }
    }

    private function _deleteFromDB($Id,$path,$fileId) {
        $stmt = \OCP\DB::prepare( 'DELETE FROM `*PREFIX*music` WHERE `user_id` = ? AND `id` = ? AND `path` = ? AND `file_id` = ?');
        $result = $stmt->execute(array($this->userId, $Id, $path, $fileId));
    }
}
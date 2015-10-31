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
use \OC\Files\View;
use \OCP\IDb;

/**
 * Controller class for main page.
 */
class ScannerController extends Controller {

    private $userId;
    private $path;
    private $abscount = 0;
    private $progress;
    private $progresskey;
    private $currentSong;
    private $iDublicate = 0;
    private $iAlbumCount = 0;
    private $numOfSongs;
    private $db;

    public function __construct($appName, IRequest $request, $userId,IDb $db) {
        parent::__construct($appName, $request);
        $this -> userId = $userId;
        $this->db = $db;
    }

    /**
     * Simply method that posts back the payload of the request
     * @NoAdminRequired
     */
    public function scanDriveMusic() {
        if(!class_exists('getid3_exception')) {
            require_once __DIR__ . '/../3rdparty/getID3/getid3/getid3.php';
        }

        $userView =  new View('/' . $this -> userId . '/files');
        $audios = $userView->searchByMime('audio/mpeg');
        $music = [];
        foreach($audios as $audio) {

            if($this->checkIfTrackDbExists($audio['fileid']) === false){
                $getID3 = new \getID3;
                $ThisFileInfo = $getID3->analyze($userView->getLocalFile($audio['path']));
                \getid3_lib::CopyTagsToComments($ThisFileInfo);

                /* FILENAME */
                $name = $audio['name'];

                /* TITLE */
                $title = $audio['name'];
                if(isset($ThisFileInfo['comments']['title'][0])) {
                    $title = $ThisFileInfo['comments']['title'][0];
                }

                /* ARTIST */
                $artist = 'Various Artists';
                if(isset($ThisFileInfo['comments']['artist'][0])) {
                    $artist = $ThisFileInfo['comments']['artist'][0];
                }

                /* ALBUM */
                $album = 'Various';
                if(isset($ThisFileInfo['comments']['album'][0])) {
                    $album = $ThisFileInfo['comments']['album'][0];
                }

                /* GENRE */
                $genre = '';
                if(isset($ThisFileInfo['comments']['genre'][0])) {
                    $genre = $ThisFileInfo['comments']['genre'][0];
                }

                /* BITRATE */
                $bitrate = 0;
                if(isset($ThisFileInfo['bitrate'])) {
                    $bitrate = $ThisFileInfo['bitrate'];
                }

                /* YEAR */
                $year = '';
                if(isset($ThisFileInfo['comments']['year'][0])) {
                    $year = $ThisFileInfo['comments']['year'][0];
                }

                /* PLAYTIME */
                $playTimeString = $ThisFileInfo['playtime_string'];
                if($playTimeString == null) {
                    $playTimeString = '';
                }

                /* PATH */
                $path = $audio['path'];

                /* TIME PLAYED */
                $timePlayed = 0;

                /* DATE ADDED */
                $dateAdded = time();

                /* FILE ID */
                $fileId = $audio['fileid'];

                $music = [
                    'user_id' => $this->userId,
                    'file' => $name,
                    'title' => $title,
                    'artist' => $artist,
                    'album' => $album,
                    'genre' => $genre,
                    'bitrate' => $bitrate,
                    'year' => $year,
                    'play_time' => $playTimeString,
                    'path' => $path,
                    'time_played' => $timePlayed,
                    'date_added' => $dateAdded,
                    'file_id' => $fileId,
                ];

                $this->writeTrackToDB($music);

            }
        }
        $response =  ['success' => true];
        return $response;
    }

    /**
     * Add track to db if not exist
     *
     *@param array $aTrack
     *
     *
     * @return id
     */
    private function writeTrackToDB($aTrack){

        $SQL='SELECT id FROM *PREFIX*music WHERE `user_id`= ? AND `title`= ? AND `artist`= ? AND `album`= ? AND `play_time`= ? AND `bitrate`= ?';
        $stmt = $this->db->prepareQuery($SQL);
        $result = $stmt->execute(array($this->userId, $aTrack['title'],$aTrack['artist'],$aTrack['album'],$aTrack['play_time'],$aTrack['bitrate']));

        $row = $result->fetchRow();
        if(isset($row['id'])){
            $this->iDublicate++;
        }else{
            $stmt = \OCP\DB::prepare( 'INSERT INTO `*PREFIX*music` (`user_id`,`file`,`title`,`artist`,`album`,`genre`,`bitrate`,`year`,`play_time`,`path`,`time_played`,`date_added`,`file_id`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)' );
            $result = $stmt->execute(array($this->userId, $aTrack['file'], $aTrack['title'], $aTrack['artist'], $aTrack['album'], $aTrack['genre'], $aTrack['bitrate'], $aTrack['year'], $aTrack['play_time'], $aTrack['path'], $aTrack['time_played'], $aTrack['date_added'], $aTrack['file_id']));
            $insertid = \OCP\DB::insertid('*PREFIX*music');
            return $insertid;
        }


    }

    private function checkIfTrackDbExists($fileid){
        $stmtCount = \OCP\DB::prepare( 'SELECT  COUNT(`id`)  AS COUNTID FROM `*PREFIX*music` WHERE `user_id` = ? AND `file_id` = ? ' );
        $resultCount = $stmtCount->execute(array($this->userId, $fileid));
        $row = $resultCount->fetchRow();
        if(isset($row['COUNTID']) && $row['COUNTID'] > 0){
            return true;
        }else{
            return false;
        }
    }
}
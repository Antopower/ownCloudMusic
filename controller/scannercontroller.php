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

                $musicJSON[] = [
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
        $response[] =  ['songlist' => $musicJSON];
        return $response[0];
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

    /**
     * @NoAdminRequired
     *
     */
    public function scanForAudios() {

        $pProgresskey = $this -> params('progresskey');
        $pGetprogress = $this -> params('getprogress');
        \OC::$server->getSession()->close();


        if (isset($pProgresskey) && isset($pGetprogress)) {


            $aCurrent = \OC::$server->getCache()->get($pProgresskey);
            $aCurrent = json_decode($aCurrent);

            $numSongs = (isset($aCurrent->{'all'})?$aCurrent->{'all'}:0);
            $currentSongCount = (isset($aCurrent->{'current'})?$aCurrent->{'current'}:0);
            $currentSong = (isset($aCurrent->{'currentsong'})?$aCurrent->{'currentsong'}:'');
            $percent = (isset($aCurrent->{'percent'})?$aCurrent->{'percent'}:'');

            if($percent ==''){
                $percent = 0;
            }
            $params = [
                'status' => 'success',
                'percent' =>$percent ,
                'currentmsg' => $currentSong.' '.$percent.'% ('.$currentSongCount.'/'.$numSongs.')'
            ];
            $response = new JSONResponse($params);
            return $response;
        }

        if(!class_exists('getid3_exception')) {
            require_once __DIR__ . '/../3rdparty/getID3/getid3/getid3.php';
        }



        $userView =  new View('/' . $this -> userId . '/files');
        $audios = $userView->searchByMime('audio/mpeg');
        $tempArray=array();


        $this->numOfSongs = count($audios);

        $this->progresskey = $pProgresskey;
        $currentIntArray=[
            'percent' => 0,
            'all' => $this->numOfSongs,
            'current' => 0,
            'currentsong' => ''
        ];

        $currentIntArray = json_encode($currentIntArray);
        \OC::$server->getCache()->set($this->progresskey, $currentIntArray, 100);
        $counter = 0;
        foreach($audios as $audio) {

            //new Audio Found
            if($this->checkIfTrackDbExists($audio['fileid']) === false){
                $TextEncoding = 'UTF-8';

                $getID3 = new \getID3;
                $ThisFileInfo = $getID3->analyze($userView->getLocalFile($audio['path']));
                \getid3_lib::CopyTagsToComments($ThisFileInfo);

                $album = (string) $this->l10n->t('Various');
                if(isset($ThisFileInfo['comments']['album'][0])){
                    $album=$ThisFileInfo['comments']['album'][0];
                }
                $genre = '';
                if(isset($ThisFileInfo['comments']['genre'][0])){
                    $genre=$ThisFileInfo['comments']['genre'][0];
                }

                $iGenreId=0;
                if($genre!=''){
                    $iGenreId= $this->writeGenreToDB($genre);
                }

                $year = '';
                if(isset($ThisFileInfo['comments']['year'][0])){
                    $year=$ThisFileInfo['comments']['year'][0];
                }

                $iAlbumId = $this->writeAlbumToDB($album,$year,$iGenreId);

                $artist = (string) $this->l10n->t('Various Artists');
                if(isset($ThisFileInfo['comments']['artist'][0])){
                    $artist=$ThisFileInfo['comments']['artist'][0];
                }

                $iArtistId= $this->writeArtistToDB($artist);

                $this->writeArtistToAlbum($iAlbumId,$iArtistId);

                $name = $audio['name'];
                if(isset($ThisFileInfo['comments']['title'][0])){
                    $name=$ThisFileInfo['comments']['title'][0];

                }
                $this->currentSong = $name.' - '.$artist;
                $trackNumber = '';
                if(isset($ThisFileInfo['comments']['track_number'][0])){
                    $trackNumber=$ThisFileInfo['comments']['track_number'][0];
                }

                $bitrate = 0;
                if(isset($ThisFileInfo['bitrate'])){
                    $bitrate=$ThisFileInfo['bitrate'];
                }
                /*
                $comment = '';
                if(isset($ThisFileInfo['comments']['comment'][0])){
                    $comment=$ThisFileInfo['comments']['comment'][0];
                }*/

                $cleanTrackNumber=$trackNumber;
                if(stristr($trackNumber,'/')){
                    $temp=explode('/',$trackNumber);
                    $cleanTrackNumber=trim($temp[0]);
                }

                if(isset($ThisFileInfo['comments']['picture'])){
                    $data=$ThisFileInfo['comments']['picture'][0]['data'];
                    $image = new \OCP\Image();
                    if($image->loadFromdata($data)) {
                        if(($image->width() <= 250 && $image->height() <= 250) || $image->resize(250)) {
                            $imgString=$image->__toString();
                            $getDominateColor = $this->getDominateColorOfImage($imgString);
                            $this->writeCoverToAlbum($iAlbumId,$imgString,$getDominateColor);
                            $poster='data:'.$ThisFileInfo['comments']['picture'][0]['image_mime'].';base64,'.$imgString;
                        }
                    }

                }

                $playTimeString = $ThisFileInfo['playtime_string'];
                if($playTimeString == null){
                    $playTimeString = '';
                }

                $aTrack = [
                    'title' => $name,
                    'number' =>(int)$cleanTrackNumber,
                    'artist_id' => (int)$iArtistId,
                    'album_id' =>(int) $iAlbumId,
                    'length' => $playTimeString,
                    'file_id' => (int)$audio['fileid'],
                    'bitrate' => (int)$bitrate,
                    'mimetype' => $audio['mimetype'],
                ];

                $this->writeTrackToDB($aTrack);

                $counter++;
                $this->abscount++;

                $this->updateProgress(intval(($this->abscount / $this->numOfSongs)*100));
            }


        }

        \OC::$server->getCache()->remove($this->progresskey);

        $message=(string)$this->l10n->t('Scanning finished!').'<br />';
        $message.=(string)$this->l10n->t('Audios found: ').$counter.'<br />';
        $message.=(string)$this->l10n->t('Duplicates found: ').$this->iDublicate.'<br />';
        $message.=(string)$this->l10n->t('Written to music library: ').($counter - $this->iDublicate).'<br />';
        $message.=(string)$this->l10n->t('Albums found: ').$this->iAlbumCount.'<br />';

        $result=[
            'status' => 'success',
            'message' => $message
        ];

        $response = new JSONResponse();
        $response -> setData($result);
        return $response;

    }

}
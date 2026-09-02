<?php
session_start();
const DB_HOST='localhost'; const DB_NAME='ysc_carpet'; const DB_USER='root'; const DB_PASS='';
function db(){ static $pdo; if(!$pdo){$pdo=new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',DB_USER,DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);} return $pdo; }
function e($v){return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function admin(){return !empty($_SESSION['admin_id']);}
function require_admin(){if(!admin()){header('Location: login.php');exit;}}
function setting($key,$default=''){try{$s=db()->prepare('SELECT value FROM settings WHERE `key`=?');$s->execute([$key]);$r=$s->fetch();return $r?$r['value']:$default;}catch(Throwable $x){return $default;}}
function set_setting($key,$value){$s=db()->prepare('INSERT INTO settings(`key`,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)');$s->execute([$key,$value]);}
function stock_label($n){$n=(int)$n; return $n<=0?'Tükendi':($n<=10?'Az Kaldı':'Stokta');}
function slug($s){$s=mb_strtolower(trim($s),'UTF-8');$s=strtr($s,['ş'=>'s','ğ'=>'g','ı'=>'i','İ'=>'i','ö'=>'o','ü'=>'u','ç'=>'c']);return preg_replace('/[^a-z0-9]+/','-',trim($s,'-'));}
function upload_image($field,$folder='uploads'){if(empty($_FILES[$field]['name'])) return null;$ok=['jpg','jpeg','png','webp','svg'];$ext=strtolower(pathinfo($_FILES[$field]['name'],PATHINFO_EXTENSION));if(!in_array($ext,$ok,true)) return null;$dir=__DIR__.'/'.$folder;if(!is_dir($dir)) mkdir($dir,0755,true);$name=time().'_'.bin2hex(random_bytes(4)).'.'.$ext;move_uploaded_file($_FILES[$field]['tmp_name'],$dir.'/'.$name);return $folder.'/'.$name;}

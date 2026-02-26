<?php

$config['system.logging']['error_level'] = 'verbose';
$databases['default']['default'] = [
  'database' => 'acsdb',
  'username' => 'root',
  'password' => 'acsusername',
  'host' => 'localhost',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
  'collation' => 'utf8mb4_general_ci',
];

$settings['hash_salt'] = 'Q09FkKRqaSJHZD3wiQrwi6aHTAB/RRj27kXKlA5Ywqg=';
$config['system.logging']['error_level'] = 'verbose';
$databases['cherity']['default'] = array (
  'database' => 'cherity',
  'username' => 'root',
  'password' => 'acsusername',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '3306',
  'driver' => 'mysql',
  'collation' => 'utf8mb4_general_ci',
);

$databases['civicrm']['default'] = array (
  'database' => 'civicrm',
  'username' => 'root',
  'password' => 'acsusername',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '3306',
  'driver' => 'mysql',
  'collation' => 'utf8mb4_general_ci',
);

$config['system.mail']['interface']['default'] = 'null_mail';